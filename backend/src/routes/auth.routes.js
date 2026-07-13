import express from "express";

import {
  register,
  login,
  logout,
  getMe,
} from "../controllers/auth.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/register", (req, res) => {
  return res.status(405).json({ message: "Use POST /api/auth/register to create a new account" });
});

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.get("/me", protectRoute, getMe);

export default router;