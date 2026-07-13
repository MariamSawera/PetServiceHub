import express from "express";

import {
  register,
  login,
  logout,
  getMe,
} from "../controllers/auth.controller.js";
import protectRoute from "../middleware/protectRoute.js";
import { signupValidator, loginValidator } from "../middleware/authValidators.js";

const router = express.Router();

router.post("/signup", signupValidator, register);

router.post("/login", loginValidator, login);

router.post("/logout", logout);

router.get("/me", protectRoute, getMe);

export default router;