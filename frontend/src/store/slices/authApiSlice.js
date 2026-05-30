import { apiSlice } from './apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getProfile: builder.query({
      query: () => '/auth/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/auth/profile',
        method: 'PATCH',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    getBusinessSettings: builder.query({
      query: () => '/business-settings',
      providesTags: ['BusinessSettings'],
    }),
    updateBusinessSettings: builder.mutation({
      query: (settingsData) => ({
        url: '/business-settings',
        method: 'POST',
        body: settingsData,
      }),
      invalidatesTags: ['BusinessSettings'],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useLogoutMutation,
  useGetBusinessSettingsQuery,
  useUpdateBusinessSettingsMutation,
} = authApiSlice;
