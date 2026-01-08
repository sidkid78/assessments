'use client';

import { useState } from 'react';
import type { IADLAssessment } from '@/lib/types/federal-assessment';
import { DIFFICULTY_LEVELS } from '@/lib/types/federal-assessment';

interface IADLAssessmentStepProps {
    initialData: Partial<IADLAssessment>;
    onSubmit: (data: Partial<IADLAssessment>) => void;
    onBack: () => void;
}

type IADLActivity = {
    key: keyof Pick<IADLAssessment, 'preparingMeals' | 'lightHousework' | 'shopping' | 'usingTelephone' | 'laundry' | 'transportation' | 'medications' | 'managingFinances'>;
    label: string;
    description: string;
    icon: string;
};

const IADL_ACTIVITIES: IADLActivity[] = [
    { key: 'preparingMeals', label: 'Preparing Meals', description: 'Planning, preparing, and serving meals', icon: '🍳' },
    { key: 'lightHousework', label: 'Light Housework', description: 'Washing dishes, dusting, light cleaning', icon: '🧹' },
    { key: 'shopping', label: 'Shopping', description: 'Getting to stores, selecting and purchasing items', icon: '🛒' },
    { key: 'usingTelephone', label: 'Using Telephone', description: 'Making and receiving calls, using cell phone', icon: '📞' },
    { key: 'laundry', label: 'Laundry', description: 'Washing, drying, and folding clothes', icon: '👔' },
    { key: 'transportation', label: 'Transportation', description: 'Driving or using public transit', icon: '🚗' },
    { key: 'medications', label: 'Managing Medications', description: 'Taking correct doses at correct times', icon: '💊' },
    { key: 'managingFinances', label: 'Managing Finances', description: 'Paying bills, managing bank accounts', icon: '💰' },
];

const DIFFICULTY_OPTIONS = [
    { value: DIFFICULTY_LEVELS.NONE, label: 'No difficulty', color: 'text-green-600 bg-green-50 border-green-200' },
    { value: DIFFICULTY_LEVELS.SOME, label: 'Some difficulty', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    { value: DIFFICULTY_LEVELS.MUCH, label: 'Much difficulty', color: 'text-orange-600 bg-orange-50 border-orange-200' },
    { value: DIFFICULTY_LEVELS.UNABLE, label: 'Unable without help', color: 'text-red-600 bg-red-50 border-red-200' },
];

type ActivityData = {
    difficultyLevel: number;
    needsHelp: boolean;
    notes: string;
    hazardsIdentified: string[];
};

export function IADLAssessmentStep({ initialData, onSubmit, onBack }: IADLAssessmentStepProps) {
    const [activities, setActivities] = useState<Record<string, ActivityData>>(() => {
        const initial: Record<string, ActivityData> = {};
        for (const activity of IADL_ACTIVITIES) {
            const existing = initialData[activity.key] as ActivityData | undefined;
            initial[activity.key] = {
                difficultyLevel: existing?.difficultyLevel ?? DIFFICULTY_LEVELS.NONE,
                needsHelp: existing?.needsHelp ?? false,
                notes: existing?.notes ?? '',
                hazardsIdentified: existing?.hazardsIdentified ?? [],
            };
        }
        return initial;
    });

    const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

    const updateActivity = (key: string, updates: Partial<ActivityData>) => {
        setActivities(prev => ({
            ...prev,
            [key]: { ...prev[key], ...updates },
        }));
    };

    const calculateScores = () => {
        const values = Object.values(activities);
        const totalDifficulties = values.filter(a => a.difficultyLevel > 0).length;
        const totalScore = values.reduce((sum, a) => sum + a.difficultyLevel, 0);

        let independenceLevel: IADLAssessment['independenceLevel'];
        const percentage = totalScore / 24; // Max score is 8 activities × 3 = 24
        if (percentage <= 0.25) independenceLevel = 'fully_independent';
        else if (percentage <= 0.5) independenceLevel = 'mostly_independent';
        else if (percentage <= 0.75) independenceLevel = 'moderately_impaired';
        else if (percentage <= 0.9) independenceLevel = 'significant_assistance';
        else independenceLevel = 'dependent';

        return { totalDifficulties, totalScore, independenceLevel };
    };

    const handleSubmit = () => {
        const scores = calculateScores();
        const iadlData: Partial<IADLAssessment> = {
            ...scores,
        };

        for (const activity of IADL_ACTIVITIES) {
            (iadlData as Record<string, ActivityData>)[activity.key] = activities[activity.key];
        }

        onSubmit(iadlData);
    };

    const scores = calculateScores();

    return (
        <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Instrumental Activities of Daily Living (IADL)
                </h2>
                <p className="text-gray-600">
                    Based on the Lawton-Brody Scale. These activities require more complex thinking skills.
                </p>
            </div>

            {/* Score Summary */}
            <div className="mb-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium text-purple-800">Current Score:</span>
                        <span className="ml-2 text-lg font-bold text-purple-900">
                            {scores.totalScore}/24
                        </span>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-purple-800">Independence Level:</span>
                        <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${scores.independenceLevel === 'fully_independent' ? 'bg-green-100 text-green-800' :
                            scores.independenceLevel === 'mostly_independent' ? 'bg-yellow-100 text-yellow-800' :
                                scores.independenceLevel === 'moderately_impaired' ? 'bg-orange-100 text-orange-800' :
                                    'bg-red-100 text-red-800'
                            }`}>
                            {scores.independenceLevel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                    </div>
                </div>
            </div>

            {/* Activity Cards */}
            <div className="space-y-4">
                {IADL_ACTIVITIES.map((activity) => {
                    const data = activities[activity.key];
                    const isExpanded = expandedActivity === activity.key;

                    return (
                        <div key={activity.key} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div
                                className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => setExpandedActivity(isExpanded ? null : activity.key)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{activity.icon}</span>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{activity.label}</h3>
                                            <p className="text-sm text-gray-500">{activity.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${DIFFICULTY_OPTIONS[data.difficultyLevel].color
                                            }`}>
                                            {DIFFICULTY_OPTIONS[data.difficultyLevel].label}
                                        </span>
                                        <svg
                                            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="p-4 border-t border-gray-200 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Difficulty Level
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {DIFFICULTY_OPTIONS.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => updateActivity(activity.key, { difficultyLevel: option.value })}
                                                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${data.difficultyLevel === option.value
                                                        ? `${option.color} border-current ring-2 ring-offset-2`
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.needsHelp}
                                                onChange={(e) => updateActivity(activity.key, { needsHelp: e.target.checked })}
                                                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700">
                                                Currently receives help with this activity
                                            </span>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes (optional)
                                        </label>
                                        <textarea
                                            value={data.notes}
                                            onChange={(e) => updateActivity(activity.key, { notes: e.target.value })}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Any specific concerns or details..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
                <button
                    onClick={onBack}
                    className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                    ← Back
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Continue to Mobility Assessment →
                </button>
            </div>
        </div>
    );
}
