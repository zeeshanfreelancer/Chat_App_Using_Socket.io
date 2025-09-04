import { useState } from "react";
import { register } from "../../services/AuthService";
import { toast } from "react-toastify";

const AUTH_IMAGE = "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YWl8ZW58MHx8MHx8fDA%3D";

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
      const res = await register(form); 
      console.log("Register response:", res); 

      const userData = res?.user || res?.data?.user;

      if (userData) {
          toast.success(`Welcome, ${userData.username}! 🎉 Registration successful.`);
          onRegister(); 
        }
      else {
            toast.error(res?.message || "Registration failed ❌");
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to register. Try again ❌");
        } finally {
          setLoading(false);
        }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
      <div className="h-[95%] flex flex-col md:flex-row w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden">
        {/* Image Section */}
        <div className="hidden md:block md:w-1/2 relative">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${AUTH_IMAGE})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 to-indigo-900/50 flex items-end">
            <div className="p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
              <p className="text-lg opacity-90">
                Create an account and discover a world of possibilities.
              </p>
            </div>
          </div>
        </div>
        
        {/* Form Section */}
        <div className="w-full h-[100%] md:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-2 md:hidden">
            <h1 className="text-3xl font-bold text-indigo-700">Create Account</h1>
            <p className="text-gray-600 mt-2">Join us and start your journey</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={form.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
                I agree to the <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms</a> and <a href="#" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition shadow-md disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                className="text-indigo-600 font-medium hover:text-indigo-500"
                onClick={() => setShowLogin(true)}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}