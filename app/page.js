"use client";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = { name: "", email: "", password: "" };
    let valid = true;

    if (!isLogin && !formData.name.trim()) {
      newErrors.name = "Full name is required";
      valid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
      valid = false;
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);
    if (valid) {
      console.log("Form submitted:", formData);
      router.push("/inbox");
    }
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          className="bg-white text-black rounded-2xl shadow-xl overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-8">
            <h2 className="text-3xl font-bold text-center mb-8">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
              )}
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
              <button
                type="submit"
                className="block w-full bg-black text-white text-center py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {isLogin ? "Sign In" : "Sign Up"}
              </button>
            </form>
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-black hover:underline"
              >
                {isLogin
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
