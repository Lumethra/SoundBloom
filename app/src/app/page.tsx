"use client";

import { useState, useEffect } from "react";
import { Sound, SavedMix } from "@/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SoundControls } from "@/components/SoundControls";
import { SoundDisplay } from "@/components/SoundDisplay";
import { LibraryAndMixes } from "@/components/LibraryAndMixes";

function Header() {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-5xl md:text-6xl font-bold mb-2 gradient-title">
        SoundBloom
      </h1>
      <p className="text-muted-text">
        Create your own ambient soundscapes
      </p>
    </header>
  );
}

function EmptyDropZone() {
  return (
    <div className="flex flex-col items-center justify-center h-60 text-muted-text empty-dropzone rounded-lg">
      <p>Drag or Add sounds from the library to start creating</p>
    </div>
  );
}

export default function Home() {
  const [activeSounds, setActiveSounds] = useState<Sound[]>([]);
  const [savedMixes, setSavedMixes] = useState<SavedMix[]>([]);
  const [useTimelineView, setUseTimelineView] = useState(true);
  const [masterVolume, setMasterVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [useRandomVariants, setUseRandomVariants] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const currentTheme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
    setTheme(currentTheme);

    const handleThemeChange = (e: CustomEvent<{ theme: 'light' | 'dark' }>) => {
      setTheme(e.detail.theme);
    };

    document.addEventListener('themechange', handleThemeChange as EventListener);
    return () => document.removeEventListener('themechange', handleThemeChange as EventListener);
  }, []);

  // Load saved mixes from localStorage
  useEffect(() => {
    const savedMixesData = localStorage.getItem("soundbloom-mixes");
    if (savedMixesData) {
      try {
        setSavedMixes(JSON.parse(savedMixesData));
      } catch (e) {
        console.error("Failed to parse saved mixes:", e);
      }
    }
  }, []);

  const handleAddSound = (sound: Sound) => {
    const baseName = sound.name
      .split(" ")
      .filter(part => !part.includes("#"))
      .join(" ");

    const soundExists = activeSounds.some(s => {
      const existingBaseName = s.name
        .split(" ")
        .filter(part => !part.includes("#"))
        .join(" ");
      return existingBaseName === baseName;
    });

    if (!soundExists) {
      setActiveSounds([...activeSounds, sound]);
    } else {
      console.log(`Sound "${baseName}" is already in your mix`);
    }
  };

  const handleRemoveSound = (soundId: string) => {
    setActiveSounds(activeSounds.filter(sound => sound.id !== soundId));
  };

  const handleUpdateVolume = (soundId: string, volume: number) => {
    setActiveSounds(
      activeSounds.map(sound =>
        sound.id === soundId ? { ...sound, volume } : sound
      )
    );
  };

  const handleSaveMix = (name: string, id?: string) => {
    if (id) {
      // Edit existing mix
      const updatedMixes = savedMixes.map(mix => {
        if (mix.id === id) {
          return { ...mix, name, sounds: activeSounds };
        }
        return mix;
      });
      setSavedMixes(updatedMixes);
      localStorage.setItem("soundbloom-mixes", JSON.stringify(updatedMixes));
    } else {
      // Create new mix
      const newMix = {
        id: Date.now().toString(),
        name,
        sounds: activeSounds
      };
      const updatedMixes = [...savedMixes, newMix];
      setSavedMixes(updatedMixes);
      localStorage.setItem("soundbloom-mixes", JSON.stringify(updatedMixes));
    }
  };

  const handleDeleteMix = (mixId: string) => {
    const updatedMixes = savedMixes.filter(mix => mix.id !== mixId);
    setSavedMixes(updatedMixes);
    localStorage.setItem("soundbloom-mixes", JSON.stringify(updatedMixes));
  };

  const handleLoadMix = (mixId: string) => {
    const mix = savedMixes.find(m => m.id === mixId);
    if (mix) {
      setActiveSounds(mix.sounds);
    }
  };

  const handleMasterVolumeChange = (volume: number) => {
    setMasterVolume(volume);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const soundData = e.dataTransfer.getData("sound");
      if (soundData) {
        const sound = JSON.parse(soundData);
        handleAddSound(sound);
      }
    } catch (err) {
      console.error("Error handling drop:", err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleMasterPlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle random variants cleanup
  useEffect(() => {
    if (useRandomVariants === true && activeSounds.length > 0) {
      const soundGroups = new Map();

      activeSounds.forEach(sound => {
        const baseName = sound.name
          .split(" ")
          .filter(part => !part.includes("#") && isNaN(Number(part)))
          .join(" ");

        if (!soundGroups.has(baseName)) {
          soundGroups.set(baseName, []);
        }
        soundGroups.get(baseName).push(sound);
      });

      let uniqueSounds: Sound[] = [];
      soundGroups.forEach(group => {
        if (group.length > 0) {
          uniqueSounds.push(group[0]);
        }
      });

      if (uniqueSounds.length < activeSounds.length) {
        console.log("Reducing from", activeSounds.length, "to", uniqueSounds.length, "sounds");
        setActiveSounds(uniqueSounds);
      }
    }
  }, [useRandomVariants, activeSounds]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Header />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LibraryAndMixes
          onAddSound={handleAddSound}
          activeSounds={activeSounds}
          useRandomVariants={useRandomVariants}
          setUseRandomVariants={setUseRandomVariants}
        />

        <div
          className="lg:col-span-2 card rounded-xl p-4"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <SoundControls
            useTimelineView={useTimelineView}
            onToggleView={() => setUseTimelineView(!useTimelineView)}
            onSaveMix={handleSaveMix}
            onLoadMix={handleLoadMix}
            onDeleteMix={handleDeleteMix}
            savedMixes={savedMixes}
          />

          {activeSounds.length === 0 ? (
            <EmptyDropZone />
          ) : (
            <SoundDisplay
              sounds={activeSounds}
              masterVolume={masterVolume}
              isPlaying={isPlaying}
              useTimelineView={useTimelineView}
              useRandomVariants={useRandomVariants}
              onMasterVolumeChange={handleMasterVolumeChange}
              onPlayPauseToggle={handleMasterPlayPause}
              onRemove={handleRemoveSound}
              onVolumeChange={handleUpdateVolume}
            />
          )}
        </div>
      </div>

      <ThemeToggle />
    </div>
  );
}
