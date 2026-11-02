/** תאריך בעברית, או null אם הערך אינו תאריך תקין. */
export function formatDate(value: string | null | undefined, options?: Intl.DateTimeFormatOptions): string | null {
    if (!value) return null;
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return null;
    return date.toLocaleDateString("he-IL", options ?? { day: "numeric", month: "long", year: "numeric" });
}

export function formatCount(value: number | null | undefined): string {
    return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
        ? value.toLocaleString("he-IL")
        : "לא זמין";
}
