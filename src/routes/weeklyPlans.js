import express from "express";
import weeklyPlanController from "../controllers/weeklyPlanController.js";

const router = express.Router();

// CREATE
router.post(
  "/organizations/:organizationId/weekly-plans",
  weeklyPlanController.createWeeklyPlan
);

// READ - By Organization
router.get(
  "/organizations/:organizationId/weekly-plans",
  weeklyPlanController.getWeeklyPlansByOrganizationId
);

// READ - By Client
router.get(
  "/clients/:clientId/weekly-plans",
  weeklyPlanController.getWeeklyPlansByClientId
);

// READ - Active plans by Client
router.get(
  "/clients/:clientId/weekly-plans/active",
  weeklyPlanController.getActivePlansByClientId
);

// READ - By ID
router.get("/weekly-plans/:id", weeklyPlanController.getWeeklyPlanById);

// UPDATE
router.put("/weekly-plans/:id", weeklyPlanController.updateWeeklyPlan);

// UPDATE - Mark day completed
router.patch(
  "/weekly-plans/:id/mark-day",
  weeklyPlanController.markDayCompleted
);

// UPDATE - Mark exercise completed
router.patch(
  "/weekly-plans/:id/mark-exercise",
  weeklyPlanController.markExerciseCompleted
);

// DELETE
router.delete("/weekly-plans/:id", weeklyPlanController.deleteWeeklyPlan);

// DUPLICATE
router.post(
  "/weekly-plans/:id/duplicate",
  weeklyPlanController.duplicateWeeklyPlan
);

export default router;
