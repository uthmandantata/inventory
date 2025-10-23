// src/components/AIInsights.jsx
import React, { useEffect, useState } from "react";

const AIInsights = ({ products, suppliers, categories }) => {
    const [insights, setInsights] = useState([]);

    useEffect(() => {
        if (!products?.length) return;

        const totalStock = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
        const lowStock = products.filter((p) => p.quantity < 5).length;
        const avgPrice =
            products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length;
        const topCategory = categories?.length
            ? categories.sort(
                (a, b) =>
                    products.filter((p) => p.categoryId === b._id).length -
                    products.filter((p) => p.categoryId === a._id).length
            )[0]?.name
            : "N/A";

        const supplierCount = suppliers?.length || 0;

        const aiGeneratedInsights = [
            `🧮 You currently have ${totalStock} total items in stock.`,
            `⚠️ ${lowStock} products are low on stock (less than 5 units).`,
            `🏷️ Average product price: ₦${avgPrice.toFixed(2)}.`,
            `📦 Top category: ${topCategory}.`,
            `🚚 You are working with ${supplierCount} active suppliers.`,
        ];

        setInsights(aiGeneratedInsights);
    }, [products, suppliers, categories]);

    return (
        <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl p-4 shadow-md mt-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-neutral-200 mb-3">
                🤖 AI Insights Summary
            </h2>
            <ul className="space-y-2 text-gray-600 dark:text-neutral-400">
                {insights.map((insight, index) => (
                    <li key={index} className="flex items-start">
                        <span>{insight}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AIInsights;
