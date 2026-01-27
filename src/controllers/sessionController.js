import sessionService from "../services/sessionService.js";
import sendResponse from "../utils/sendResponse.js";

const sessionController = {
  // CREATE
  createSession: async (req, res) => {
    try {
      const newSession = await sessionService.createSession(req.body);
      sendResponse(res, 201, newSession, "Sesión creada exitosamente");
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By Organization
  getSessionsByOrganizationId: async (req, res) => {
    const { organizationId } = req.params;
    try {
      const sessions = await sessionService.getSessionsByOrganizationId(
        organizationId
      );
      sendResponse(res, 200, sessions, "Sesiones obtenidas exitosamente");
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By ID (includes exercises)
  getSessionById: async (req, res) => {
    const { id } = req.params;
    try {
      const session = await sessionService.getSessionById(id);
      sendResponse(res, 200, session, "Sesión encontrada");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // UPDATE
  updateSession: async (req, res) => {
    const { id } = req.params;
    try {
      const updatedSession = await sessionService.updateSession(id, req.body);
      sendResponse(
        res,
        200,
        updatedSession,
        "Sesión actualizada exitosamente"
      );
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // DELETE
  deleteSession: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await sessionService.deleteSession(id);
      sendResponse(res, 200, result, "Sesión eliminada exitosamente");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // DUPLICATE
  duplicateSession: async (req, res) => {
    const { id } = req.params;
    try {
      const duplicatedSession = await sessionService.duplicateSession(id);
      sendResponse(
        res,
        201,
        duplicatedSession,
        "Sesión duplicada exitosamente"
      );
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },
};

export default sessionController;
