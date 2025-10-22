import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { addToQueue, setupSyncListener } from "../utils/offlineQueue";
import { processQueue } from "../utils/syncManager";


const Product = () => {
    const [name, setName] = useState("");
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState("");
    const [suppliers, setSuppliers] = useState([]);
    const [supplierId, setSupplierId] = useState("");
    const [sku, setSku] = useState("");
    const [description, setDescription] = useState("");
    const [unit, setUnit] = useState("")
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [location, setLocation] = useState("");
    const [notes, setNotes] = useState("");
    const [editProduct, setEditProduct] = useState(null);
    const [products, setProducts] = useState(null);
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
    // 🔍 Filter products based on search term
    const filteredProducts = products?.filter((prod) =>
        prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // 📄 Apply pagination after filtering
    const currentProducts = filteredProducts?.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil((filteredProducts?.length || 0) / itemsPerPage);



    useEffect(() => {
        const token = localStorage.getItem("inv-token");

        const fetchProducts = async () => {
            try {
                if (!navigator.onLine) {
                    // 🟠 Offline: Load saved products
                    const cached = localStorage.getItem("cachedProducts");
                    if (cached) {
                        setProducts(JSON.parse(cached));
                        console.log("📦 Loaded products from cache");
                    }
                    return;
                }

                // 🟢 Online: Fetch fresh data
                const response = await axios.get("https://inventory-2g51.onrender.com/api/product/", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.success) {
                    setProducts(response.data.products);
                    localStorage.setItem(
                        "cachedProducts",
                        JSON.stringify(response.data.products)
                    );
                    console.log("✅ Products cached locally");
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

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

                const response = await axios.get("https://inventory-2g51.onrender.com/api/category/", {
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

        const fetchSuppliers = async () => {
            try {
                if (!navigator.onLine) {
                    const cached = localStorage.getItem("cachedSuppliers");
                    if (cached) {
                        setSuppliers(JSON.parse(cached));
                        console.log("📦 Loaded suppliers from cache");
                    }
                    return;
                }

                const response = await axios.get("https://inventory-2g51.onrender.com/api/supplier/", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.suppliers) {
                    setSuppliers(response.data.suppliers);
                    localStorage.setItem(
                        "cachedSuppliers",
                        JSON.stringify(response.data.suppliers)
                    );
                    console.log("✅ Suppliers cached locally");
                }
            } catch (error) {
                console.error("Error fetching suppliers:", error);
            }
        };

        setupSyncListener();
        // ✅ Clean sync listener setup
        const handleOnline = async () => {
            console.log("🌐 Back online — syncing and refreshing data...");
            await fetchCategories();
            await fetchSuppliers();
            await fetchProducts();
            await processQueue(); // attempt to sync queued actions

        };

        window.addEventListener("online", handleOnline);

        // Initial fetch
        fetchCategories();
        fetchSuppliers();
        fetchProducts();


        // ✅ Cleanup listener when component unmounts
        return () => {
            window.removeEventListener("online", handleOnline);
        };


    }, []);



    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("inv-token");

        const updatedProduct = {
            name,
            categoryId,
            supplierId,
            sku,
            description,
            unit,
            price,
            quantity,
            expiryDate,
            location,
            notes,
            _id: editProduct._id, // ensure ID is included for offline sync
        };

        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        try {
            // 📴 If offline — queue for later sync
            if (navigator.onLine) {
                const response = await axios.put(
                    `https://inventory-2g51.onrender.com/api/product/edit/${editProduct._id}`,
                    updatedProduct,
                    config
                );
                if (response.data.success) {
                    const updated = response.data.product;
                    // Option 2: (Instant UI update if not refreshing)
                    setProducts((prev) =>
                        prev.map((prod) =>
                            prod._id === updated._id ? updated : prod
                        )
                    );
                    setIsEditModalOpen(false);
                    setEditProduct(null);
                    alert("✅ Product updated successfully!");
                } else {
                    setError("Failed to update product.");
                }
            }
            else {
                await addToQueue({
                    type: "EDIT_PRODUCT",
                    data: updatedProduct,
                });
                // 🧠 Update local cache
                const cached = JSON.parse(localStorage.getItem("cachedProducts") || "[]");
                const index = cached.findIndex((prod) => prod._id === editProduct._id);
                if (index !== -1) {
                    cached[index] = { ...cached[index], ...updatedProduct, offline: true };
                    localStorage.setItem("cachedProducts", JSON.stringify(cached));
                }
                // 🧩 Update UI instantly
                setProducts((prev) =>
                    prev.map((prod) =>
                        prod._id === editProduct._id ? { ...prod, ...updatedProduct, offline: true } : prod
                    )
                );
                setIsEditModalOpen(false);
                setEditProduct(null);
                alert("📦 You’re offline. Product update saved locally and will sync automatically when you’re back online.");
            }

        } catch (err) {
            console.error("❌ Edit failed:", err.message);
            setError("Failed to update product. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = async (productId) => {
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
                `https://inventory-2g51.onrender.com/api/product/delete/${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setProducts((prev) =>
                    prev.filter((prod) =>
                        prod._id !== productId
                    )
                );
                setIsDeleteModalOpen(false);
            } else {
                setError(response.data.message || "Failed to delete product.");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Something went wrong.");

        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const productData = {
            name,
            categoryId,
            supplierId,
            sku,
            description,
            unit,
            price,
            quantity,
            expiryDate,
            location,
            notes,
        };

        try {
            // 🟢 ONLINE MODE
            if (navigator.onLine) {
                const response = await axios.post(
                    "https://inventory-2g51.onrender.com/api/product/add",
                    productData,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("inv-token")}`,
                        },
                    }
                );

                if (response.data.success) {
                    const newProduct = response.data.product;
                    setProducts((prev) => [...(prev || []), newProduct]);
                    alert("✅ Product added successfully!");
                } else {
                    setError(response.data.message || "Failed to add product.");
                }
            }

            // 🔴 OFFLINE MODE
            else {
                await addToQueue({
                    type: "ADD_PRODUCT",
                    data: productData,
                });

                // 🧠 Update local cache
                const cached = JSON.parse(localStorage.getItem("cachedProducts") || "[]");
                const newOfflineProduct = {
                    ...productData,
                    _id: Date.now(), // fake id
                    offline: true, // mark as offline
                };

                cached.push(newOfflineProduct);
                localStorage.setItem("cachedProducts", JSON.stringify(cached));

                // 🧩 Update UI instantly
                setProducts((prev) => [...(prev || []), newOfflineProduct]);

                alert("📦 You’re offline. Product saved locally and will sync automatically when you’re back online.");
            }

            // ✅ Clear form
            setName("");
            setCategoryId("");
            setSupplierId("");
            setSku("");
            setDescription("");
            setUnit("");
            setPrice("");
            setQuantity("");
            setExpiryDate("");
            setLocation("");
            setNotes("");
            setIsModalOpen(false);

        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="">Loading...</div>
    return (

        <div className='p-4'>
            {!navigator.onLine && (
                <div className="bg-yellow-400 text-black text-center p-2 rounded-md mb-3">
                    ⚠️ You’re offline. Any new products will be saved and synced later.
                </div>
            )}
            <h1 className="text-2xl font-bold mb-8">Product Management</h1>
            <div className="flex flex-col lg:flex-row gap-4">

                <div className="lg:w-full">
                    <div className="bg-white shadow-md rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className=" text-xl font-bold mb-4">Existing Product</h2>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    placeholder="Search products..."
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

                        <div className="max-w-[100rem] border border-gray-200 rounded-lg shadow-sm overflow-hidden">

                            <div className="max-h-[calc(100vh-240px)] overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                                    <thead className="bg-gray-50 dark:bg-neutral-700">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">S/N</th>
                                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Name</th>
                                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Description</th>
                                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Category</th>
                                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Supplier</th>
                                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">SKU</th>
                                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Unit</th>
                                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Price</th>
                                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Quantity</th>

                                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Status</th>
                                            <th scope="col" className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                                        {filteredProducts?.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center text-gray-500 py-4">
                                                    No categories found.
                                                </td>
                                            </tr>
                                        )}
                                        {currentProducts && currentProducts.map((product, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">{indexOfFirstItem + index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">{product.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{product.description}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">{product.categoryId?.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{product.supplierId?.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">{product.sku}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{product.unit}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{product.price}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{product.quantity}</td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full 
                                                            ${product.status === "active"
                                                                ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
                                                                : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100"
                                                            }`}
                                                    >
                                                        {product.status === "active" ? "Active" : "Out of Stock"}
                                                    </span>
                                                </td>


                                                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium space-x-3">
                                                    <button
                                                        onClick={() => {
                                                            setEditProduct(product); // store selected product
                                                            setEditProduct(product); // store selected product
                                                            setName(product.name);
                                                            setCategoryId(product.categoryId?._id || "");
                                                            setSupplierId(product.supplierId?._id || "");
                                                            setSku(product.sku || "");
                                                            setDescription(product.description || "");
                                                            setUnit(product.unit || "");
                                                            setPrice(product.price || "");
                                                            setQuantity(product.quantity || "");

                                                            setExpiryDate(product.expiryDate ? product.expiryDate.split("T")[0] : "");
                                                            setLocation(product.location || "");
                                                            setNotes(product.notes || "");
                                                            setIsEditModalOpen(true);
                                                        }
                                                        }
                                                        type="button"
                                                        className="inline-flex items-center gap-x-2 text-sm font-semibold cursor-pointer rounded-lg border border-transparent text-blue-600 hover:text-blue-800 focus:outline-hidden focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:text-blue-400">Edit</button>
                                                    <button
                                                        onClick={() => {
                                                            setEditProduct(product); // 👈 store selected category
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
                    {/* Add Product Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
                            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-xl shadow-lg relative">
                                {/* Close Button */}
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-3 right-3 text-gray-500 hover:text-black"
                                >
                                    ✕
                                </button>

                                <h2 className="text-2xl font-bold text-center mb-6">
                                    Add New Product
                                </h2>

                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Product Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Product Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            required
                                        />
                                    </div>

                                    {/* SKU */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">SKU (optional)</label>
                                        <input
                                            type="text"
                                            value={sku}
                                            onChange={(e) => setSku(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                        />
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Category</label>
                                        <select
                                            value={categoryId}
                                            onChange={(e) => setCategoryId(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            required
                                        >
                                            <option value="">Select a Category</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Supplier */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Supplier</label>
                                        <select
                                            value={supplierId}
                                            onChange={(e) => setSupplierId(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            required
                                        >
                                            <option value="">Select a Supplier</option>
                                            {suppliers.map((sup) => (
                                                <option key={sup._id} value={sup._id}>
                                                    {sup.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Unit */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Unit</label>
                                        <input
                                            type="text"
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            placeholder="e.g., pcs, box, kg"
                                            required
                                        />
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Price</label>
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            required
                                        />
                                    </div>

                                    {/* Quantity */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            required
                                        />
                                    </div>

                                    {/* Expiry Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Expiry Date
                                        </label>
                                        <input
                                            type="date"
                                            value={expiryDate}
                                            onChange={(e) => setExpiryDate(e.target.value)}
                                            min={new Date().toISOString().split("T")[0]} // Prevent selecting before today
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                        />
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Location</label>
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                        />
                                    </div>

                                    {/* Description (full width) */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            rows="2"
                                        ></textarea>
                                    </div>

                                    {/* Notes (full width) */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            rows="2"
                                        ></textarea>
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div className="md:col-span-2">
                                            <p className="text-red-500 text-sm">{error}</p>
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <div className="md:col-span-2">
                                        <button
                                            type="submit"
                                            className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                                            disabled={loading}
                                        >
                                            {loading ? "Loading..." : "Add Product"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Edit Category Modal */}
                    {isEditModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
                            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-xl shadow-lg relative">
                                {/* Close Button */}
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="absolute top-3 right-3 text-gray-500 hover:text-black"
                                >
                                    ✕
                                </button>

                                <h2 className="text-2xl font-bold text-center mb-6">
                                    Edit New Product
                                </h2>

                                <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Product Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Product Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            required
                                        />
                                    </div>

                                    {/* SKU */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">SKU (optional)</label>
                                        <input
                                            type="text"
                                            value={sku}
                                            onChange={(e) => setSku(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                        />
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Category</label>
                                        <select
                                            value={categoryId}
                                            onChange={(e) => setCategoryId(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            required
                                        >
                                            <option value="">Select a Category</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Supplier */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Supplier</label>
                                        <select
                                            value={supplierId}
                                            onChange={(e) => setSupplierId(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            required
                                        >
                                            <option value="">Select a Supplier</option>
                                            {suppliers.map((sup) => (
                                                <option key={sup._id} value={sup._id}>
                                                    {sup.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Unit */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Unit</label>
                                        <input
                                            type="text"
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            placeholder="e.g., pcs, box, kg"
                                            required
                                        />
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Price</label>
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            required
                                        />
                                    </div>

                                    {/* Quantity */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            required
                                        />
                                    </div>

                                    {/* Expiry Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Expiry Date
                                        </label>
                                        <input
                                            type="date"
                                            value={expiryDate}
                                            onChange={(e) => setExpiryDate(e.target.value)}
                                            min={new Date().toISOString().split("T")[0]} // Prevent selecting before today
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                        />
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Location</label>
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                        />
                                    </div>

                                    {/* Description (full width) */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            rows="2"
                                        ></textarea>
                                    </div>

                                    {/* Notes (full width) */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                                            rows="2"
                                        ></textarea>
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div className="md:col-span-2">
                                            <p className="text-red-500 text-sm">{error}</p>
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <div className="md:col-span-2">
                                        <button
                                            type="submit"
                                            className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                                            disabled={loading}
                                        >
                                            {loading ? "Loading..." : "Edit Product"}
                                        </button>
                                    </div>
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
                                    Are you sure you want to delete this category? <span className="text-red-500">{editProduct?.name}</span>
                                </h2>
                                <div className='flex space-x-4'>
                                    <button
                                        onClick={() => handleDelete(editProduct._id)} // ✅ use category ID
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

export default Product