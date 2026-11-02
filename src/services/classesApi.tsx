import { baseApi } from "./baseApi";
import type {
    ClassOption,
    CreateClassRequest,
    CreateClassResponse,
    JoinClassRequest,
    JoinClassResponse,
    ClassDetailsResponse,
    ClassInviteCodeRequest,
    ClassInviteCodeResponse,
    DeleteClassRequest,
    UpdateClassRequest,
} from "../types/class.types";

export const classesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMyClasses: builder.query<ClassOption[], void>({
            query: () => "/classes/my",
            providesTags: ["MyClasses"],
        }),

        getClassDetails: builder.query<ClassDetailsResponse, number>({
            query: (classId) => `/classes/${classId}`,
            providesTags: (_result, _error, classId) => [
                { type: "ClassDetails", id: classId },
            ],
        }),

        createClass: builder.mutation<CreateClassResponse, CreateClassRequest>({
            query: (body) => ({
                url: "/classes",
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, error) =>
                error ? [] : ["MyClasses"],
        }),

        joinClass: builder.mutation<JoinClassResponse, JoinClassRequest>({
            query: (body) => ({
                url: "/classes/join",
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, error) =>
                error ? [] : ["MyClasses"],
        }),

        updateClass: builder.mutation<ClassDetailsResponse, UpdateClassRequest>({
            query: ({ classId, name }) => ({
                url: `/classes/${classId}`,
                method: "PATCH",
                body: { name },
            }),
            invalidatesTags: (_result, error, { classId }) =>
                error
                    ? []
                    : [
                        { type: "ClassDetails", id: classId },
                        "MyClasses",
                    ],
        }),

        deleteClass: builder.mutation<void, DeleteClassRequest>({
            query: ({ classId }) => ({
                url: `/classes/${classId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, error, { classId }) =>
                error
                    ? []
                    : [
                        { type: "ClassDetails", id: classId },
                        { type: "ClassMembers", id: classId },
                        { type: "ClassInviteCode", id: classId },
                        { type: "Posts", id: classId },
                        { type: "RecentPosts", id: classId },
                        { type: "FeaturedItem", id: classId },
                        "MyClasses",
                    ],
        }),

        getClassInviteCode: builder.query<ClassInviteCodeResponse, number>({
            query: (classId) => `/classes/${classId}/invite-code`,
            providesTags: (_result, _error, classId) => [
                { type: "ClassInviteCode", id: classId },
            ],
        }),

        regenerateClassInviteCode: builder.mutation<
            ClassInviteCodeResponse,
            ClassInviteCodeRequest
        >({
            query: ({ classId }) => ({
                url: `/classes/${classId}/invite-code/regenerate`,
                method: "POST",
            }),
            invalidatesTags: (_result, error, { classId }) =>
                error ? [] : [{ type: "ClassInviteCode", id: classId }],
        }),
    }),
});

export const {
    useGetMyClassesQuery,
    useCreateClassMutation,
    useJoinClassMutation,
    useGetClassDetailsQuery,
    useUpdateClassMutation,
    useDeleteClassMutation,
    useGetClassInviteCodeQuery,
    useRegenerateClassInviteCodeMutation,
} = classesApi;