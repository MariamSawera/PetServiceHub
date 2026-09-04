import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Clinic from "../models/Clinic.js";
import User from "../models/User.js";

const providerEmail = "provider.demo@pawcare.com";
const providerPassword = "Provider123!";

const clinics = [
  {
    name: "Happy Paws Clinic",
    description: "Friendly everyday veterinary care for dogs, cats, and small pets.",
    phone: "+91 98765 10001",
    email: "hello@happypaws.example",
    address: "12 Jubilee Hills Road",
    city: "Hyderabad",
    state: "Telangana",
    postalCode: "500033",
    location: { type: "Point", coordinates: [78.4071, 17.4326] },
    specialties: ["Veterinary Care", "Vaccinations"],
    services: ["Wellness checks", "Dental care"],
    image: "/images/clinic-1.jpg",
    rating: 4.8,
    reviews: 120,
  },
  {
    name: "PetCare Hospital",
    description: "Full-service veterinary hospital with surgical and emergency support.",
    phone: "+91 98765 10002",
    email: "care@petcare.example",
    address: "28 Banjara Hills Road No. 12",
    city: "Hyderabad",
    state: "Telangana",
    postalCode: "500034",
    location: { type: "Point", coordinates: [78.4483, 17.4156] },
    specialties: ["Pet Surgery", "Emergency Care"],
    services: ["Surgery", "Diagnostics"],
    image: "/images/clinic-2.jpg",
    rating: 4.6,
    reviews: 178,
  },
  {
    name: "City Vet Center",
    description: "Modern companion-animal clinic focused on preventive and specialist care.",
    phone: "+91 98765 10003",
    email: "team@cityvet.example",
    address: "6 Himayatnagar Main Road",
    city: "Hyderabad",
    state: "Telangana",
    postalCode: "500029",
    location: { type: "Point", coordinates: [78.4867, 17.4065] },
    specialties: ["Pet Dermatology", "Veterinary Care"],
    services: ["Skin consultations", "Microchipping"],
    image: "/images/clinic-3.jpg",
    rating: 4.7,
    reviews: 96,
  },
  {
    name: "Paws & Claws Vet",
    description: "Neighbourhood veterinary care with thoughtful support for every pet parent.",
    phone: "+91 98765 10004",
    email: "hello@pawsclaws.example",
    address: "41 Kondapur Main Road",
    city: "Hyderabad",
    state: "Telangana",
    postalCode: "500084",
    location: { type: "Point", coordinates: [78.3618, 17.4584] },
    specialties: ["Veterinary Care", "Pet Nutrition"],
    services: ["Nutrition plans", "Routine care"],
    image: "/images/clinic-4.jpg",
    rating: 4.5,
    reviews: 64,
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const password = await bcrypt.hash(providerPassword, 10);
  const provider = await User.findOneAndUpdate(
    { email: providerEmail },
    {
      $set: {
        name: "Demo Provider",
        role: "provider",
        isVerified: true,
        authProvider: "local",
      },
      $setOnInsert: { email: providerEmail, password },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (!provider.password) {
    provider.password = password;
    await provider.save();
  }

  for (const clinic of clinics) {
    await Clinic.findOneAndUpdate(
      { owner: provider._id, name: clinic.name },
      { $set: clinic, $setOnInsert: { owner: provider._id } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`Seeded ${clinics.length} clinics for ${providerEmail}`);
  console.log(`Demo provider password: ${providerPassword}`);
};

seed()
  .catch((error) => {
    console.error("Clinic seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
