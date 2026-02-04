import Dish from "../models/dishModel.js";

const dishService = {
  // CREATE
  createDish: async (dishData) => {
    const {
      name,
      category,
      ingredients,
      preparation,
      nutritionalInfo,
      notes,
      imageUrl,
      organizationId,
      createdBy,
      createdByModel,
    } = dishData;

    if (!name || !name.trim()) {
      throw new Error("El nombre del plato es obligatorio");
    }

    if (!category) {
      throw new Error("La categoría del plato es obligatoria");
    }

    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    const newDish = new Dish({
      name: name.trim(),
      category,
      ingredients: ingredients || [],
      preparation: preparation?.trim() || "",
      nutritionalInfo: nutritionalInfo || {},
      notes: notes?.trim() || "",
      imageUrl: imageUrl?.trim() || "",
      organizationId,
      createdBy,
      createdByModel: createdByModel || "Organization",
    });

    try {
      return await newDish.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error(
          "Ya existe un plato con este nombre y categoría en esta organización"
        );
      }
      throw error;
    }
  },

  // READ - All by Organization
  getDishesByOrganizationId: async (organizationId) => {
    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    return await Dish.find({ organizationId })
      .sort({ category: 1, name: 1 })
      .lean();
  },

  // READ - Search/Filter
  searchDishes: async (organizationId, searchQuery = "", category = "", limit = 50) => {
    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    const query = { organizationId };

    if (category && category.trim()) {
      query.category = category.trim();
    }

    if (searchQuery && searchQuery.trim()) {
      const searchRegex = { $regex: searchQuery.trim(), $options: "i" };
      query.$or = [
        { name: searchRegex },
        { ingredients: searchRegex },
      ];
    }

    return await Dish.find(query)
      .limit(parseInt(limit))
      .sort({ category: 1, name: 1 })
      .lean();
  },

  // READ - By ID
  getDishById: async (id) => {
    const dish = await Dish.findById(id);
    if (!dish) {
      throw new Error("Plato no encontrado");
    }
    return dish;
  },

  // UPDATE
  updateDish: async (id, dishData) => {
    const dish = await Dish.findById(id);

    if (!dish) {
      throw new Error("Plato no encontrado");
    }

    const {
      name,
      category,
      ingredients,
      preparation,
      nutritionalInfo,
      notes,
      imageUrl,
      editedBy,
      editedByModel,
    } = dishData;

    // Update fields selectively
    if (name !== undefined) dish.name = name.trim();
    if (category !== undefined) dish.category = category;
    if (ingredients !== undefined) dish.ingredients = ingredients;
    if (preparation !== undefined) dish.preparation = preparation.trim();
    if (nutritionalInfo !== undefined) dish.nutritionalInfo = nutritionalInfo;
    if (notes !== undefined) dish.notes = notes.trim();
    if (imageUrl !== undefined) dish.imageUrl = imageUrl.trim();

    // Track editor
    if (editedBy && editedByModel) {
      dish.editedBy.push({
        userId: editedBy,
        userModel: editedByModel,
        editedAt: new Date(),
      });
    }

    try {
      return await dish.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error(
          "Ya existe otro plato con este nombre y categoría en esta organización"
        );
      }
      throw error;
    }
  },

  // DELETE
  deleteDish: async (id) => {
    const dish = await Dish.findById(id);
    if (!dish) {
      throw new Error("Plato no encontrado");
    }

    await Dish.deleteOne({ _id: id });
    return { message: "Plato eliminado correctamente" };
  },
};

export default dishService;
