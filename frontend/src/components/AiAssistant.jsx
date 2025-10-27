// src/components/AiAssistant.jsx
import React, { useState } from "react";
import { MessageCircle } from "lucide-react";

const AiAssistant = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: "ai", text: "Hi 👋, I'm your Inventory Assistant. How can I help?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("https://inventory-2g51.onrender.com/api/ai/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: input }),
            });

            const data = await res.json();
            const aiReply = data.reply || "Sorry, I couldn’t process that.";

            setMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [...prev, { sender: "ai", text: "Error reaching AI server." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
            >
                <MessageCircle className="w-5 h-5" />
            </button>

            {open && (
                <div className="fixed bottom-20 right-6 w-80 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col">
                    <div className="bg-blue-600 text-white p-3 rounded-t-xl font-semibold">
                        Ask Inventory 💬
                    </div>
                    <div className="p-3 space-y-2 overflow-y-auto max-h-64">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`p-2 rounded-lg text-sm ${msg.sender === "ai"
                                        ? "bg-gray-100 text-gray-800 self-start"
                                        : "bg-blue-600 text-white self-end ml-auto"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        ))}
                        {loading && <p className="text-gray-400 text-sm">AI is thinking...</p>}
                    </div>
                    <div className="flex border-t border-gray-200">
                        <input
                            type="text"
                            className="flex-1 p-2 text-sm focus:outline-none"
                            placeholder="Ask about inventory..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            className="bg-blue-600 text-white px-4 text-sm hover:bg-blue-700"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiAssistant;
