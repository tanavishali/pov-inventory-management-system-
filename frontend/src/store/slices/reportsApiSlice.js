import { apiSlice } from './apiSlice';

export const reportsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReports: builder.query({
      query: ({ from, to } = {}) => {
        const sp = new URLSearchParams()
        if (from) sp.set('from', from)
        if (to) sp.set('to', to)
        const qs = sp.toString()
        return qs ? `/reports/summary?${qs}` : '/reports/summary'
      },
      providesTags: ['Order', 'Shop', 'Salesman'],
    }),
  }),
});

export const { useGetReportsQuery } = reportsApiSlice;
