'use client';

import { useState } from 'react';
import type { ADLAssessment } from '@/lib/types/federal-assessment';
import { DIFFICULTY_LEVELS } from '@/lib/types/federal-assessment';

interface ADLAssessmentStepProps {
    initialData: Partial<ADLAssessment>;
    onSubmit: (data: Partial<ADLAssessment>) => void;
    onBack: () => void;
}

type ADLActivity = {
    key: keyof Pick<ADLAssessment, 'bathing' | 'dressingUpperBody' | 'dressingLowerBody' | 'transferring' | 'eating' | 'toileting' | 'walking' | 'grooming'>;
    label: string;
    description: string;
    icon: string;
};

const ADL_ACTIVITIES: ADLActivity[] = [
    { key: 'bathing', label: 'Bathing', description: 'Washing body, getting in/out of tub or shower', icon: '🚿' },
    { key: 'dressingUpperBody', label: 'Dressing - Upper Body', description: 'Putting on shirt, bra, managing buttons', icon: '👕' },
    { key: 'dressingLowerBody', label: 'Dressing - Lower Body', description: 'Putting on pants, shoes, socks', icon: '👖' },
    { key: 'transferring', label: 'Transferring', description: 'Getting in/out of bed or chairs', icon: '🪑' },
    { key: 'eating', label: 'Eating', description: 'Feeding self, cutting food, drinking', icon: '🍽️' },
    { key: 'toileting', label: 'Toileting', description: 'Using toilet, managing clothing, hygiene', icon: '🚽' },
    { key: 'walking', label: 'Walking', description: 'Walking across a small room', icon: '🚶' },
    { key: 'grooming', label: 'Grooming', description: 'Brushing teeth, combing hair, shaving', icon: '🪥' },
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

export function ADLAssessmentStep({ initialData, onSubmit, onBack }: ADLAssessmentStepProps) {
    const [activities, setActivities] = useState<Record<string, ActivityData>>(() => {
        const initial: Record<string, ActivityData> = {};
        for (const activity of ADL_ACTIVITIES) {
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

        let independenceLevel: ADLAssessment['independenceLevel'];
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
        const adlData: Partial<ADLAssessment> = {
            ...scores,
        };

        for (const activity of ADL_ACTIVITIES) {
            (adlData as Record<string, ActivityData>)[activity.key] = activities[activity.key];
        }

        onSubmit(adlData);
    };

    const scores = calculateScores();

    return (
        <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Activities of Daily Living (ADL) Assessment
                </h2>
                <p className="text-gray-600">
                    Based on the Katz Index of Independence. Rate your difficulty with each activity.
                </p>
            </div>

            {/* Score Summary */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium text-blue-800">Current Score:</span>
                        <span className="ml-2 text-lg font-bold text-blue-900">
                            {scores.totalScore}/24
                        </span>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-blue-800">Independence Level:</span>
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
                {ADL_ACTIVITIES.map((activity) => {
                    const data = activities[activity.key];
                    const isExpanded = expandedActivity === activity.key;

                    return (
                        <div key={activity.key} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Activity Header */}
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

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="p-4 border-t border-gray-200 space-y-4">
                                    {/* Difficulty Level */}
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

                                    {/* Needs Help */}
                                    <div>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.needsHelp}
                                                onChange={(e) => updateActivity(activity.key, { needsHelp: e.target.checked })}
                                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700">
                                                Currently receives help with this activity
                                            </span>
                                        </label>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes (optional)
                                        </label>
                                        <textarea
                                            value={data.notes}
                                            onChange={(e) => updateActivity(activity.key, { notes: e.target.value })}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    Continue to IADL Assessment →
                </button>
            </div>
        </div>
    );
}
