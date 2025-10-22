// src/utils/syncManager.js
import axios from "axios";
import { getQueue, clearQueue } from "./offlineQueue";

export async function processQueue() {
    const queue = await getQueue();

    if (!queue || queue.length === 0) {
        console.log("✅ No offline data to sync");
        return;
    }

    console.log("🌐 Syncing offline data...");

    const token = localStorage.getItem("inv-token");
    if (!token) {
        console.warn("⚠️ No token found. Please log in to sync offline data.");
        return;
    }

    const remainingQueue = [];

    for (const action of queue) {
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            if (action.type === "ADD_PRODUCT") {
                await axios.post("http://localhost:3000/api/product/add", action.data, config);
                console.log("✅ Synced new product:", action.data.name);
            }

            else if (action.type === "EDIT_PRODUCT") {
                await axios.put(
                    `http://localhost:3000/api/product/edit/${action.data._id}`,
                    action.data,
                    config
                );
                console.log("✏️ Synced edited product:", action.data.name);
            }


            else if (action.type === "ADD_CATEGORY") {
                await axios.post("http://localhost:3000/api/category/add", action.data, config);
                console.log("✅ Synced new category:", action.data.name);
            }

            else if (action.type === "EDIT_CATEGORY") {
                await axios.put(
                    `http://localhost:3000/api/category/edit/${action.data._id}`,
                    action.data,
                    config
                );
                console.log("✏️ Synced edited category:", action.data.name);
            }
            else if (action.type === "ADD_SUPPLIER") {
                await axios.post("http://localhost:3000/api/supplier/add", action.data, config);
                console.log("✅ Synced new supplier:", action.data.name);
            }

            else if (action.type === "EDIT_SUPPLIER") {
                await axios.put(
                    `http://localhost:3000/api/supplier/edit/${action.data._id}`,
                    action.data,
                    config
                );
                console.log("✏️ Synced edited supplier:", action.data.name);
            }
            else if (action.type === "EDIT_USER") {
                await axios.put(
                    `http://localhost:3000/api/users/edit-profile`,
                    action.data,
                    config
                );
                console.log("✏️ Synced edited user:", action.data.name);
            }

        } catch (err) {
            console.error(`❌ Failed to sync ${action.type}:`, action.data.name, "-", err.message);

            // Stop syncing if token is invalid
            if (err.response?.status === 401) {
                console.warn("🚫 Token expired or invalid. Please log in again.");
                return;
            }

            // Keep failed actions for retry
            remainingQueue.push(action);
        }
    }

    if (remainingQueue.length > 0) {
        localStorage.setItem("offlineQueue", JSON.stringify(remainingQueue));
        console.warn(`⚠️ ${remainingQueue.length} item(s) failed to sync. Saved for retry.`);
    } else {
        await clearQueue();
        console.log("🎉 All offline data synced successfully!");
    }
}

// Automatically run when the browser reconnects
window.addEventListener("online", processQueue);
console.log("🔔 Sync manager initialized — will sync when back online");
