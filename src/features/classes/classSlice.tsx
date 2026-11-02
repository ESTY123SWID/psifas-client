import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ClassState {
    selectedClassId: number | null;
}

const initialState: ClassState = {
    selectedClassId: null,
};

const classSlice = createSlice({
    name: "class",
    initialState,
    reducers: {
        setSelectedClassId: (
            state,
            action: PayloadAction<number | null>
        ) => {
            state.selectedClassId = action.payload;
        },
    },
});

export const { setSelectedClassId } = classSlice.actions;

export default classSlice.reducer;