import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    questionType: {
      type: String,
      required: true,
    },
    // Value puede ser String, Number, o Array de Strings según el tipo
    value: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { _id: false }
);

const formResponseSchema = new mongoose.Schema(
  {
    formTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FormTemplate",
      required: true,
    },
    weeklyPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeeklyPlan",
      default: null, // Opcional - null para formularios iniciales
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    answers: [answerSchema],
    submittedAt: {
      type: Date,
      default: null,
    },
    // Tracking de autoría (quien creó el pending - sistema o manual)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "createdByModel",
    },
    createdByModel: {
      type: String,
      enum: ["Employee", "Organization", "System"],
      default: "System",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes para consultas comunes
formResponseSchema.index({ clientId: 1, status: 1 });
formResponseSchema.index({ organizationId: 1, status: 1 });
// Un plan solo tiene una respuesta (sparse para ignorar nulls de formularios iniciales)
formResponseSchema.index({ weeklyPlanId: 1 }, { unique: true, sparse: true });

const FormResponse = mongoose.model("FormResponse", formResponseSchema);
export default FormResponse;
