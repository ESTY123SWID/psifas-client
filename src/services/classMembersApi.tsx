import { baseApi } from "./baseApi";

import type {
    ClassMembersRequest,
    ClassMembersResponse,
    ClassMembersPreviewResponse,
    LeaveClassRequest,
    RemoveClassMemberRequest,
    UpdateClassMemberRoleRequest,
} from "../types/classMember.types";

export const classMembersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getClassMembersPreview: builder.query<
            ClassMembersPreviewResponse,
            number
        >({
            query: (classId) => ({
                url: `/classes/${classId}/members`,
                params: { page: 1, pageSize: 5 },
            }),

            providesTags: (_result, _error, classId) => [
                { type: "ClassMembers", id: classId },
            ],
        }),

        getClassMembers: builder.query<
            ClassMembersResponse,
            ClassMembersRequest
        >({
            query: ({ classId, page, pageSize }) => ({
                url: `/classes/${classId}/members`,
                params: { page, pageSize },
            }),
            providesTags: (_result, _error, { classId }) => [
                { type: "ClassMembers", id: classId },
            ],
        }),

        updateClassMemberRole: builder.mutation<
            void,
            UpdateClassMemberRoleRequest
        >({
            query: ({ classId, memberId, role }) => ({
                url: `/classes/${classId}/members/${memberId}`,
                method: "PATCH",
                body: { role },
            }),
            invalidatesTags: (_result, error, { classId }) =>
                error
                    ? []
                    : [
                        { type: "ClassMembers", id: classId },
                        { type: "ClassDetails", id: classId },
                        { type: "MyClasses" },
                    ],
        }),

        removeClassMember: builder.mutation<
            void,
            RemoveClassMemberRequest
        >({
            query: ({ classId, memberId }) => ({
                url: `/classes/${classId}/members/${memberId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, error, { classId }) =>
                error
                    ? []
                    : [
                        { type: "ClassMembers", id: classId },
                        { type: "ClassDetails", id: classId },
                        { type: "MyClasses" },
                    ],
        }),

        leaveClass: builder.mutation<void, LeaveClassRequest>({
            query: ({ classId }) => ({
                url: `/classes/${classId}/members/me`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, error, { classId }) =>
                error
                    ? []
                    : [
                        { type: "ClassMembers", id: classId },
                        { type: "ClassDetails", id: classId },
                        { type: "MyClasses" },
                    ],
        }),

    }),
});

export const {
    useGetClassMembersPreviewQuery,
    useGetClassMembersQuery,
    useUpdateClassMemberRoleMutation,
    useRemoveClassMemberMutation,
    useLeaveClassMutation,
} = classMembersApi;