
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { addToQueue, setupSyncListener } from "../utils/offlineQueue";
import NotificationBell from './LowStockModal';
import AIInsights from './AIInsights';

const Home = () => {

    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [user, setUser] = useState(null);


    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // change this to 10, 20, etc.

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);



    const [productSearch, setProductSearch] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [supplierSearch, setSupplierSearch] = useState("");

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const filteredProducts = products.filter((cat) => {
        const name = cat?.name || "";
        const desc = cat?.description || "";
        return (
            name.toLowerCase().includes(productSearch.toLowerCase()) ||
            desc.toLowerCase().includes(productSearch.toLowerCase())
        );
    });

    const filteredUsers = users.filter((user) => {
        const username = user?.username || "";
        const email = user?.email || "";
        return (
            username.toLowerCase().includes(userSearch.toLowerCase()) ||
            email.toLowerCase().includes(userSearch.toLowerCase())
        );
    });

    const filteredSuppliers = suppliers.filter((supplier) => {
        const name = supplier?.name || "";
        const contactInfo = supplier?.contactInfo || "";
        return (
            name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
            contactInfo.toLowerCase().includes(supplierSearch.toLowerCase())
        );
    });


    // 📄 Apply pagination after filtering
    const currentProducts = filteredProducts?.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil((filteredProducts?.length || 0) / itemsPerPage);

    // 📄 Apply pagination after filtering
    const currentUsers = filteredUsers?.slice(indexOfFirstItem, indexOfLastItem);
    const totalUserPages = Math.ceil((filteredUsers?.length || 0) / itemsPerPage);

    const currentSupplier = filteredSuppliers?.slice(indexOfFirstItem, indexOfLastItem);
    const totalSupplierPages = Math.ceil((filteredSuppliers?.length || 0) / itemsPerPage);

    const LOW_STOCK_THRESHOLD = 5;
    const lowStockProducts = products.filter((p) => p.quantity <= LOW_STOCK_THRESHOLD);


    useEffect(() => {
        const token = localStorage.getItem("inv-token");

        const fetchUser = async () => {
            try {
                if (!navigator.onLine) {
                    console.log("📦 Offline: loading user from cache...");
                    const storedUser = localStorage.getItem("current-user");
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    } else {
                        console.warn("⚠️ No cached user found.");
                    }
                    return;
                }

                const response = await axios.get("https://inventory-2g51.onrender.com/api/users/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.success) {
                    setUser(response.data.user);
                    localStorage.setItem("current-user", JSON.stringify(response.data.user));
                    console.log("✅ User fetched and cached");
                }
            } catch (error) {
                console.error("❌ Error fetching user:", error);
                setError("Failed to load user data");
            }
        };

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

                if (response.data.products) {
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

        setupSyncListener();
        window.addEventListener("online", () => {
            // Re-fetch and refresh cache
            console.log("🌐 Back online, refreshing data...");
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        });

        fetchUsers();
        fetchSuppliers();
        fetchProducts();
        fetchCategories();
        fetchUser();

    }, [])


    return (
        <div>
            <div className="w-full ">
                <div className="p-4 sm:p-6 sm:space-y-6">
                    {!navigator.onLine && (
                        <div className="bg-yellow-400 text-black text-center p-2 rounded-md mb-3">
                            ⚠️ You’re offline. Any new suppliers will be saved and synced later.
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold mb-8">Dashboard Management</h1>
                        <NotificationBell lowStockProducts={lowStockProducts} />
                    </div>

                    {/* <!-- Grid --> */}
                    <div
                        className={`grid gap-3 sm:gap-6 ${user?.role === "admin"
                            ? "sm:grid-cols-2 lg:grid-cols-3"
                            : "sm:grid-cols-1 lg:grid-cols-2"
                            }`}
                    >
                        {console.log("This is the user's role: ", user?.role)}
                        {user?.role === "admin" ?
                            <div className="flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
                                <div className="p-4 md:p-5">
                                    <div className="flex items-center gap-x-2">
                                        <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
                                            Total users
                                        </p>
                                        <div className="hs-tooltip">
                                            <div className="hs-tooltip-toggle">
                                                <svg className="shrink-0 size-4 text-gray-500 dark:text-neutral-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
                                                <span className="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 transition-opacity inline-block absolute invisible z-10 py-1 px-2 bg-gray-900 text-xs font-medium text-white rounded-md shadow-2xs dark:bg-neutral-700" role="tooltip">
                                                    The number of daily users
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-1 flex items-center gap-x-2">
                                        <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200">
                                            {users.length}
                                        </h3>
                                        <span className="flex items-center gap-x-1 text-green-600">
                                            <svg className="inline-block size-4 self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                                            <span className="inline-block text-sm">
                                                1.7%
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            : ""}
                        {/* <!-- Card --> */}

                        {/* <!-- End Card --> */}

                        {/* <!-- Card --> */}
                        <div className="flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
                            <div className="p-4 md:p-5">
                                <div className="flex items-center gap-x-2">
                                    <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
                                        Total Products
                                    </p>
                                </div>

                                <div className="mt-1 flex items-center gap-x-2">
                                    <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200">
                                        {products.length}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        {/* <!-- End Card --> */}

                        {/* <!-- Card --> */}
                        <div className="flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
                            <div className="p-4 md:p-5">
                                <div className="flex items-center gap-x-2">
                                    <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
                                        Total Suppliers
                                    </p>
                                </div>

                                <div className="mt-1 flex items-center gap-x-2">
                                    <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200">
                                        {suppliers.length}
                                    </h3>
                                    <span className="flex items-center gap-x-1 text-red-600">
                                        <svg className="inline-block size-4 self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></svg>
                                        <span className="inline-block text-sm">
                                            1.7%
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* <!-- End Card --> */}

                        {/* <!-- Card --> */}

                        {/* <!-- End Card --> */}
                    </div>
                    {/* <!-- End Grid --> */}
                    <AIInsights
                        products={products}
                        suppliers={suppliers}
                        categories={categories}
                    />
                    <div
                        className={`grid gap-3 sm:gap-6 ${user?.role === "admin"
                            ? "sm:grid-cols-2 lg:grid-cols-3"
                            : "sm:grid-cols-1 lg:grid-cols-2"
                            }`}
                    >
                        {/* <!-- Card --> */}
                        <div className="p-4 md:p-5 min-h-102.5 flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
                            {/* <!-- Header --> */}
                            <div className="flex flex-wrap justify-between items-center gap-2 pb-5">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-neutral-200">
                                        Products
                                    </h2>

                                </div>

                            </div>
                            {/* <!-- End Header --> */}


                            <div className="lg:w-full">
                                <div className="bg-white ">
                                    <div className="flex justify-between items-center mb-4">

                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                placeholder="Search products..."
                                                value={productSearch}
                                                onChange={(e) => setProductSearch(e.target.value)}
                                                className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring focus:ring-blue-200"
                                            />
                                        </div>
                                        <a href="/products" className='bg-blue-500 text-white p-2 w-34 cursor-pointer rounded-md hover:bg-blue-600'>View All</a>

                                    </div>

                                    <div className="max-w-[100rem] border border-gray-200 rounded-lg shadow-sm overflow-hidden">

                                        <div className="max-h-[calc(100vh-240px)] overflow-y-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                                                <thead className="bg-gray-50 dark:bg-neutral-700">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Name</th>
                                                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Quantity</th>
                                                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Status</th>
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

                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">{product.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{product.quantity}</td>

                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                                <span
                                                                    className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full 
                                                            ${product.status === "active"
                                                                            ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
                                                                            : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100"
                                                                        }`}
                                                                >

                                                                </span>
                                                            </td>
                                                            <td>{predictLowStock(product)}</td>

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

                            </div>
                        </div>
                        {/* <!-- End Card --> */}

                        {/* <!-- Card --> */}
                        {user?.role === "admin"
                            ?

                            < div className="p-4 md:p-5 min-h-102.5 flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
                                {/* <!-- Header --> */}
                                <div className="flex flex-wrap justify-between items-center gap-2 pb-5">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-neutral-200">
                                            Users
                                        </h2>

                                    </div>

                                    <div>
                                        <span className="py-[5px] px-1.5 inline-flex items-center gap-x-1 text-xs font-medium rounded-md bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-500">
                                            <svg className="inline-block size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
                                            25%
                                        </span>
                                    </div>
                                </div>
                                {/* <!-- End Header --> */}

                                <div className="lg:w-full">
                                    <div className="bg-white ">
                                        <div className="flex justify-between items-center mb-4">

                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    placeholder="Search users..."
                                                    value={userSearch}
                                                    onChange={(e) => setUserSearch(e.target.value)}
                                                    className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring focus:ring-blue-200"
                                                />
                                            </div>
                                            <a href="/users" className='bg-blue-500 text-white p-2 w-34 cursor-pointer rounded-md hover:bg-blue-600'>View All</a>

                                        </div>

                                        <div className="max-w-[100rem] border border-gray-200 rounded-lg shadow-sm overflow-hidden">

                                            <div className="max-h-[calc(100vh-240px)] overflow-y-auto">
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                                                    <thead className="bg-gray-50 dark:bg-neutral-700">
                                                        <tr>
                                                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Userame</th>
                                                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Email</th>
                                                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Is Banned</th>
                                                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">role</th>

                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                                                        {filteredUsers?.length === 0 && (
                                                            <tr>
                                                                <td colSpan="4" className="text-center text-gray-500 py-4">
                                                                    No user found.
                                                                </td>
                                                            </tr>
                                                        )}
                                                        {currentUsers && currentUsers.map((user, index) => (
                                                            <tr key={index}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">{user.username}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{user.email}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{user.isBanned}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">{user.role}</td>
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
                                                {Array.from({ length: totalUserPages }, (_, i) => (
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
                                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalUserPages))}
                                                    disabled={currentPage === totalUserPages}
                                                    className="p-2.5 min-w-10 inline-flex justify-center items-center text-sm rounded-full text-gray-800 hover:bg-gray-100 disabled:opacity-50"
                                                >
                                                    »
                                                </button>
                                            </nav>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            : ""
                        }
                        {/* <!-- End Card --> */}
                        {/* <!-- Card --> */}
                        <div className="p-4 md:p-5 min-h-102.5 flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
                            {/* <!-- Header --> */}
                            <div className="flex flex-wrap justify-between items-center gap-2 pb-5">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-neutral-200">
                                        Suppliers
                                    </h2>

                                </div>

                                <div>
                                    <span className="py-[5px] px-1.5 inline-flex items-center gap-x-1 text-xs font-medium rounded-md bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-500">
                                        <svg className="inline-block size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
                                        25%
                                    </span>
                                </div>
                            </div>
                            {/* <!-- End Header --> */}

                            <div className="lg:w-full">
                                <div className="bg-white shadow-md rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-4">

                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                placeholder="Search supplier..."
                                                value={supplierSearch}
                                                onChange={(e) => setSupplierSearch(e.target.value)}
                                                className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring focus:ring-blue-200"
                                            />
                                        </div>
                                        <button

                                            className='bg-blue-500 text-white p-2 w-34 cursor-pointer rounded-md hover:bg-blue-600'>Add
                                        </button>
                                    </div>

                                    <div className="overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                                            <thead className="bg-gray-50 dark:bg-neutral-700">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Name</th>
                                                    <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Contact Info</th>
                                                    <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Address</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                                                {filteredSuppliers?.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="text-center text-gray-500 py-4">
                                                            No supplier found.
                                                        </td>
                                                    </tr>
                                                )}
                                                {currentSupplier && currentSupplier.map((supplier, index) => (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">{supplier.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{supplier.contactInfo}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{supplier.address}</td>

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

                            </div>
                        </div>
                        {/* <!-- End Card --> */}
                    </div>

                    {/* <!-- Card --> */}

                    {/* <!-- End Card --> */}
                </div>
            </div>
        </div >
    )
}

export default Home