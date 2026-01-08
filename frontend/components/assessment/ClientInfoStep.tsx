'use client';

import { SelfReportedInfo } from '@/lib/types/federal-assessment';
import { useState } from 'react';

interface ClientInfoStepProps {
    existingInfo: SelfReportedInfo;
    onSubmit: (info: SelfReportedInfo) => void;
    onBack: () => void;
}

const MOBILITY_AIDS = [
    'Cane',
    'Walker',
    'Wheelchair',
    'Rollator',
    'Crutches',
    'Power Scooter',
    'None',
];

const COMMON_CONCERNS = [
    'Fall Prevention',
    'Bathroom Safety',
    'Stair Access',
    'Kitchen Access',
    'Bedroom Access',
    'Mobility Throughout Home',
    'Entry/Exit Access',
    'Emergency Egress',
];

const MEDICAL_CONDITIONS = [
    'Arthritis',
    'Vision Impairment',
    'Hearing Impairment',
    'Balance Issues',
    'Stroke',
    'Parkinson\'s',
    'Dementia/Alzheimer\'s',
    'Heart Condition',
    'Diabetes',
    'COPD',
    'Multiple Sclerosis',
    'Other',
];

export function ClientInfoStep({ existingInfo, onSubmit, onBack }: ClientInfoStepProps) {
    const [info, setInfo] = useState<SelfReportedInfo>(existingInfo);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(info);
    };

    const toggleArrayItem = (array: string[] = [], item: string) => {
        if (array.includes(item)) {
            return array.filter(i => i !== item);
        }
        return [...array, item];
    };

    return (
        <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Client Information
                </h2>
                <p className="text-gray-600">
                    This information helps tailor recommendations to the client's specific needs and
                    mobility level.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={info.name || ''}
                        onChange={(e) => setInfo({ ...info, name: e.target.value || undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter client's full name"
                        required
                    />
                </div>

                {/* Address */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Property Address (Optional)
                    </label>
                    <input
                        type="text"
                        value={info.address || ''}
                        onChange={(e) => setInfo({ ...info, address: e.target.value || undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter property address"
                    />
                </div>

                {/* Age */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age (Optional)
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="120"
                        value={info.age || ''}
                        onChange={(e) => setInfo({ ...info, age: parseInt(e.target.value) || undefined })}
                        className="max-w-xs w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter age"
                    />
                </div>

                {/* Lives Alone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Living Situation
                    </label>
                    <div className="space-y-2">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={info.livesAlone === true}
                                onChange={() => setInfo({ ...info, livesAlone: true })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">Lives alone</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={info.livesAlone === false}
                                onChange={() => setInfo({ ...info, livesAlone: false })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">Lives with others</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={info.livesAlone === undefined}
                                onChange={() => setInfo({ ...info, livesAlone: undefined })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">Prefer not to say</span>
                        </label>
                    </div>
                </div>

                {/* Recent Falls */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Has the client experienced any falls in the past year?
                    </label>
                    <div className="space-y-2">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={info.recentFalls === true}
                                onChange={() => setInfo({ ...info, recentFalls: true })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                Yes (High priority for fall prevention)
                            </span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={info.recentFalls === false}
                                onChange={() => setInfo({ ...info, recentFalls: false })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">No</span>
                        </label>
                    </div>
                </div>

                {/* Mobility Aids */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Mobility Aids Used (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {MOBILITY_AIDS.map(aid => (
                            <label key={aid} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={info.mobilityAids?.includes(aid) || false}
                                    onChange={() =>
                                        setInfo({
                                            ...info,
                                            mobilityAids: toggleArrayItem(info.mobilityAids, aid),
                                        })
                                    }
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">{aid}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Primary Concerns */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Primary Concerns (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {COMMON_CONCERNS.map(concern => (
                            <label key={concern} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={info.primaryConcerns?.includes(concern) || false}
                                    onChange={() =>
                                        setInfo({
                                            ...info,
                                            primaryConcerns: toggleArrayItem(info.primaryConcerns, concern),
                                        })
                                    }
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">{concern}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Medical Conditions */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Current Medical Conditions (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {MEDICAL_CONDITIONS.map(condition => (
                            <label key={condition} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={info.currentMedicalConditions?.includes(condition) || false}
                                    onChange={() =>
                                        setInfo({
                                            ...info,
                                            currentMedicalConditions: toggleArrayItem(
                                                info.currentMedicalConditions,
                                                condition
                                            ),
                                        })
                                    }
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">{condition}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Privacy Notice */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-600">
                        <strong>Privacy Notice:</strong> This information is used solely to customize home
                        modification recommendations and is processed in accordance with HIPAA guidelines.
                        All data is encrypted and stored securely.
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
                        Continue to Property Information
                    </button>
                </div>
            </form>
        </div>
    );
}
