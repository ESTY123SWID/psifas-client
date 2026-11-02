import { useId, type ReactNode } from "react";

import type { AdminSearchFiltersProps, AdminSortOrder } from "../../types/admin.types";

/** שורת סינון במסכי הניהול: חיפוש, מיון וסדר, ושדות נוספים לפי הצורך. */
function AdminSearchFilters<TSort extends string>({
    search,
    sort,
    order,
    sortOptions,
    searchLabel,
    searchPlaceholder,
    onSearchChange,
    onSortChange,
    onOrderChange,
    children,
}: AdminSearchFiltersProps<TSort> & { children?: ReactNode }) {
    const id = useId();

    return (
        <section aria-label="חיפוש, סינון ומיון" className="mb-8 flex flex-wrap items-end gap-x-7 gap-y-5">
            <div className="min-w-0 flex-[3_1_280px]">
                <label htmlFor={`${id}-search`} className="field-label">{searchLabel}</label>
                <input
                    id={`${id}-search`}
                    type="search"
                    value={search}
                    placeholder={searchPlaceholder}
                    className="input"
                    onChange={(event) => onSearchChange(event.currentTarget.value)}
                />
            </div>

            {children}

            <div className="min-w-0 flex-[1_1_160px]">
                <label htmlFor={`${id}-sort`} className="field-label">מיון לפי</label>
                <select
                    id={`${id}-sort`}
                    value={sort}
                    className="input select font-semibold"
                    onChange={(event) => {
                        const option = sortOptions.find((item) => item.value === event.currentTarget.value);
                        if (option) onSortChange(option.value);
                    }}
                >
                    {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>

            <div className="min-w-0 flex-[1_1_140px]">
                <label htmlFor={`${id}-order`} className="field-label">סדר</label>
                <select
                    id={`${id}-order`}
                    value={order}
                    className="input select font-semibold"
                    onChange={(event) => onOrderChange(event.currentTarget.value === "desc" ? "desc" : "asc" satisfies AdminSortOrder)}
                >
                    <option value="asc">עולה</option>
                    <option value="desc">יורד</option>
                </select>
            </div>
        </section>
    );
}

export default AdminSearchFilters;
