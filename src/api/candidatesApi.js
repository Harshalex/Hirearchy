import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const candidatesApi = createApi({
    reducerPath: 'candidatesApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://f6a5156da2ea.ngrok-free.app',
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token && typeof token === 'string' && token !== 'undefined' && token.trim() !== '') {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        searchCandidates: builder.mutation({
            query: (prompt) => ({
                url: 'getcandidate/search/',
                method: 'POST',
                body: { prompt },
            }),
            transformResponse: (response) => response.profiles || [],
        }),
        searchCandidatesWithFilters: builder.mutation({
            query: (filters) => ({
                url: 'getcandidate/search/',
                method: 'POST',
                body: { filters },
            }),
            transformResponse: (response) => response.profiles || [],
        }),
    }),
});

export const { useSearchCandidatesMutation, useSearchCandidatesWithFiltersMutation } = candidatesApi;