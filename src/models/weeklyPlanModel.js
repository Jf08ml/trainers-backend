import mongoose from "mongoose";

// Schema for a single day's session assignment
const DaySessionSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6, // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    // Track which exercises have been completed for this day's session
    completedExercises: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SessionExercise",
      },
    ],
  },
  { _id: false }
);

const weeklyPlanSchema = new mongoose.Schema(
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
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    // Optional: could also be assigned to an employee for their own training
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    weekDays: {
      type: [DaySessionSchema],
      default: [],
      validate: {
        validator: function (days) {
          // Ensure no duplicate days
          const dayNumbers = days.map((d) => d.dayOfWeek);
          return dayNumbers.length === new Set(dayNumbers).size;
        },
        message: "No puede haber días duplicados en el plan semanal",
      },
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= this.startDate;
        },
        message: "La fecha de fin debe ser posterior a la fecha de inicio",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    // Formulario de feedback asociado al plan
    formTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FormTemplate",
      default: null,
    },
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
weeklyPlanSchema.index({ clientId: 1, isActive: 1, startDate: -1 });

// Index for organization filtering
weeklyPlanSchema.index({ organizationId: 1, createdAt: -1 });

const WeeklyPlan = mongoose.model("WeeklyPlan", weeklyPlanSchema);
export default WeeklyPlan;
