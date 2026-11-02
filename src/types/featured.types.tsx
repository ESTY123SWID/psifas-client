import type {
    ReactionCounts,
    ReactionType,
} from "./reaction.types";

export interface FeaturedItem {
    id: number;
    type: "quote" | "image";
    text?: string | null;
    imageUrl?: string | null;
    reactions?: Partial<ReactionCounts> | null;
    myReaction?: ReactionType | null;
}

export interface FeaturedItemProps {
    classId: number;
}