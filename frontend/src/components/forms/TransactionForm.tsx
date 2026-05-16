'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories, useCreateTransaction, useUpdateTransaction } from '../../hooks/useApi';
import { Transaction } from '../../types';

const schema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().min(1, 'Description is required').max(500),
  date: z.string().min(1, 'Date is required'),
  categoryId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface TransactionFormProps {
  transaction?: Transaction;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransactionForm({ transaction, onSuccess, onCancel }: TransactionFormProps) {
  const { data: categories = [] } = useCategories();
  const create = useCreateTransaction();
  const update = useUpdateTransaction();

  const isEdit = !!transaction;
  const isPending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: transaction
      ? {
          amount: parseFloat(transaction.amount),
          type: transaction.type,
          description: transaction.description,
          date: transaction.date.slice(0, 10),
          categoryId: transaction.categoryId ?? undefined,
        }
      : { type: 'EXPENSE', date: new Date().toISOString().slice(0, 10) },
  });

  const selectedType = watch('type');
  const filteredCategories = categories.filter((c: { type: string }) => c.type === selectedType);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      date: new Date(values.date).toISOString(),
      categoryId: values.categoryId || undefined,
    };
    if (isEdit) {
      await update.mutateAsync({ id: transaction.id, ...payload });
    } else {
      await create.mutateAsync(payload);
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Type selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <div className="grid grid-cols-2 gap-2">
          {(['INCOME', 'EXPENSE'] as const).map((t) => (
            <label
              key={t}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border-2 cursor-pointer transition-colors text-sm font-medium
                ${selectedType === t
                  ? t === 'INCOME'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
            >
              <input type="radio" value={t} {...register('type')} className="sr-only" />
              {t === 'INCOME' ? '💚' : '💸'} {t}
            </label>
          ))}
        </div>
        {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
        <input type="number" step="0.01" className="input-field" placeholder="0.00" {...register('amount')} />
        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input type="text" className="input-field" placeholder="What was this for?" {...register('description')} />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input type="date" className="input-field" {...register('date')} />
        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category (optional)</label>
        <select className="input-field" {...register('categoryId')}>
          <option value="">No category</option>
          {filteredCategories.map((c: { id: string; name: string; color: string }) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="btn-primary flex-1">
          {isPending ? 'Saving...' : isEdit ? 'Update' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
}
