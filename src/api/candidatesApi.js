import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const candidatesApi = createApi({
    reducerPath: 'candidatesApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'https://16ae-103-180-81-194.ngrok-free.app' }),
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