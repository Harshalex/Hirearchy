import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const candidatesApi = createApi({
    reducerPath: 'candidatesApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://192.168.1.49:8000/' }),
    endpoints: (builder) => ({
        searchCandidates: builder.mutation({
            query: (prompt) => ({
                url: 'getcandidate/search/',
                method: 'POST',
                body: { prompt },
            }),
            transformResponse: (response) => response.profiles || [],
        }),
    }),
});

export const { useSearchCandidatesMutation } = candidatesApi; 