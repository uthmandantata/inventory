import React, { useEffect, useState } from "react";
import axios from "axios";
import { addToQueue, setupSyncListener } from "../utils/offlineQueue";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch user (online or from cache)
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

        const response = await axios.get("http://localhost:3000/api/users/me", {
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

    setupSyncListener();

    const handleOnline = async () => {
      console.log("🌐 Back online — syncing and refreshing data...");
      await fetchUser();
    };

    window.addEventListener("online", handleOnline);
    fetchUser();

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // ✅ Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Save edits (online or offline)
  const handleSave = async () => {
    if (!user?._id) return;

    try {
      if (navigator.onLine) {
        const response = await axios.put(
          `http://localhost:3000/api/users/edit-profile/`,
          {
            username: user.username,
            email: user.email,
            address: user.address,
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("inv-token")}` },
          }
        );

        if (response.data?.success) {
          setUser(response.data.user);
          localStorage.setItem("current-user", JSON.stringify(response.data.user));
          alert("✅ Profile updated successfully");
        } else {
          setError("Failed to update profile");
        }
      } else {
        // 📦 Offline mode: queue update
        await addToQueue({
          type: "EDIT_USER",
          data: {
            _id: user._id,
            username: user.username,
            email: user.email,
            address: user.address,
          },
        });

        localStorage.setItem("current-user", JSON.stringify(user));
        setUser(user);
        alert("📦 Offline: Changes will sync when you’re back online");
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Error updating user profile");
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 sm:space-y-6">
      {!navigator.onLine && (
        <div className="bg-yellow-400 text-black text-center p-2 rounded-md mb-3">
          ⚠️ You’re offline. Profile edits will sync later.
        </div>
      )}

      <h1 className="text-2xl font-bold mb-8">User Profile</h1>

      <div className="bg-white shadow-md rounded-2xl p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 border-b pb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {/* {user?.username} */}
            </h1>
            {/* <p className="text-gray-500">{user?.email}</p> */}
            <span
              className={`inline-block mt-2 px-3 py-1 text-xl font-medium rounded-full ${user?.role === "Admin"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
                }`}
            >
              {user?.role.toUpperCase()}
            </span>
          </div>

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="mt-4 sm:mt-0 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-all"
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-500 text-sm mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={user?.username || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full border rounded-lg px-4 py-2 text-gray-700 ${isEditing
                ? "border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                : "bg-gray-100 cursor-not-allowed"
                }`}
            />
          </div>

          <div>
            <label className="block text-gray-500 text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={user?.email || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full border rounded-lg px-4 py-2 text-gray-700 ${isEditing
                ? "border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                : "bg-gray-100 cursor-not-allowed"
                }`}
            />
          </div>

          <div>
            <label className="block text-gray-500 text-sm mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={user?.address || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full border rounded-lg px-4 py-2 text-gray-700 ${isEditing
                ? "border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                : "bg-gray-100 cursor-not-allowed"
                }`}
            />
          </div>

          <div>
            <label className="block text-gray-500 text-sm mb-1">Joined</label>
            <input
              type="text"
              value={
                user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"
              }
              disabled
              className="w-full border rounded-lg px-4 py-2 text-gray-700 bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        {isEditing && (
          <div className="mt-10 flex justify-end">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 font-medium transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
