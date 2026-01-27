import MuscleGroup from "../models/muscleGroupModel.js";

const muscleGroupService = {
  // CREATE
  createMuscleGroup: async (muscleGroupData) => {
    const { name, organizationId, createdBy, createdByModel } = muscleGroupData;

    if (!name || !name.trim()) {
      throw new Error("El nombre del grupo muscular es obligatorio");
    }

    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    const newMuscleGroup = new MuscleGroup({
      name: name.trim(),
      organizationId,
      createdBy,
      createdByModel: createdByModel || "Organization",
    });

    try {
      return await newMuscleGroup.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error(
          "Ya existe un grupo muscular con este nombre en esta organización"
        );
      }
      throw error;
    }
  },

  // READ - All by Organization
  getMuscleGroupsByOrganizationId: async (organizationId) => {
    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    return await MuscleGroup.find({ organizationId }).sort({ name: 1 }).lean();
  },

  // READ - By ID
  getMuscleGroupById: async (id) => {
    const muscleGroup = await MuscleGroup.findById(id);
    if (!muscleGroup) {
      throw new Error("Grupo muscular no encontrado");
    }
    return muscleGroup;
  },

  // UPDATE
  updateMuscleGroup: async (id, muscleGroupData) => {
    const muscleGroup = await MuscleGroup.findById(id);

    if (!muscleGroup) {
      throw new Error("Grupo muscular no encontrado");
    }

    const { name, editedBy, editedByModel } = muscleGroupData;

    if (name !== undefined) muscleGroup.name = name.trim();

    // Track editor
    if (editedBy && editedByModel) {
      muscleGroup.editedBy.push({
        userId: editedBy,
        userModel: editedByModel,
        editedAt: new Date(),
      });
    }

    try {
      return await muscleGroup.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error(
          "Ya existe otro grupo muscular con este nombre en esta organización"
        );
      }
      throw error;
    }
  },

  // DELETE
  deleteMuscleGroup: async (id) => {
    const muscleGroup = await MuscleGroup.findById(id);
    if (!muscleGroup) {
      throw new Error("Grupo muscular no encontrado");
    }

    await MuscleGroup.deleteOne({ _id: id });
    return { message: "Grupo muscular eliminado correctamente" };
  },
};

export default muscleGroupService;
