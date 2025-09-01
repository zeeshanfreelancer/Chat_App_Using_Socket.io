import { useState } from "react";
import { register } from "../../services/AuthService";
import { toast } from "react-toastify";

export default function Register({ onRegister, setShowLogin }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    bio: "",
    profilePic: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      onRegister(user);
      toast.success("Registration successful! 🎉 You can now login.");
      setShowLogin(true); // Redirect to login after success
    } catch (err) {
      toast.error("Failed to register. Try again ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
          required
        />

        <textarea
          name="bio"
          placeholder="Your Bio"
          value={form.bio}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
        ></textarea>

        <input
          type="text"
          name="profilePic"
          placeholder="Profile Picture URL"
          value={form.profilePic}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <div className="mt-4 text-center">
        <span>Already have an account? </span>
        <button
          type="button"
          className="text-blue-500 underline"
          onClick={() => setShowLogin(true)}
        >
          Login
        </button>
      </div>
    </div>
  );
}
