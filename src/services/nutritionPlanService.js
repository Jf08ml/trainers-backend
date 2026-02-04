import NutritionPlan from "../models/nutritionPlanModel.js";
import Dish from "../models/dishModel.js";
import Client from "../models/clientModel.js";

const nutritionPlanService = {
  // Validate that all dishes belong to the same organization
  validateDishesOrganization: async (organizationId, dishIds) => {
    if (!dishIds || dishIds.length === 0) return;

    const uniqueDishIds = [...new Set(dishIds.filter((id) => id))];
    if (uniqueDishIds.length === 0) return;

    const dishes = await Dish.find({
      _id: { $in: uniqueDishIds },
      organizationId,
    });

    if (dishes.length !== uniqueDishIds.length) {
      throw new Error("Uno o más platos no pertenecen a esta organización");
    }
  },

  // Validate client belongs to organization
  validateClientOrganization: async (organizationId, clientId) => {
    const client = await Client.findOne({
      _id: clientId,
      organizationId,
    });

    if (!client) {
      throw new Error("El cliente no pertenece a esta organización");
    }

    return client;
  },

  // Validate weekNumber/dayOfWeek fields on dish entries
  validateDishTemporalFields: (dishes, totalWeeks) => {
    for (const dish of dishes) {
      if (dish.weekNumber == null || dish.dayOfWeek == null) {
        throw new Error("Cada plato debe incluir weekNumber y dayOfWeek");
      }
      if (dish.weekNumber < 1 || dish.weekNumber > totalWeeks) {
        throw new Error(
          `weekNumber ${dish.weekNumber} está fuera del rango (1-${totalWeeks})`
        );
      }
      if (dish.dayOfWeek < 0 || dish.dayOfWeek > 6) {
        throw new Error(
          `dayOfWeek ${dish.dayOfWeek} está fuera del rango (0-6)`
        );
      }
    }
  },

  // CREATE
  createNutritionPlan: async (planData) => {
    const {
      name,
      organizationId,
      clientId,
      totalWeeks = 1,
      recommendedDishes = [],
      nutritionalTargets,
      notes,
      createdBy,
      createdByModel,
    } = planData;

    if (!name || !name.trim()) {
      throw new Error("El nombre del plan es obligatorio");
    }

    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    if (!clientId) {
      throw new Error("Se requiere el ID del cliente");
    }

    if (!Number.isInteger(totalWeeks) || totalWeeks < 1) {
      throw new Error("totalWeeks debe ser un número entero mayor o igual a 1");
    }

    // Validate client
    await nutritionPlanService.validateClientOrganization(
      organizationId,
      clientId
    );

    // Validate temporal fields on recommended dishes
    if (recommendedDishes.length > 0) {
      nutritionPlanService.validateDishTemporalFields(recommendedDishes, totalWeeks);
    }

    // Validate all recommended dishes belong to organization
    const dishIds = recommendedDishes.map((d) => d.dishId);
    await nutritionPlanService.validateDishesOrganization(
      organizationId,
      dishIds
    );

    const newPlan = new NutritionPlan({
      name: name.trim(),
      organizationId,
      clientId,
      totalWeeks,
      recommendedDishes,
      nutritionalTargets: nutritionalTargets || {},
      notes: notes?.trim() || "",
      createdBy,
      createdByModel: createdByModel || "Organization",
    });

    return await newPlan.save();
  },

  // READ - All by Organization
  getNutritionPlansByOrganizationId: async (organizationId) => {
    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    return await NutritionPlan.find({ organizationId })
      .populate("clientId", "name email phoneNumber")
      .populate("recommendedDishes.dishId", "name category nutritionalInfo")
      .sort({ createdAt: -1 })
      .lean();
  },

  // READ - By Client
  getNutritionPlansByClientId: async (clientId, organizationId) => {
    if (!clientId) {
      throw new Error("Se requiere el ID del cliente");
    }

    const query = { clientId };
    if (organizationId) {
      query.organizationId = organizationId;
    }

    return await NutritionPlan.find(query)
      .populate("recommendedDishes.dishId", "name category nutritionalInfo ingredients preparation imageUrl")
      .populate("clientSelections.dishId", "name category nutritionalInfo ingredients preparation imageUrl")
      .sort({ createdAt: -1 })
      .lean();
  },

  // READ - Active plans by Client
  getActiveNutritionPlansByClientId: async (clientId, organizationId) => {
    if (!clientId) {
      throw new Error("Se requiere el ID del cliente");
    }

    const query = {
      clientId,
      isActive: true,
    };

    if (organizationId) {
      query.organizationId = organizationId;
    }

    return await NutritionPlan.find(query)
      .populate("recommendedDishes.dishId", "name category nutritionalInfo ingredients preparation imageUrl notes")
      .populate("clientSelections.dishId", "name category nutritionalInfo ingredients preparation imageUrl notes")
      .sort({ createdAt: -1 })
      .lean();
  },

  // READ - By ID (fully populated)
  getNutritionPlanById: async (id) => {
    const plan = await NutritionPlan.findById(id)
      .populate("clientId", "name email phoneNumber")
      .populate("recommendedDishes.dishId")
      .populate("clientSelections.dishId");

    if (!plan) {
      throw new Error("Plan nutricional no encontrado");
    }

    return plan;
  },

  // UPDATE
  updateNutritionPlan: async (id, planData) => {
    const plan = await NutritionPlan.findById(id);

    if (!plan) {
      throw new Error("Plan nutricional no encontrado");
    }

    const {
      name,
      totalWeeks,
      recommendedDishes,
      nutritionalTargets,
      notes,
      isActive,
      editedBy,
      editedByModel,
    } = planData;

    // Update totalWeeks first so dish validation uses the new value
    if (totalWeeks !== undefined) {
      if (!Number.isInteger(totalWeeks) || totalWeeks < 1) {
        throw new Error("totalWeeks debe ser un número entero mayor o igual a 1");
      }
      plan.totalWeeks = totalWeeks;
    }

    // If updating recommendedDishes, validate they belong to org and have valid temporal fields
    if (recommendedDishes) {
      nutritionPlanService.validateDishTemporalFields(
        recommendedDishes,
        plan.totalWeeks
      );
      const dishIds = recommendedDishes.map((d) => d.dishId);
      await nutritionPlanService.validateDishesOrganization(
        plan.organizationId.toString(),
        dishIds
      );
      plan.recommendedDishes = recommendedDishes;
    }

    if (name !== undefined) plan.name = name.trim();
    if (nutritionalTargets !== undefined) plan.nutritionalTargets = nutritionalTargets;
    if (notes !== undefined) plan.notes = notes?.trim() || "";
    if (isActive !== undefined) plan.isActive = isActive;

    // Track editor
    if (editedBy && editedByModel) {
      plan.editedBy.push({
        userId: editedBy,
        userModel: editedByModel,
        editedAt: new Date(),
      });
    }

    return await plan.save();
  },

  // UPDATE - Client selections only
  updateClientSelections: async (id, selections) => {
    const plan = await NutritionPlan.findById(id);

    if (!plan) {
      throw new Error("Plan nutricional no encontrado");
    }

    // Validate temporal fields
    nutritionPlanService.validateDishTemporalFields(
      selections,
      plan.totalWeeks || 1
    );

    // Validate all selected dishes belong to org
    const dishIds = selections.map((s) => s.dishId);
    await nutritionPlanService.validateDishesOrganization(
      plan.organizationId.toString(),
      dishIds
    );

    plan.clientSelections = selections;
    return await plan.save();
  },

  // DELETE
  deleteNutritionPlan: async (id) => {
    const plan = await NutritionPlan.findById(id);
    if (!plan) {
      throw new Error("Plan nutricional no encontrado");
    }

    await NutritionPlan.deleteOne({ _id: id });
    return { message: "Plan nutricional eliminado correctamente" };
  },
};

export default nutritionPlanService;
