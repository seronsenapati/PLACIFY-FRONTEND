import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "", // ✅ added
    email: "",
    password: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (errorMsg || successMsg) {
      const timer = setTimeout(() => {
        setErrorMsg("");
        setSuccessMsg("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, successMsg]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      await api.post("/auth/register", formData);
      navigate("/login", {
        state: { message: "Registration successful. Please log in." },
      });
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #ffffff14 0%, rgba(255, 255, 255, 0.12) 19%, rgba(255, 255, 255, 0.05) 28%, transparent 35%, transparent 100%), linear-gradient(to bottom, #18181b, #000000)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="p-6 mt-13 rounded-xl shadow-2xl border border-white/20 mt-10 bg-white/5 backdrop-blur-lg">
          <div className="text-center mb-3">
            <h2 className="text-3xl font-bold text-white">Create an Account</h2>
            <p className="mt-2 text-gray-300">Join us today</p>
          </div>

          {successMsg && (
            <div className="mb-6 p-3 bg-green-500/20 text-green-300 text-sm rounded-md flex justify-between items-center">
              <span>{successMsg}</span>
              <button
                onClick={() => setSuccessMsg("")}
                className="text-green-300 hover:text-green-100"
                aria-label="Dismiss success"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-500/20 text-red-300 text-sm rounded-md flex justify-between items-center">
              <span>{errorMsg}</span>
              <button
                onClick={() => setErrorMsg("")}
                className="text-red-300 hover:text-red-100"
                aria-label="Dismiss error"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-2.5 border border-gray-500 rounded-lg focus:ring-2 focus:ring-gray-800 bg-transparent text-white"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* ✅ New Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-4 py-2.5 border border-gray-500 rounded-lg focus:ring-2 focus:ring-gray-800 bg-transparent text-white"
                placeholder="johndoe123"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-2.5 border border-gray-500 rounded-lg focus:ring-2 focus:ring-gray-800 bg-transparent text-white"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pr-10 px-4 py-2.5 border border-gray-500 rounded-lg focus:ring-2 focus:ring-gray-800 bg-transparent text-white"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
                          a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243
                          4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532
                          7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0
                          0112 5c4.478 0 8.268 2.943 9.543 7a10.025
                          10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5
                          12 5c4.478 0 8.268 2.943 9.542
                          7-1.274 4.057-5.064 7-9.542
                          7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                className="w-full px-4 py-2.5 border border-gray-500 rounded-lg focus:ring-2 focus:ring-gray-800 bg-transparent text-white"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-white/20 transition ${
                loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <p className="text-gray-300">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-white hover:text-gray-200"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
