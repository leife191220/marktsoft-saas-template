export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    avatar?: string;
    avatar_url?: string;
}

export interface Category {
    id: number;
    name: string;
    type: 'product' | 'expense' | 'ingredient';
    is_personal: boolean;
    is_active: boolean;
}

export interface MeasureUnit {
    id: number;
    name: string;
    abbreviation: string;
}

export interface Supplier {
    id: number;
    name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
}

export interface Ingredient {
    id: number;
    name: string;
    category_id: number;
    category?: Category;
    unit_of_measure: string;
    current_stock: number;
    cost_per_unit: number;
    is_active: boolean;
}

export interface Recipe {
    id?: number;
    product_id?: number;
    ingredient_id: number | string; // Permitimos string para los selects vacíos
    quantity: number | string;
    ingredient?: Ingredient;
}

export interface Product {
    id: number;
    name: string;
    category_id: number;
    category?: Category;
    sale_price: number;
    is_active: boolean;
    recipes?: Recipe[];
}

export interface OrderDetail {
    id: number;
    order_id: number;
    product_id: number;
    product?: Product;
    quantity: number;
    unit_price: number;
    subtotal: number;
    status: string;
    notes?: string;
}

export interface Order {
    id: number;
    table_id: number | null;
    user_id: number;
    customer_id: number | null;
    status: string;
    total: number;
    details?: OrderDetail[];
}

export interface Table {
    id: number;
    name: string;
    status: 'available' | 'open' | 'occupied' | 'paying';
    orders?: Order[];
}

// Interfaz Genérica para la Paginación de Laravel
export interface PaginatedData<T> {
    data: T[];
    links: any[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

// Tipado base para las Props de todas las vistas de Inertia
export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
    };
};
