import mongoose from "mongoose";

const dishSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["desayuno", "merienda_am", "almuerzo", "merienda_pm", "cena"],
    },
    ingredients: [
      {
        type: String,
        trim: true,
      },
    ],
    preparation: {
      type: String,
      trim: true,
    },
    nutritionalInfo: {
      calories: { type: Number, default: 0 },
      carbohydrates: { type: Number, default: 0 },
      fats: { type: Number, default: 0 },
      proteins: { type: Number, default: 0 },
    },
    notes: {
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

// Composite unique index - prevents duplicate dish name+category per organization
dishSchema.index(
  { name: 1, category: 1, organizationId: 1 },
  {
    unique: true,
    name: "unique_dish_name_category_per_organization",
  }
);

const Dish = mongoose.model("Dish", dishSchema);
export default Dish;
