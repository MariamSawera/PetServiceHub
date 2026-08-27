import express from "express";

import {
  register,
  login,
  logout,
  verifyEmail,
  getMe,
  googleAuth,
  googleCallback,
} from "../controllers/auth.controller.js";
import protectRoute from "../middleware/protectRoute.js";
import { signupValidator, loginValidator } from "../middleware/authValidators.js";

const router = express.Router();

router.post("/signup", signupValidator, register);

router.post("/login", loginValidator, login);

router.post("/logout", logout);

router.get("/me", protectRoute, getMe);

router.get("/verify-email/:token", verifyEmail);

router.get(
  "/google",
  googleAuth
);

router.get(
  "/google/callback",
  googleCallback
);

export default router;