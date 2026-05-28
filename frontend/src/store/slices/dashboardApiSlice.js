import { apiSlice } from './apiSlice';

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/dashboard/stats',
      providesTags: ['Order', 'Product', 'Shop'],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApiSlice;
