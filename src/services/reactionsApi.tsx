import { baseApi } from "./baseApi";
import type { ToggleReactionRequest } from "../types/reaction.types";

export const reactionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        toggleReaction: builder.mutation<void, ToggleReactionRequest>({
            query: ({ postId, reaction }) => ({
                url: `/posts/${postId}/reactions`,
                method: "POST",
                body: { reaction },
            }),

            invalidatesTags: (_result, error, { classId }) =>
                error
                    ? []
                    : [
                        { type: "FeaturedItem", id: classId },
                        { type: "Posts", id: classId },
                        { type: "RecentPosts", id: classId },
                    ],
        }),
    }),
});

export const { useToggleReactionMutation } = reactionsApi;