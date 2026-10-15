
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Fetch the logged-in customer's cart
export const fetchCart = createAsyncThunk(
    "cart/fetchCart",
    async (_, { rejectWithValue }) => {
        try {
            const data = await api("/api/cart");
            return data.cart;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
