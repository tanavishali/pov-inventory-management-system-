import { apiSlice } from './apiSlice';

export const shopsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /shops - list all customer shops for current tenant
    getShops: builder.query({
      query: () => '/shops',
      providesTags: ['Shop'],
    }),

    // POST /shops - create a new customer shop
    createShop: builder.mutation({
      query: (data) => ({
        url: '/shops',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Shop'],
    }),

    // PATCH /shops/:id - update customer shop details or block/unblock status
    updateShop: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/shops/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Shop'],
    }),

    // DELETE /shops/:id - delete a customer shop
    deleteShop: builder.mutation({
      query: (id) => ({
        url: `/shops/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Shop'],
    }),
  }),
});

export const {
  useGetShopsQuery,
  useCreateShopMutation,
  useUpdateShopMutation,
  useDeleteShopMutation,
} = shopsApiSlice;
