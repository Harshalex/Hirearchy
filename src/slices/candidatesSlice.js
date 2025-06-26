import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    list: [],
};

const candidatesSlice = createSlice({
    name: 'candidates',
    initialState,
    reducers: {
        setCandidates(state, action) {
            state.list = action.payload;
        },
        clearCandidates(state) {
            state.list = [];
        },
    },
});

export const { setCandidates, clearCandidates } = candidatesSlice.actions;
export default candidatesSlice.reducer; 