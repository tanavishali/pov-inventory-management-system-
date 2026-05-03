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

  }),
});

export const {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useRenewAdminMutation,
} = superAdminApiSlice;
