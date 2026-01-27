import express from "express";
import muscleGroupController from "../controllers/muscleGroupController.js";
import equipmentController from "../controllers/equipmentController.js";
import sessionGoalController from "../controllers/sessionGoalController.js";

const router = express.Router();

// ========== MUSCLE GROUPS ==========
// CREATE
router.post(
  "/organizations/:organizationId/muscle-groups",
  muscleGroupController.createMuscleGroup
);

// READ - By Organization
router.get(
  "/organizations/:organizationId/muscle-groups",
  muscleGroupController.getMuscleGroupsByOrganizationId
);

// READ - By ID
router.get("/muscle-groups/:id", muscleGroupController.getMuscleGroupById);

// UPDATE
router.put("/muscle-groups/:id", muscleGroupController.updateMuscleGroup);

// DELETE
router.delete("/muscle-groups/:id", muscleGroupController.deleteMuscleGroup);

// ========== EQUIPMENT ==========
// CREATE
router.post(
  "/organizations/:organizationId/equipment",
  equipmentController.createEquipment
);

// READ - By Organization
router.get(
  "/organizations/:organizationId/equipment",
  equipmentController.getEquipmentByOrganizationId
);

// READ - By ID
router.get("/equipment/:id", equipmentController.getEquipmentById);

// UPDATE
router.put("/equipment/:id", equipmentController.updateEquipment);

// DELETE
router.delete("/equipment/:id", equipmentController.deleteEquipment);

// ========== SESSION GOALS ==========
// CREATE
router.post(
  "/organizations/:organizationId/session-goals",
  sessionGoalController.createSessionGoal
);

// READ - By Organization
router.get(
  "/organizations/:organizationId/session-goals",
  sessionGoalController.getSessionGoalsByOrganizationId
);

// READ - By ID
router.get("/session-goals/:id", sessionGoalController.getSessionGoalById);

// UPDATE
router.put("/session-goals/:id", sessionGoalController.updateSessionGoal);

// DELETE
router.delete("/session-goals/:id", sessionGoalController.deleteSessionGoal);

export default router;
