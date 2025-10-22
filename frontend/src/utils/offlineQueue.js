// src/utils/offlineQueue.js

// Function to add new task (product) to queue
export const addToQueue = async (task) => {
    const existing = JSON.parse(localStorage.getItem("offlineQueue") || "[]");
    existing.push(task);
    localStorage.setItem("offlineQueue", JSON.stringify(existing));
    console.log("📦 Added to offline queue:", task);
};

// Function to sync all queued tasks when online
export const syncQueue = async () => {
    const queue = JSON.parse(localStorage.getItem("offlineQueue") || "[]");
    if (queue.length === 0) return console.log("✅ Nothing to sync");

    console.log("🔄 Syncing queued data...");

    for (let item of queue) {
        try {
            if (item.type === "ADD_PRODUCT") {
                const response = await fetch("http://localhost:3000/api/product/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("inv-token")}`,
                    },
                    body: JSON.stringify(item.data),
                });

                if (!response.ok) throw new Error("Failed to sync product");
                console.log("✅ Synced product:", item.data.name);
            }
        } catch (err) {
            console.error("❌ Error syncing:", err);
            // Stop syncing if one fails (to avoid endless errors)
            return;
        }
    }

    // If all succeeded, clear the queue
    localStorage.removeItem("offlineQueue");
    console.log("🎉 All queued products synced successfully!");
};

// Function to start listening for when user comes back online
export const setupSyncListener = () => {
    window.addEventListener("online", syncQueue);
    console.log("🟢 Sync listener active — will sync when online");
};
// Function to get current queue (for debugging/testing)
export const getQueue = async () => {
    return JSON.parse(localStorage.getItem("offlineQueue") || "[]");
};
// Function to clear the queue (for debugging/testing)
export const clearQueue = async () => {
    localStorage.removeItem("offlineQueue");
    console.log("🗑️ Offline queue cleared");
};

// Start listening for online events immediately
setupSyncListener();