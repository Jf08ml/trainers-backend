import mongoose from "mongoose";

// Schema for strength set configuration
const StrengthSetSchema = new mongoose.Schema(
  {
    load: {
      type: Number,
      min: 0,
    },
    repsMin: {
      type: Number,
      required: true,
      min: 1,
    },
    repsMax: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: function (value) {
          return value >= this.repsMin;
        },
        message: "repsMax debe ser mayor o igual a repsMin",
      },
    },
    restSeconds: {
      type: Number,
      min: 0,
    },
    rpe: {
      type: Number,
      min: 1,
      max: 10,
    },
  },
  { _id: false }
);

// Schema for strength configuration
const StrengthConfigSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["strength"],
      required: true,
      default: "strength",
    },
    sets: {
      type: [StrengthSetSchema],
      required: true,
      validate: {
        validator: function (sets) {
          return sets && sets.length >= 1;
        },
        message: "Se requiere al menos 1 set para ejercicios de fuerza",
      },
    },
  },
  { _id: false }
);

// Schema for cardio continuous configuration
const CardioContinuousConfigSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["cardio_continuous"],
      required: true,
      default: "cardio_continuous",
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 0.1,
    },
    effort: {
      type: Number,
      min: 1,
      max: 10,
    },
    zone: {
      type: Number,
      min: 1,
      max: 5,
    },
    pace: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

// Schema for cardio interval configuration
const CardioIntervalConfigSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["cardio_interval"],
      required: true,
      default: "cardio_interval",
    },
    workSeconds: {
      type: Number,
      required: true,
      min: 1,
    },
    restSeconds: {
      type: Number,
      required: true,
      min: 0,
    },
    rounds: {
      type: Number,
      required: true,
      min: 1,
    },
    workEffort: {
      type: Number,
      min: 1,
      max: 10,
    },
    restEffort: {
      type: Number,
      min: 1,
      max: 10,
    },
  },
  { _id: false }
);

const sessionExerciseSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      validate: {
        validator: function (config) {
          if (!config || !config.type) {
            return false;
          }

          const validTypes = ["strength", "cardio_continuous", "cardio_interval"];
          if (!validTypes.includes(config.type)) {
            return false;
          }

          // Validate based on config type
          if (config.type === "strength") {
            return (
              Array.isArray(config.sets) &&
              config.sets.length >= 1 &&
              config.sets.every(
                (set) =>
                  set.repsMin !== undefined &&
                  set.repsMax !== undefined &&
                  set.repsMin >= 1 &&
                  set.repsMax >= set.repsMin
              )
            );
          }

          if (config.type === "cardio_continuous") {
            return (
              config.durationMinutes !== undefined && config.durationMinutes > 0
            );
          }

          if (config.type === "cardio_interval") {
            return (
              config.workSeconds !== undefined &&
              config.workSeconds > 0 &&
              config.restSeconds !== undefined &&
              config.restSeconds >= 0 &&
              config.rounds !== undefined &&
              config.rounds > 0
            );
          }

          return false;
        },
        message: "Configuración de ejercicio inválida según el tipo especificado",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying by session
sessionExerciseSchema.index({ sessionId: 1, order: 1 });

const SessionExercise = mongoose.model("SessionExercise", sessionExerciseSchema);
export default SessionExercise;
