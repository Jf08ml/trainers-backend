import express from "express";
import nutritionPlanController from "../controllers/nutritionPlanController.js";

const router = express.Router();

// CREATE
router.post(
  "/organizations/:organizationId/nutrition-plans",
  nutritionPlanController.createNutritionPlan
);

// READ - By Organization
router.get(
  "/organizations/:organizationId/nutrition-plans",
  nutritionPlanController.getNutritionPlansByOrganizationId
);

// READ - By Client
router.get(
  "/clients/:clientId/nutrition-plans",
  nutritionPlanController.getNutritionPlansByClientId
);

// READ - Active plans by Client
router.get(
  "/clients/:clientId/nutrition-plans/active",
  nutritionPlanController.getActiveNutritionPlansByClientId
);

// READ - By ID
router.get(
  "/nutrition-plans/:id",
  nutritionPlanController.getNutritionPlanById
);

// UPDATE
router.put(
  "/nutrition-plans/:id",
  nutritionPlanController.updateNutritionPlan
);

// UPDATE - Client selections
router.put(
  "/nutrition-plans/:id/selections",
  nutritionPlanController.updateClientSelections
);

// DELETE
router.delete(
  "/nutrition-plans/:id",
  nutritionPlanController.deleteNutritionPlan
);

export default router;
