import SessionGoal from "../models/sessionGoalModel.js";

const sessionGoalService = {
  // CREATE
  createSessionGoal: async (sessionGoalData) => {
    const { name, organizationId, createdBy, createdByModel } = sessionGoalData;

    if (!name || !name.trim()) {
      throw new Error("El nombre del objetivo es obligatorio");
    }

    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    const newSessionGoal = new SessionGoal({
      name: name.trim(),
      organizationId,
      createdBy,
      createdByModel: createdByModel || "Organization",
    });

    try {
      return await newSessionGoal.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error(
          "Ya existe un objetivo con este nombre en esta organización"
        );
      }
      throw error;
    }
  },

  // READ - All by Organization
  getSessionGoalsByOrganizationId: async (organizationId) => {
    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    return await SessionGoal.find({ organizationId }).sort({ name: 1 }).lean();
  },

  // READ - By ID
  getSessionGoalById: async (id) => {
    const sessionGoal = await SessionGoal.findById(id);
    if (!sessionGoal) {
      throw new Error("Objetivo no encontrado");
    }
    return sessionGoal;
  },

  // UPDATE
  updateSessionGoal: async (id, sessionGoalData) => {
    const sessionGoal = await SessionGoal.findById(id);

    if (!sessionGoal) {
      throw new Error("Objetivo no encontrado");
    }

    const { name, editedBy, editedByModel } = sessionGoalData;

    if (name !== undefined) sessionGoal.name = name.trim();

    // Track editor
    if (editedBy && editedByModel) {
      sessionGoal.editedBy.push({
        userId: editedBy,
        userModel: editedByModel,
        editedAt: new Date(),
      });
    }

    try {
      return await sessionGoal.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error(
          "Ya existe otro objetivo con este nombre en esta organización"
        );
      }
      throw error;
    }
  },

  // DELETE
  deleteSessionGoal: async (id) => {
    const sessionGoal = await SessionGoal.findById(id);
    if (!sessionGoal) {
      throw new Error("Objetivo no encontrado");
    }

    await SessionGoal.deleteOne({ _id: id });
    return { message: "Objetivo eliminado correctamente" };
  },
};

export default sessionGoalService;
