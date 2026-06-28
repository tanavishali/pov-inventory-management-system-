import { apiSlice } from './apiSlice';

export const salesmanApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /salesman - list all salesmen for the current tenant shop
    getSalesmen: builder.query({
      query: ({ search, status } = {}) => {
        const sp = new URLSearchParams()
        if (search) sp.set('search', search)
        if (status && status !== 'all') sp.set('status', status)
        const qs = sp.toString()
        return qs ? `/salesman?${qs}` : '/salesman'
      },
      providesTags: ['Salesman'],
    }),

    // POST /salesman - create new salesman
    createSalesman: builder.mutation({
      query: (data) => ({
        url: '/salesman',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Salesman'],
    }),

    // PATCH /salesman/:id - update salesman profile/credentials
    updateSalesman: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/salesman/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Salesman'],
    }),

    // DELETE /salesman/:id - delete salesman
    deleteSalesman: builder.mutation({
      query: (id) => ({
        url: `/salesman/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Salesman'],
    }),
  }),
});

export const {
  useGetSalesmenQuery,
  useCreateSalesmanMutation,
  useUpdateSalesmanMutation,
  useDeleteSalesmanMutation,
} = salesmanApiSlice;
