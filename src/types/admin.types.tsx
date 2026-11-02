import type { User } from "./auth.types";

export type AdminUserRole = User["role"];

export interface AdminRecentUser {
    id: number;
    name: string;
    email: string;
    role: AdminUserRole;
    registeredAt?: string | null;
}

export interface AdminRecentClass {
    id: number;
    name: string;
    createdAt?: string | null;
}

export interface AdminDashboardResponse {
    totalUsers?: number | null;
    totalClasses?: number | null;
    totalPosts?: number | null;
    systemAdminCount?: number | null;
    newUsersThisWeek?: number | null;
    newPostsThisWeek?: number | null;
    imagePostCount?: number | null;
    recentUsers?: AdminRecentUser[] | null;
    recentClasses?: AdminRecentClass[] | null;
}

export interface AdminStatsCardProps {
    label: string;
    value?: number | null;
}

export interface AdminRecentUsersProps {
    users?: AdminRecentUser[] | null;
}

export interface AdminRecentClassesProps {
    classes?: AdminRecentClass[] | null;
}

export type AdminUserSort = "name" | "registeredAt";

export type AdminClassSort = "name" | "createdAt";

export type AdminSortOrder = "asc" | "desc";

export interface AdminListRequest {
    page: number;
    pageSize: number;
    search?: string;
    sort: string;
    order: AdminSortOrder;
}

export interface AdminPageResponse<TItem> {
    items: TItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface AdminUser extends AdminRecentUser {
    classCount?: number | null;
    systemAdminCount?: number | null;
    managedClassCount?: number | null;
    lastManagerClassCount?: number | null;
    canDelete?: boolean;
    canChangeRole?: boolean;
}

export interface AdminUserDetails extends AdminUser {}

export interface AdminUsersRequest extends AdminListRequest {
    sort: AdminUserSort;
    role?: AdminUserRole;
}

export interface AdminUserRoleRequest {
    userId: number;
    role: AdminUserRole;
}

export interface AdminUserDeleteRequest {
    userId: number;
}

export interface AdminUsersTableProps {
    users: AdminUser[];
    onSelectUser: (userId: number) => void;
}

export interface AdminUserRowProps {
    user: AdminUser;
    onSelect: (userId: number) => void;
}

export interface AdminUserDetailsModalProps {
    userId: number;
    onClose: () => void;
    onDeleted: (userId: number) => void;
}

export interface AdminClass extends AdminRecentClass {
    memberCount?: number | null;
    postCount?: number | null;
    managerName?: string | null;
    inviteCode?: string | null;
}

export interface AdminClassDetails extends AdminClass {
    managerCount?: number | null;
    managers?: AdminClassMember[] | null;
}

export interface AdminClassMember {
    id: number;
    name: string;
    email?: string | null;
    role: "Member" | "ClassManager";
}

export interface AdminClassesRequest extends AdminListRequest {
    sort: AdminClassSort;
}

export interface AdminClassMembersRequest {
    classId: number;
    page: number;
    pageSize: number;
}

export interface AdminClassRenameRequest {
    classId: number;
    name: string;
}

export interface AdminClassMemberActionRequest {
    classId: number;
    userId: number;
}

export interface AdminClassMemberRoleRequest extends AdminClassMemberActionRequest {
    role: AdminClassMember["role"];
}

export interface AdminClassDeleteRequest {
    classId: number;
}

export interface AdminClassesTableProps {
    classes: AdminClass[];
    onSelectClass: (classId: number) => void;
}

export interface AdminClassRowProps {
    classItem: AdminClass;
    onSelect: (classId: number) => void;
}

export interface AdminClassDetailsPageData {
    classDetails: AdminClassDetails;
    members: AdminPageResponse<AdminClassMember>;
}

export interface AdminClassMembersListProps {
    classId: number;
    members: AdminClassMember[];
    /** מספר המנהלות בכיתה — לחסימת פעולות על המנהלת האחרונה. */
    managerCount?: number | null;
}

export interface AdminSearchOption<TSort extends string> {
    value: TSort;
    label: string;
}

export interface AdminSearchFiltersProps<TSort extends string> {
    search: string;
    sort: TSort;
    order: AdminSortOrder;
    sortOptions: AdminSearchOption<TSort>[];
    searchLabel: string;
    searchPlaceholder: string;
    onSearchChange: (value: string) => void;
    onSortChange: (value: TSort) => void;
    onOrderChange: (value: AdminSortOrder) => void;
}

export interface AdminPaginationProps {
    page: number;
    totalPages: number;
    isLoading: boolean;
    onPageChange: (page: number) => void;
}

export function isAdminUser(value: unknown): value is AdminUser {
    if (typeof value !== "object" || value === null) return false;
    const user = value as Record<string, unknown>;
    return Number.isSafeInteger(user.id) &&
        Number(user.id) > 0 &&
        typeof user.name === "string" &&
        typeof user.email === "string" &&
        (user.role === "User" || user.role === "SystemAdmin");
}

export function isAdminClass(value: unknown): value is AdminClass {
    if (typeof value !== "object" || value === null) return false;
    const classItem = value as Record<string, unknown>;
    return Number.isSafeInteger(classItem.id) &&
        Number(classItem.id) > 0 &&
        typeof classItem.name === "string";
}

export function isAdminClassMember(value: unknown): value is AdminClassMember {
    if (typeof value !== "object" || value === null) return false;
    const member = value as Record<string, unknown>;
    return Number.isSafeInteger(member.id) &&
        Number(member.id) > 0 &&
        typeof member.name === "string" &&
        (member.email === undefined || member.email === null || typeof member.email === "string") &&
        (member.role === "Member" || member.role === "ClassManager");
}
