'use client';

import { useState } from 'react';
import { Plus, Trash2, Tags } from 'lucide-react';
import { useCategories, useCreateCategory } from '../../../hooks/useApi';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import apiClient from '../../../lib/apiClient';
import { Category } from '../../../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../../lib/auth';

const schema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366f1'),
});

type FormValues = z.infer<typeof schema>;

const PRESET_COLORS = [
  '#6366f1', '#22c55e', '#ef4444', '#f59e0b',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
];

export default function CategoriesPage() {
  const { user } = useAuth();
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const canManage = user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT';
  const canDelete = user?.role === 'ADMIN';

  const deleteCategory = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'EXPENSE', color: '#6366f1' },
  });

  const selectedColor = watch('color');

  const onSubmit = async (values: FormValues) => {
    await createCategory.mutateAsync(values as { name: string; type: 'INCOME' | 'EXPENSE'; color: string });
    reset();
    setShowForm(false);
  };

  const incomeCategories = categories.filter((c: Category) => c.type === 'INCOME');
  const expenseCategories = categories.filter((c: Category) => c.type === 'EXPENSE');

  const CategoryGroup = ({ title, items }: { title: string; items: Category[] }) => (
    <div className="card overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
        <h3 className="font-semibold text-sm text-gray-700">{title}</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No categories yet</p>
        )}
        {items.map((c) => (
          <div key={c.id} className="flex items-center gap-3 px-5 py-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: c.color }}
            />
            <span className="text-sm text-gray-900 flex-1">{c.name}</span>
            {canDelete && (
              <button
                onClick={() => deleteCategory.mutate(c.id)}
                className="text-gray-300 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-0.5">Organize your transactions</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            New Category
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && canManage && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Create Category</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" className="input-field" placeholder="e.g. Salaries" {...register('name')} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select className="input-field" {...register('type')}>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="flex gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue('color', color)}
                    className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color,
                      outline: selectedColor === color ? `3px solid ${color}` : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                {isSubmitting ? 'Creating...' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="card h-48 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CategoryGroup title="💚 Income Categories" items={incomeCategories} />
          <CategoryGroup title="💸 Expense Categories" items={expenseCategories} />
        </div>
      )}
    </div>
  );
}
