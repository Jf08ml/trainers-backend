import exerciseService from "../services/exerciseService.js";
import sendResponse from "../utils/sendResponse.js";

const exerciseController = {
  // CREATE
  createExercise: async (req, res) => {
    try {
      const newExercise = await exerciseService.createExercise(req.body);
      sendResponse(res, 201, newExercise, "Ejercicio creado exitosamente");
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By Organization
  getExercisesByOrganizationId: async (req, res) => {
    const { organizationId } = req.params;
    try {
      const exercises = await exerciseService.getExercisesByOrganizationId(
        organizationId
      );
      sendResponse(res, 200, exercises, "Ejercicios obtenidos exitosamente");
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - Search
  searchExercises: async (req, res) => {
    const { organizationId } = req.params;
    const { search = "", limit = 50 } = req.query;
    try {
      const exercises = await exerciseService.searchExercises(
        organizationId,
        search,
        parseInt(limit)
      );
      sendResponse(res, 200, exercises, "Ejercicios encontrados exitosamente");
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By ID
  getExerciseById: async (req, res) => {
    const { id } = req.params;
    try {
      const exercise = await exerciseService.getExerciseById(id);
      sendResponse(res, 200, exercise, "Ejercicio encontrado");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // UPDATE
  updateExercise: async (req, res) => {
    const { id } = req.params;
    try {
      const updatedExercise = await exerciseService.updateExercise(
        id,
        req.body
      );
      sendResponse(
        res,
        200,
        updatedExercise,
        "Ejercicio actualizado exitosamente"
      );
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // DELETE
  deleteExercise: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await exerciseService.deleteExercise(id);
      sendResponse(res, 200, result, "Ejercicio eliminado exitosamente");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },
};

export default exerciseController;
