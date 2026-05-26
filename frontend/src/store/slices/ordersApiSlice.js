import { apiSlice } from './apiSlice';

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /orders - list all orders for current shop
    getOrders: builder.query({
      query: () => '/orders',
      providesTags: ['Order'],
    }),

    // POST /orders - place a new order
    createOrder: builder.mutation({
      query: (data) => ({
        url: '/orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order'],
    }),

    // PATCH /orders/:id - update order status or details
    updateOrder: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/orders/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Order'],
    }),

    // DELETE /orders/:id - delete order
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = ordersApiSlice;
