import { useId } from "react";

import type {
	PostAuthorFilter,
	PostFilterOption,
	PostFiltersProps,
	PostTypeFilter,
	PostsSort,
} from "../../types/posts.types";
import {
	DEFAULT_POSTS_SORT,
	DEFAULT_POST_AUTHOR_FILTER,
	DEFAULT_POST_TYPE_FILTER,
} from "../../types/posts.types";

const typeFilterOptions: PostFilterOption<PostTypeFilter>[] = [
	{ value: "all", label: "הכול" },
	{ value: "quote", label: "משפטים" },
	{ value: "image", label: "תמונות" },
];

const authorFilterOptions: PostFilterOption<PostAuthorFilter>[] = [
	{ value: "all", label: "כל הפרסומים" },
	{ value: "mine", label: "הפרסומים שלי" },
];

const sortOptions: PostFilterOption<PostsSort>[] = [
	{ value: "newest", label: "החדשים ביותר" },
	{ value: "oldest", label: "הישנים ביותר" },
	{ value: "popular", label: "הפופולריים ביותר" },
];

function PostFilters({
	typeFilter,
	authorFilter,
	search,
	sort,
	onTypeFilterChange,
	onAuthorFilterChange,
	onSearchChange,
	onSortChange,
}: PostFiltersProps) {
	const id = useId();
	const searchValue = typeof search === "string" ? search : "";
	const hasActiveFilters =
		typeFilter !== DEFAULT_POST_TYPE_FILTER ||
		authorFilter !== DEFAULT_POST_AUTHOR_FILTER ||
		searchValue.trim() !== "" ||
		sort !== DEFAULT_POSTS_SORT;

	const handleClear = () => {
		onTypeFilterChange(DEFAULT_POST_TYPE_FILTER);
		onAuthorFilterChange(DEFAULT_POST_AUTHOR_FILTER);
		onSearchChange("");
		onSortChange(DEFAULT_POSTS_SORT);
	};

	const selectField = (
		label: string,
		fieldId: string,
		value: string,
		options: PostFilterOption<string>[],
		onChange: (value: string) => void
	) => (
		<div className="min-w-0">
			<label htmlFor={fieldId} className="field-label">{label}</label>
			<select id={fieldId} value={value} className="input select font-semibold" onChange={(event) => onChange(event.currentTarget.value)}>
				{options.map((option) => (
					<option key={option.value} value={option.value}>{option.label}</option>
				))}
			</select>
		</div>
	);

	return (
		<section aria-label="סינון וחיפוש פרסומים" className="mb-12 border-b border-ink pb-10">
			<div className="grid gap-x-7 gap-y-6 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
				<div className="min-w-0">
					<label htmlFor={`${id}-search`} className="field-label">חיפוש</label>
					<input
						id={`${id}-search`}
						type="search"
						value={searchValue}
						onChange={(event) => onSearchChange(event.currentTarget.value)}
						className="input"
						placeholder="כותרת או תוכן הפרסום"
					/>
				</div>
				{selectField("סוג", `${id}-type`, typeFilter, typeFilterOptions, (value) => {
					const option = typeFilterOptions.find((item) => item.value === value);
					if (option) onTypeFilterChange(option.value);
				})}
				{selectField("מפרסמת", `${id}-author`, authorFilter, authorFilterOptions, (value) => {
					const option = authorFilterOptions.find((item) => item.value === value);
					if (option) onAuthorFilterChange(option.value);
				})}
				{selectField("מיון", `${id}-sort`, sort, sortOptions, (value) => {
					const option = sortOptions.find((item) => item.value === value);
					if (option) onSortChange(option.value);
				})}
			</div>
			{hasActiveFilters && (
				<button type="button" onClick={handleClear} className="mt-5 text-sm text-ink-2 underline underline-offset-4 hover:text-coral">
					ניקוי סינון וחיפוש
				</button>
			)}
		</section>
	);
}

export default PostFilters;
