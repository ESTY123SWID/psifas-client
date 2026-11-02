import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

/** מבנה השגיאה האחיד שהשרת מחזיר: { code, message, details? }. */
export interface ApiErrorInfo {
    status: number | string | null;
    code: string | null;
    message: string | null;
    fieldErrors: Record<string, string>;
}

export function readApiError(error: unknown): ApiErrorInfo {
    const info: ApiErrorInfo = { status: null, code: null, message: null, fieldErrors: {} };
    if (typeof error !== "object" || error === null || !("status" in error)) return info;

    const fetchError = error as FetchBaseQueryError | SerializedError & { status?: unknown };
    info.status = (fetchError as FetchBaseQueryError).status ?? null;

    const data = (fetchError as { data?: unknown }).data;
    if (typeof data === "object" && data !== null) {
        const body = data as Record<string, unknown>;
        if (typeof body.code === "string") info.code = body.code;
        if (typeof body.message === "string") info.message = body.message;
        if (Array.isArray(body.details)) {
            for (const detail of body.details) {
                if (typeof detail === "object" && detail !== null) {
                    const { field, message } = detail as Record<string, unknown>;
                    if (typeof field === "string" && typeof message === "string" && !info.fieldErrors[field]) {
                        info.fieldErrors[field] = message;
                    }
                }
            }
        }
    }
    return info;
}
