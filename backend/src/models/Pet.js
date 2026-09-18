import mongoose from "mongoose";

const vaccinationSchema = new mongoose.Schema(
  {
    vaccineName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    dateAdministered: {
      type: Date,
      required: true,
    },
    nextDueDate: {
      type: Date,
    },
    veterinarian: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

const petSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    species: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    breed: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    gender: {
      type: String,
      enum: ["male", "female", "unknown"],
      default: "unknown",
    },
    dateOfBirth: {
      type: Date,
    },
    weight: {
      type: Number,
      min: 0,
    },
    image: {
      type: String,
      trim: true,
    },
    medicalInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    vaccinations: {
      type: [vaccinationSchema],
      default: [],
    },
  },
  { timestamps: true }
);

petSchema.index({ owner: 1, createdAt: -1 });

const Pet = mongoose.model("Pet", petSchema);

export default Pet;
