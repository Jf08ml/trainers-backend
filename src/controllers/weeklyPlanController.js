import weeklyPlanService from "../services/weeklyPlanService.js";
import sendResponse from "../utils/sendResponse.js";

const weeklyPlanController = {
  // CREATE
  createWeeklyPlan: async (req, res) => {
    try {
      const newPlan = await weeklyPlanService.createWeeklyPlan(req.body);
      sendResponse(res, 201, newPlan, "Plan semanal creado exitosamente");
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By Organization
  getWeeklyPlansByOrganizationId: async (req, res) => {
    const { organizationId } = req.params;
    try {
      const plans = await weeklyPlanService.getWeeklyPlansByOrganizationId(
        organizationId
      );
      sendResponse(
        res,
        200,
        plans,
        "Planes semanales obtenidos exitosamente"
      );
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By Client
  getWeeklyPlansByClientId: async (req, res) => {
    const { clientId } = req.params;
    const { organizationId } = req.query;
    try {
      const plans = await weeklyPlanService.getWeeklyPlansByClientId(
        clientId,
        organizationId
      );
      sendResponse(
        res,
        200,
        plans,
        "Planes del cliente obtenidos exitosamente"
      );
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - Active plans by Client
  getActivePlansByClientId: async (req, res) => {
    const { clientId } = req.params;
    const { organizationId } = req.query;
    try {
      const plans = await weeklyPlanService.getActivePlansByClientId(
        clientId,
        organizationId
      );
      sendResponse(
        res,
        200,
        plans,
        "Planes activos obtenidos exitosamente"
      );
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By ID
  getWeeklyPlanById: async (req, res) => {
    const { id } = req.params;
    try {
      const plan = await weeklyPlanService.getWeeklyPlanById(id);
      sendResponse(res, 200, plan, "Plan semanal encontrado");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // UPDATE
  updateWeeklyPlan: async (req, res) => {
    const { id } = req.params;
    try {
      const updatedPlan = await weeklyPlanService.updateWeeklyPlan(
        id,
        req.body
      );
      sendResponse(
        res,
        200,
        updatedPlan,
        "Plan semanal actualizado exitosamente"
      );
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // UPDATE - Mark day completed
  markDayCompleted: async (req, res) => {
    const { id } = req.params;
    const { dayOfWeek, completed } = req.body;
    try {
      const updatedPlan = await weeklyPlanService.markDayCompleted(
        id,
        dayOfWeek,
        completed
      );
      sendResponse(
        res,
        200,
        updatedPlan,
        "Estado de día actualizado exitosamente"
      );
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // UPDATE - Mark exercise completed
  markExerciseCompleted: async (req, res) => {
    const { id } = req.params;
    const { dayOfWeek, sessionExerciseId, completed } = req.body;
    try {
      const updatedPlan = await weeklyPlanService.markExerciseCompleted(
        id,
        dayOfWeek,
        sessionExerciseId,
        completed
      );
      sendResponse(
        res,
        200,
        updatedPlan,
        "Estado de ejercicio actualizado exitosamente"
      );
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // DELETE
  deleteWeeklyPlan: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await weeklyPlanService.deleteWeeklyPlan(id);
      sendResponse(res, 200, result, "Plan semanal eliminado exitosamente");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // DUPLICATE
  duplicateWeeklyPlan: async (req, res) => {
    const { id } = req.params;
    const { newClientId } = req.body;
    try {
      const duplicatedPlan = await weeklyPlanService.duplicateWeeklyPlan(
        id,
        newClientId
      );
      sendResponse(
        res,
        201,
        duplicatedPlan,
        "Plan semanal duplicado exitosamente"
      );
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },
};

export default weeklyPlanController;
