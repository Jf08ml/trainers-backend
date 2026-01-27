import Session from "../models/sessionModel.js";
import SessionGoal from "../models/sessionGoalModel.js";
import MuscleGroup from "../models/muscleGroupModel.js";
import SessionExercise from "../models/sessionExerciseModel.js";
import Exercise from "../models/exerciseModel.js";

const sessionService = {
  // Validate that all references belong to the same organization
  validateOrganizationReferences: async (organizationId, references) => {
    const { goals = [], muscleFocus = [] } = references;

    // Validate goals
    if (goals && goals.length > 0) {
      const foundGoals = await SessionGoal.find({
        _id: { $in: goals },
        organizationId,
      });
      if (foundGoals.length !== goals.length) {
        throw new Error(
          "Uno o más objetivos no pertenecen a esta organización"
        );
      }
    }

    // Validate muscle groups
    if (muscleFocus && muscleFocus.length > 0) {
      const foundMuscles = await MuscleGroup.find({
        _id: { $in: muscleFocus },
        organizationId,
      });
      if (foundMuscles.length !== muscleFocus.length) {
        throw new Error(
          "Uno o más grupos musculares no pertenecen a esta organización"
        );
      }
    }
  },

  // CREATE
  createSession: async (sessionData) => {
    const {
      name,
      type,
      organizationId,
      goals = [],
      muscleFocus = [],
      notes,
      createdBy,
      createdByModel,
    } = sessionData;

    if (!name || !name.trim()) {
      throw new Error("El nombre de la sesión es obligatorio");
    }

    if (!type) {
      throw new Error("El tipo de sesión es obligatorio");
    }

    if (!["strength", "cardio", "mixed"].includes(type)) {
      throw new Error("El tipo de sesión debe ser 'strength', 'cardio' o 'mixed'");
    }

    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    // Validate all references belong to the same organization
    await sessionService.validateOrganizationReferences(organizationId, {
      goals,
      muscleFocus,
    });

    const newSession = new Session({
      name: name.trim(),
      type,
      organizationId,
      goals,
      muscleFocus,
      notes: notes?.trim() || "",
      createdBy,
      createdByModel: createdByModel || "Organization",
    });

    return await newSession.save();
  },

  // READ - All by Organization
  getSessionsByOrganizationId: async (organizationId) => {
    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    return await Session.find({ organizationId })
      .populate("goals")
      .populate("muscleFocus")
      .sort({ createdAt: -1 })
      .lean();
  },

  // READ - By ID (with exercises populated)
  getSessionById: async (id) => {
    const session = await Session.findById(id)
      .populate("goals")
      .populate("muscleFocus");

    if (!session) {
      throw new Error("Sesión no encontrada");
    }

    // Get session exercises with exercise details
    const sessionExercises = await SessionExercise.find({ sessionId: id })
      .populate({
        path: "exerciseId",
        populate: [
          { path: "muscleGroups" },
          { path: "equipment" },
        ],
      })
      .sort({ order: 1 })
      .lean();

    return {
      ...session.toObject(),
      exercises: sessionExercises,
    };
  },

  // UPDATE
  updateSession: async (id, sessionData) => {
    const session = await Session.findById(id);

    if (!session) {
      throw new Error("Sesión no encontrada");
    }

    const { name, type, goals, muscleFocus, notes, editedBy, editedByModel } = sessionData;

    // If type is being changed, validate compatibility with existing exercises
    if (type && type !== session.type) {
      const existingExercises = await SessionExercise.find({ sessionId: id });

      if (existingExercises.length > 0) {
        // Check if any exercises are incompatible
        const hasStrengthExercises = existingExercises.some(
          (ex) => ex.config.type === "strength"
        );
        const hasCardioExercises = existingExercises.some(
          (ex) =>
            ex.config.type === "cardio_continuous" ||
            ex.config.type === "cardio_interval"
        );

        if (type === "strength" && hasCardioExercises) {
          throw new Error(
            "No se puede cambiar a tipo 'strength': la sesión contiene ejercicios de cardio"
          );
        }

        if (type === "cardio" && hasStrengthExercises) {
          throw new Error(
            "No se puede cambiar a tipo 'cardio': la sesión contiene ejercicios de fuerza"
          );
        }
      }

      session.type = type;
    }

    // Validate references if provided
    if (goals || muscleFocus) {
      await sessionService.validateOrganizationReferences(
        session.organizationId.toString(),
        {
          goals: goals || session.goals,
          muscleFocus: muscleFocus || session.muscleFocus,
        }
      );
    }

    if (name !== undefined) session.name = name.trim();
    if (goals !== undefined) session.goals = goals;
    if (muscleFocus !== undefined) session.muscleFocus = muscleFocus;
    if (notes !== undefined) session.notes = notes?.trim() || "";

    // Track editor
    if (editedBy && editedByModel) {
      session.editedBy.push({
        userId: editedBy,
        userModel: editedByModel,
        editedAt: new Date(),
      });
    }

    return await session.save();
  },

  // DELETE (cascade delete session exercises)
  deleteSession: async (id) => {
    const session = await Session.findById(id);
    if (!session) {
      throw new Error("Sesión no encontrada");
    }

    // Delete all associated session exercises
    await SessionExercise.deleteMany({ sessionId: id });

    // Delete the session
    await Session.deleteOne({ _id: id });

    return { message: "Sesión eliminada correctamente" };
  },

  // DUPLICATE Session
  duplicateSession: async (id, duplicateData = {}) => {
    const session = await Session.findById(id);
    if (!session) {
      throw new Error("Sesión no encontrada");
    }

    const { createdBy, createdByModel } = duplicateData;

    // Create new session with same data but different name
    const newSession = new Session({
      name: `${session.name} (Copia)`,
      type: session.type,
      organizationId: session.organizationId,
      goals: session.goals,
      muscleFocus: session.muscleFocus,
      notes: session.notes,
      createdBy: createdBy || session.createdBy,
      createdByModel: createdByModel || session.createdByModel || "Organization",
    });

    const savedSession = await newSession.save();

    // Duplicate session exercises
    const sessionExercises = await SessionExercise.find({ sessionId: id });

    const duplicatedExercises = sessionExercises.map((ex) => ({
      organizationId: ex.organizationId,
      sessionId: savedSession._id,
      exerciseId: ex.exerciseId,
      order: ex.order,
      notes: ex.notes,
      config: ex.config,
    }));

    if (duplicatedExercises.length > 0) {
      await SessionExercise.insertMany(duplicatedExercises);
    }

    return await sessionService.getSessionById(savedSession._id);
  },
};

export default sessionService;
