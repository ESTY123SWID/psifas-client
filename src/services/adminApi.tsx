import { baseApi } from "./baseApi";
import type {
    AdminClass,
    AdminClassDeleteRequest,
    AdminClassMemberActionRequest,
    AdminClassMemberRoleRequest,
    AdminClassRenameRequest,
    AdminClassDetails,
    AdminClassMembersRequest,
    AdminClassesRequest,
    AdminDashboardResponse,
    AdminPageResponse,
    AdminUser,
    AdminUserDeleteRequest,
    AdminUserDetails,
    AdminUserRoleRequest,
    AdminUsersRequest,
    AdminClassMember,
} from "../types/admin.types";

export const adminApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdminDashboard: builder.query<AdminDashboardResponse, void>({
            query: () => "/admin/dashboard",
            providesTags: ["AdminDashboard"],
        }),

        getAdminUsers: builder.query<AdminPageResponse<AdminUser>, AdminUsersRequest>({
            query: (params) => ({
                url: "/admin/users",
                params,
            }),
            providesTags: (result) => [
                { type: "AdminUsers", id: "LIST" },
                ...(result?.items.map((user) => ({
                    type: "AdminUsers" as const,
                    id: user.id,
                })) ?? []),
            ],
        }),

        getAdminUserDetails: builder.query<AdminUserDetails, number>({
            query: (userId) => `/admin/users/${userId}`,
            providesTags: (_result, _error, userId) => [
                { type: "AdminUsers", id: userId },
            ],
        }),

        updateAdminUserRole: builder.mutation<AdminUserDetails, AdminUserRoleRequest>({
            query: ({ userId, role }) => ({
                url: `/admin/users/${userId}`,
                method: "PATCH",
                body: { role },
            }),
            invalidatesTags: (_result, error, { userId }) =>
                error
                    ? []
                    : [
                        { type: "AdminUsers", id: userId },
                        { type: "AdminUsers", id: "LIST" },
                        "AdminDashboard",
                    ],
        }),

        deleteAdminUser: builder.mutation<void, AdminUserDeleteRequest>({
            query: ({ userId }) => ({
                url: `/admin/users/${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, error, { userId }) =>
                error
                    ? []
                    : [
                        { type: "AdminUsers", id: userId },
                        { type: "AdminUsers", id: "LIST" },
                        { type: "AdminClasses", id: "LIST" },
                        { type: "AdminClassMembers" },
                        "AdminDashboard",
                    ],
        }),

        getAdminClasses: builder.query<AdminPageResponse<AdminClass>, AdminClassesRequest>({
            query: (params) => ({
                url: "/admin/classes",
                params,
            }),
            providesTags: (result) => [
                { type: "AdminClasses", id: "LIST" },
                ...(result?.items.map((classItem) => ({
                    type: "AdminClasses" as const,
                    id: classItem.id,
                })) ?? []),
            ],
        }),

        getAdminClassDetails: builder.query<AdminClassDetails, number>({
            query: (classId) => `/admin/classes/${classId}`,
            providesTags: (_result, _error, classId) => [
                { type: "AdminClasses", id: classId },
            ],
        }),

        getAdminClassMembers: builder.query<
            AdminPageResponse<AdminClassMember>,
            AdminClassMembersRequest
        >({
            query: ({ classId, page, pageSize }) => ({
                url: `/admin/classes/${classId}/members`,
                params: { page, pageSize },
            }),
            providesTags: (_result, _error, { classId }) => [
                { type: "AdminClassMembers", id: classId },
            ],
        }),

        renameAdminClass: builder.mutation<AdminClassDetails, AdminClassRenameRequest>({
            query: ({ classId, name }) => ({
                url: `/admin/classes/${classId}`,
                method: "PATCH",
                body: { name },
            }),
            invalidatesTags: (_result, error, { classId }) =>
                error ? [] : [{ type: "AdminClasses", id: classId }, { type: "AdminClasses", id: "LIST" }, "AdminDashboard", "MyClasses"],
        }),

        updateAdminClassMemberRole: builder.mutation<void, AdminClassMemberRoleRequest>({
            query: ({ classId, userId, role }) => ({
                url: `/admin/classes/${classId}/members/${userId}`,
                method: "PATCH",
                body: { role },
            }),
            invalidatesTags: (_result, error, { classId }) =>
                error
                    ? []
                    : [
                        { type: "AdminClassMembers", id: classId },
                        { type: "AdminClasses", id: classId },
                        { type: "AdminClasses", id: "LIST" },
                        { type: "AdminUsers" },
                        "MyClasses",
                    ],
        }),

        removeAdminClassMember: builder.mutation<void, AdminClassMemberActionRequest>({
            query: ({ classId, userId }) => ({
                url: `/admin/classes/${classId}/members/${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, error, { classId }) =>
                error
                    ? []
                    : [
                        { type: "AdminClassMembers", id: classId },
                        { type: "AdminClasses", id: classId },
                        { type: "AdminClasses", id: "LIST" },
                        { type: "AdminUsers" },
                        "AdminDashboard",
                        "MyClasses",
                    ],
        }),

        deleteAdminClass: builder.mutation<void, AdminClassDeleteRequest>({
            query: ({ classId }) => ({
                url: `/admin/classes/${classId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, error, { classId }) =>
                error
                    ? []
                    : [
                        { type: "AdminClasses", id: classId },
                        { type: "AdminClasses", id: "LIST" },
                        { type: "AdminUsers", id: "LIST" },
                        { type: "AdminClassMembers", id: classId },
                        "AdminDashboard",
                    ],
        }),
    }),
});

export const {
    useGetAdminDashboardQuery,
    useGetAdminUsersQuery,
    useGetAdminUserDetailsQuery,
    useUpdateAdminUserRoleMutation,
    useDeleteAdminUserMutation,
    useGetAdminClassesQuery,
    useGetAdminClassDetailsQuery,
    useGetAdminClassMembersQuery,
    useDeleteAdminClassMutation,
    useRenameAdminClassMutation,
    useUpdateAdminClassMemberRoleMutation,
    useRemoveAdminClassMemberMutation,
} = adminApi;
