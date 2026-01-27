import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    questionType: {
      type: String,
      enum: [
        "text",
        "textarea",
        "number",
        "single_choice",
        "multiple_choice",
        "scale",
        "yes_no",
      ],
      required: true,
    },
    required: {
      type: Boolean,
      default: true,
    },
    // Para single_choice y multiple_choice
    options: [
      {
        type: String,
        trim: true,
      },
    ],
    // Para scale
    scaleMin: {
      type: Number,
      default: 1,
    },
    scaleMax: {
      type: Number,
      default: 10,
    },
    scaleMinLabel: {
      type: String,
      trim: true,
      default: "",
    },
    scaleMaxLabel: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true }
);

const formTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    questions: [questionSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    // Tracking de autoría
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "createdByModel",
    },
    createdByModel: {
      type: String,
      enum: ["Employee", "Organization"],
      default: "Organization",
    },
  },
  {
    timestamps: true,
  }
);

// Index for organization filtering
formTemplateSchema.index({ organizationId: 1, isActive: 1 });
formTemplateSchema.index({ organizationId: 1, createdAt: -1 });

const FormTemplate = mongoose.model("FormTemplate", formTemplateSchema);
export default FormTemplate;
