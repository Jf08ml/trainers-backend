import express from "express";
import exerciseController from "../controllers/exerciseController.js";

const router = express.Router();

// CREATE
router.post("/exercises", exerciseController.createExercise);

// READ - By Organization
router.get(
  "/exercises/organization/:organizationId",
  exerciseController.getExercisesByOrganizationId
);

// READ - Search
router.get(
  "/exercises/organization/:organizationId/search",
  exerciseController.searchExercises
);

// READ - By ID
router.get("/exercises/:id", exerciseController.getExerciseById);

// UPDATE
router.put("/exercises/:id", exerciseController.updateExercise);

// DELETE
router.delete("/exercises/:id", exerciseController.deleteExercise);

export default router;
