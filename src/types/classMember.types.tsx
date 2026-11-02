export interface ClassMember {
    id: number;
    name?: string | null;
    email?: string | null;
    role: "Member" | "ClassManager";
    joinedAt?: string | null;
}

export interface ClassMembersPreviewResponse {
    members: ClassMember[];
    totalCount: number;
    managerCount?: number;
}

export interface ClassMembersRequest {
    classId: number;
    page: number;
    pageSize: number;
}

export interface ClassMembersResponse extends ClassMembersPreviewResponse {
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface ClassMemberRowProps {
    classId: number;
    member: ClassMember;
    currentUserId: number | null;
    canManageMembers: boolean;
    managerCount?: number;
    onCurrentUserRemoved: () => void;
}

export interface MembersListProps {
    classId: number;
    members: ClassMember[];
    currentUserId: number | null;
    canManageMembers: boolean;
    managerCount?: number;
    onCurrentUserRemoved: () => void;
}

export interface UpdateClassMemberRoleRequest {
    classId: number;
    memberId: number;
    role: ClassMember["role"];
}

export interface RemoveClassMemberRequest {
    classId: number;
    memberId: number;
}

export interface LeaveClassRequest {
    classId: number;
}

export function isClassMember(value: unknown): value is ClassMember {
    if (typeof value !== "object" || value === null) return false;

    const member = value as Record<string, unknown>;
    const hasValidName =
        member.name === undefined ||
        member.name === null ||
        typeof member.name === "string";
    const hasValidEmail =
        member.email === undefined ||
        member.email === null || typeof member.email === "string";
    const hasValidJoinDate =
        member.joinedAt === undefined ||
        member.joinedAt === null ||
        typeof member.joinedAt === "string";

    return Number.isSafeInteger(member.id) &&
        Number(member.id) > 0 &&
        hasValidName &&
        hasValidEmail &&
        hasValidJoinDate &&
        (member.role === "Member" || member.role === "ClassManager");
}

export interface ClassMembersPreviewProps {
    classId: number;
    className: string;
}