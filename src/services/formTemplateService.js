import FormTemplate from "../models/formTemplateModel.js";

const formTemplateService = {
  // CREATE
  createFormTemplate: async (templateData) => {
    const {
      name,
      description,
      organizationId,
      questions = [],
      createdBy,
      createdByModel,
    } = templateData;

    if (!name || !name.trim()) {
      throw new Error("El nombre del formulario es obligatorio");
    }

    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    if (questions.length === 0) {
      throw new Error("El formulario debe tener al menos una pregunta");
    }

    // Validar preguntas
    for (const question of questions) {
      if (!question.questionText || !question.questionText.trim()) {
        throw new Error("Todas las preguntas deben tener texto");
      }
      if (!question.questionType) {
        throw new Error("Todas las preguntas deben tener un tipo");
      }
      // Validar opciones para preguntas de selección
      if (
        ["single_choice", "multiple_choice"].includes(question.questionType) &&
        (!question.options || question.options.length < 2)
      ) {
        throw new Error(
          "Las preguntas de selección deben tener al menos 2 opciones"
        );
      }
    }

    // Asignar orden si no está definido
    const questionsWithOrder = questions.map((q, index) => ({
      ...q,
      order: q.order ?? index,
    }));

    const newTemplate = new FormTemplate({
      name: name.trim(),
      description: description?.trim() || "",
      organizationId,
      questions: questionsWithOrder,
      createdBy,
      createdByModel,
    });

    return await newTemplate.save();
  },

  // READ - All active by Organization
  getFormTemplatesByOrganizationId: async (organizationId, options = {}) => {
    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    const { includeInactive = false } = options;

    const query = { organizationId };
    if (!includeInactive) {
      query.isActive = true;
    }

    return await FormTemplate.find(query)
      .sort({ createdAt: -1 })
      .lean();
  },

  // READ - By ID
  getFormTemplateById: async (id) => {
    if (!id) {
      throw new Error("Se requiere el ID del formulario");
    }

    const template = await FormTemplate.findById(id).lean();

    if (!template) {
      throw new Error("Formulario no encontrado");
    }

    return template;
  },

  // UPDATE
  updateFormTemplate: async (id, updateData) => {
    if (!id) {
      throw new Error("Se requiere el ID del formulario");
    }

    const template = await FormTemplate.findById(id);
    if (!template) {
      throw new Error("Formulario no encontrado");
    }

    const { name, description, questions, isActive } = updateData;

    if (name !== undefined) {
      if (!name.trim()) {
        throw new Error("El nombre no puede estar vacío");
      }
      template.name = name.trim();
    }

    if (description !== undefined) {
      template.description = description?.trim() || "";
    }

    if (questions !== undefined) {
      if (questions.length === 0) {
        throw new Error("El formulario debe tener al menos una pregunta");
      }

      // Validar preguntas
      for (const question of questions) {
        if (!question.questionText || !question.questionText.trim()) {
          throw new Error("Todas las preguntas deben tener texto");
        }
        if (!question.questionType) {
          throw new Error("Todas las preguntas deben tener un tipo");
        }
        if (
          ["single_choice", "multiple_choice"].includes(question.questionType) &&
          (!question.options || question.options.length < 2)
        ) {
          throw new Error(
            "Las preguntas de selección deben tener al menos 2 opciones"
          );
        }
      }

      // Asignar orden si no está definido
      template.questions = questions.map((q, index) => ({
        ...q,
        order: q.order ?? index,
      }));
    }

    if (isActive !== undefined) {
      template.isActive = isActive;
    }

    return await template.save();
  },

  // DELETE (soft delete)
  deleteFormTemplate: async (id) => {
    if (!id) {
      throw new Error("Se requiere el ID del formulario");
    }

    const template = await FormTemplate.findById(id);
    if (!template) {
      throw new Error("Formulario no encontrado");
    }

    template.isActive = false;
    await template.save();

    return { message: "Formulario eliminado exitosamente" };
  },

  // Validar que el template pertenece a la organización
  validateTemplateOrganization: async (organizationId, templateId) => {
    if (!templateId) return null;

    const template = await FormTemplate.findOne({
      _id: templateId,
      organizationId,
      isActive: true,
    });

    if (!template) {
      throw new Error("El formulario no pertenece a esta organización o no está activo");
    }

    return template;
  },
};

export default formTemplateService;
