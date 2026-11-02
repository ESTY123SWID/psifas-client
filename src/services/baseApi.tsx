import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { logout } from "../features/auth/authSlice";
import { setSelectedClassId } from "../features/classes/classSlice";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
        // נדרש על ידי הגנת ה־CSRF בשרת לכל בקשה שמשנה מידע.
        headers.set("X-Requested-With", "XMLHttpRequest");
        return headers;
    },
});

const baseQueryWithSessionExpiry: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);
    const url = typeof args === "string" ? args : args.url;
    const method = typeof args === "string" ? "GET" : (args.method ?? "GET").toUpperCase();
    const isAuthEntryRequest = ["/auth/login", "/auth/register"].includes(url) ||
        (url === "/auth/me" && method === "GET");

    if (result.error?.status === 401 && !isAuthEntryRequest) {
        api.dispatch(logout());
        api.dispatch(setSelectedClassId(null));
        api.dispatch(baseApi.util.resetApiState());
    }

    return result;
};

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithSessionExpiry,

    tagTypes: [
        "FeaturedItem",
        "RecentPosts",
        "MyClasses",
        "Posts",
         "ClassMembers",
        "ClassDetails",
        "ClassInviteCode",
        "AdminDashboard",
        "AdminUsers",
        "AdminClasses",
        "AdminClassMembers",
        "Session",
    ],

    endpoints: () => ({}),
});