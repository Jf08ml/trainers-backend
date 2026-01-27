import formResponseService from "../services/formResponseService.js";
import sendResponse from "../utils/sendResponse.js";

const formResponseController = {
  // CREATE
  createFormResponse: async (req, res) => {
    try {
      const newResponse = await formResponseService.createFormResponse(req.body);
      sendResponse(res, 201, newResponse, "Respuesta creada exitosamente");
    } catch (error) {
      sendResponse(res, 400, null, error.message);
    }
  },

  // READ - By Client (all)
  getFormResponsesByClientId: async (req, res) => {
    const { clientId } = req.params;
    const { organizationId } = req.query;
    try {
      // Primero crear formularios pendientes para planes expirados
      await formResponseService.createPendingResponsesForExpiredPlans(
        clientId,
        organizationId
      );

      const responses = await formResponseService.getFormResponsesByClientId(
        clientId,
        organizationId
      );
      sendResponse(res, 200, responses, "Respuestas obtenidas exitosamente");
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - Pending by Client
  getPendingFormResponsesByClientId: async (req, res) => {
    const { clientId } = req.params;
    const { organizationId } = req.query;
    try {
      // Primero crear formularios pendientes para planes expirados
      await formResponseService.createPendingResponsesForExpiredPlans(
        clientId,
        organizationId
      );

      const responses = await formResponseService.getPendingFormResponsesByClientId(
        clientId,
        organizationId
      );
      sendResponse(res, 200, responses, "Formularios pendientes obtenidos exitosamente");
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By ID
  getFormResponseById: async (req, res) => {
    const { id } = req.params;
    try {
      const response = await formResponseService.getFormResponseById(id);
      sendResponse(res, 200, response, "Respuesta encontrada");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // READ - By Weekly Plan
  getFormResponseByWeeklyPlanId: async (req, res) => {
    const { planId } = req.params;
    try {
      const response = await formResponseService.getFormResponseByWeeklyPlanId(planId);
      sendResponse(res, 200, response, "Respuesta del plan obtenida");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // UPDATE - Submit answers
  submitFormResponse: async (req, res) => {
    const { id } = req.params;
    const { answers } = req.body;
    try {
      const updatedResponse = await formResponseService.submitFormResponse(id, answers);
      sendResponse(res, 200, updatedResponse, "Formulario enviado exitosamente");
    } catch (error) {
      sendResponse(res, 400, null, error.message);
    }
  },

  // READ - By Organization (admin)
  getFormResponsesByOrganizationId: async (req, res) => {
    const { organizationId } = req.params;
    const { status } = req.query;
    try {
      const responses = await formResponseService.getFormResponsesByOrganizationId(
        organizationId,
        status
      );
      sendResponse(res, 200, responses, "Respuestas obtenidas exitosamente");
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },
};

export default formResponseController;
