import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["strength", "cardio", "mixed"],
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    goals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SessionGoal",
      },
    ],
    muscleFocus: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MuscleGroup",
      },
    ],
    notes: {
      type: String,
      trim: true,
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

// Index for organization filtering
sessionSchema.index({ organizationId: 1, createdAt: -1 });

const Session = mongoose.model("Session", sessionSchema);
export default Session;
