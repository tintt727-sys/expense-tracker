// Currency formatter supporting MMK (Myanmar Kyat) as well as USD, EUR, THB, etc.
export const formatCurrency = (amount: number, currency = 'MMK'): string => {
  const num = Math.abs(amount || 0);

  if (currency === 'MMK') {
    return `${num.toLocaleString('en-US')} MMK`;
  }
  if (currency === 'USD') {
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'EUR') {
    return `€${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'THB') {
    return `฿${num.toLocaleString('en-US')}`;
  }

  return `${num.toLocaleString('en-US')} ${currency}`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    const d = new Date(dateString);
    if (dateString === todayStr) return 'Today';

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateString === yesterday.toISOString().slice(0, 10)) return 'Yesterday';

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const getMonthName = (monthKey: string): string => {
  // input: "2026-10"
  try {
    const [year, month] = monthKey.split('-');
    const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return monthKey;
  }
};
