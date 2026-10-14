import React from 'react';
import { FolderOpen, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'Get started by creating your first entry.',
  actionText,
  onAction,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/40">
      <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 shadow-sm">
        {icon || <FolderOpen className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium text-sm shadow-md shadow-purple-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};
