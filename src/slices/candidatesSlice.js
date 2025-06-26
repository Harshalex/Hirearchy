import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    list: [],
    manualList: [],
    aiList: [],
};

const candidatesSlice = createSlice({
    name: 'candidates',
    initialState,
    reducers: {
        setCandidates(state, action) {
            state.list = action.payload;
        },
        setManualCandidates(state, action) {
            state.manualList = action.payload;
        },
        setAiCandidates(state, action) {
            state.aiList = action.payload;
        },
        clearCandidates(state) {
            state.list = [];
            state.manualList = [];
            state.aiList = [];
        },
    },
});

export const { setCandidates, setManualCandidates, setAiCandidates, clearCandidates } = candidatesSlice.actions;
export default candidatesSlice.reducer; 