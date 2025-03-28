// types/index.ts
export interface Item {
    id: string;
    user_id: string;
    name: string;  // Ensure this is explicitly defined
    expiry_date: string;
    created_at: string;
    about: string | null;
}

// Optional: If you want more type safety, you can create a type for setting items
export type ItemUpdate = Partial<Omit<Item, 'id' | 'user_id' | 'created_at'>> & { 
    id?: string;  // Make id optional for update operations
};

export interface RecipeIngredient {
    name: string;
    quantity?: string;
    inInventory: boolean;
    purchaseLink?: string;
}

export interface Recipe {
    name: string;
    ingredients: RecipeIngredient[];
    instructions: string[];
    youtubeLink?: string;
}

export interface RecipeResponse {
    recipes: Recipe[];
    prompt?: string;
}