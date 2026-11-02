export type ReactionType =
    | "like"
    | "love"
    | "laugh"
    | "adore"
    | "touched"
    | "wow"
    | "applause"
    | "fire";

export type ReactionCounts = Record<ReactionType, number>;

export interface ToggleReactionRequest {
    classId: number;
    postId: number;
    reaction: ReactionType;
}

export interface ReactionBarProps {
    counts?: Partial<ReactionCounts> | null;
    myReaction?: ReactionType | null;
    isUpdating: boolean;
    onReactionClick: (reaction: ReactionType) => void;
}