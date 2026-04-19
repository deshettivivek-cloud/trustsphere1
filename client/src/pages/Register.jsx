import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    service_type: "",
  });

  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    let err = {};
    if (!form.full_name) err.full_name = "Full name required";
    if (!form.email) err.email = "Email required";
    if (!form.password || form.password.length < 6)
      err.password = "Password must be at least 6 characters";
    if (!form.phone) err.phone = "Phone required";
    if (!form.city) err.city = "City required";
    if (role === "service_worker" && !form.service_type)
      err.service_type = "Service type required";
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Create auth user
      console.log("[Register] Step 1: Creating auth user...");
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            phone: form.phone,
            city: form.city,
            role: role,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("User creation failed");
      console.log("[Register] Auth user created:", data.user.id);

      // Step 2: Upsert into profiles (handles re-registration gracefully)
      console.log("[Register] Step 2: Upserting profile...");
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: form.full_name,
        phone: form.phone,
        city: form.city,
        role: role,
        email: form.email,
      });

      if (profileError) {
        console.error("[Register] Profile upsert error:", profileError);
        throw profileError;
      }
      console.log("[Register] Profile upserted OK");

      // Step 3: If service_worker, also insert into worker_profiles
      if (role === "service_worker") {
        console.log("[Register] Step 3: Inserting worker_profiles...");

        // First check if row already exists
        const { data: existingWp } = await supabase
          .from("worker_profiles")
          .select("id")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (existingWp) {
          // Update existing row
          const { error: wpUpdateErr } = await supabase
            .from("worker_profiles")
            .update({ service_type: form.service_type, location: form.city })
            .eq("user_id", data.user.id);
          if (wpUpdateErr) console.error("[Register] Worker update error:", wpUpdateErr);
          else console.log("[Register] Worker profile updated OK");
        } else {
          // Insert new row
          const { error: wpInsertErr } = await supabase
            .from("worker_profiles")
            .insert({
              user_id: data.user.id,
              service_type: form.service_type,
              location: form.city,
            });
          if (wpInsertErr) console.error("[Register] Worker insert error:", wpInsertErr);
          else console.log("[Register] Worker profile inserted OK");
        }
      }

      // Step 4: Success
      console.log("[Register] All done, navigating to dashboard");
      toast.success("Account created! 🎉");
      navigate("/dashboard");

    } catch (err) {
      console.error("[Register] Error:", err);
      let msg = err.message || "Registration failed. Please try again.";

      // User-friendly error messages
      if (msg === "Failed to fetch" || msg.includes("fetch")) {
        msg = "Network error — please check your internet connection and try again. If the problem persists, close extra browser tabs.";
      } else if (msg.includes("rate") || msg.includes("limit")) {
        msg = "Too many attempts. Please wait a minute and try again.";
      } else if (msg.includes("already registered") || msg.includes("already been registered")) {
        msg = "This email is already registered. Try signing in instead.";
      }

      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/create-profile`,
        },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed');
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-lg bg-gray-800 border ${
      errors[field] ? "border-red-500" : "border-gray-700"
    } text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition`;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl p-8">

        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="text-gray-400 mt-1 text-sm">Join TrustSphere today</p>
        </div>

        {/* Role Toggle */}
        <div className="flex rounded-lg overflow-hidden border border-gray-700 mb-6">
          <button
            type="button"
            onClick={() => setRole("customer")}
            className={`flex-1 py-2 text-sm font-medium transition ${
              role === "customer"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setRole("service_worker")}
            className={`flex-1 py-2 text-sm font-medium transition ${
              role === "service_worker"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            Service Worker
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className={inputClass("full_name")}
            />
            {errors.full_name && (
              <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass("email")}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <div className="flex">
              <span className="px-3 py-2.5 bg-gray-700 border border-gray-700 border-r-0 rounded-l-lg text-gray-300 text-sm">
                +91
              </span>
              <input
                type="tel"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={`flex-1 px-4 py-2.5 rounded-r-lg bg-gray-800 border ${
                  errors.phone ? "border-red-500" : "border-gray-700"
                } text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition`}
              />
            </div>
            {errors.phone && (
              <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* City */}
          <div>
            <input
              type="text"
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className={inputClass("city")}
            />
            {errors.city && (
              <p className="text-red-400 text-xs mt-1">{errors.city}</p>
            )}
          </div>

          {/* Service Type — only for service workers */}
          {role === "service_worker" && (
            <div>
              <select
                value={form.service_type}
                onChange={(e) =>
                  setForm({ ...form, service_type: e.target.value })
                }
                className={`w-full px-4 py-2.5 rounded-lg bg-gray-800 border ${
                  errors.service_type ? "border-red-500" : "border-gray-700"
                } text-white focus:outline-none focus:border-blue-500 transition`}
              >
                <option value="">Select Service Type</option>
                <option value="plumber">Plumber</option>
                <option value="electrician">Electrician</option>
                <option value="carpenter">Carpenter</option>
                <option value="cleaner">Cleaner</option>
                <option value="painter">Painter</option>
                <option value="ac repair">AC Repair</option>
                <option value="technician">Technician</option>
                <option value="other">Other</option>
              </select>
              {errors.service_type && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.service_type}
                </p>
              )}
            </div>
          )}

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className={inputClass("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-gray-500 text-xs uppercase">or</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        {/* Google Sign Up */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full py-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-lg transition flex items-center justify-center gap-3 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Sign up with Google
        </button>

        {/* Sign in link */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;