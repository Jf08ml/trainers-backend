import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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

// Composite unique index - prevents duplicate equipment names per organization
equipmentSchema.index(
  { name: 1, organizationId: 1 },
  {
    unique: true,
    name: "unique_equipment_per_organization",
  }
);

const Equipment = mongoose.model("Equipment", equipmentSchema);
export default Equipment;
