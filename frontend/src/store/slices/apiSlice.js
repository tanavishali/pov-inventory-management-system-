import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = localStorage.getItem('wholesale_token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['User', 'Admin', 'Salesman', 'Payment', 'Product', 'Order', 'Shop', 'Udhar', 'BusinessSettings', 'Booking'],
  endpoints: (builder) => ({}),
});
