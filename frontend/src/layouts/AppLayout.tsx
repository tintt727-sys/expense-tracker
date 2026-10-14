import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { TransactionModal } from '../components/TransactionModal';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { useToast } from '../components/Toast';
import { Category } from '../types';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { success, error } = useToast();

  const handleOpenTransactionModal = async () => {
    try {
      const res = await categoryService.getCategories();
      setCategories(res.categories);
      setIsModalOpen(true);
    } catch {
      setIsModalOpen(true);
    }
  };

  const handleSaveTransaction = async (data: any) => {
    try {
      await transactionService.createTransaction(data);
      success('Transaction recorded successfully!');
      // Dispatch custom event to notify current page to refresh data
      window.dispatchEvent(new CustomEvent('transactionUpdated'));
    } catch (err: any) {
      error(err.message || 'Failed to save transaction');
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col antialiased">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenTransactionModal={handleOpenTransactionModal}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          <Outlet context={{ onOpenTransactionModal: handleOpenTransactionModal }} />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenTransactionModal={handleOpenTransactionModal} />

      {/* Add Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        categories={categories}
      />
    </div>
  );
};
