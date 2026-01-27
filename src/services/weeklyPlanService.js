import WeeklyPlan from "../models/weeklyPlanModel.js";
import Session from "../models/sessionModel.js";
import Client from "../models/clientModel.js";
import Employee from "../models/employeeModel.js";
import formTemplateService from "./formTemplateService.js";
import formResponseService from "./formResponseService.js";

const weeklyPlanService = {
  // Validate that all sessions belong to the same organization
  validateSessionsOrganization: async (organizationId, sessionIds) => {
    if (!sessionIds || sessionIds.length === 0) return;

    // Get unique session IDs (same session can be assigned to multiple days)
    const uniqueSessionIds = [...new Set(sessionIds.filter(id => id))];
    if (uniqueSessionIds.length === 0) return;

    const sessions = await Session.find({
      _id: { $in: uniqueSessionIds },
      organizationId,
    });

    if (sessions.length !== uniqueSessionIds.length) {
      throw new Error(
        "Una o más sesiones no pertenecen a esta organización"
      );
    }
  },

  // Validate client belongs to organization
  validateClientOrganization: async (organizationId, clientId) => {
    const client = await Client.findOne({
      _id: clientId,
      organizationId,
    });

    if (!client) {
      throw new Error("El cliente no pertenece a esta organización");
    }

    return client;
  },

  // Validate employee belongs to organization (if provided)
  validateEmployeeOrganization: async (organizationId, employeeId) => {
    if (!employeeId) return null;

    const employee = await Employee.findOne({
      _id: employeeId,
      organizationId,
    });

    if (!employee) {
      throw new Error("El empleado no pertenece a esta organización");
    }

    return employee;
  },

  // CREATE
  createWeeklyPlan: async (planData) => {
    const {
      name,
      organizationId,
      clientId,
      employeeId,
      weekDays = [],
      startDate,
      endDate,
      notes,
      formTemplateId,
      createdBy,
      createdByModel,
    } = planData;

    if (!name || !name.trim()) {
      throw new Error("El nombre del plan es obligatorio");
    }

    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    if (!clientId) {
      throw new Error("Se requiere el ID del cliente");
    }

    if (!startDate || !endDate) {
      throw new Error("Se requieren fechas de inicio y fin");
    }

    // Validate client
    await weeklyPlanService.validateClientOrganization(
      organizationId,
      clientId
    );

    // Validate employee if provided
    if (employeeId) {
      await weeklyPlanService.validateEmployeeOrganization(
        organizationId,
        employeeId
      );
    }

    // Validate all sessions belong to organization
    const sessionIds = weekDays.map((day) => day.sessionId);
    await weeklyPlanService.validateSessionsOrganization(
      organizationId,
      sessionIds
    );

    // Validate formTemplate if provided
    if (formTemplateId) {
      await formTemplateService.validateTemplateOrganization(
        organizationId,
        formTemplateId
      );
    }

    const newPlan = new WeeklyPlan({
      name: name.trim(),
      organizationId,
      clientId,
      employeeId,
      weekDays,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      notes: notes?.trim() || "",
      formTemplateId: formTemplateId || null,
      createdBy,
      createdByModel,
    });

    return await newPlan.save();
  },

  // READ - All by Organization
  getWeeklyPlansByOrganizationId: async (organizationId) => {
    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    return await WeeklyPlan.find({ organizationId })
      .populate("clientId", "name email phoneNumber")
      .populate("employeeId", "names email")
      .populate("formTemplateId", "name")
      .populate({
        path: "weekDays.sessionId",
        select: "name type",
      })
      .sort({ createdAt: -1 })
      .lean();
  },

  // READ - By Client
  getWeeklyPlansByClientId: async (clientId, organizationId) => {
    if (!clientId) {
      throw new Error("Se requiere el ID del cliente");
    }

    const query = { clientId };
    if (organizationId) {
      query.organizationId = organizationId;
    }

    return await WeeklyPlan.find(query)
      .populate("formTemplateId", "name")
      .populate({
        path: "weekDays.sessionId",
        select: "name type goals muscleFocus",
        populate: [
          { path: "goals", select: "name" },
          { path: "muscleFocus", select: "name" },
        ],
      })
      .sort({ startDate: -1 })
      .lean();
  },

  // READ - Active plans for a client
  getActivePlansByClientId: async (clientId, organizationId) => {
    if (!clientId) {
      throw new Error("Se requiere el ID del cliente");
    }

    const now = new Date();
    // Compare endDate against start of today to include plans ending today
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const query = {
      clientId,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: startOfToday },
    };

    if (organizationId) {
      query.organizationId = organizationId;
    }

    return await WeeklyPlan.find(query)
      .populate("formTemplateId", "name")
      .populate({
        path: "weekDays.sessionId",
        select: "name type goals muscleFocus",
        populate: [
          { path: "goals", select: "name" },
          { path: "muscleFocus", select: "name" },
        ],
      })
      .sort({ startDate: -1 })
      .lean();
  },

  // READ - By ID (fully populated)
  getWeeklyPlanById: async (id) => {
    const plan = await WeeklyPlan.findById(id)
      .populate("clientId", "name email phoneNumber birthDate")
      .populate("employeeId", "names email")
      .populate("formTemplateId", "name description")
      .populate({
        path: "weekDays.sessionId",
        populate: [
          { path: "goals" },
          { path: "muscleFocus" },
        ],
      });

    if (!plan) {
      throw new Error("Plan semanal no encontrado");
    }

    return plan;
  },

  // UPDATE
  updateWeeklyPlan: async (id, planData) => {
    const plan = await WeeklyPlan.findById(id);

    if (!plan) {
      throw new Error("Plan semanal no encontrado");
    }

    const { name, weekDays, startDate, endDate, isActive, notes, formTemplateId, editedBy, editedByModel } = planData;

    // If updating weekDays, validate sessions
    if (weekDays) {
      const sessionIds = weekDays.map((day) => day.sessionId);
      await weeklyPlanService.validateSessionsOrganization(
        plan.organizationId.toString(),
        sessionIds
      );
      plan.weekDays = weekDays;
    }

    if (name !== undefined) plan.name = name.trim();
    if (startDate !== undefined) plan.startDate = new Date(startDate);
    if (endDate !== undefined) plan.endDate = new Date(endDate);
    if (isActive !== undefined) plan.isActive = isActive;
    if (notes !== undefined) plan.notes = notes?.trim() || "";

    // Handle formTemplateId update
    if (formTemplateId !== undefined) {
      if (formTemplateId) {
        await formTemplateService.validateTemplateOrganization(
          plan.organizationId.toString(),
          formTemplateId
        );
        plan.formTemplateId = formTemplateId;
      } else {
        plan.formTemplateId = null;
      }
    }

    // Track editor
    if (editedBy && editedByModel) {
      plan.editedBy.push({
        userId: editedBy,
        userModel: editedByModel,
        editedAt: new Date(),
      });
    }

    return await plan.save();
  },

  // UPDATE - Mark day as completed
  markDayCompleted: async (planId, dayOfWeek, completed = true) => {
    const plan = await WeeklyPlan.findById(planId);

    if (!plan) {
      throw new Error("Plan semanal no encontrado");
    }

    const dayIndex = plan.weekDays.findIndex((d) => d.dayOfWeek === dayOfWeek);

    if (dayIndex === -1) {
      throw new Error("Día no encontrado en el plan");
    }

    plan.weekDays[dayIndex].completed = completed;
    const savedPlan = await plan.save();

    // Si se marcó como completado, verificar si todos los días están completados
    // y crear FormResponse si el plan tiene formTemplateId
    if (completed && plan.formTemplateId) {
      const allDaysCompleted = savedPlan.weekDays.every((day) => day.completed);
      if (allDaysCompleted) {
        try {
          await formResponseService.createPendingResponseIfNeeded(planId);
        } catch (error) {
          console.error("Error creating form response:", error.message);
        }
      }
    }

    return savedPlan;
  },

  // UPDATE - Mark exercise as completed/uncompleted for a specific day
  markExerciseCompleted: async (planId, dayOfWeek, sessionExerciseId, completed = true) => {
    const plan = await WeeklyPlan.findById(planId);

    if (!plan) {
      throw new Error("Plan semanal no encontrado");
    }

    const dayIndex = plan.weekDays.findIndex((d) => d.dayOfWeek === dayOfWeek);

    if (dayIndex === -1) {
      throw new Error("Día no encontrado en el plan");
    }

    // Initialize completedExercises array if not exists
    if (!plan.weekDays[dayIndex].completedExercises) {
      plan.weekDays[dayIndex].completedExercises = [];
    }

    const exerciseIdStr = sessionExerciseId.toString();
    const existingIndex = plan.weekDays[dayIndex].completedExercises
      .findIndex(id => id.toString() === exerciseIdStr);

    if (completed && existingIndex === -1) {
      // Add to completed list
      plan.weekDays[dayIndex].completedExercises.push(sessionExerciseId);
    } else if (!completed && existingIndex !== -1) {
      // Remove from completed list
      plan.weekDays[dayIndex].completedExercises.splice(existingIndex, 1);
    }

    return await plan.save();
  },

  // DELETE
  deleteWeeklyPlan: async (id) => {
    const plan = await WeeklyPlan.findById(id);
    if (!plan) {
      throw new Error("Plan semanal no encontrado");
    }

    await WeeklyPlan.deleteOne({ _id: id });
    return { message: "Plan semanal eliminado correctamente" };
  },

  // DUPLICATE - Creates continuation for next week (Monday to Sunday)
  duplicateWeeklyPlan: async (id, newClientId = null) => {
    const plan = await WeeklyPlan.findById(id);
    if (!plan) {
      throw new Error("Plan semanal no encontrado");
    }

    // Find next Monday after the plan's end date
    const endDate = new Date(plan.endDate);
    const nextMonday = new Date(endDate);
    nextMonday.setDate(endDate.getDate() + 1);
    while (nextMonday.getDay() !== 1) {
      nextMonday.setDate(nextMonday.getDate() + 1);
    }
    // Reset time to start of day
    nextMonday.setHours(0, 0, 0, 0);

    // Sunday is 6 days after Monday
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    nextSunday.setHours(23, 59, 59, 999);

    // Generate continuation name with week number
    const getWeekNumber = (date) => {
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
      return Math.ceil((days + startOfYear.getDay() + 1) / 7);
    };

    const weekNumber = getWeekNumber(nextMonday);

    // Try to replace week number in name, or create new name
    let newName;
    const weekPattern = /Semana\s+\d+/i;
    if (weekPattern.test(plan.name)) {
      newName = plan.name.replace(weekPattern, `Semana ${weekNumber}`);
    } else {
      // Remove "(Copia)" suffix if exists and add week number
      const baseName = plan.name.replace(/\s*\(Copia\)\s*$/i, "").trim();
      newName = `${baseName} - Semana ${weekNumber}`;
    }

    const newPlan = new WeeklyPlan({
      name: newName,
      organizationId: plan.organizationId,
      clientId: newClientId || plan.clientId,
      employeeId: plan.employeeId,
      weekDays: plan.weekDays.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        sessionId: day.sessionId,
        notes: day.notes,
        completed: false, // Reset completion status
        completedExercises: [], // Reset completed exercises
      })),
      startDate: nextMonday,
      endDate: nextSunday,
      notes: plan.notes,
      formTemplateId: plan.formTemplateId, // Mantener el mismo formulario
      createdBy: plan.createdBy,
      createdByModel: plan.createdByModel,
    });

    const savedPlan = await newPlan.save();
    return await weeklyPlanService.getWeeklyPlanById(savedPlan._id);
  },
};

export default weeklyPlanService;
