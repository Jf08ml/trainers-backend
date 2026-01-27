import muscleGroupService from "../services/muscleGroupService.js";
import sendResponse from "../utils/sendResponse.js";

const muscleGroupController = {
  // CREATE
  createMuscleGroup: async (req, res) => {
    try {
      const newMuscleGroup = await muscleGroupService.createMuscleGroup(
        req.body
      );
      sendResponse(
        res,
        201,
        newMuscleGroup,
        "Grupo muscular creado exitosamente"
      );
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By Organization
  getMuscleGroupsByOrganizationId: async (req, res) => {
    const { organizationId } = req.params;
    try {
      const muscleGroups =
        await muscleGroupService.getMuscleGroupsByOrganizationId(
          organizationId
        );
      sendResponse(
        res,
        200,
        muscleGroups,
        "Grupos musculares obtenidos exitosamente"
      );
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By ID
  getMuscleGroupById: async (req, res) => {
    const { id } = req.params;
    try {
      const muscleGroup = await muscleGroupService.getMuscleGroupById(id);
      sendResponse(res, 200, muscleGroup, "Grupo muscular encontrado");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // UPDATE
  updateMuscleGroup: async (req, res) => {
    const { id } = req.params;
    try {
      const updatedMuscleGroup = await muscleGroupService.updateMuscleGroup(
        id,
        req.body
      );
      sendResponse(
        res,
        200,
        updatedMuscleGroup,
        "Grupo muscular actualizado exitosamente"
      );
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // DELETE
  deleteMuscleGroup: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await muscleGroupService.deleteMuscleGroup(id);
      sendResponse(res, 200, result, "Grupo muscular eliminado exitosamente");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },
};

export default muscleGroupController;
