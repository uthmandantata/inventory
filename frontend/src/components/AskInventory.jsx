import React, { useState } from "react";
import axios from "axios";

const AskInventory = () => {
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

    const handleAsk = async () => {
        if (!query.trim()) return;
        const res = await axios.post(`${BACKEND_URL}/api/assistant/ask`, { query });
        setResponse(res.data.answer);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-md">
            <h2 className="text-lg font-bold mb-3">🤖 Ask Inventory</h2>
            <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask something about your inventory..."
                className="w-full p-2 border rounded-md"
            />
            <button
                onClick={handleAsk}
                className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-md"
            >
                Ask
            </button>
            {response && (
                <div className="mt-4 bg-gray-100 p-3 rounded-md">
                    <strong>Answer:</strong> {response}
                </div>
            )}
        </div>
    );
};

export default AskInventory;
