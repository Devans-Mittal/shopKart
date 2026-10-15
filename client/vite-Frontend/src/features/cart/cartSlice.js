
import { createSlice } from "@reduxjs/toolkit";
import { fetchCart } from "./cartThunks";

const initialState = {
    items: [],
    loading: false,
    error: null
};

const cartSlice = createSlice({
    name: "cart",
    initialState,

    reducers: {
        setCart: (state, action) => {
            state.items = action.payload;
        },

        setCartLoading: (state, action) => {
            state.loading = action.payload;
        },

        setCartError: (state, action) => {
            state.error = action.payload;
        },

        clearCart: (state) => {
            state.items = [];
            state.error = null;
            state.loading = false;
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload || "Failed to fetch cart";
            });
    }
});

export const {
    setCart,
    setCartLoading,
    setCartError,
    clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
