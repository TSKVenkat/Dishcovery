// types/index.ts
export interface Item {
    id: string;
    user_id: string;
    name: string;
    expiry_date: string;
    created_at: string;
    about: string | null;
}