import { apiSlice } from './apiSlice';

export const salesmanApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /salesman - list all salesmen for the current tenant shop
    getSalesmen: builder.query({
      query: () => '/salesman',
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
