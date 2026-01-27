import sessionGoalService from "../services/sessionGoalService.js";
import sendResponse from "../utils/sendResponse.js";

const sessionGoalController = {
  // CREATE
  createSessionGoal: async (req, res) => {
    try {
      const newSessionGoal = await sessionGoalService.createSessionGoal(
        req.body
      );
      sendResponse(res, 201, newSessionGoal, "Objetivo creado exitosamente");
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By Organization
  getSessionGoalsByOrganizationId: async (req, res) => {
    const { organizationId } = req.params;
    try {
      const sessionGoals =
        await sessionGoalService.getSessionGoalsByOrganizationId(
          organizationId
        );
      sendResponse(res, 200, sessionGoals, "Objetivos obtenidos exitosamente");
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By ID
  getSessionGoalById: async (req, res) => {
    const { id } = req.params;
    try {
      const sessionGoal = await sessionGoalService.getSessionGoalById(id);
      sendResponse(res, 200, sessionGoal, "Objetivo encontrado");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // UPDATE
  updateSessionGoal: async (req, res) => {
    const { id } = req.params;
    try {
      const updatedSessionGoal = await sessionGoalService.updateSessionGoal(
        id,
        req.body
      );
      sendResponse(
        res,
        200,
        updatedSessionGoal,
        "Objetivo actualizado exitosamente"
      );
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // DELETE
  deleteSessionGoal: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await sessionGoalService.deleteSessionGoal(id);
      sendResponse(res, 200, result, "Objetivo eliminado exitosamente");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },
};

export default sessionGoalController;
