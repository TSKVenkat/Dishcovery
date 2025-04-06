// components/InventoryTable.tsx
import { useState } from 'react';
import { format, isAfter, isBefore, differenceInDays, parseISO } from 'date-fns';
import { createClient } from '@/utils/supabase/client';
import { Pencil, Trash2, X, Check, AlertTriangle, Clock, CalendarCheck } from 'lucide-react';
import { Item } from '@/types';

export const deleteItem = async (itemId: string) => {
  if (!confirm('Are you sure you want to delete this item?')) return;
  
  try {
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);
    
    if (deleteError) throw deleteError;
    
    return true;
  } catch (err) {
    console.error('Error deleting item:', err);
    throw err;
  }
};

interface InventoryTableProps {
  items: Item[];
  onItemUpdated: (item: Item) => void;
  onItemDeleted: (id: string) => void;
}

export default function InventoryTable({ items, onItemUpdated, onItemDeleted }: InventoryTableProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Item>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId);
      onItemDeleted(itemId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  const startEditing = (item: Item) => {
    const formattedDate = item.expiry_date 
      ? format(parseISO(item.expiry_date), 'yyyy-MM-dd')
      : '';
      
    setEditingItem(item.id);
    setEditFormData({
      name: item.name,
      expiry_date: formattedDate,
      about: item.about || ''
    });
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditFormData({});
  };

  const handleInputChange = (field: string, value: string) => {
    setEditFormData({
      ...editFormData,
      [field]: value
    });
  };

  const saveChanges = async (itemId: string) => {
    if (!editFormData.name || !editFormData.expiry_date) {
      setError('Item name and expiry date are required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      // Validate and parse the date
      let expiryDate;
      try {
        expiryDate = new Date(editFormData.expiry_date);
        
        // Check if date is valid
        if (isNaN(expiryDate.getTime())) {
          throw new Error('Invalid expiry date format');
        }
      } catch (dateError) {
        setError('Please enter a valid expiry date');
        setIsLoading(false);
        return;
      }
      
      // Format to ISO string with just the date part (no time)
      const formattedDate = format(expiryDate, 'yyyy-MM-dd');
      
      const { data, error: updateError } = await supabase
        .from('items')
        .update({
          name: editFormData.name,
          expiry_date: formattedDate,
          about: editFormData.about || null
        })
        .eq('id', itemId)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      onItemUpdated(data);
      setEditingItem(null);
      setEditFormData({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      console.error('Error updating item:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    
    // Ensure we have a valid date by using parseISO
    let expiry;
    try {
      expiry = parseISO(expiryDate);
      
      // Check if date is valid
      if (isNaN(expiry.getTime())) {
        return { 
          label: 'Invalid date', 
          class: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300',
          icon: <Clock size={14} className="mr-1" />
        };
      }
    } catch (error) {
      return { 
        label: 'Invalid date', 
        class: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300',
        icon: <Clock size={14} className="mr-1" />
      };
    }
    
    if (isBefore(expiry, today)) {
      return { 
        label: 'Expired', 
        class: 'badge-expired',
        icon: <AlertTriangle size={14} className="mr-1" />
      };
    }
    
    const daysRemaining = differenceInDays(expiry, today);
    
    if (daysRemaining <= 7) {
      return { 
        label: `${daysRemaining} days left`, 
        class: 'badge-expiring-soon',
        icon: <Clock size={14} className="mr-1" />
      };
    }
    
    return { 
      label: format(expiry, 'MMM dd, yyyy'), 
      class: 'badge-fresh',
      icon: <CalendarCheck size={14} className="mr-1" />
    };
  };

  // Sort items by expiry date (expired and soon-to-expire first)
  const sortedItems = [...items].sort((a, b) => {
    const dateA = parseISO(a.expiry_date);
    const dateB = parseISO(b.expiry_date);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div>
      {error && (
        <div className="bg-error/10 border border-error/20 text-error rounded-lg px-4 py-3 mb-6">
          <div className="flex items-start">
            <AlertTriangle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {sortedItems.length === 0 ? (
        <div className="text-center py-8 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div className="text-neutral-500 dark:text-neutral-400 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium">No food items found</h3>
            <p className="mt-1">Add some items to your inventory to get started!</p>
          </div>
        </div>
      ) : (
        <div className="bg-card-background rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Item Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Expiry Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Notes</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-400 w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {sortedItems.map(item => (
                  <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    {editingItem === item.id ? (
                      // Edit mode
                      <>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editFormData.name || ''}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="form-input"
                            placeholder="Enter food name"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="date"
                            value={editFormData.expiry_date || ''}
                            onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                            className="form-input"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editFormData.about || ''}
                            onChange={(e) => handleInputChange('about', e.target.value)}
                            className="form-input"
                            placeholder="Add notes (optional)"
                          />
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          <button
                            onClick={() => saveChanges(item.id)}
                            disabled={isLoading}
                            className="p-1.5 bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/40 rounded transition-colors"
                            title="Save changes"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1.5 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 rounded transition-colors"
                            title="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </td>
                      </>
                    ) : (
                      // View mode
                      <>
                        <td className="px-4 py-3 font-medium">
                          <div className="flex items-center">
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="badge flex items-center w-fit px-2.5 py-1.5 text-xs ${getExpiryStatus(item.expiry_date).class}">
                            {getExpiryStatus(item.expiry_date).icon}
                            {getExpiryStatus(item.expiry_date).label}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 truncate max-w-xs">
                          {item.about || '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end space-x-1">
                            <button
                              onClick={() => startEditing(item)}
                              className="p-1.5 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 rounded transition-colors"
                              title="Edit item"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 bg-accent-50 text-accent-600 hover:bg-accent-100 dark:bg-accent-900/20 dark:text-accent-400 dark:hover:bg-accent-900/40 rounded transition-colors"
                              title="Delete item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}