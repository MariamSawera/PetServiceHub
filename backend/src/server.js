import express from "express"
import cors from "cors";
import dotenv from "dotenv"
import { connectDB } from './config/db.js';
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import passport from "./config/passport.js";



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cookieParser());
app.use(passport.initialize());

app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true,
}));

app.use(express.json());
app.use("/api/auth", authRoutes);


app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is connected 🚀" });
});


connectDB()
  .then(() => {
    console.log("Database connected ✅");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Database connection failed ❌", err);
    process.exit(1); // exit if DB fails
  });


