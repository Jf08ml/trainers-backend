import equipmentService from "../services/equipmentService.js";
import sendResponse from "../utils/sendResponse.js";

const equipmentController = {
  // CREATE
  createEquipment: async (req, res) => {
    try {
      const newEquipment = await equipmentService.createEquipment(req.body);
      sendResponse(res, 201, newEquipment, "Equipamiento creado exitosamente");
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By Organization
  getEquipmentByOrganizationId: async (req, res) => {
    const { organizationId } = req.params;
    try {
      const equipment = await equipmentService.getEquipmentByOrganizationId(
        organizationId
      );
      sendResponse(
        res,
        200,
        equipment,
        "Equipamiento obtenido exitosamente"
      );
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By ID
  getEquipmentById: async (req, res) => {
    const { id } = req.params;
    try {
      const equipment = await equipmentService.getEquipmentById(id);
      sendResponse(res, 200, equipment, "Equipamiento encontrado");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // UPDATE
  updateEquipment: async (req, res) => {
    const { id } = req.params;
    try {
      const updatedEquipment = await equipmentService.updateEquipment(
        id,
        req.body
      );
      sendResponse(
        res,
        200,
        updatedEquipment,
        "Equipamiento actualizado exitosamente"
      );
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // DELETE
  deleteEquipment: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await equipmentService.deleteEquipment(id);
      sendResponse(res, 200, result, "Equipamiento eliminado exitosamente");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },
};

export default equipmentController;
