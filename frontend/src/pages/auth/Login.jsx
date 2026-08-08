import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


function Login() {

    const navigate = useNavigate();

    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            await login(email, password);

            // Login successful
            navigate("/dashboard");

        } catch (error) {

            setError(
                error.message || "Invalid email or password"
            );

        } finally {

            setLoading(false);

        }
    };


    return (
        <div className="min-h-screen bg-[#07070a] text-white flex items-center justify-center px-4">

            <div className="w-full max-w-md">

                {/* Logo / Brand */}

                <div className="text-center mb-8">

                    <h1 className="text-3xl font-bold">
                        Velocyte
                    </h1>

                    <p className="text-gray-400 mt-2">
                        Welcome back
                    </p>

                </div>


                {/* Login Card */}

                <div className="bg-[#111116] border border-white/10 rounded-2xl p-8 shadow-2xl">

                    <h2 className="text-2xl font-semibold mb-2">
                        Sign in
                    </h2>

                    <p className="text-gray-400 text-sm mb-6">
                        Enter your credentials to continue.
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

                            <div className="flex items-center justify-between mb-2">

                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-300"
                                >
                                    Password
                                </label>

                                <button
                                    type="button"
                                    className="text-xs text-purple-400 hover:text-purple-300"
                                >
                                    Forgot password?
                                </button>

                            </div>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="••••••••"
                                required
                                className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />

                        </div>


                        {/* Login button */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-violet-500 py-3 font-semibold transition hover:scale-[1.01] hover:from-purple-500 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {loading
                                ? "Signing in..."
                                : "Sign In"
                            }

                        </button>

                    </form>


                    {/* Register */}

                    <div className="mt-6 text-center text-sm text-gray-400">

                        Don't have an account?{" "}

                        <Link
                            to="/register"
                            className="font-medium text-purple-400 hover:text-purple-300"
                        >
                            Create account
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


export default Login;