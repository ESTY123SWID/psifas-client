
import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../services/baseApi";
import classReducer from "../features/classes/classSlice";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
    reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
        class: classReducer,
          auth: authReducer
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
});
export type RootState = ReturnType<typeof store.getState>;