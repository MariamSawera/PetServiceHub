// TODO(backend): Replace every export in this file with real API calls.
// Suggested endpoints are noted above each block so the shape of the
// response is easy to match up when the API is ready.

// TODO(backend): GET /api/quick-actions (or keep static if these never change)
export const quickActions = [
  {
    id: "symptom-checker",
    title: "AI Symptom Checker",
    description: "Analyze your pet's health in seconds",
    icon: "Stethoscope",
    accent: "teal",
    href: "/symptom-checker",
  },
  {
    id: "book-appointment",
    title: "Book Appointment",
    description: "Schedule vet visits with trusted vets",
    icon: "Calendar",
    accent: "blue",
    href: "/appointments/new",
  },
  {
    id: "my-pets",
    title: "My Pets",
    description: "Manage pet profiles, records & vaccinations",
    icon: "PawPrint",
    accent: "purple",
    href: "/pets",
  },
  {
    id: "health-records",
    title: "Health Records",
    description: "Store and access health history",
    icon: "FileHeart",
    accent: "amber",
    href: "/records",
  },
  {
    id: "nearby-vets",
    title: "Nearby Vets",
    description: "Find trusted vets near you",
    icon: "MapPin",
    accent: "teal",
    href: "/vets",
  },
];

// TODO(backend): GET /api/categories
export const topCategories = [
  {
    id: "general-checkup",
    title: "General Checkup",
    description: "Regular health checkups",
    emoji: "🐶",
    accent: "mint",
  },
  {
    id: "vaccinations",
    title: "Vaccinations",
    description: "Keep your pets protected",
    emoji: "💉",
    accent: "sky",
  },
  {
    id: "dental-care",
    title: "Dental Care",
    description: "Clean teeth, happy pets",
    emoji: "🦷",
    accent: "violet",
  },
  {
    id: "nutrition",
    title: "Nutrition",
    description: "Healthy diet for a longer life",
    emoji: "🥣",
    accent: "peach",
  },
];

// TODO(backend): GET /api/clinics/nearby?lat=&lng=&limit=4
export const nearbyClinics = [
  {
    id: "happy-paws-clinic",
    name: "Happy Paws Clinic",
    distanceKm: 0.4,
    rating: 4.8,
    reviews: 120,
    image: "/images/clinic-1.jpg",
  },
  {
    id: "petcare-hospital",
    name: "PetCare Hospital",
    distanceKm: 1.2,
    rating: 4.6,
    reviews: 178,
    image: "/images/clinic-2.jpg",
  },
  {
    id: "city-vet-center",
    name: "City Vet Center",
    distanceKm: 1.6,
    rating: 4.7,
    reviews: 96,
    image: "/images/clinic-3.jpg",
  },
  {
    id: "paws-and-claws-vet",
    name: "Paws & Claws Vet",
    distanceKm: 2.1,
    rating: 4.5,
    reviews: 64,
    image: "/images/clinic-4.jpg",
  },
];

// TODO(backend): GET /api/trust-badges (or leave static, this rarely changes)
export const trustBadges = [
  { id: "trusted", label: "Trusted by pet parents", icon: "ShieldCheck" },
  { id: "secure", label: "Secure & Private", icon: "Lock" },
  { id: "ai", label: "AI Powered", icon: "Sparkles" },
  { id: "support", label: "24/7 Support", icon: "Headphones" },
];
