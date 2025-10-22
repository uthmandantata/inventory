import React, { useEffect, useState } from "react";
import axios from "axios";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // 🔍 Filter users based on search term
    const filteredUsers = users?.filter((user) => {
        const username = user?.username || "";
        const email = user?.email || "";
        return (
            username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // 📄 Apply pagination after filtering
    const currentUsers = filteredUsers?.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil((filteredUsers?.length || 0) / itemsPerPage);

    useEffect(() => {
        const token = localStorage.getItem("inv-token");

        const fetchUsers = async () => {
            setLoading(true);
            try {
                // 📦 Load from cache if offline
                if (!navigator.onLine) {
                    const cached = localStorage.getItem("cachedUsers");
                    if (cached) {
                        setUsers(JSON.parse(cached));
                        console.log("📦 Loaded users from cache (offline)");
                    } else {
                        console.warn("⚠️ No cached user data found");
                    }
                    return;
                }

                // 🌐 Fetch from API if online
                const response = await axios.get("https://inventory-2g51.onrender.com/api/users/", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.success) {
                    setUsers(response.data.users);
                    localStorage.setItem("cachedUsers", JSON.stringify(response.data.users));
                    console.log("✅ Users fetched successfully and cached");
                }
            } catch (error) {
                console.error("❌ Error fetching users:", error.message);
            } finally {
                setLoading(false);
            }
        };

        // 🌐 Auto-refresh when back online
        const handleOnline = async () => {
            console.log("🌍 Back online — refreshing user data...");
            await fetchUsers();
        };

        window.addEventListener("online", handleOnline);

        fetchUsers(); // Initial load

        return () => {
            window.removeEventListener("online", handleOnline);
        };
    }, []);

    if (loading) return <div className="p-4 text-gray-600">Loading...</div>;

    return (
        <div className="p-4">
            {!navigator.onLine && (
                <div className="bg-yellow-400 text-black text-center p-2 rounded-md mb-3">
                    ⚠️ You’re offline. Any new suppliers will be saved and synced later.
                </div>
            )}
            <h1 className="text-2xl font-bold mb-8">User Management</h1>

            <div className="bg-white shadow-md rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Existing Users</h2>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring focus:ring-blue-200"
                    />
                </div>

                <div className="max-w-[100rem] border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="max-h-[calc(100vh-240px)] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                            <thead className="bg-gray-50 dark:bg-neutral-700">
                                <tr>
                                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">S/N</th>
                                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Username</th>
                                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Is Banned</th>
                                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                                {filteredUsers?.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center text-gray-500 py-4">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    currentUsers?.map((user, index) => (
                                        <tr key={user._id || index}>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800">{indexOfFirstItem + index + 1}</td>
                                            <td className="px-6 py-4 text-sm text-gray-800">{user.username}</td>
                                            <td className="px-6 py-4 text-sm text-gray-800">{user.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-800">{user.isBanned ? "Yes" : "No"}</td>
                                            <td className="px-6 py-4 text-sm text-gray-800">{user.role}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="py-2 px-4 flex justify-center">
                    <nav className="flex items-center space-x-1">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2.5 min-w-10 inline-flex justify-center items-center text-sm rounded-full text-gray-800 hover:bg-gray-100 disabled:opacity-50"
                        >
                            «
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`min-w-10 flex justify-center items-center py-2.5 text-sm rounded-full ${currentPage === i + 1
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-800 hover:bg-gray-100"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2.5 min-w-10 inline-flex justify-center items-center text-sm rounded-full text-gray-800 hover:bg-gray-100 disabled:opacity-50"
                        >
                            »
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Users;
