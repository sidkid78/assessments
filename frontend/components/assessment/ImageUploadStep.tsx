'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import type { AssessmentImage } from '@/lib/types/federal-assessment';

interface ImageUploadStepProps {
    existingImages: AssessmentImage[];
    onSubmit: (images: AssessmentImage[]) => void;
}

const ROOM_TYPES = [
    { value: 'bathroom', label: 'Bathroom' },
    { value: 'bedroom', label: 'Bedroom' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'living_room', label: 'Living Room' },
    { value: 'hallway', label: 'Hallway' },
    { value: 'entrance', label: 'Entrance' },
    { value: 'stairs', label: 'Stairs' },
    { value: 'laundry', label: 'Laundry' },
    { value: 'garage', label: 'Garage' },
    { value: 'other', label: 'Other' },
];

export function ImageUploadStep({ existingImages, onSubmit }: ImageUploadStepProps) {
    const [images, setImages] = useState<AssessmentImage[]>(existingImages);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        const newImages = await Promise.all(
            files.map(async (file) => {
                const url = await readFileAsDataURL(file);
                return {
                    id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    url,
                    file,
                    uploadedAt: new Date(),
                };
            })
        );

        setImages(prev => [...prev, ...newImages]);
    };

    const readFileAsDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveImage = (id: string) => {
        setImages(prev => prev.filter(img => img.id !== id));
    };

    const handleUpdateRoom = (id: string, room: string) => {
        setImages(prev =>
            prev.map(img => (img.id === id ? { ...img, room } : img))
        );
    };

    const handleUpdateNotes = (id: string, notes: string) => {
        setImages(prev =>
            prev.map(img => (img.id === id ? { ...img, userNotes: notes } : img))
        );
    };

    const handleSubmit = () => {
        if (images.length === 0) {
            alert('Please upload at least one image');
            return;
        }
        onSubmit(images);
    };

    return (
        <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    Upload Home Images
                </h2>
                <p className="text-muted-foreground">
                    Upload photos of the home environment. Focus on bathrooms, stairs, entryways, and
                    areas where the client spends most of their time.
                </p>
            </div>

            {/* Upload Area */}
            <div className="mb-8">
                <input
                    title="Upload Home Images"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors group"
                >
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                    >
                        <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <p className="mt-2 text-sm font-semibold text-gray-700 group-hover:text-blue-600">
                        Click to upload images
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, JPEG up to 10MB each
                    </p>
                </button>
            </div>

            {/* Image List */}
            {images.length > 0 && (
                <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Uploaded Images ({images.length})
                        </h3>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            + Add More
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {images.map((image) => (
                            <div
                                key={image.id}
                                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                            >
                                <div className="flex gap-4">
                                    {/* Thumbnail */}
                                    <div className="shrink-0 relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                                        <Image
                                            src={image.url}
                                            alt="Home assessment"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Room Type
                                                </label>
                                                <select
                                                    title="Room Type"
                                                    value={image.room || ''}
                                                    onChange={(e) => handleUpdateRoom(image.id, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Select room...</option>
                                                    {ROOM_TYPES.map(room => (
                                                        <option key={room.value} value={room.value}>
                                                            {room.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex items-end">
                                                <button
                                                    onClick={() => handleRemoveImage(image.id)}
                                                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Notes (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={image.userNotes || ''}
                                                onChange={(e) => handleUpdateNotes(image.id, e.target.value)}
                                                placeholder="E.g., 'Client's primary bathroom' or 'Recent fall location'"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    📸 Photography Tips for Best Results
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Take photos in good lighting conditions</li>
                    <li>• Capture the entire room from doorway perspective when possible</li>
                    <li>• Focus on bathrooms (91% of homes have bathroom hazards)</li>
                    <li>• Photograph stairs, entries, and high-traffic hallways</li>
                    <li>• Include close-ups of specific hazards or concerns</li>
                    <li>• Ensure images are clear and not blurry</li>
                </ul>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={images.length === 0}
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    Continue to Client Information
                </button>
            </div>
        </div>
    );
}