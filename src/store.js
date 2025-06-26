import { configureStore } from '@reduxjs/toolkit';
import { candidatesApi } from './api/candidatesApi';
import candidatesReducer from './slices/candidatesSlice';

const store = configureStore({
    reducer: {
        [candidatesApi.reducerPath]: candidatesApi.reducer,
        candidates: candidatesReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(candidatesApi.middleware),
});

export default store; 