export const predictLowStock = (product) => {
  if (!product.salesHistory || product.salesHistory.length === 0) return null;

  const totalSold = product.salesHistory.reduce((a, b) => a + b, 0);
  const avgDailySales = totalSold / product.salesHistory.length;
  const daysLeft = product.quantity / avgDailySales;

  return daysLeft < 7 
    ? `⚠️ Likely to run out in ${Math.ceil(daysLeft)} days`
    : `✅ Stable (${Math.ceil(daysLeft)} days of stock)`;
};
