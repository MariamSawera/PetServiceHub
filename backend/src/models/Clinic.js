import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema(
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
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    website: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    city: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    state: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (coordinates) => coordinates.length === 2,
          message: "Location coordinates must be [longitude, latitude]",
        },
      },
    },
    image: {
      type: String,
      trim: true,
    },
    specialties: {
      type: [String],
      default: [],
    },
    services: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

clinicSchema.index({ city: 1, createdAt: -1 });
clinicSchema.index({ owner: 1, createdAt: -1 });
clinicSchema.index({ location: "2dsphere" });

const Clinic = mongoose.model("Clinic", clinicSchema);

export default Clinic;