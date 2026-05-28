import { apiSlice } from './apiSlice';

export const udharApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /udhar - list all credit ledger entries for current tenant
    getUdhar: builder.query({
      query: () => '/udhar',
      providesTags: ['Udhar'],
    }),

    // POST /udhar - create a new credit ledger entry
    createUdhar: builder.mutation({
      query: (data) => ({
        url: '/udhar',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Udhar'],
    }),

    // PATCH /udhar/:id - update credit ledger entry
    updateUdhar: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/udhar/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Udhar'],
    }),

    // DELETE /udhar/:id - delete a credit ledger entry
    deleteUdhar: builder.mutation({
      query: (id) => ({
        url: `/udhar/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Udhar'],
    }),
  }),
});

export const {
  useGetUdharQuery,
  useCreateUdharMutation,
  useUpdateUdharMutation,
  useDeleteUdharMutation,
} = udharApiSlice;
