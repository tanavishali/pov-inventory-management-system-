import { apiSlice } from './apiSlice';

// Builds a query string, skipping empty/'all' values so unfiltered requests stay clean.
function toQueryString(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') return;
    qs.set(key, value);
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export const superAdminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET /super-admin/admins — paginated shop admins list ({ data, total, page, totalPages, counts })
    getAdmins: builder.query({
      query: (params) => `/super-admin/admins${toQueryString(params)}`,
      providesTags: ['Admin'],
    }),

    // POST /super-admin/admins — create a new shop admin (also creates this month's payment record)
    createAdmin: builder.mutation({
      query: (data) => ({
        url: '/super-admin/admins',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Admin', 'Payment'],
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

    // GET /super-admin/payments — paginated payments list ({ data, total, page, totalPages, stats })
    getPayments: builder.query({
      query: (params) => `/super-admin/payments${toQueryString(params)}`,
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
