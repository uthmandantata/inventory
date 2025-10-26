import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { useEffect } from 'react';

const SetPassword = () => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    // const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [token, setToken] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        setToken(urlParams.get("token"));
    }, []);



    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${BACKEND_URL}/api/users/set-password`, {
                token,
                password,
            });

            if (response.data.success) {
                setError("✅ Password set successfully! You can now log in.");
                navigate("/login")
            } else {
                setError("❌ Failed to set password.");
            }
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className='h-screen flex flex-col items-center justify-center'>
            <div className="mt-7 w-xl bg-white border border-gray-200 rounded-xl shadow-2xs dark:bg-neutral-900 dark:border-neutral-700">
                <div className="p-4 sm:p-7">
                    <div className="text-center">
                        <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">Set New Password</h1>
                    </div>
                    <div className="mt-5">
                        {error && (
                            <div className="bg-red-200 text-red-700 p-2 mb-4 rounded">
                                {error}
                            </div>
                        )}
                        {/* <!-- Form --> */}
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-y-4">

                                {/* <!-- Form Group --> */}
                                <div>
                                    <div className="flex flex-wrap justify-between items-center gap-2">
                                        <label htmlFor="password" className="block text-sm mb-2 dark:text-white">Password</label>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={password}
                                            required
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" aria-describedby="password-error" />
                                        <div className="hidden absolute inset-y-0 end-0 pointer-events-none pe-3">
                                            <svg className="size-5 text-red-500" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="hidden text-xs text-red-600 mt-2" id="password-error">8+ characters required</p>
                                </div>
                                {/* <!-- End Form Group --> */}


                                {/* <!-- Form Group --> */}
                                <div>
                                    <div className="flex flex-wrap justify-between items-center gap-2">
                                        <label htmlFor="confirmPassword" className="block text-sm mb-2 dark:text-white">Confirm Password</label>

                                    </div>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={confirmPassword}
                                            required
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" aria-describedby="password-error" />
                                        <div className="hidden absolute inset-y-0 end-0 pointer-events-none pe-3">
                                            <svg className="size-5 text-red-500" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="hidden text-xs text-red-600 mt-2" id="password-error">8+ characters required</p>
                                </div>
                                {/* <!-- End Form Group --> */}
                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                                    {loading ? "Setting Password..." : "Set Password"}

                                </button>
                            </div>
                        </form>
                        {/* <!-- End Form --> */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SetPassword