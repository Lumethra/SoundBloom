import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { Sound, SoundCategory } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const soundsPath = path.join(process.cwd(), 'public', 'sounds');
        const categories = fs.readdirSync(soundsPath).filter(
            file => fs.statSync(path.join(soundsPath, file)).isDirectory()
        );

        const sounds: Sound[] = [];
        const soundMap: Record<string, Sound> = {};

        categories.forEach(category => {
            const categoryPath = path.join(soundsPath, category);
            const files = fs.readdirSync(categoryPath).filter(
                file => ['.mp3', '.wav', '.ogg', '.flac'].includes(path.extname(file).toLowerCase())
            );

            files.forEach(file => {
                const fileNameWithoutExt = path.basename(file, path.extname(file));

                // Check if it's a numbered variant like "ocean-wave (1).wav"
                const variantMatch = fileNameWithoutExt.match(/^(.+?)(?:\s*\(\d+\))?$/);
                if (!variantMatch) return;

                const baseName = variantMatch[1]; // "ocean-wave" from "ocean-wave (1)"
                const normalizedName = baseName
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                const soundId = `${category}-${baseName.replace(/\s+/g, '-')}`;
                const filePath = `/sounds/${category}/${file}`;

                // If this is the first time we see this sound base name
                if (!soundMap[soundId]) {
                    soundMap[soundId] = {
                        id: soundId,
                        name: normalizedName,
                        category: category as SoundCategory,
                        src: filePath,
                        variants: [filePath],
                        volume: 0.7
                    };
                } else {
                    // Add this as a variant to an existing sound
                    soundMap[soundId].variants?.push(filePath);
                }
            });
        });

        // Convert the map to an array
        const soundList = Object.values(soundMap);

        return NextResponse.json(soundList);
    } catch (error) {
        console.error('Error loading sounds:', error);
        return NextResponse.json({ error: 'Failed to load sounds' }, { status: 500 });
    }
}