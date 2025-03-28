// components/InventoryTable.tsx
import { useState } from 'react';
import { format, isAfter, isBefore, differenceInDays, parseISO } from 'date-fns';
import { createClient } from '@/utils/supabase/client';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { Item } from '@/types';

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

  const deleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);
      
      if (deleteError) throw deleteError;
      
      onItemDeleted(itemId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      console.error('Error deleting item:', err);
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
          class: 'bg-gray-100 text-gray-800'
        };
      }
    } catch (error) {
      return { 
        label: 'Invalid date', 
        class: 'bg-gray-100 text-gray-800'
      };
    }
    
    if (isBefore(expiry, today)) {
      return { 
        label: 'Expired', 
        class: 'bg-red-100 text-red-800'
      };
    }
    
    const daysRemaining = differenceInDays(expiry, today);
    
    if (daysRemaining <= 7) {
      return { 
        label: `Expires in ${daysRemaining} days`, 
        class: 'bg-yellow-100 text-yellow-800'
      };
    }
    
    return { 
      label: format(expiry, 'MMM dd, yyyy'), 
      class: 'bg-green-100 text-green-800'
    };
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-gray-700">Item Name</th>
              <th className="px-4 py-3 text-left text-gray-700">Expiry Date</th>
              <th className="px-4 py-3 text-left text-gray-700">Notes</th>
              <th className="px-4 py-3 text-right text-gray-700 w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                {editingItem === item.id ? (
                  // Edit mode
                  <>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editFormData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={editFormData.expiry_date || ''}
                        onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editFormData.about || ''}
                        onChange={(e) => handleInputChange('about', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                      />
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button
                        onClick={() => saveChanges(item.id)}
                        disabled={isLoading}
                        className="p-1 text-green-600 hover:text-green-800"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-1 text-gray-600 hover:text-gray-800"
                      >
                        <X size={18} />
                      </button>
                    </td>
                  </>
                ) : (
                  // View mode
                  <>
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExpiryStatus(item.expiry_date).class}`}>
                        {getExpiryStatus(item.expiry_date).label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-xs">
                      {item.about || '-'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button
                        onClick={() => startEditing(item)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}