import sessionExerciseService from "../services/sessionExerciseService.js";
import sendResponse from "../utils/sendResponse.js";

const sessionExerciseController = {
  // CREATE
  createSessionExercise: async (req, res) => {
    try {
      const newSessionExercise =
        await sessionExerciseService.createSessionExercise(req.body);
      sendResponse(
        res,
        201,
        newSessionExercise,
        "Ejercicio agregado a la sesión exitosamente"
      );
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By Session
  getSessionExercisesBySessionId: async (req, res) => {
    const { sessionId } = req.params;
    try {
      const sessionExercises =
        await sessionExerciseService.getSessionExercisesBySessionId(sessionId);
      sendResponse(
        res,
        200,
        sessionExercises,
        "Ejercicios de la sesión obtenidos exitosamente"
      );
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By ID
  getSessionExerciseById: async (req, res) => {
    const { id } = req.params;
    try {
      const sessionExercise =
        await sessionExerciseService.getSessionExerciseById(id);
      sendResponse(res, 200, sessionExercise, "Ejercicio de sesión encontrado");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // UPDATE
  updateSessionExercise: async (req, res) => {
    const { id } = req.params;
    try {
      const updatedSessionExercise =
        await sessionExerciseService.updateSessionExercise(id, req.body);
      sendResponse(
        res,
        200,
        updatedSessionExercise,
        "Ejercicio de sesión actualizado exitosamente"
      );
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // DELETE
  deleteSessionExercise: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await sessionExerciseService.deleteSessionExercise(id);
      sendResponse(
        res,
        200,
        result,
        "Ejercicio de sesión eliminado exitosamente"
      );
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // REORDER
  reorderSessionExercises: async (req, res) => {
    const { sessionId } = req.params;
    const { exerciseOrders } = req.body;
    try {
      const reorderedExercises =
        await sessionExerciseService.reorderSessionExercises(
          sessionId,
          exerciseOrders
        );
      sendResponse(
        res,
        200,
        reorderedExercises,
        "Ejercicios reordenados exitosamente"
      );
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },
};

export default sessionExerciseController;
