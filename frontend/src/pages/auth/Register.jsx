import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../../services/authService";


function Register() {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        // Check passwords
        if (password !== confirmPassword) {

            setError("Passwords do not match.");
            return;

        }

        // Basic password validation
        if (password.length < 8) {

            setError(
                "Password must contain at least 8 characters."
            );

            return;
        }

        setLoading(true);

        try {

            await registerUser({
                name,
                email,
                password,
            });

            // Registration successful
            navigate("/login");

        } catch (error) {

            setError(
                error.message || "Registration failed."
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="min-h-screen bg-[#07070a] text-white flex items-center justify-center px-4 py-12">

            <div className="w-full max-w-md">

                {/* Logo */}

                <div className="text-center mb-8">

                    <Link
                        to="/"
                        className="text-3xl font-bold"
                    >
                        Velocyte
                    </Link>

                    <p className="text-gray-400 mt-2">
                        Start building with Velocyte
                    </p>

                </div>


                {/* Register Card */}

                <div className="bg-[#111116] border border-white/10 rounded-2xl p-8 shadow-2xl">

                    <h1 className="text-2xl font-semibold">
                        Create your account
                    </h1>

                    <p className="text-gray-400 text-sm mt-2 mb-6">
                        Join Velocyte and start building better software.
                    </p>


                    {/* Error */}

                    {error && (

                        <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            {error}
                        </div>

                    )}


                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* Name */}

                        <div>

                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-300 mb-2"
                            >
                                Full Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                placeholder="Aryan Shaw"
                                required
                                minLength={2}
                                maxLength={100}
                                className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />

                        </div>


                        {/* Email */}

                        <div>

                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-300 mb-2"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                placeholder="you@example.com"
                                required
                                className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />

                        </div>


                        {/* Password */}

                        <div>

                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-300 mb-2"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Minimum 8 characters"
                                required
                                minLength={8}
                                className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />

                        </div>


                        {/* Confirm Password */}

                        <div>

                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-300 mb-2"
                            >
                                Confirm Password
                            </label>

                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                placeholder="Re-enter your password"
                                required
                                className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />

                        </div>


                        {/* Submit */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-violet-500 py-3 font-semibold transition hover:scale-[1.01] hover:from-purple-500 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {loading
                                ? "Creating account..."
                                : "Create Account"
                            }

                        </button>

                    </form>


                    {/* Login */}

                    <div className="mt-6 text-center text-sm text-gray-400">

                        Already have an account?{" "}

                        <Link
                            to="/login"
                            className="font-medium text-purple-400 hover:text-purple-300"
                        >
                            Sign In
                        </Link>

                    </div>

                </div>


                {/* Back */}

                <div className="text-center mt-6">

                    <Link
                        to="/"
                        className="text-sm text-gray-500 hover:text-gray-300"
                    >
                        ← Back to Velocyte
                    </Link>

                </div>

            </div>

        </div>
    );
}


export default Register;