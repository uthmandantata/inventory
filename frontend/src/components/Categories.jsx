import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router';
import axios from 'axios';
import { addToQueue, setupSyncListener } from "../utils/offlineQueue";


const Categories = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [editCategory, setEditCategory] = useState(null);
    const [categories, setCategories] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // 👈 modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // 👈 modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // 👈 modal state

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // change this to 10, 20, etc.

    const [searchTerm, setSearchTerm] = useState("");

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // 🔍 Filter categories based on search term
    const filteredCategories = categories?.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 📄 Apply pagination after filtering
    const currentCategories = filteredCategories?.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil((filteredCategories?.length || 0) / itemsPerPage);



    useEffect(() => {
        const token = localStorage.getItem("inv-token");
        const fetchCategories = async () => {
            try {
                if (!navigator.onLine) {
                    const cached = localStorage.getItem("cachedCategories");
                    if (cached) {
                        setCategories(JSON.parse(cached));
                        console.log("📦 Loaded categories from cache");
                    }
                    return;
                }

                const response = await axios.get("${process.env.BACKEND_URL}/api/category/", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.category) {
                    setCategories(response.data.category);
                    localStorage.setItem(
                        "cachedCategories",
                        JSON.stringify(response.data.category)
                    );
                    console.log("✅ Categories cached locally");
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        setupSyncListener();
        window.addEventListener("online", () => {
            // Re-fetch and refresh cache
            console.log("🌐 Back online, refreshing data...");
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        });
        fetchCategories();
    }, [])

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        // setLoading(true);
        setError(null);

        const updatedCategory = {
            name,
            description,
            _id: editCategory._id, // ensure ID is included for offline sync
        };


        try {
            if (navigator.onLine) {
                const response = await axios.put(
                    `${process.env.BACKEND_URL}/api/category/edit/${editCategory._id}`,
                    updatedCategory,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("inv-token")}`,
                        },
                    }
                );

                if (response.data.success) {
                    const updated = response.data.category;

                    // ✅ Update UI instantly
                    setCategories((prev) =>
                        prev.map((cat) =>
                            cat._id === updated._id ? updated : cat
                        )
                    );

                    setIsEditModalOpen(false);
                    setEditCategory(null);
                } else {
                    setError("Failed to update category.");
                }
            } else {
                await addToQueue({
                    type: "EDIT_CATEGORY",
                    data: updatedCategory,
                });
                // 🧠 Update local cache
                const cached = JSON.parse(localStorage.getItem("cachedCategory") || "[]");
                const index = cached.findIndex((cat) => cat._id === editCategory._id);
                if (index !== -1) {
                    cached[index] = { ...cached[index], ...updatedCategory, offline: true };
                    localStorage.setItem("cachedCategory", JSON.stringify(cached));
                }
                // 🧩 Update UI instantly
                setCategories((prev) =>
                    prev.map((cat) =>
                        cat._id === editCategory._id ? { ...cat, ...updatedCategory, offline: true } : cat
                    )
                );
                setIsEditModalOpen(false);
                setEditCategory(null);
                alert("📦 You’re offline. Category update saved locally and will sync automatically when you’re back online.");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (categoryId) => {
        // setLoading(true);
        setError(null);
        try {

            const token = localStorage.getItem("inv-token"); // 👈 check here
            if (!token) {
                setError("No token found. Please log in again.");
                setLoading(false);
                return;
            }

            const response = await axios.delete(
                `${process.env.BACKEND_URL}/api/category/delete/${categoryId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setCategories((prev) =>
                    prev.filter((cat) =>
                        cat._id !== categoryId
                    )
                );
                setIsDeleteModalOpen(false);
            } else {
                setError(response.data.message || "Failed to delete category.");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Something went wrong.");

        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // setLoading(true);
        setError(null);

        const categoryData = {
            name,
            description,
        };

        try {
            if (navigator.onLine) {
                const response = await axios.post(
                    "${process.env.BACKEND_URL}/api/category/add",
                    categoryData,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("inv-token")}`,
                        },
                    }
                );

                if (response.data.success) {
                    const newCategory = response.data.category;

                    // ✅ Add to the table instantly
                    setCategories((prev) => [...(prev || []), newCategory]);

                    // ✅ Clear form inputs
                    setName("");
                    setDescription("");

                    // ✅ Close modal
                    setIsModalOpen(false);

                    console.log("Category added successfully:", newCategory);
                } else {
                    setError("Failed to add category. Please try again.");
                }
            }
            // 🔴 OFFLINE MODE
            else {
                await addToQueue({
                    type: "ADD_CATEGORY",
                    data: categoryData,
                });

                // 🧠 Update local cache
                const cached = JSON.parse(localStorage.getItem("cachedCategories") || "[]");
                const newOfflineCategory = {
                    ...categoryData,
                    _id: Date.now(), // fake id
                    offline: true, // mark as offline
                };

                cached.push(newOfflineCategory);
                localStorage.setItem("cachedCategories", JSON.stringify(cached));

                // 🧩 Update UI instantly
                setCategories((prev) => [...(prev || []), newOfflineCategory]);

                alert("📦 You’re offline. Category saved locally and will sync automatically when you’re back online.");
            }
            // ✅ Clear form inputs
            setName("");
            setDescription("");
            setIsModalOpen(false);
        } catch (error) {
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };
    if (loading) return <div className="">Loading...</div>
    return (
        <div className='p-4'>
            {!navigator.onLine && (
                <div className="bg-yellow-400 text-black text-center p-2 rounded-md mb-3">
                    ⚠️ You’re offline. Any new categories will be saved and synced later.
                </div>
            )}
            <h1 className="text-2xl font-bold mb-8">Category Management</h1>
            <div className="flex flex-col lg:flex-row gap-4">

                <div className="lg:w-full">
                    <div className="bg-white shadow-md rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className=" text-xl font-bold mb-4">Existing Categories</h2>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring focus:ring-blue-200"
                                />
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className='bg-blue-500 text-white p-2 w-34 cursor-pointer rounded-md hover:bg-blue-600'>Add
                            </button>
                        </div>

                        <div className="overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                                <thead className="bg-gray-50 dark:bg-neutral-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">S/N</th>
                                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Name</th>
                                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Description</th>
                                        <th scope="col" className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                                    {filteredCategories?.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center text-gray-500 py-4">
                                                No categories found.
                                            </td>
                                        </tr>
                                    )}
                                    {currentCategories && currentCategories.map((category, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">{indexOfFirstItem + index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">{category.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{category.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium space-x-3">
                                                <button

                                                    onClick={() => {
                                                        setEditCategory(category); // store selected category
                                                        setName(category.name);    // prefill inputs
                                                        setDescription(category.description)
                                                        setIsEditModalOpen(true)
                                                    }
                                                    }
                                                    type="button"
                                                    className="inline-flex items-center gap-x-2 text-sm font-semibold cursor-pointer rounded-lg border border-transparent text-blue-600 hover:text-blue-800 focus:outline-hidden focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:text-blue-400">Edit</button>
                                                <button
                                                    onClick={() => {
                                                        setEditCategory(category); // 👈 store selected category
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    type="button"
                                                    className="inline-flex items-center gap-x-2 text-sm font-semibold cursor-pointer rounded-lg border border-transparent text-red-600 hover:text-red-800 focus:outline-hidden focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:text-blue-400">Delete</button>
                                            </td>
                                        </tr>

                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="py-1 px-4">
                            <nav className="flex items-center space-x-1" aria-label="Pagination">
                                {/* Previous */}
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2.5 min-w-10 inline-flex justify-center items-center text-sm rounded-full text-gray-800 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    «
                                </button>

                                {/* Page Numbers */}
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

                                {/* Next */}
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
                    {/* Add Category Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                            <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-3 right-3 text-gray-500 hover:text-black"
                                >
                                    ✕
                                </button>

                                <h2 className="text-xl font-bold text-center mb-4">
                                    Add New Category
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Category Name
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Description
                                        </label>
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            required
                                        />
                                    </div>

                                    {error && <p className="text-red-500 text-sm">{error}</p>}

                                    <button
                                        type="submit"
                                        className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                                        disabled={loading}
                                    >
                                        {loading ? "Loading..." : "Add Category"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Edit Category Modal */}
                    {isEditModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                            <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="absolute top-3 cursor-pointer right-3 text-gray-500 hover:text-black"
                                >
                                    ✕
                                </button>

                                <h2 className="text-xl font-bold text-center mb-4">
                                    Edit Category
                                </h2>

                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Category Name
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Description
                                        </label>
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            required
                                        />
                                    </div>

                                    {error && <p className="text-red-500 text-sm">{error}</p>}

                                    <button
                                        type="submit"
                                        className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                                        disabled={loading}
                                    >
                                        {loading ? "Loading..." : "Edit Category"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Delete Category Modal */}
                    {isDeleteModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                            <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="absolute top-3 cursor-pointer right-3 text-gray-500 hover:text-black"
                                >
                                    ✕
                                </button>

                                <h2 className="text-xl font-bold text-center mb-4">
                                    Are you sure you want to delete this category? <span className="text-red-500">{editCategory?.name}</span>
                                </h2>
                                <div className='flex space-x-4'>
                                    <button
                                        onClick={() => handleDelete(editCategory._id)} // ✅ use category ID
                                        className="w-full cursor-pointer bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
                                        disabled={loading}
                                    >
                                        {loading ? "Deleting..." : "Yes, Delete"}
                                    </button>

                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="w-full cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div >

    )
}

export default Categories