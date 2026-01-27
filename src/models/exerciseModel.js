import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    muscleGroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MuscleGroup",
      },
    ],
    difficulty: {
      type: String,
      enum: ["principiante", "intermedio", "avanzado"],
      default: "intermedio",
    },
    equipment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Equipment",
      },
    ],
    videoUrl: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
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
    editedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "editedBy.userModel",
        },
        userModel: {
          type: String,
          enum: ["Employee", "Organization"],
        },
        editedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Composite unique index - prevents duplicate exercise names per organization
exerciseSchema.index(
  { name: 1, organizationId: 1 },
  {
    unique: true,
    name: "unique_exercise_name_per_organization",
  }
);

const Exercise = mongoose.model("Exercise", exerciseSchema);
export default Exercise;
