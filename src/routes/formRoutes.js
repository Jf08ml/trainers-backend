import express from "express";
import formTemplateController from "../controllers/formTemplateController.js";
import formResponseController from "../controllers/formResponseController.js";

const router = express.Router();

// ==================== FORM TEMPLATES ====================

// Crear plantilla de formulario
router.post(
  "/organizations/:organizationId/form-templates",
  formTemplateController.createFormTemplate
);

// Obtener plantillas por organización
router.get(
  "/organizations/:organizationId/form-templates",
  formTemplateController.getFormTemplatesByOrganizationId
);

// Obtener plantilla por ID
router.get("/form-templates/:id", formTemplateController.getFormTemplateById);

// Actualizar plantilla
router.put("/form-templates/:id", formTemplateController.updateFormTemplate);

// Eliminar plantilla (soft delete)
router.delete("/form-templates/:id", formTemplateController.deleteFormTemplate);

// ==================== FORM RESPONSES ====================

// Crear respuesta (generalmente llamado por sistema o cron)
router.post("/form-responses", formResponseController.createFormResponse);

// Obtener respuestas por cliente
router.get(
  "/clients/:clientId/form-responses",
  formResponseController.getFormResponsesByClientId
);

// Obtener formularios pendientes por cliente
router.get(
  "/clients/:clientId/form-responses/pending",
  formResponseController.getPendingFormResponsesByClientId
);

// Obtener respuesta por ID
router.get("/form-responses/:id", formResponseController.getFormResponseById);

// Enviar respuestas (completar formulario)
router.put("/form-responses/:id", formResponseController.submitFormResponse);

// Obtener respuesta de un plan semanal
router.get(
  "/weekly-plans/:planId/form-response",
  formResponseController.getFormResponseByWeeklyPlanId
);

// Obtener respuestas por organización (admin)
router.get(
  "/organizations/:organizationId/form-responses",
  formResponseController.getFormResponsesByOrganizationId
);

export default router;
