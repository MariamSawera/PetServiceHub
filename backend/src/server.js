import express from "express"
import cors from "cors";
import "dotenv/config";
import { connectDB } from './config/db.js';
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import passport from "./config/passport.js";
import uploadRoutes from "./routes/upload.js";
import profileRoutes from "./routes/profile.routes.js";
import petRoutes from "./routes/pet.routes.js";
import clinicRoutes from "./routes/clinic.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import reminderRoutes from "./routes/reminder.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import { createVaccinationNotifications } from "./services/notification.service.js";
import { apiRateLimiter } from "./middleware/rateLimiters.js";
import communityRoutes from "./routes/community.routes.js";



const app = express();
const PORT = process.env.PORT || 5000;

app.use(cookieParser());
app.use(passport.initialize());

app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true,
}));

app.use(express.json());
app.use("/api", apiRateLimiter);
app.use("/api/auth", authRoutes);
app.use("/api", uploadRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/clinics", clinicRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/community", communityRoutes);


app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is connected 🚀" });
});


connectDB()
  .then(() => {
    console.log("Database connected ✅");
    createVaccinationNotifications().catch((error) => console.error("Initial vaccination notification sweep failed", error));
    setInterval(() => {
      createVaccinationNotifications().catch((error) => console.error("Vaccination notification sweep failed", error));
    }, 24 * 60 * 60 * 1000);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Database connection failed ❌", err);
    process.exit(1); // exit if DB fails
  });


