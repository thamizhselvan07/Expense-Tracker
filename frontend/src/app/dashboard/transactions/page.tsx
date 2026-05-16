'use client';

import { useState, useCallback, memo } from 'react';
import { Plus, Download, Search, Filter, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import {
  useTransactions,
  useDeleteTransaction,
} from '../../../hooks/useApi';
import { TransactionForm } from '../../../components/forms/TransactionForm';
import { Transaction, TransactionFilters, TransactionType } from '../../../types';
import apiClient from '../../../lib/apiClient';

const formatCurrency = (v: string | number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(typeof v === 'string' ? parseFloat(v) : v);

// ---- Modal ----
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ---- Transaction row ----
const TransactionRow = memo(function TransactionRow({
  tx,
  onEdit,
  onDelete,
}: {
  tx: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-500">
        {format(new Date(tx.date), 'MMM d, yyyy')}
      </td>
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-900">{tx.description}</p>
        {tx.category && (
          <span className="text-xs text-gray-400">{tx.category.name}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full',
          tx.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        )}>
          {tx.type}
        </span>
      </td>
      <td className={clsx('px-4 py-3 text-sm font-semibold text-right',
        tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
      )}>
        {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => onEdit(tx)} className="text-gray-400 hover:text-brand-600 transition-colors p-1">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(tx.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

// ---- Main page ----
export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({ page: 1, limit: 20 });
  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading } = useTransactions(filters);
  const deleteMutation = useDeleteTransaction();

  const handleEdit = useCallback((tx: Transaction) => {
    setEditTx(tx);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Delete this transaction?')) {
      await deleteMutation.mutateAsync(id);
    }
  }, [deleteMutation]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditTx(null);
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.set('type', filters.type);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);

      const response = await apiClient.get(`/transactions/export?${params}`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const transactions: Transaction[] = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {meta ? `${meta.total} total` : 'Loading...'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <select
          className="input-field w-auto text-sm"
          value={filters.type ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              type: (e.target.value as TransactionType) || undefined,
              page: 1,
            }))
          }
        >
          <option value="">All types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">From</label>
          <input
            type="date"
            className="input-field w-auto text-sm"
            value={filters.startDate ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, startDate: e.target.value || undefined, page: 1 }))
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">To</label>
          <input
            type="date"
            className="input-field w-auto text-sm"
            value={filters.endDate ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, endDate: e.target.value || undefined, page: 1 }))
            }
          />
        </div>

        {(filters.type || filters.startDate || filters.endDate) && (
          <button
            className="text-sm text-brand-600 hover:underline"
            onClick={() => setFilters({ page: 1, limit: 20 })}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading &&
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
              {!isLoading && transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-12 text-sm">
                    No transactions found. Add your first one!
                  </td>
                </tr>
              )}
              {transactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {meta.page} of {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                className="btn-secondary text-sm py-1.5 px-3"
                disabled={!meta.hasPrev}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
              >
                Previous
              </button>
              <button
                className="btn-secondary text-sm py-1.5 px-3"
                disabled={!meta.hasNext}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          title={editTx ? 'Edit Transaction' : 'Add Transaction'}
          onClose={handleCloseModal}
        >
          <TransactionForm
            transaction={editTx ?? undefined}
            onSuccess={handleCloseModal}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
}
