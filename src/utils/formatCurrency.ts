const currencyFormatter = new Intl.NumberFormat('en-NG', {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

export const formatCurrency = (amount: number): string => {
  return `₦${currencyFormatter.format(amount)}`;
};
