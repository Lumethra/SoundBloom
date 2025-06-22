import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { SavedMix } from "@/types";
import PlayArrowIcon from '@mui/icons-material/PlayArrowRounded';
import PauseIcon from '@mui/icons-material/PauseRounded';
import VolumeDownIcon from '@mui/icons-material/VolumeDownRounded';
import VolumeUpIcon from '@mui/icons-material/VolumeUpRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';

export function MasterControl({
    masterVolume,
    isPlaying,
    onPlayPauseToggle,
    onVolumeChange
}: {
    masterVolume: number;
    isPlaying: boolean;
    onPlayPauseToggle: () => void;
    onVolumeChange: (vol: number) => void;
}) {
    return (
        <div className="master-control p-4 mb-4">
            <div className="flex items-center gap-4">
                <button
                    onClick={onPlayPauseToggle}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'play-button' : 'pause-button'}`}
                    aria-label={isPlaying ? "Pause All" : "Play All"}
                >
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </button>
                <div className="flex-1">
                    <div className="text-sm mb-1 font-semibold">
                        Master Control {!isPlaying && '(Paused)'}
                    </div>
                    <div className="flex items-center gap-2">
                        <VolumeDownIcon className="opacity-60" />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={masterVolume}
                            onChange={e => onVolumeChange(parseFloat(e.target.value))}
                            className="flex-1 h-1 rounded-lg appearance-none cursor-pointer"
                        />
                        <VolumeUpIcon className="opacity-60" />
                        <div className="text-sm ml-2 w-10 text-right">
                            {Math.round(masterVolume * 100)}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

type SoundControlsProps = {
    useTimelineView: boolean;
    onToggleView: () => void;
    onSaveMix: (name: string, id?: string) => void;
    onLoadMix: (mixId: string) => void;
    onDeleteMix: (mixId: string) => void;
    savedMixes: SavedMix[];
};

export function SoundControls({
    useTimelineView,
    onToggleView,
    onSaveMix,
    onLoadMix,
    onDeleteMix,
    savedMixes
}: SoundControlsProps) {
    const [showModal, setShowModal] = useState(false);
    const [mixName, setMixName] = useState("");
    const [editId, setEditId] = useState<string | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ show: boolean, id: string, name: string }>({ show: false, id: "", name: "" });


    const closeDeleteModal = () => setDeleteModal({ show: false, id: "", name: "" });
    const closeDropdown = () => setShowDropdown(false);

    const saveMix = () => {
        const trimmed = mixName.trim();
        if (trimmed) {
            onSaveMix(trimmed, editId || undefined);
            setMixName("");
            setShowModal(false);
            setEditId(null);
        }
    };

    function startEditMix(id: string, name: string) {
        setEditId(id);
        setMixName(name);
        setShowModal(true);
        closeDropdown();
    }

    function confirmDelete(id: string, name: string) {
        setDeleteModal({ show: true, id, name });
    }

    if (showDropdown) console.log("Dropdown open");

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setShowModal(false);
                closeDeleteModal();
            }
        }
        if (showModal || deleteModal.show) {
            window.addEventListener("keydown", onKeyDown);
            return () => window.removeEventListener("keydown", onKeyDown);
        }
    }, [showModal, deleteModal.show]);

    return (
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
                <h2 className="text-xl font-semibold">Your Soundscape</h2>
                <button
                    onClick={onToggleView}
                    className="ml-4 px-3 py-1 text-xs rounded category-pill inactive"
                >
                    {useTimelineView ? "Switch to Grid View" : "Switch to Timeline View"}
                </button>
            </div>
            <div className="flex space-x-2">
                <button
                    className={`btn-primary px-3 py-1 rounded text-sm${showModal ? " active" : ""}`}
                    onClick={() => {
                        setEditId(null);
                        setMixName("");
                        setShowModal(true);
                    }}
                >
                    Save Mix
                </button>
                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(v => !v)}
                        className="btn-secondary px-3 py-1 rounded text-sm flex items-center"
                    >
                        Load Mix <KeyboardArrowDownIcon />
                    </button>
                    {showDropdown && (
                        <div className="absolute right-0 mt-1 w-64 card shadow-lg rounded-md z-10 overflow-hidden">
                            {savedMixes.length ? (
                                <div className="max-h-60 overflow-y-auto">
                                    {savedMixes.map(({ id, name }) => (
                                        <div key={id} className="flex items-center justify-between hover:bg-slate-200 dark:hover:bg-slate-700">
                                            <button
                                                onClick={() => {
                                                    onLoadMix(id);
                                                    closeDropdown();
                                                }}
                                                className="flex-grow text-left px-4 py-2 text-sm truncate"
                                            >
                                                {name}
                                            </button>
                                            <div className="flex pr-2">
                                                <button
                                                    onClick={() => startEditMix(id, name)}
                                                    className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                                                    title="Edit mix"
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(id, name)}
                                                    className="p-1 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                                                    title="Delete mix"
                                                >
                                                    <DeleteIcon />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-2 text-sm text-muted-text">No saved mixes</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {showModal && createPortal(
                <div className="modal-overlay" onClick={() => {
                    setShowModal(false);
                    setEditId(null);
                }}>
                    <div
                        className="modal-content p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-medium mb-4">
                            {editId ? 'Edit Mix' : 'Save Your Mix'}
                        </h3>
                        <input
                            type="text"
                            value={mixName}
                            onChange={e => setMixName(e.target.value)}
                            placeholder="Enter a name for your mix"
                            className="w-full p-2 mb-4 border border-slate-200 dark:border-slate-700 rounded bg-transparent"
                            autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditId(null);
                                }}
                                className="px-4 py-2 hover:bg-primary hover:bg-opacity-10 dark:hover:bg-opacity-20 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveMix}
                                className="btn-primary px-4 py-2 rounded"
                                disabled={!mixName.trim()}
                            >
                                {editId ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
            {deleteModal.show && createPortal(
                <div className="modal-overlay" onClick={closeDeleteModal}>
                    <div
                        className="modal-content p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center text-red-500 dark:text-red-400 mb-2">
                            <WarningIcon className="mr-2" />
                            <h3 className="text-lg font-medium">Delete Mix</h3>
                        </div>
                        <p className="mb-6">
                            Are you sure you want to delete "<span className="font-medium">{deleteModal.name}</span>"?
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onDeleteMix(deleteModal.id);
                                    closeDeleteModal();
                                }}
                                className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded flex items-center"
                            >
                                <DeleteIcon className="mr-1" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}