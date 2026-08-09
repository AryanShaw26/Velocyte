import { useState } from "react";
import { X, FolderPlus } from "lucide-react";

import { useAuth } from "../../context/AuthContext";


function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {

    const { accessToken } = useAuth();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    if (!isOpen) {
        return null;
    }


    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");


        if (!name.trim()) {
            setError("Project name is required.");
            return;
        }


        try {

            setLoading(true);


            const response = await fetch(
                "http://127.0.0.1:8000/api/projects",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${accessToken}`,
                    },

                    body: JSON.stringify({
                        name: name.trim(),
                        description: description.trim() || null,
                    }),
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail || "Failed to create project."
                );
            }


            // Reset form
            setName("");
            setDescription("");

            // Tell dashboard that a project was created
            if (onProjectCreated) {
                onProjectCreated(data);
            }

            onClose();


        } catch (error) {

            console.error(
                "Create project error:",
                error
            );

            setError(
                error.message || "Something went wrong."
            );

        } finally {

            setLoading(false);

        }
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111116] shadow-2xl">

                {/* Header */}

                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">

                            <FolderPlus size={20} />

                        </div>

                        <div>

                            <h2 className="text-lg font-semibold text-white">
                                Create Project
                            </h2>

                            <p className="text-sm text-gray-500">
                                Start a new development project
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5 hover:text-white"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>

                </div>


                {/* Form */}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 p-6"
                >

                    {/* Error */}

                    {error && (

                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            {error}
                        </div>

                    )}


                    {/* Name */}

                    <div>

                        <label
                            htmlFor="project-name"
                            className="mb-2 block text-sm font-medium text-gray-200"
                        >
                            Project name
                        </label>

                        <input
                            id="project-name"
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="e.g. Velocyte"
                            maxLength={150}
                            disabled={loading}
                            className="w-full rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500"
                        />

                    </div>


                    {/* Description */}

                    <div>

                        <label
                            htmlFor="project-description"
                            className="mb-2 block text-sm font-medium text-gray-200"
                        >
                            Description
                            <span className="ml-2 text-gray-600">
                                Optional
                            </span>
                        </label>

                        <textarea
                            id="project-description"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            placeholder="What are you building?"
                            maxLength={1000}
                            rows={4}
                            disabled={loading}
                            className="w-full resize-none rounded-lg border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500"
                        />

                    </div>


                    {/* Buttons */}

                    <div className="flex justify-end gap-3 border-t border-white/10 pt-5">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-2.5 text-sm font-medium text-white transition hover:from-purple-500 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? "Creating..."
                                : "Create Project"
                            }
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}


export default CreateProjectModal;