import SessionExercise from "../models/sessionExerciseModel.js";
import Session from "../models/sessionModel.js";
import Exercise from "../models/exerciseModel.js";

const sessionExerciseService = {
  // Validate session type compatibility with exercise config
  validateSessionTypeCompatibility: async (sessionId, configType) => {
    const session = await Session.findById(sessionId);
    if (!session) {
      throw new Error("Sesión no encontrada");
    }

    // Mixed sessions allow any exercise type
    if (session.type === "mixed") {
      return session;
    }

    if (session.type === "strength" && configType !== "strength") {
      throw new Error(
        "Solo se permiten ejercicios de fuerza en sesiones tipo 'strength'"
      );
    }

    if (
      session.type === "cardio" &&
      !["cardio_continuous", "cardio_interval"].includes(configType)
    ) {
      throw new Error(
        "Solo se permiten ejercicios de cardio en sesiones tipo 'cardio'"
      );
    }

    return session;
  },

  // Validate organization consistency
  validateOrganizationConsistency: async (
    sessionId,
    exerciseId,
    organizationId
  ) => {
    const session = await Session.findById(sessionId);
    const exercise = await Exercise.findById(exerciseId);

    if (!session) {
      throw new Error("Sesión no encontrada");
    }

    if (!exercise) {
      throw new Error("Ejercicio no encontrado");
    }

    if (session.organizationId.toString() !== organizationId.toString()) {
      throw new Error("La sesión no pertenece a esta organización");
    }

    if (exercise.organizationId.toString() !== organizationId.toString()) {
      throw new Error("El ejercicio no pertenece a esta organización");
    }

    return { session, exercise };
  },

  // CREATE
  createSessionExercise: async (sessionExerciseData) => {
    const {
      organizationId,
      sessionId,
      exerciseId,
      order = 0,
      notes,
      config,
    } = sessionExerciseData;

    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    if (!sessionId) {
      throw new Error("Se requiere el ID de la sesión");
    }

    if (!exerciseId) {
      throw new Error("Se requiere el ID del ejercicio");
    }

    if (!config || !config.type) {
      throw new Error("Se requiere la configuración del ejercicio");
    }

    // Validate organization consistency
    await sessionExerciseService.validateOrganizationConsistency(
      sessionId,
      exerciseId,
      organizationId
    );

    // Validate session type compatibility
    await sessionExerciseService.validateSessionTypeCompatibility(
      sessionId,
      config.type
    );

    // If order not provided, get next order number
    let finalOrder = order;
    if (order === 0 || order === undefined) {
      const lastExercise = await SessionExercise.findOne({ sessionId })
        .sort({ order: -1 })
        .lean();
      finalOrder = lastExercise ? lastExercise.order + 1 : 0;
    }

    const newSessionExercise = new SessionExercise({
      organizationId,
      sessionId,
      exerciseId,
      order: finalOrder,
      notes: notes?.trim() || "",
      config,
    });

    return await newSessionExercise.save();
  },

  // READ - All by Session
  getSessionExercisesBySessionId: async (sessionId) => {
    if (!sessionId) {
      throw new Error("Se requiere el ID de la sesión");
    }

    return await SessionExercise.find({ sessionId })
      .populate({
        path: "exerciseId",
        populate: [
          { path: "muscleGroups" },
          { path: "equipment" },
        ],
      })
      .sort({ order: 1 })
      .lean();
  },

  // READ - By ID
  getSessionExerciseById: async (id) => {
    const sessionExercise = await SessionExercise.findById(id).populate({
      path: "exerciseId",
      populate: [
        { path: "muscleGroups" },
        { path: "equipment" },
      ],
    });

    if (!sessionExercise) {
      throw new Error("Ejercicio de sesión no encontrado");
    }

    return sessionExercise;
  },

  // UPDATE
  updateSessionExercise: async (id, sessionExerciseData) => {
    const sessionExercise = await SessionExercise.findById(id);

    if (!sessionExercise) {
      throw new Error("Ejercicio de sesión no encontrado");
    }

    const { order, notes, config } = sessionExerciseData;

    // If config type is changing, validate compatibility
    if (config && config.type && config.type !== sessionExercise.config.type) {
      await sessionExerciseService.validateSessionTypeCompatibility(
        sessionExercise.sessionId,
        config.type
      );
    }

    if (order !== undefined) sessionExercise.order = order;
    if (notes !== undefined) sessionExercise.notes = notes?.trim() || "";
    if (config !== undefined) sessionExercise.config = config;

    return await sessionExercise.save();
  },

  // DELETE
  deleteSessionExercise: async (id) => {
    const sessionExercise = await SessionExercise.findById(id);
    if (!sessionExercise) {
      throw new Error("Ejercicio de sesión no encontrado");
    }

    await SessionExercise.deleteOne({ _id: id });
    return { message: "Ejercicio de sesión eliminado correctamente" };
  },

  // REORDER - Update order for multiple exercises
  reorderSessionExercises: async (sessionId, exerciseOrders) => {
    if (!sessionId) {
      throw new Error("Se requiere el ID de la sesión");
    }

    if (!Array.isArray(exerciseOrders) || exerciseOrders.length === 0) {
      throw new Error("Se requiere un array de ejercicios con sus órdenes");
    }

    // Update each exercise order
    const updatePromises = exerciseOrders.map(({ id, order }) =>
      SessionExercise.findByIdAndUpdate(
        id,
        { order },
        { new: true, runValidators: true }
      )
    );

    await Promise.all(updatePromises);

    return await sessionExerciseService.getSessionExercisesBySessionId(
      sessionId
    );
  },
};

export default sessionExerciseService;
