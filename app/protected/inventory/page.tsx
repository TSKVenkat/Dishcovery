'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import Link from 'next/link';
import InventoryTable from '@/components/InventoryTable';
import AddItemModal from '@/components/AddItemModal';
import { Item } from '@/types';

enum FilterType {
  ALL = 'All',
  EXPIRED = 'Expired',
  EXPIRING_SOON = 'Expiring Soon',
  FRESH = 'Fresh'
}

export default function Inventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>(FilterType.ALL);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Apply filter when items or filter changes
  useEffect(() => {
    filterItems();
  }, [items, filter]);

  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('Authentication required');
      }
      
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.user.id)
        .order('expiry_date', { ascending: true });
        
      if (error) throw error;
      
      setItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
      console.error('Error fetching items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    const today = new Date();
    const sevenDaysFromNow = addDays(today, 7);
    
    let filtered = [...items];
    
    switch (filter) {
      case FilterType.EXPIRED:
        filtered = items.filter(item => isBefore(new Date(item.expiry_date), today));
        break;
      case FilterType.EXPIRING_SOON:
        filtered = items.filter(item => 
          isAfter(new Date(item.expiry_date), today) && 
          isBefore(new Date(item.expiry_date), sevenDaysFromNow)
        );
        break;
      case FilterType.FRESH:
        filtered = items.filter(item => 
          isAfter(new Date(item.expiry_date), sevenDaysFromNow)
        );
        break;
      default:
        // ALL - no filtering needed
        break;
    }
    
    setFilteredItems(filtered);
  };

  const handleItemAdded = (newItem: Item) => {
    setItems(prevItems => [...prevItems, newItem]);
    setShowAddModal(false);
  };

  const handleItemUpdated = (updatedItem: Item) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  };

  const handleItemDeleted = (deletedId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== deletedId));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Food Inventory</h1>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {Object.values(FilterType).map((filterType) => (
              <button
                key={filterType}
                className={`px-4 py-2 rounded-lg border ${
                  filter === filterType 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-800 hover:bg-gray-100'
                }`}
                onClick={() => setFilter(filterType as FilterType)}
              >
                {filterType}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add Item
            </button>
            
            <Link href="/protected/recipes" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              Suggest Recipes
            </Link>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2">Loading your inventory...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <InventoryTable 
          items={filteredItems} 
          onItemUpdated={handleItemUpdated}
          onItemDeleted={handleItemDeleted}
        />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-500">
            {items.length === 0 
              ? "Your inventory is empty. Add some items to get started!" 
              : "No items match the current filter."}
          </p>
        </div>
      )}

      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onItemAdded={handleItemAdded}
        />
      )}
    </div>
  );
}