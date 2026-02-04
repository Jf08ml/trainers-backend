import Exercise from "../models/exerciseModel.js";

const exerciseService = {
  // CREATE
  createExercise: async (exerciseData) => {
    const {
      name,
      description,
      muscleGroups,
      equipment,
      videoUrl,
      imageUrl,
      organizationId,
      createdBy,
      createdByModel,
    } = exerciseData;

    if (!name || !name.trim()) {
      throw new Error("El nombre del ejercicio es obligatorio");
    }

    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    const newExercise = new Exercise({
      name: name.trim(),
      description: description?.trim() || "",
      muscleGroups: muscleGroups || [],
      equipment: equipment || [],
      videoUrl: videoUrl?.trim() || "",
      imageUrl: imageUrl?.trim() || "",
      organizationId,
      createdBy,
      createdByModel: createdByModel || "Organization",
    });

    try {
      return await newExercise.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error(
          "Ya existe un ejercicio con este nombre en esta organización"
        );
      }
      throw error;
    }
  },

  // READ - All by Organization
  getExercisesByOrganizationId: async (organizationId) => {
    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    return await Exercise.find({ organizationId })
      .sort({ name: 1 })
      .lean();
  },

  // READ - Search/Filter
  searchExercises: async (organizationId, searchQuery = "", limit = 50) => {
    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    const query = { organizationId };

    if (searchQuery && searchQuery.trim()) {
      const searchRegex = { $regex: searchQuery.trim(), $options: "i" };
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { muscleGroups: searchRegex },
        { equipment: searchRegex },
      ];
    }

    return await Exercise.find(query)
      .limit(parseInt(limit))
      .sort({ name: 1 })
      .lean();
  },

  // READ - By ID
  getExerciseById: async (id) => {
    const exercise = await Exercise.findById(id);
    if (!exercise) {
      throw new Error("Ejercicio no encontrado");
    }
    return exercise;
  },

  // UPDATE
  updateExercise: async (id, exerciseData) => {
    const exercise = await Exercise.findById(id);

    if (!exercise) {
      throw new Error("Ejercicio no encontrado");
    }

    const {
      name,
      description,
      muscleGroups,
      equipment,
      videoUrl,
      imageUrl,
      editedBy,
      editedByModel,
    } = exerciseData;

    // Update fields selectively
    if (name !== undefined) exercise.name = name.trim();
    if (description !== undefined) exercise.description = description.trim();
    if (muscleGroups !== undefined) exercise.muscleGroups = muscleGroups;
    if (equipment !== undefined) exercise.equipment = equipment;
    if (videoUrl !== undefined) exercise.videoUrl = videoUrl.trim();
    if (imageUrl !== undefined) exercise.imageUrl = imageUrl.trim();

    // Track editor
    if (editedBy && editedByModel) {
      exercise.editedBy.push({
        userId: editedBy,
        userModel: editedByModel,
        editedAt: new Date(),
      });
    }

    try {
      return await exercise.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error(
          "Ya existe otro ejercicio con este nombre en esta organización"
        );
      }
      throw error;
    }
  },

  // DELETE
  deleteExercise: async (id) => {
    const exercise = await Exercise.findById(id);
    if (!exercise) {
      throw new Error("Ejercicio no encontrado");
    }

    await Exercise.deleteOne({ _id: id });
    return { message: "Ejercicio eliminado correctamente" };
  },
};

export default exerciseService;
