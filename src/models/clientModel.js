import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
      // unique: true,
    },
    password: {
      type: String,
      required: false, // Opcional inicialmente, requerido si el cliente quiere login
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    // 🌍 Campos internacionales
    phone_e164: {
      type: String,
      required: false, // Se poblará progresivamente
      index: true,
    },
    phone_country: {
      type: String,
      required: false, // ISO2: CO, MX, PE, etc.
      maxlength: 2,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    birthDate: {
      type: Date,
      required: false,
    },
    // Entrenador/empleado asignado al cliente
    assignedEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// 🔒 Índice compuesto único: previene duplicados de phone_e164 por organización
// Solo aplica a documentos donde phone_e164 existe y es string (ignora null/undefined)
clientSchema.index(
  { phone_e164: 1, organizationId: 1 },
  { 
    unique: true,
    partialFilterExpression: { 
      phone_e164: { $exists: true, $type: 'string' }
    },
    name: 'unique_phone_per_organization'
  }
);

// 🔐 Middleware para hashear la contraseña antes de guardar
clientSchema.pre("save", async function (next) {
  // Solo hashear si el password fue modificado (o es nuevo)
  if (!this.isModified("password")) {
    return next();
  }

  // Si hay password, hashearlo
  if (this.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const Client = mongoose.model("Client", clientSchema);

export default Client;
