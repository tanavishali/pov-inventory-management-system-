import { apiSlice } from './apiSlice';

export const superAdminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET /super-admin/admins — list all shop admins
    getAdmins: builder.query({
      query: () => '/super-admin/admins',
      providesTags: ['Admin'],
    }),

    // POST /super-admin/admins — create a new shop admin
    createAdmin: builder.mutation({
      query: (data) => ({
        url: '/super-admin/admins',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Admin'],
    }),

    // PATCH /super-admin/admins/:id — update admin details or status
    updateAdmin: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/super-admin/admins/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Admin'],
    }),

    // DELETE /super-admin/admins/:id — delete an admin
    deleteAdmin: builder.mutation({
      query: (id) => ({
        url: `/super-admin/admins/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admin'],
    }),

    // POST /super-admin/admins/:id/renew — renew subscription
    renewAdmin: builder.mutation({
      query: ({ id, days }) => ({
        url: `/super-admin/admins/${id}/renew`,
        method: 'POST',
        body: { days },
      }),
      invalidatesTags: ['Admin'],
    }),

    // GET /super-admin/payments — list all payments
    getPayments: builder.query({
      query: () => '/super-admin/payments',
      providesTags: ['Payment'],
    }),

    // POST /super-admin/payments — create a new payment
    createPayment: builder.mutation({
      query: (data) => ({
        url: '/super-admin/payments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment'],
    }),

    // PATCH /super-admin/payments/:id/pay — mark payment as paid
    markPaymentPaid: builder.mutation({
      query: ({ id, method }) => ({
        url: `/super-admin/payments/${id}/pay`,
        method: 'PATCH',
        body: { method },
      }),
      invalidatesTags: ['Payment'],
    }),

    // DELETE /super-admin/payments/:id — delete a payment
    deletePayment: builder.mutation({
      query: (id) => ({
        url: `/super-admin/payments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Payment'],
    }),

    // GET /super-admin/stats — get aggregated platform statistics
    getPlatformStats: builder.query({
      query: () => '/super-admin/stats',
      providesTags: ['Admin', 'Payment'],
    }),

    // GET /super-admin/revenue — get detailed platform revenue analytics
    getDetailedRevenue: builder.query({
      query: () => '/super-admin/revenue',
      providesTags: ['Admin', 'Payment'],
    }),

  }),
});

export const {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useRenewAdminMutation,
  useGetPaymentsQuery,
  useCreatePaymentMutation,
  useMarkPaymentPaidMutation,
  useDeletePaymentMutation,
  useGetPlatformStatsQuery,
  useGetDetailedRevenueQuery,
} = superAdminApiSlice;
