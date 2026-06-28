import { apiSlice } from './apiSlice';

export const bookingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST /bookings — public demo/booking request from the marketing site
    createBooking: builder.mutation({
      query: (data) => ({
        url: '/bookings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Booking'],
    }),

    // GET /bookings — super-admin: list all leads
    getBookings: builder.query({
      query: () => '/bookings',
      providesTags: ['Booking'],
    }),

    // PATCH /bookings/:id — super-admin: update status
    updateBookingStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/bookings/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Booking'],
    }),

    // DELETE /bookings/:id — super-admin
    deleteBooking: builder.mutation({
      query: (id) => ({
        url: `/bookings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Booking'],
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useGetBookingsQuery,
  useUpdateBookingStatusMutation,
  useDeleteBookingMutation,
} = bookingsApiSlice;
