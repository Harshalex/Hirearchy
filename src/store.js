import { configureStore } from '@reduxjs/toolkit';
import { candidatesApi } from './api/candidatesApi';
import { authApi } from './api/authApi';
import candidatesReducer from './slices/candidatesSlice';
import authReducer from "./slices/authSlice";

const store = configureStore({
    reducer: {
        [candidatesApi.reducerPath]: candidatesApi.reducer,
        [authApi.reducerPath]: authApi.reducer,
        candidates: candidatesReducer,
        auth: authReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(candidatesApi.middleware,
            authApi.middleware
        ),
});

export default store; 