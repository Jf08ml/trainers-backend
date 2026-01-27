import formTemplateService from "../services/formTemplateService.js";
import sendResponse from "../utils/sendResponse.js";

const formTemplateController = {
  // CREATE
  createFormTemplate: async (req, res) => {
    try {
      const { organizationId } = req.params;
      const newTemplate = await formTemplateService.createFormTemplate({
        ...req.body,
        organizationId,
      });
      sendResponse(res, 201, newTemplate, "Formulario creado exitosamente");
    } catch (error) {
      sendResponse(res, 400, null, error.message);
    }
  },

  // READ - By Organization
  getFormTemplatesByOrganizationId: async (req, res) => {
    const { organizationId } = req.params;
    const { includeInactive } = req.query;
    try {
      const templates = await formTemplateService.getFormTemplatesByOrganizationId(
        organizationId,
        {
          includeInactive: includeInactive === "true",
        }
      );
      sendResponse(res, 200, templates, "Formularios obtenidos exitosamente");
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By ID
  getFormTemplateById: async (req, res) => {
    const { id } = req.params;
    try {
      const template = await formTemplateService.getFormTemplateById(id);
      sendResponse(res, 200, template, "Formulario encontrado");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // UPDATE
  updateFormTemplate: async (req, res) => {
    const { id } = req.params;
    try {
      const updatedTemplate = await formTemplateService.updateFormTemplate(
        id,
        req.body
      );
      sendResponse(res, 200, updatedTemplate, "Formulario actualizado exitosamente");
    } catch (error) {
      sendResponse(res, 400, null, error.message);
    }
  },

  // DELETE (soft delete)
  deleteFormTemplate: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await formTemplateService.deleteFormTemplate(id);
      sendResponse(res, 200, result, "Formulario eliminado exitosamente");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },
};

export default formTemplateController;
