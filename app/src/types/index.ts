export type SoundCategory = "nature" | "ambient" | "instrument" | "urban" | string;

export interface Sound {
    id: string;
    name: string;
    category: SoundCategory;
    src: string;
    volume: number;
    variants?: string[];
    isVariant?: boolean;
    displayName?: string;
}

export interface SavedMix {
    id: string;
    name: string;
    sounds: Sound[];
}