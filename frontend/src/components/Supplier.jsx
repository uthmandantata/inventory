import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { addToQueue, setupSyncListener } from "../utils/offlineQueue";

const Supplier = () => {
    const BACKEND_URL = process.env.BACKEND_URL
    const [name, setName] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [address, setAddress] = useState("");

    const [editSupplier, setEditSupplier] = useState(null);
    const [supplier, setSuppliers] = useState(null);
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

    // 🔍 Filter supplier based on search term
    const filteredSupplier = supplier?.filter((sup) =>

        sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sup.contactInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sup.address.toLowerCase().includes(searchTerm.toLowerCase())
    );


    // 📄 Apply pagination after filtering
    const currentsupplier = filteredSupplier?.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil((filteredSupplier?.length || 0) / itemsPerPage);



    useEffect(() => {
        const token = localStorage.getItem("inv-token");

        const fetchSupplier = async () => {
            try {
                if (!navigator.onLine) {
                    const cached = localStorage.getItem("cachedSupplier");
                    if (cached) {
                        setSuppliers(JSON.parse(cached));
                        console.log("📦 Loaded suppliers from cache (offline)");
                    } else {
                        console.warn("⚠️ No cached supplier data found");
                    }
                    return;
                }

                const response = await axios.get(`${BACKEND_URL}/api/supplier/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.success) {
                    setSuppliers(response.data.suppliers);
                    localStorage.setItem("cachedSupplier", JSON.stringify(response.data.suppliers));
                    console.log("✅ Suppliers fetched successfully and cached");
                }
            } catch (error) {
                console.error("❌ Error fetching suppliers:", error.message);
            }
        };

        // ✅ Clean sync listener setup
        const handleOnline = async () => {
            console.log("🌐 Back online — syncing and refreshing data...");
            await fetchSupplier(); // Instead of forcing reload
        };

        window.addEventListener("online", handleOnline);

        // Initial fetch
        fetchSupplier();

        // ✅ Cleanup listener when component unmounts
        return () => {
            window.removeEventListener("online", handleOnline);
        };
    }, []);

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        // setLoading(true);
        setError(null);
        const updatedSupplier = {
            name,
            contactInfo,
            address,
            _id: editSupplier._id, // ensure ID is included for offline sync
        };


        try {
            if (navigator.onLine) {
                const response = await axios.put(
                    `${BACKEND_URL}/api/supplier/edit/${editSupplier._id}`,
                    updatedSupplier,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("inv-token")}`,
                        },
                    }
                );

                if (response.data.success) {
                    const updated = response.data.supplier;

                    // ✅ Update UI instantly
                    setSuppliers((prev) =>
                        prev.map((sup) =>
                            sup._id === updated._id ? updated : sup
                        )
                    );

                    setIsEditModalOpen(false);
                    setEditSupplier(null);
                } else {
                    setError("Failed to update supplier.");
                }
            } else {
                // ⚙️ Offline mode
                await addToQueue({
                    type: "EDIT_SUPPLIER",
                    data: updatedSupplier,
                });
                // 🧩 Update local cache safely
                const cached = JSON.parse(localStorage.getItem("cachedSupplier") || "[]");
                const index = cached.findIndex((sup) => sup._id === editSupplier._id);
                if (index !== -1) {
                    cached[index] = {
                        ...cached[index],
                        ...updatedSupplier,
                        offline: true,
                    };
                    localStorage.setItem("cachedSupplier", JSON.stringify(cached));
                }
                // 🧩 Update UI instantly
                setSuppliers((prev) =>
                    prev.map((sup) =>
                        sup._id === editSupplier._id ? { ...sup, ...updatedSupplier, offline: true } : sup
                    )
                );
                setIsEditModalOpen(false);
                setEditSupplier(null);
                alert("📦 You’re offline. Supplier update saved locally and will sync automatically when you’re back online.");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (supplierId) => {
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
                `${BACKEND_URL}/api/supplier/delete/${supplierId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setSuppliers((prev) =>
                    prev.filter((sup) =>
                        sup._id !== supplierId
                    )
                );
                setIsDeleteModalOpen(false);
            } else {
                setError(response.data.message || "Failed to delete supplier.");
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
        const supplierData = {
            name, contactInfo, address
        };


        try {
            if (navigator.onLine) {
                const response = await axios.post(
                    `${BACKEND_URL}/api/supplier/add`,
                    supplierData,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("inv-token")}`,
                        },
                    }
                );
                if (response.data.success) {
                    setSuppliers((prev) => [...prev, response.data.supplier]);
                    setIsModalOpen(false);
                    setName("");
                    setContactInfo("");
                    setAddress("");
                    console.log("Supplier added successfully", supplierData);
                } else {
                    setError("Failed to add supplier. Please try again.");
                }

            } else {
                // ⚙️ Offline mode
                await addToQueue({
                    type: "ADD_SUPPLIER",
                    data: supplierData,
                });

                // ✅ Update local cache safely
                const cached = JSON.parse(localStorage.getItem("cachedSupplier") || "[]");
                const newOfflineSupplier = {
                    ...supplierData,
                    _id: Date.now(), // temporary ID
                    offline: true,
                };
                cached.push(newOfflineSupplier);
                localStorage.setItem("cachedSupplier", JSON.stringify(cached));

                // ✅ Update UI instantly
                setSuppliers((prev) => [...prev, newOfflineSupplier]);

                alert("📦 You’re offline. Supplier saved locally and will sync automatically when you’re back online.");
            }

            // ✅ Reset form fields after both online & offline success
            setName("");
            setContactInfo("");
            setAddress("");
            setIsModalOpen(false);

        } catch (error) {
            if (error.response?.data?.message) {
                setError(error.response?.data?.message);
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
                    ⚠️ You’re offline. Any new suppliers will be saved and synced later.
                </div>
            )}
            <h1 className="text-2xl font-bold mb-8">Supplier Management</h1>
            <div className="flex flex-col lg:flex-row gap-4">

                <div className="lg:w-full">
                    <div className="bg-white shadow-md rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className=" text-xl font-bold mb-4">Existing Suppliers</h2>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    placeholder="Search supplier..."
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
                                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Contact Info</th>
                                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Address</th>
                                        <th scope="col" className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                                    {filteredSupplier?.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center text-gray-500 py-4">
                                                No supplier found.
                                            </td>
                                        </tr>
                                    )}
                                    {currentsupplier && currentsupplier.map((supplier, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">{indexOfFirstItem + index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">{supplier.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{supplier.contactInfo}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{supplier.address}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium space-x-3">
                                                <button

                                                    onClick={() => {
                                                        setEditSupplier(supplier); // store selected supplier
                                                        setName(supplier.name);    // prefill inputs
                                                        setContactInfo(supplier.contactInfo)
                                                        setAddress(supplier.address)
                                                        setIsEditModalOpen(true)
                                                    }
                                                    }
                                                    type="button"
                                                    className="inline-flex items-center gap-x-2 text-sm font-semibold cursor-pointer rounded-lg border border-transparent text-blue-600 hover:text-blue-800 focus:outline-hidden focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:text-blue-400">Edit</button>
                                                <button
                                                    onClick={() => {
                                                        setEditSupplier(supplier); // 👈 store selected supplier
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
                    {/* Add supplier Modal */}
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
                                    Add New supplier
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            supplier Name
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
                                            Contact Info
                                        </label>
                                        <input
                                            type="text"
                                            value={contactInfo}
                                            onChange={(e) => setContactInfo(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
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
                                        {loading ? "Loading..." : "Add supplier"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Edit supplier Modal */}
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
                                    Edit supplier
                                </h2>

                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            supplier Name
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
                                            Contact Info
                                        </label>
                                        <input
                                            type="text"
                                            value={contactInfo}
                                            onChange={(e) => setContactInfo(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
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
                                        {loading ? "Loading..." : "Edit supplier"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Delete supplier Modal */}
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
                                    Are you sure you want to delete this supplier? <span className="text-red-500">{editSupplier?.name}</span>
                                </h2>
                                <div className='flex space-x-4'>
                                    <button
                                        onClick={() => handleDelete(editSupplier._id)} // ✅ use supplier ID
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

export default Supplier