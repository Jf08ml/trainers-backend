import express from "express";
import sessionController from "../controllers/sessionController.js";
import sessionExerciseController from "../controllers/sessionExerciseController.js";

const router = express.Router();

// ========== SESSIONS ==========
// CREATE
router.post(
  "/organizations/:organizationId/sessions",
  sessionController.createSession
);

// READ - By Organization
router.get(
  "/organizations/:organizationId/sessions",
  sessionController.getSessionsByOrganizationId
);

// READ - By ID (includes exercises)
router.get("/sessions/:id", sessionController.getSessionById);

// UPDATE
router.put("/sessions/:id", sessionController.updateSession);

// DELETE (cascade deletes session exercises)
router.delete("/sessions/:id", sessionController.deleteSession);

// DUPLICATE
router.post("/sessions/:id/duplicate", sessionController.duplicateSession);

// ========== SESSION EXERCISES ==========
// CREATE
router.post(
  "/sessions/:sessionId/exercises",
  sessionExerciseController.createSessionExercise
);

// READ - By Session
router.get(
  "/sessions/:sessionId/exercises",
  sessionExerciseController.getSessionExercisesBySessionId
);

// REORDER - Update order for multiple exercises
router.patch(
  "/sessions/:sessionId/exercises/reorder",
  sessionExerciseController.reorderSessionExercises
);

// READ - By ID
router.get(
  "/session-exercises/:id",
  sessionExerciseController.getSessionExerciseById
);

// UPDATE
router.patch(
  "/session-exercises/:id",
  sessionExerciseController.updateSessionExercise
);

// DELETE
router.delete(
  "/session-exercises/:id",
  sessionExerciseController.deleteSessionExercise
);

export default router;
