import nutritionPlanService from "../services/nutritionPlanService.js";
import sendResponse from "../utils/sendResponse.js";

const nutritionPlanController = {
  // CREATE
  createNutritionPlan: async (req, res) => {
    try {
      const newPlan = await nutritionPlanService.createNutritionPlan(req.body);
      sendResponse(res, 201, newPlan, "Plan nutricional creado exitosamente");
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By Organization
  getNutritionPlansByOrganizationId: async (req, res) => {
    const { organizationId } = req.params;
    try {
      const plans = await nutritionPlanService.getNutritionPlansByOrganizationId(
        organizationId
      );
      sendResponse(
        res,
        200,
        plans,
        "Planes nutricionales obtenidos exitosamente"
      );
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By Client
  getNutritionPlansByClientId: async (req, res) => {
    const { clientId } = req.params;
    const { organizationId } = req.query;
    try {
      const plans = await nutritionPlanService.getNutritionPlansByClientId(
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
  getActiveNutritionPlansByClientId: async (req, res) => {
    const { clientId } = req.params;
    const { organizationId } = req.query;
    try {
      const plans = await nutritionPlanService.getActiveNutritionPlansByClientId(
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
  getNutritionPlanById: async (req, res) => {
    const { id } = req.params;
    try {
      const plan = await nutritionPlanService.getNutritionPlanById(id);
      sendResponse(res, 200, plan, "Plan nutricional encontrado");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // UPDATE
  updateNutritionPlan: async (req, res) => {
    const { id } = req.params;
    try {
      const updatedPlan = await nutritionPlanService.updateNutritionPlan(
        id,
        req.body
      );
      sendResponse(
        res,
        200,
        updatedPlan,
        "Plan nutricional actualizado exitosamente"
      );
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // UPDATE - Client selections
  updateClientSelections: async (req, res) => {
    const { id } = req.params;
    const { selections } = req.body;
    try {
      const updatedPlan = await nutritionPlanService.updateClientSelections(
        id,
        selections
      );
      sendResponse(
        res,
        200,
        updatedPlan,
        "Selecciones actualizadas exitosamente"
      );
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // DELETE
  deleteNutritionPlan: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await nutritionPlanService.deleteNutritionPlan(id);
      sendResponse(res, 200, result, "Plan nutricional eliminado exitosamente");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },
};

export default nutritionPlanController;
