import React from "react";
import { NavLink } from "react-router";
import {
    FaHome,
    FaUsers,
    FaTable,
    FaBox,
    FaTruck,
    FaCog,
    FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext"; // ✅ import auth context

const Sidebar = () => {
    const { user } = useAuth(); // ✅ get current user from context

    // ✅ define all menu items
    const menuItems = [
        { name: "Dashboard", path: "/admin/dashboard/", icon: <FaHome /> },
        {
            name: "Categories",
            path: "/admin/dashboard/categories",
            icon: <FaTable />,
            // role: ["admin", "manager"], // both can view
        },
        {
            name: "Products",
            path: "/admin/dashboard/products",
            icon: <FaBox />,
            // role: ["admin", "manager"], // both can view
        },
        {
            name: "Suppliers",
            path: "/admin/dashboard/suppliers",
            icon: <FaTruck />,
            // role: ["admin", "manager"], // both can view
        },
        {
            name: "Users",
            path: "/admin/dashboard/users",
            icon: <FaUsers />,
            role: ["admin"], // only admin
        },
        {
            name: "Profile",
            path: "/admin/dashboard/profile",
            icon: <FaCog />,
            // role: ["admin", "manager"], // both can view
        },
        {
            name: "Logout",
            path: "/admin/dashboard/logout",
            icon: <FaSignOutAlt />,
            // role: ["admin", "manager"], // both can view
        },
    ];

    // ✅ Filter links based on user role
    const filteredMenu = menuItems.filter(
        (item) => !item.role || item.role.includes(user?.role)
    );

    return (
        <div className="flex flex-col h-screen pl-6 pt-10 bg-black text-white w-16 md:w-64 fixed">
            <div className="h-16 flex flex-items">
                <span className="hidden md:block text-xl font-bold">Inventory MS</span>
                <span className="md:hidden text-xl font-bold">IMS</span>
            </div>

            <ul className="mt-4 space-y-1">
                {filteredMenu.map((item) => (
                    <li key={item.name}>
                        <NavLink
                            to={item.path}
                            end={item.path === "/admin/dashboard/"}
                            className={({ isActive }) =>
                                `flex items-center p-2 rounded-md transition duration-200 hover:bg-gray-700 ${isActive ? "bg-gray-700" : ""
                                }`
                            }
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="hidden md:block ml-4">{item.name}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
