export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const getStockStatusColor = (stockQuantity: number): 'error' | 'warning' | 'success' => {
  if (stockQuantity === 0) return 'error';
  if (stockQuantity < 10) return 'warning';
  return 'success';
};

export const getStockStatusLabel = (stockQuantity: number): string => {
  if (stockQuantity === 0) return 'Out of Stock';
  if (stockQuantity < 10) return 'Low Stock';
  return 'In Stock';
};
