import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { Category, TransactionType } from '../types';
import { CategoryIcon } from '../components/CategoryIcon';
import { CategoryModal } from '../components/CategoryModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income'>('all');

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { success, error } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getCategories();
      setCategories(res.categories);
    } catch (err: any) {
      error(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (data: { name: string; icon: string; type: TransactionType }) => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, data);
        success('Category updated successfully!');
      } else {
        await categoryService.createCategory(data);
        success('Category created successfully!');
      }
      setModalOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      error(err.message || 'Failed to save category');
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await categoryService.deleteCategory(deletingId);
      success('Category deleted successfully!');
      setDeletingId(null);
      fetchCategories();
    } catch (err: any) {
      error(err.message || 'Failed to delete category');
    }
  };

  const filtered = categories.filter((c) => (activeTab === 'all' ? true : c.type === activeTab));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Category Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize transactions into custom income and expense categories.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-purple-500/25 transition-all duration-200 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Type Filter Pills */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          All Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'expense'
              ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          🔴 Expense ({categories.filter((c) => c.type === 'expense').length})
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'income'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          🟢 Income ({categories.filter((c) => c.type === 'income').length})
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner message="Loading categories..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((cat) => {
            const isIncome = cat.type === 'income';
            return (
              <div
                key={cat.id}
                className="group relative bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                      isIncome
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
                    }`}
                  >
                    <CategoryIcon name={cat.name} iconName={cat.icon} className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(cat.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {cat.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isIncome
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {cat.type}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSave}
        category={editingCategory}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deletingId}
        title="Delete Category"
        message="Are you sure you want to delete this category? Transactions using this category will remain intact."
        confirmText="Delete"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
