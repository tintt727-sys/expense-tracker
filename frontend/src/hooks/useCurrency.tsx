import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatCurrency as formatCurrencyUtil } from '../utils/formatters';

interface CurrencyContextType {
  currency: string;
  setCurrency: (c: string) => void;
  format: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem('appCurrency') || 'MMK';
  });

  const setCurrency = (c: string) => {
    localStorage.setItem('appCurrency', c);
    setCurrencyState(c);
  };

  const format = (amount: number) => formatCurrencyUtil(amount, currency);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
