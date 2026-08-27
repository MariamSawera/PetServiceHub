import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(null, false);
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
          // If existing local account, connect Google to it
          if (!user.googleId) {
            user.googleId = profile.id;
          }

          user.authProvider = "google";
          user.isVerified = true;

          await user.save();

          return done(null, user);
        }

        // Create new Google user
        user = await User.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          authProvider: "google",
          isVerified: true,
          role: "user",
        });

        return done(null, user);
      } catch (error) {
        console.error("Google OAuth Error:", error);
        return done(error, null);
      }
    }
  )
);

export default passport;