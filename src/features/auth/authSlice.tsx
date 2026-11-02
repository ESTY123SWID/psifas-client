import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User, AuthState } from "../../types/auth.types";

const initialState: AuthState = {
    user: null,
    sessionStatus: "checking",
    sessionError: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,

    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.sessionStatus = "authenticated";
            state.sessionError = null;
        },

        logout: (state) => {
            state.user = null;
            state.sessionStatus = "unauthenticated";
            state.sessionError = null;
        },

        setSessionStatus: (
            state,
            action: PayloadAction<AuthState["sessionStatus"]>
        ) => {
            state.sessionStatus = action.payload;
            if (action.payload !== "error") {
                state.sessionError = null;
            }
        },

        setSessionError: (state, action: PayloadAction<string>) => {
            state.sessionStatus = "error";
            state.sessionError = action.payload;
        },
    },
});

export const { setUser, logout, setSessionStatus, setSessionError } = authSlice.actions;

export default authSlice.reducer;