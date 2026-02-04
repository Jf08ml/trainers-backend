import mongoose from "mongoose";

const MEAL_TYPES = ["desayuno", "merienda_am", "almuerzo", "merienda_pm", "cena"];

// dayOfWeek: 0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes, 5=Sábado, 6=Domingo

const RecommendedDishSchema = new mongoose.Schema(
  {
    dishId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
      required: true,
    },
    mealType: {
      type: String,
      required: true,
      enum: MEAL_TYPES,
    },
    weekNumber: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
      default: 0,
    },
  },
  { _id: false }
);

const ClientSelectionSchema = new mongoose.Schema(
  {
    dishId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
      required: true,
    },
    mealType: {
      type: String,
      required: true,
      enum: MEAL_TYPES,
    },
    weekNumber: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
      default: 0,
    },
  },
  { _id: false }
);

const nutritionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    totalWeeks: {
      type: Number,
      default: 1,
      min: 1,
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
    recommendedDishes: {
      type: [RecommendedDishSchema],
      default: [],
    },
    clientSelections: {
      type: [ClientSelectionSchema],
      default: [],
    },
    nutritionalTargets: {
      calories: { type: Number, default: 0 },
      carbohydrates: { type: Number, default: 0 },
      fats: { type: Number, default: 0 },
      proteins: { type: Number, default: 0 },
    },
    notes: {
      type: String,
      trim: true,
    },
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

// Composite index for finding active plans for a client
nutritionPlanSchema.index({ clientId: 1, isActive: 1 });

// Index for organization filtering
nutritionPlanSchema.index({ organizationId: 1, createdAt: -1 });

const NutritionPlan = mongoose.model("NutritionPlan", nutritionPlanSchema);
export default NutritionPlan;
