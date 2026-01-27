import FormResponse from "../models/formResponseModel.js";
import FormTemplate from "../models/formTemplateModel.js";
import WeeklyPlan from "../models/weeklyPlanModel.js";

const formResponseService = {
  // CREATE - Crear respuesta pendiente
  createFormResponse: async (responseData) => {
    const {
      formTemplateId,
      weeklyPlanId, // Opcional - null para formularios iniciales
      clientId,
      organizationId,
      createdBy,
      createdByModel = "System",
    } = responseData;

    if (!formTemplateId) {
      throw new Error("Se requiere el ID del formulario");
    }
    if (!clientId) {
      throw new Error("Se requiere el ID del cliente");
    }
    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    // Verificar que el template existe y está activo
    const template = await FormTemplate.findOne({
      _id: formTemplateId,
      isActive: true,
    });
    if (!template) {
      throw new Error("El formulario no existe o no está activo");
    }

    // Para formularios de plan semanal, verificar que no exista ya una respuesta
    if (weeklyPlanId) {
      const existingResponse = await FormResponse.findOne({ weeklyPlanId });
      if (existingResponse) {
        return existingResponse; // Retornar la existente en lugar de error
      }
    }

    // Para formularios iniciales, verificar que no exista uno pendiente del mismo template
    if (!weeklyPlanId && template.type === "initial_intake") {
      const existingInitial = await FormResponse.findOne({
        clientId,
        formTemplateId,
        weeklyPlanId: null,
      });
      if (existingInitial) {
        return existingInitial; // Retornar el existente
      }
    }

    const newResponse = new FormResponse({
      formTemplateId,
      weeklyPlanId: weeklyPlanId || null,
      clientId,
      organizationId,
      status: "pending",
      answers: [],
      createdBy,
      createdByModel,
    });

    return await newResponse.save();
  },

  // READ - Por cliente (todas)
  getFormResponsesByClientId: async (clientId, organizationId) => {
    if (!clientId) {
      throw new Error("Se requiere el ID del cliente");
    }

    const query = { clientId };
    if (organizationId) {
      query.organizationId = organizationId;
    }

    return await FormResponse.find(query)
      .populate("formTemplateId", "name description")
      .populate("weeklyPlanId", "name startDate endDate")
      .sort({ createdAt: -1 })
      .lean();
  },

  // READ - Pendientes por cliente
  getPendingFormResponsesByClientId: async (clientId, organizationId) => {
    if (!clientId) {
      throw new Error("Se requiere el ID del cliente");
    }

    const query = { clientId, status: "pending" };
    if (organizationId) {
      query.organizationId = organizationId;
    }

    return await FormResponse.find(query)
      .populate("formTemplateId", "name description questions")
      .populate("weeklyPlanId", "name startDate endDate")
      .sort({ createdAt: -1 })
      .lean();
  },

  // READ - Por ID
  getFormResponseById: async (id) => {
    if (!id) {
      throw new Error("Se requiere el ID de la respuesta");
    }

    const response = await FormResponse.findById(id)
      .populate("formTemplateId")
      .populate("weeklyPlanId", "name startDate endDate")
      .populate("clientId", "name email phoneNumber")
      .lean();

    if (!response) {
      throw new Error("Respuesta no encontrada");
    }

    return response;
  },

  // READ - Por plan semanal
  getFormResponseByWeeklyPlanId: async (weeklyPlanId) => {
    if (!weeklyPlanId) {
      throw new Error("Se requiere el ID del plan semanal");
    }

    return await FormResponse.findOne({ weeklyPlanId })
      .populate("formTemplateId")
      .populate("clientId", "name email phoneNumber")
      .lean();
  },

  // UPDATE - Enviar respuestas (completar formulario)
  submitFormResponse: async (id, answersData) => {
    if (!id) {
      throw new Error("Se requiere el ID de la respuesta");
    }

    const response = await FormResponse.findById(id);
    if (!response) {
      throw new Error("Respuesta no encontrada");
    }

    if (response.status === "completed") {
      throw new Error("Este formulario ya fue completado");
    }

    // Obtener el template para validar respuestas
    const template = await FormTemplate.findById(response.formTemplateId);
    if (!template) {
      throw new Error("Formulario no encontrado");
    }

    // Validar que todas las preguntas requeridas estén respondidas
    const answers = [];
    for (const question of template.questions) {
      const answer = answersData.find(
        (a) => a.questionId.toString() === question._id.toString()
      );

      if (question.required && (!answer || answer.value === undefined || answer.value === null || answer.value === "")) {
        throw new Error(`La pregunta "${question.questionText}" es obligatoria`);
      }

      if (answer) {
        answers.push({
          questionId: question._id,
          questionText: question.questionText,
          questionType: question.questionType,
          value: answer.value,
        });
      }
    }

    response.answers = answers;
    response.status = "completed";
    response.submittedAt = new Date();

    return await response.save();
  },

  // Crear respuesta pendiente si el plan tiene formulario asociado
  createPendingResponseIfNeeded: async (weeklyPlanId) => {
    const plan = await WeeklyPlan.findById(weeklyPlanId);
    if (!plan || !plan.formTemplateId) {
      return null;
    }

    // Verificar si ya existe respuesta
    const existingResponse = await FormResponse.findOne({ weeklyPlanId });
    if (existingResponse) {
      return existingResponse;
    }

    // Crear nueva respuesta pendiente
    return await formResponseService.createFormResponse({
      formTemplateId: plan.formTemplateId,
      weeklyPlanId: plan._id,
      clientId: plan.clientId,
      organizationId: plan.organizationId,
      createdByModel: "System",
    });
  },

  // Obtener respuestas por organización (para admin)
  getFormResponsesByOrganizationId: async (organizationId, status) => {
    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    const query = { organizationId };
    if (status) {
      query.status = status;
    }

    return await FormResponse.find(query)
      .populate("formTemplateId", "name")
      .populate("weeklyPlanId", "name startDate endDate")
      .populate("clientId", "name email phoneNumber")
      .sort({ createdAt: -1 })
      .lean();
  },

  // Crear formularios pendientes para planes expirados que aún no tienen respuesta
  createPendingResponsesForExpiredPlans: async (clientId, organizationId) => {
    if (!clientId) return [];

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Buscar planes que:
    // 1. Pertenecen al cliente
    // 2. Tienen un formTemplateId asignado
    // 3. Su endDate ya pasó (o es hoy)
    const query = {
      clientId,
      formTemplateId: { $ne: null },
      endDate: { $lte: now },
    };

    if (organizationId) {
      query.organizationId = organizationId;
    }

    const expiredPlansWithForms = await WeeklyPlan.find(query).lean();

    const createdResponses = [];
    for (const plan of expiredPlansWithForms) {
      // Verificar si ya existe respuesta para este plan
      const existingResponse = await FormResponse.findOne({
        weeklyPlanId: plan._id,
      });

      if (!existingResponse) {
        try {
          const newResponse = await formResponseService.createFormResponse({
            formTemplateId: plan.formTemplateId,
            weeklyPlanId: plan._id,
            clientId: plan.clientId,
            organizationId: plan.organizationId,
            createdByModel: "System",
          });
          createdResponses.push(newResponse);
        } catch (error) {
          console.error(
            `Error creating response for plan ${plan._id}:`,
            error.message
          );
        }
      }
    }

    return createdResponses;
  },
};

export default formResponseService;
