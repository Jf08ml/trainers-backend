import Employee from "../models/employeeModel.js";
import Organization from "../models/organizationModel.js";
import Client from "../models/clientModel.js";
import bcrypt from "bcryptjs";

const authService = {
  authenticateUser: async (email, password, organizationId) => {
    // 1. Buscar en la colección de empleados dentro de la organización correcta
    let user = await Employee.findOne({ email, organizationId }).populate(
      "role"
    );

    if (user && (await bcrypt.compare(password, user.password))) {
      return {
        ...user.toObject(),
        userType: "employee",
        organizationId: user.organizationId,
        userPermissions: [...user.role.permissions, ...user.customPermissions],
      };
    }

    // 2. Buscar en la colección de organizaciones (admin)
    if (email && organizationId) {
      user = await Organization.findOne({
        _id: organizationId,
        email,
      }).populate("role");
      if (user && (await bcrypt.compare(password, user.password))) {
        return {
          ...user.toObject(),
          userType: "admin",
          organizationId: user._id,
          userPermissions: user.role.permissions,
        };
      }
    }

    // 3. Buscar en la colección de clientes (sin necesidad de organizationId específico en la búsqueda)
    if (email && password) {
      user = await Client.findOne({ email });
      if (user && user.password && (await bcrypt.compare(password, user.password))) {
        return {
          ...user.toObject(),
          userType: "client",
          organizationId: user.organizationId,
          userPermissions: ["client"], // Permisos básicos de cliente
        };
      }
    }

    // Si no se encuentra el usuario o la contraseña no coincide
    throw new Error("Correo o contraseña incorrectos");
  },
};

export default authService;
