import { apiSlice } from './apiSlice';

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /products - list all products for current shop
    getProducts: builder.query({
      query: ({ search, filter, sort } = {}) => {
        const sp = new URLSearchParams()
        if (search) sp.set('search', search)
        if (filter && filter !== 'all') sp.set('filter', filter)
        if (sort) sp.set('sort', sort)
        const qs = sp.toString()
        return qs ? `/products?${qs}` : '/products'
      },
      providesTags: ['Product'],
    }),

    // POST /products - create new product
    createProduct: builder.mutation({
      query: (data) => ({
        url: '/products',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),

    // PATCH /products/:id - update product
    updateProduct: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),

    // DELETE /products/:id - delete product
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApiSlice;
