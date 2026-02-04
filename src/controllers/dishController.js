import dishService from "../services/dishService.js";
import sendResponse from "../utils/sendResponse.js";

const dishController = {
  // CREATE
  createDish: async (req, res) => {
    try {
      const newDish = await dishService.createDish(req.body);
      sendResponse(res, 201, newDish, "Plato creado exitosamente");
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By Organization
  getDishesByOrganizationId: async (req, res) => {
    const { organizationId } = req.params;
    try {
      const dishes = await dishService.getDishesByOrganizationId(organizationId);
      sendResponse(res, 200, dishes, "Platos obtenidos exitosamente");
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - Search
  searchDishes: async (req, res) => {
    const { organizationId } = req.params;
    const { search = "", category = "", limit = 50 } = req.query;
    try {
      const dishes = await dishService.searchDishes(
        organizationId,
        search,
        category,
        parseInt(limit)
      );
      sendResponse(res, 200, dishes, "Platos encontrados exitosamente");
    } catch (error) {
      sendResponse(res, 500, null, error.message);
    }
  },

  // READ - By ID
  getDishById: async (req, res) => {
    const { id } = req.params;
    try {
      const dish = await dishService.getDishById(id);
      sendResponse(res, 200, dish, "Plato encontrado");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // UPDATE
  updateDish: async (req, res) => {
    const { id } = req.params;
    try {
      const updatedDish = await dishService.updateDish(id, req.body);
      sendResponse(res, 200, updatedDish, "Plato actualizado exitosamente");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },

  // DELETE
  deleteDish: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await dishService.deleteDish(id);
      sendResponse(res, 200, result, "Plato eliminado exitosamente");
    } catch (error) {
      sendResponse(res, 404, null, error.message);
    }
  },
};

export default dishController;
