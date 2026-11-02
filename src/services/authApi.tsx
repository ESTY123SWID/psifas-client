import { baseApi } from "./baseApi";
import type { AuthSessionResponse } from "../types/auth.types";
import type {
    ChangePasswordRequest,
    UpdateMyProfileRequest,
    UpdateMyProfileResponse,
} from "../types/profile.types";

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCurrentUser: builder.query<AuthSessionResponse, void>({
            query: () => "/auth/me",
            providesTags: ["Session"],
        }),

        login: builder.mutation<AuthSessionResponse, { email: string; password: string }>({
            query: (data) => ({
                url: "/auth/login",
                method: "POST",
                body: data,
            }),
            invalidatesTags: (_result, error) => error ? [] : ["Session"],
        }),

        register: builder.mutation<AuthSessionResponse, { name: string; email: string; password: string }>({
            query: (data) => ({
                url: "/auth/register",
                method: "POST",
                body: data,
            }),
            invalidatesTags: (_result, error) => error ? [] : ["Session"],
        }),

        logout: builder.mutation<void, void>({
            query: () => ({
                url: "/auth/logout",
                method: "POST",
            }),
        }),

        updateMyProfile: builder.mutation<
            UpdateMyProfileResponse,
            UpdateMyProfileRequest
        >({
            query: (body) => ({
                url: "/auth/me",
                method: "PATCH",
                body,
            }),
        }),

        changePassword: builder.mutation<void, ChangePasswordRequest>({
            query: (body) => ({
                url: "/auth/me/password",
                method: "POST",
                body,
            }),
        }),
    }),
});

export const {
    useGetCurrentUserQuery,
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useUpdateMyProfileMutation,
    useChangePasswordMutation,
} = authApi;