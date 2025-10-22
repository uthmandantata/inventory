import React, { useState, useRef, useEffect } from "react";
import { FaBell } from "react-icons/fa";

const NotificationBell = ({ lowStockProducts }) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const lowStockCount = lowStockProducts?.length || 0;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* 🔔 Bell Icon */}
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="relative p-3 text-gray-600 hover:text-gray-900 transition"
            >
                <FaBell className="text-xl" />
                {lowStockCount > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {lowStockCount}
                    </span>
                )}
            </button>

            {/* 🔽 Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-down">
                    <div className="p-3 border-b font-semibold text-gray-800">
                        Low Stock Alerts
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {lowStockCount === 0 ? (
                            <p className="p-3 text-gray-500 text-sm">All stock levels are okay ✅</p>
                        ) : (
                            <ul className="p-3 space-y-2 text-sm">
                                {lowStockProducts.map((product, index) => (
                                    <li
                                        key={index}
                                        className="flex justify-between items-center bg-red-50 p-2 rounded-md"
                                    >
                                        <span className="font-medium">{product.name}</span>
                                        <span className="text-red-600 font-semibold">
                                            {product.quantity}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
