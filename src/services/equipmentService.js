import Equipment from "../models/equipmentModel.js";

const equipmentService = {
  // CREATE
  createEquipment: async (equipmentData) => {
    const { name, organizationId, createdBy, createdByModel } = equipmentData;

    if (!name || !name.trim()) {
      throw new Error("El nombre del equipamiento es obligatorio");
    }

    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    const newEquipment = new Equipment({
      name: name.trim(),
      organizationId,
      createdBy,
      createdByModel: createdByModel || "Organization",
    });

    try {
      return await newEquipment.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error(
          "Ya existe un equipamiento con este nombre en esta organización"
        );
      }
      throw error;
    }
  },

  // READ - All by Organization
  getEquipmentByOrganizationId: async (organizationId) => {
    if (!organizationId) {
      throw new Error("Se requiere el ID de la organización");
    }

    return await Equipment.find({ organizationId }).sort({ name: 1 }).lean();
  },

  // READ - By ID
  getEquipmentById: async (id) => {
    const equipment = await Equipment.findById(id);
    if (!equipment) {
      throw new Error("Equipamiento no encontrado");
    }
    return equipment;
  },

  // UPDATE
  updateEquipment: async (id, equipmentData) => {
    const equipment = await Equipment.findById(id);

    if (!equipment) {
      throw new Error("Equipamiento no encontrado");
    }

    const { name, editedBy, editedByModel } = equipmentData;

    if (name !== undefined) equipment.name = name.trim();

    // Track editor
    if (editedBy && editedByModel) {
      equipment.editedBy.push({
        userId: editedBy,
        userModel: editedByModel,
        editedAt: new Date(),
      });
    }

    try {
      return await equipment.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error(
          "Ya existe otro equipamiento con este nombre en esta organización"
        );
      }
      throw error;
    }
  },

  // DELETE
  deleteEquipment: async (id) => {
    const equipment = await Equipment.findById(id);
    if (!equipment) {
      throw new Error("Equipamiento no encontrado");
    }

    await Equipment.deleteOne({ _id: id });
    return { message: "Equipamiento eliminado correctamente" };
  },
};

export default equipmentService;
