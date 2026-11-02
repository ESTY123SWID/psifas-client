export interface ClassOption {
    id: number;
    name: string;
    role: "Member" | "ClassManager";
    createdAt?: string | null;
}

export interface ClassSelectorProps {
    classes: ClassOption[];
    selectedClassId: number | null;
    onClassChange: (classId: number) => void;
}

export interface ClassListProps {
    classes: ClassOption[];
    selectedClassId: number | null;
    onSelectActive: (classId: number) => void;
}

export interface ClassListItemProps {
    classItem: ClassOption;
    selectedClassId: number | null;
    onSelectActive: (classId: number) => void;
}

export interface CreateClassRequest {
    name: string;
}

export interface CreateClassResponse {
    id: number;
    inviteCode?: string | null;
}

export interface JoinClassRequest {
    inviteCode: string;
}

export interface JoinClassResponse {
    classId: number;
}

export interface CreateClassFormProps {
    onCreated: (classId: number) => void;
}

export interface CreateClassFormValues {
    name: string;
}

export interface JoinClassFormProps {
    onJoined: (classId: number) => void;
}

export interface JoinClassFormValues {
    inviteCode: string;
}

export interface ClassDetailsResponse extends ClassOption {}

export interface UpdateClassRequest {
    classId: number;
    name: string;
}

export interface DeleteClassRequest {
    classId: number;
}

export interface ClassInviteCodeResponse {
    inviteCode: string;
}

export interface ClassInviteCodeRequest {
    classId: number;
}

export interface RenameClassFormProps {
    classId: number;
    currentName: string;
}

export interface RenameClassFormValues {
    name: string;
}

export interface InviteCodePanelProps {
    classId: number;
}

export interface ClassMembershipActionsProps {
    classId: number;
    className: string;
    role: ClassOption["role"];
    managerCount?: number;
    onMembershipEnded: () => void;
}