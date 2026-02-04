import express from "express";
import dishController from "../controllers/dishController.js";

const router = express.Router();

// CREATE
router.post("/dishes", dishController.createDish);

// READ - By Organization
router.get(
  "/dishes/organization/:organizationId",
  dishController.getDishesByOrganizationId
);

// READ - Search
router.get(
  "/dishes/organization/:organizationId/search",
  dishController.searchDishes
);

// READ - By ID
router.get("/dishes/:id", dishController.getDishById);

// UPDATE
router.put("/dishes/:id", dishController.updateDish);

// DELETE
router.delete("/dishes/:id", dishController.deleteDish);

export default router;
