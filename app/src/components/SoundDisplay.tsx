import { useRef, useState, useEffect } from "react";
import { Sound } from "@/types";
import { MasterControl } from "./SoundControls";

import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import PauseRounded from '@mui/icons-material/PauseRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import VolumeDownRounded from '@mui/icons-material/VolumeDownRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';

function getDisplayName(sound: Sound, useRandomVariants: boolean) {
    const nameMatch = sound.name.match(/\s+(\d+)$/);
    let variantNum = nameMatch ? nameMatch[1] : null;
    if (!variantNum && sound.src) {
        const altMatch = sound.src.match(/\((\d+)\)/);
        if (altMatch) variantNum = altMatch[1];
    }
    const base = sound.name.replace(/\s+\d+$/, '');
    if (useRandomVariants) return base;
    if (variantNum && !sound.name.includes(variantNum)) {
        return `${base} ${variantNum}`;
    }
    return sound.name;
}

interface SoundItemProps {
    sound: Sound;
    isPlaying: boolean;
    masterVolume: number;
    onRemove: (id: string) => void;
    onVolumeChange: (id: string, volume: number) => void;
    variant?: "track" | "tile";
    useRandomVariants?: boolean;
}

function SoundItem({
    sound,
    isPlaying: globalIsPlaying,
    masterVolume,
    onRemove,
    onVolumeChange,
    variant = "track",
    useRandomVariants = true
}: SoundItemProps) {
    const [localIsPlaying, setLocalIsPlaying] = useState(true);
    const audioRef = useSoundAudio(sound, masterVolume, globalIsPlaying && localIsPlaying);

    const isPlaying = globalIsPlaying && localIsPlaying;

    const containerClass = isPlaying
        ? "bg-slate-100 dark:bg-slate-700"
        : "bg-slate-200/60 dark:bg-slate-800/60";
    const pointerEventsClass = !globalIsPlaying ? "pointer-events-none" : "";
    const playButtonClass = localIsPlaying
        ? "play-button"
        : "bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300";
    const playButtonCursor = !globalIsPlaying ? "opacity-50 cursor-default" : "cursor-pointer";
    const removeButtonClass = `w-6 h-6 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300 ${!globalIsPlaying
        ? "opacity-50"
        : "hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900 dark:hover:text-red-300 cursor-pointer"
        }`;

    const togglePlay = () => globalIsPlaying && setLocalIsPlaying(v => !v);

    return (
        <div
            className={[
                "p-3 rounded-md sound-item",
                variant === "tile" ? "flex flex-col gap-2" : "",
                containerClass,
                pointerEventsClass,
                "mb-2"
            ].join(" ")}
        >
            <div className={`flex items-center justify-between mb-2 ${variant === "tile" ? "" : ""}`}>
                <div className={`flex items-center space-x-2`}>
                    <button
                        onClick={togglePlay}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${playButtonClass} ${playButtonCursor}`}
                        aria-label={localIsPlaying ? "Pause" : "Play"}
                        disabled={!globalIsPlaying}
                    >
                        {localIsPlaying ? (
                            <PauseRounded fontSize="small" />
                        ) : (
                            <PlayArrowRounded fontSize="small" />
                        )}
                    </button>
                    <h3 className={`font-medium transition-opacity ${!isPlaying ? "opacity-60" : ""}`}>
                        {getDisplayName(sound, useRandomVariants)}
                    </h3>
                </div>
                <button
                    onClick={() => onRemove(sound.id)}
                    className={removeButtonClass}
                    aria-label="Remove sound"
                    disabled={!globalIsPlaying}
                >
                    <CloseRounded fontSize="small" />
                </button>
            </div>
            <div className={`flex items-center space-x-2 ${!isPlaying ? "opacity-60" : ""}`}>
                <VolumeDownRounded className="text-muted-text" fontSize="small" />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={sound.volume}
                    onChange={(e) => onVolumeChange(sound.id, parseFloat(e.target.value))}
                    className="flex-1 h-1 rounded-lg appearance-none"
                    aria-label="Volume"
                    disabled={!globalIsPlaying || !localIsPlaying}
                />
                <VolumeUpRounded className="text-muted-text" fontSize="small" />
                <div className="text-xs ml-1 w-8 text-right">
                    {Math.round(sound.volume * 100)}%
                </div>
            </div>
            <div className="mt-1 text-xs text-muted-text">
                {sound.category}
                {!isPlaying && " • Paused"}
            </div>
        </div>
    );
}

interface SoundScapeProps {
    sounds: Sound[];
    masterVolume: number;
    isPlaying: boolean;
    useRandomVariants?: boolean;
    onMasterVolumeChange: (volume: number) => void;
    onPlayPauseToggle: () => void;
    onRemove: (id: string) => void;
    onVolumeChange: (id: string, volume: number) => void;
}

function SoundScape({
    sounds,
    masterVolume,
    isPlaying,
    useRandomVariants = true,
    onMasterVolumeChange,
    onPlayPauseToggle,
    onRemove,
    onVolumeChange,
}: SoundScapeProps) {
    const groupedSounds = sounds.reduce(
        (acc: Record<string, Sound[]>, sound) => {
            const category = sound.category;
            if (!acc[category]) acc[category] = [];
            acc[category].push(sound);
            return acc;
        },
        {}
    );

    return (
        <div className="flex flex-col h-full">
            <MasterControl
                masterVolume={masterVolume}
                isPlaying={isPlaying}
                onPlayPauseToggle={onPlayPauseToggle}
                onVolumeChange={onMasterVolumeChange}
            />
            <div className="space-y-6 overflow-y-auto mt-4">
                {Object.entries(groupedSounds).map(([category, categorySounds]) => (
                    <div key={category} className="mb-4">
                        <h3 className="text-base font-medium mb-3 text-slate-600 dark:text-slate-300 capitalize">
                            {category}
                        </h3>
                        <div className="space-y-2">
                            {categorySounds.map((sound) => (
                                <SoundItem
                                    key={sound.id}
                                    sound={sound}
                                    isPlaying={isPlaying}
                                    masterVolume={masterVolume}
                                    onRemove={onRemove}
                                    onVolumeChange={onVolumeChange}
                                    variant="track"
                                    useRandomVariants={useRandomVariants}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface SoundBoardProps {
    sounds: Sound[];
    masterVolume: number;
    isPlaying: boolean;
    useRandomVariants?: boolean;
    onMasterVolumeChange: (volume: number) => void;
    onPlayPauseToggle: () => void;
    onRemove: (id: string) => void;
    onVolumeChange: (id: string, volume: number) => void;
}

function useSoundAudio(sound: Sound, masterVolume: number, isPlaying: boolean) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    useEffect(() => {
        const audio = new Audio(sound.src);
        audio.loop = true;
        audio.volume = sound.volume * masterVolume;
        audioRef.current = audio;
        return () => {
            audio.pause();
            audioRef.current = null;
        };
    }, [sound.src, sound.volume, masterVolume]);
    useEffect(() => {
        if (isPlaying) {
            audioRef.current?.play().catch(() => { });
        } else {
            audioRef.current?.pause();
        }
    }, [isPlaying]);
    return audioRef;
}

function SoundBoard({
    sounds,
    masterVolume,
    isPlaying,
    useRandomVariants = true,
    onMasterVolumeChange,
    onPlayPauseToggle,
    onRemove,
    onVolumeChange
}: SoundBoardProps) {
    return (
        <div className="space-y-4">
            <MasterControl
                masterVolume={masterVolume}
                isPlaying={isPlaying}
                onPlayPauseToggle={onPlayPauseToggle}
                onVolumeChange={onMasterVolumeChange}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sounds.map((sound) => (
                    <SoundItem
                        key={sound.id}
                        sound={sound}
                        isPlaying={isPlaying}
                        masterVolume={masterVolume}
                        onRemove={onRemove}
                        onVolumeChange={onVolumeChange}
                        variant="tile"
                        useRandomVariants={useRandomVariants}
                    />
                ))}
            </div>
        </div>
    );
}

interface SoundDisplayProps {
    sounds: Sound[];
    masterVolume: number;
    isPlaying: boolean;
    useTimelineView: boolean;
    useRandomVariants?: boolean;
    onMasterVolumeChange: (volume: number) => void;
    onPlayPauseToggle: () => void;
    onRemove: (id: string) => void;
    onVolumeChange: (id: string, volume: number) => void;
}

export function SoundDisplay({
    sounds,
    masterVolume,
    isPlaying,
    useTimelineView,
    useRandomVariants = true,
    onMasterVolumeChange,
    onPlayPauseToggle,
    onRemove,
    onVolumeChange
}: SoundDisplayProps) {
    if (useTimelineView) {
        return (
            <SoundScape
                sounds={sounds}
                masterVolume={masterVolume}
                isPlaying={isPlaying}
                useRandomVariants={useRandomVariants}
                onMasterVolumeChange={onMasterVolumeChange}
                onPlayPauseToggle={onPlayPauseToggle}
                onRemove={onRemove}
                onVolumeChange={onVolumeChange}
            />
        );
    }
    return (
        <SoundBoard
            sounds={sounds}
            masterVolume={masterVolume}
            isPlaying={isPlaying}
            useRandomVariants={useRandomVariants}
            onMasterVolumeChange={onMasterVolumeChange}
            onPlayPauseToggle={onPlayPauseToggle}
            onRemove={onRemove}
            onVolumeChange={onVolumeChange}
        />
    );
}