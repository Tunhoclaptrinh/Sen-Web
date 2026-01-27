import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ShopItem, InventoryItem } from '../../types/game.types';
import apiClient from '../../config/axios.config';

// Shop Service Wrapper
const shopApi = {
    getShopItems: async () => {
        const response = await apiClient.get('/shop');
        return response; // Configured axios interceptor returns data directly
    },
    getUserInventory: async () => {
        const response = await apiClient.get('/shop/inventory');
        return response;
    },
    purchaseItem: async (itemId: number, quantity: number) => {
        const response = await apiClient.post('/shop/buy', { itemId, quantity });
        return response;
    }
};

interface ShopState {
    items: ShopItem[];
    inventory: InventoryItem[]; // Simplified: { item_id, quantity }
    loading: boolean;
    purchaseLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

const initialState: ShopState = {
    items: [],
    inventory: [],
    loading: false,
    purchaseLoading: false,
    error: null,
    successMessage: null,
};

// Thunks
export const fetchShopData = createAsyncThunk(
    'shop/fetchData',
    async (_, { rejectWithValue }) => {
        try {
            const [items, inventory] = await Promise.all([
                shopApi.getShopItems(),
                shopApi.getUserInventory()
            ]);
            return { items, inventory };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch shop data');
        }
    }
);

export const purchaseItem = createAsyncThunk(
    'shop/purchase',
    async ({ itemId, quantity }: { itemId: number; quantity: number }, { rejectWithValue }) => {
        try {
            const response = await shopApi.purchaseItem(itemId, quantity);
            return response; // { success, item, quantity, new_balance, inventory }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.msg || 'Purchase failed');
        }
    }
);

const shopSlice = createSlice({
    name: 'shop',
    initialState,
    reducers: {
        clearMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch Data
        builder.addCase(fetchShopData.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchShopData.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload.items;
            state.inventory = action.payload.inventory;
        });
        builder.addCase(fetchShopData.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Purchase
        builder.addCase(purchaseItem.pending, (state) => {
            state.purchaseLoading = true;
            state.error = null;
        });
        builder.addCase(purchaseItem.fulfilled, (state, action) => {
            state.purchaseLoading = false;
            state.successMessage = `Mua thành công ${action.payload.quantity}x ${action.payload.item.name}`;
            state.inventory = action.payload.inventory;
            
            // Note: Balance update handled implicitly? 
            // In a real app we might need to update auth/user slice or game slice balance.
            // But let's rely on re-fetching or handling it in component for now.
        });
        builder.addCase(purchaseItem.rejected, (state, action) => {
            state.purchaseLoading = false;
            state.error = action.payload as string;
        });
    }
});

export const { clearMessages } = shopSlice.actions;
export default shopSlice.reducer;
