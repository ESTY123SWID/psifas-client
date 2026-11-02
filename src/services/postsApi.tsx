import { baseApi } from "./baseApi";

import type { RecentPost } from "../types/recentPost.types";

import type {
    CreatePostRequest,
    CreatePostResponse,
} from "../types/createPost.types";
import type {
    GetPostsRequest,
    GetPostsResponse,
    GetPostDetailsRequest,
    Post,
    DeletePostRequest,
    PostMutationResponse,
    UpdatePostRequest,
} from "../types/posts.types";

export const postsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getPosts: builder.query<GetPostsResponse, GetPostsRequest>({
            query: ({ classId, type, authorId, search, sort, page, pageSize }) => ({
                url: `/classes/${classId}/posts`,
                params: {
                    type,
                    authorId,
                    search: search?.trim() || undefined,
                    sort,
                    page,
                    pageSize,
                },
            }),

            providesTags: (_result, _error, { classId }) => [
                { type: "Posts", id: classId },
            ],
        }),

        getPostDetails: builder.query<Post, GetPostDetailsRequest>({
            query: ({ classId, postId }) =>
                `/classes/${classId}/posts/${postId}`,
            providesTags: (_result, _error, { classId }) => [
                { type: "Posts", id: classId },
            ],
        }),

        getRecentPosts: builder.query<RecentPost[], number>({
            query: (classId) => ({
                url: `/classes/${classId}/posts/recent`,
                params: { limit: 10 },
            }),

            providesTags: (_result, _error, classId) => [
                { type: "RecentPosts", id: classId },
            ],
        }),

        createPost: builder.mutation<
            CreatePostResponse,
            CreatePostRequest
        >({
            query: ({ classId, formData }) => ({
                url: `/classes/${classId}/posts`,
                method: "POST",
                body: formData,
            }),

            invalidatesTags: (_result, error, { classId }) =>
                error
                    ? []
                    : [
                        { type: "RecentPosts", id: classId },
                        { type: "Posts", id: classId },
                    ],
        }),

        updatePost: builder.mutation<PostMutationResponse, UpdatePostRequest>({
            query: ({ classId, postId, formData }) => ({
                url: `/classes/${classId}/posts/${postId}`,
                method: "PATCH",
                body: formData,
            }),

            invalidatesTags: (_result, error, { classId }) =>
                error
                    ? []
                    : [
                        { type: "Posts", id: classId },
                        { type: "RecentPosts", id: classId },
                        { type: "FeaturedItem", id: classId },
                    ],
        }),

        deletePost: builder.mutation<void, DeletePostRequest>({
            query: ({ classId, postId }) => ({
                url: `/classes/${classId}/posts/${postId}`,
                method: "DELETE",
            }),

            invalidatesTags: (_result, error, { classId }) =>
                error
                    ? []
                    : [
                        { type: "Posts", id: classId },
                        { type: "RecentPosts", id: classId },
                        { type: "FeaturedItem", id: classId },
                    ],
        }),

    }),
});

export const {
    useGetPostsQuery,
    useGetPostDetailsQuery,
    useGetRecentPostsQuery,
    useCreatePostMutation,
    useUpdatePostMutation,
    useDeletePostMutation,
} = postsApi;