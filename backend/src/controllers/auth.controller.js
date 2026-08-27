import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import sendVerificationEmail from "../utils/sendEmail.js";
import passport from "../config/passport.js";  

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString("hex");

const user = await User.create({
  name,
  email,
  password: hashedPassword,

  isVerified: false,

  verificationToken,
  verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,

  authProvider: "local",
});

await sendVerificationEmail(email, verificationToken);

    // generateToken(user, res);

return res.status(201).json({
  message: "Registration successful. Please verify your email.",
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification link",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    return res.json({
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(401).json({ message: "This account uses Google login. Please continue with Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
  return res.status(403).json({
    message: "Please verify your email before logging in",
  });
}

    generateToken(user, res);
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });
  return res.json({ message: "Logged out successfully" });
};

export const getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  return res.json(req.user);
};

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});


// export const googleCallback = (req, res, next) => {
//   passport.authenticate(
//     "google",
//     { session: false },
//     (err, user) => {
//       if (err) {
//         console.error("Google authentication error:", err);

//         return res.status(500).json({
//           message: "Google authentication failed",
//         });
//       }

//       if (!user) {
//         return res.status(401).json({
//           message: "Google authentication failed",
//         });
//       }

//       // Generate your normal JWT cookie
//       generateToken(user, res);

//       // Redirect to your React frontend
//       return res.redirect("http://localhost:5173");
//     }
//   )(req, res, next);
// };    //with frontend

export const googleCallback = (req, res, next) => {
  passport.authenticate(
    "google",
    { session: false },
    (err, user) => {
      if (err) {
        console.error("Google authentication error:", err);

        return res.status(500).json({
          message: "Google authentication failed",
          error: err.message,
        });
      }

      if (!user) {
        return res.status(401).json({
          message: "Google authentication failed",
        });
      }

      // Generate JWT cookie
      generateToken(user, res);

      return res.json({
        message: "Google login successful",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          authProvider: user.authProvider,
        },
      });
    }
  )(req, res, next);
};