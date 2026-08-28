import { useState } from "react";
import api from "../lib/axios";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/signup", {
        name,
        email,
        password,
      });

      console.log("Signup successful:", response.data);

      alert(
        "Account created! Please check your email to verify your account."
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Signup failed"
      );
    }
  };

  const handleGoogleSignup = () => {
    window.location.href =
      "http://localhost:5000/api/auth/google";
  };

  return (
    <div>
      <h1>PetServiceHub</h1>

      <h2>Create Account</h2>

      <form onSubmit={handleSignup}>
        <div>
          <label>Name</label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>

        <div>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            minLength={6}
            required
          />
        </div>

        <button type="submit">
          Create Account
        </button>
      </form>

      <hr />

      <button onClick={handleGoogleSignup}>
        Continue with Google
      </button>
    </div>
  );
}

export default Signup;