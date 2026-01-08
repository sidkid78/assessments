'use client';

import { useState } from 'react';
import type { AIAssessmentInput } from '@/lib/types/federal-assessment';

type PropertyInfo = NonNullable<AIAssessmentInput['propertyInfo']>;

interface PropertyInfoStepProps {
    existingInfo: PropertyInfo;
    onSubmit: (info: PropertyInfo) => void;
    onBack: () => void;
}

const PROPERTY_TYPES = [
    'Single-Family Home',
    'Townhouse',
    'Condominium',
    'Apartment',
    'Mobile Home',
    'Assisted Living',
    'Other',
];

export function PropertyInfoStep({
    existingInfo,
    onSubmit,
    onBack,
}: PropertyInfoStepProps) {
    const [info, setInfo] = useState<PropertyInfo>(existingInfo);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(info);
    };

    return (
        <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Property Information
                </h2>
                <p className="text-gray-600">
                    Property details help contextualize safety recommendations and cost estimates.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Property Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Property Type
                    </label>
                    <select
                        title="Property Type"
                        value={info.type || ''}
                        onChange={(e) => setInfo({ ...info, type: e.target.value })}
                        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select property type...</option>
                        {PROPERTY_TYPES.map(type => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Year Built */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year Built (Optional)
                    </label>
                    <input
                        type="number"
                        min="1800"
                        max={new Date().getFullYear()}
                        value={info.yearBuilt || ''}
                        onChange={(e) =>
                            setInfo({ ...info, yearBuilt: parseInt(e.target.value) || undefined })
                        }
                        className="max-w-xs w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 1985"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Helps identify age-related safety concerns (pre-ADA construction, etc.)
                    </p>
                </div>

                {/* Number of Stories */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Number of Stories
                    </label>
                    <div className="flex gap-4">
                        {[1, 2, 3].map(num => (
                            <label key={num} className="flex items-center">
                                <input
                                    type="radio"
                                    checked={info.stories === num}
                                    onChange={() => setInfo({ ...info, stories: num })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    {num} {num === 1 ? 'Story' : 'Stories'}
                                </span>
                            </label>
                        ))}
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={info.stories !== undefined && info.stories > 3}
                                onChange={() => setInfo({ ...info, stories: 4 })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">3+ Stories</span>
                        </label>
                    </div>
                    {info.stories !== undefined && info.stories > 3 && (
                        <input
                            type="number"
                            min="4"
                            max="20"
                            value={info.stories}
                            onChange={(e) =>
                                setInfo({ ...info, stories: parseInt(e.target.value) || 4 })
                            }
                            className="mt-3 max-w-xs w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter number of stories"
                        />
                    )}
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                        Why This Information Matters
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>
                            • <strong>Property Type:</strong> Affects modification permissions and structural
                            options
                        </li>
                        <li>
                            • <strong>Year Built:</strong> Pre-1990 homes often lack ADA-compatible features
                        </li>
                        <li>
                            • <strong>Stories:</strong> Multi-story homes require stair safety assessment and
                            may need lift/ramp solutions
                        </li>
                    </ul>
                </div>

                {/* Optional: All fields optional notice */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                        <strong>Note:</strong> All property information fields are optional. However,
                        providing this information allows for more accurate cost estimates and
                        modification recommendations.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        ← Back
                    </button>
                    <button
                        type="submit"
                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Review Assessment
                    </button>
                </div>
            </form>
        </div>
    );
}
