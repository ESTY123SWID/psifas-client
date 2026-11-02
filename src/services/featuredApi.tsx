import { baseApi } from "./baseApi";
import type { FeaturedItem } from "../types/featured.types";

export const featuredApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFeaturedItem: builder.query<FeaturedItem | null, number>({
            query: (classId) => `/classes/${classId}/featured`,

            providesTags: (_result, _error, classId) => [
                { type: "FeaturedItem", id: classId },
            ],
        }),
    }),
});

export const { useGetFeaturedItemQuery } = featuredApi;