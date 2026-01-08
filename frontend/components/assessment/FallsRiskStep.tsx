'use client';

import { useState } from 'react';
import type { FallsRiskAssessment } from '@/lib/types/federal-assessment';

interface FallsRiskStepProps {
    initialData: Partial<FallsRiskAssessment>;
    onSubmit: (data: Partial<FallsRiskAssessment>) => void;
    onBack: () => void;
}

const FALL_LOCATIONS = [
    { value: 'bathroom', label: 'Bathroom' },
    { value: 'bedroom', label: 'Bedroom' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'stairs', label: 'Stairs' },
    { value: 'entrance', label: 'Entrance' },
    { value: 'yard', label: 'Yard' },
    { value: 'other', label: 'Other' },
] as const;

const EFFICACY_ACTIVITIES = [
    { key: 'cleaningHouse', label: 'Cleaning the house' },
    { key: 'gettingDressed', label: 'Getting dressed/undressed' },
    { key: 'preparingMeals', label: 'Preparing simple meals' },
    { key: 'takingBath', label: 'Taking a bath or shower' },
    { key: 'goingShopping', label: 'Going shopping' },
    { key: 'gettingInOutChair', label: 'Getting in/out of a chair' },
    { key: 'goingUpDownStairs', label: 'Going up/down stairs' },
    { key: 'walkingInNeighborhood', label: 'Walking around the neighborhood' },
    { key: 'reachingInCabinets', label: 'Reaching into cabinets/closets' },
    { key: 'answeringDoor', label: 'Hurrying to answer door/phone' },
] as const;

const RISK_FACTORS = [
    { key: 'historyOfFalls', label: 'History of falls' },
    { key: 'fearOfFalling', label: 'Fear of falling' },
    { key: 'mobilityProblems', label: 'Mobility problems' },
    { key: 'balanceProblems', label: 'Balance problems' },
    { key: 'visionProblems', label: 'Vision problems' },
    { key: 'cognitiveImpairment', label: 'Cognitive impairment' },
    { key: 'medicationRisks', label: 'Takes 4+ medications or psychoactive meds' },
    { key: 'incontinence', label: 'Incontinence' },
    { key: 'footProblems', label: 'Foot problems' },
    { key: 'environmentalHazards', label: 'Home has environmental hazards' },
] as const;

type FallDetail = {
    location: typeof FALL_LOCATIONS[number]['value'];
    locationSpecific: string;
    causedInjury: boolean;
    injuryType: string;
    requiredMedicalAttention: boolean;
    wasHospitalized: boolean;
    nightsHospitalized: number;
};

export function FallsRiskStep({ initialData, onSubmit, onBack }: FallsRiskStepProps) {
    const [hasFallenPastYear, setHasFallenPastYear] = useState(initialData.hasFallenPastYear ?? false);
    const [fallDetails, setFallDetails] = useState<FallDetail[]>(
        (initialData.fallDetails as FallDetail[] | undefined) ?? []
    );
    const [fallsEfficacy, setFallsEfficacy] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        for (const activity of EFFICACY_ACTIVITIES) {
            initial[activity.key] = (initialData.fallsEfficacy as Record<string, number> | undefined)?.[activity.key] ?? 10;
        }
        return initial;
    });
    const [riskFactors, setRiskFactors] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        for (const factor of RISK_FACTORS) {
            initial[factor.key] = (initialData.riskFactors as Record<string, boolean> | undefined)?.[factor.key] ?? false;
        }
        return initial;
    });

    const addFall = () => {
        setFallDetails(prev => [...prev, {
            location: 'bathroom',
            locationSpecific: '',
            causedInjury: false,
            injuryType: '',
            requiredMedicalAttention: false,
            wasHospitalized: false,
            nightsHospitalized: 0,
        }]);
    };

    const updateFall = (index: number, updates: Partial<FallDetail>) => {
        setFallDetails(prev => prev.map((fall, i) => i === index ? { ...fall, ...updates } : fall));
    };

    const removeFall = (index: number) => {
        setFallDetails(prev => prev.filter((_, i) => i !== index));
    };

    const calculateRiskLevel = (): 'low' | 'moderate' | 'high' => {
        const riskCount = Object.values(riskFactors).filter(Boolean).length;
        const efficacyScore = Object.values(fallsEfficacy).reduce((sum, v) => sum + v, 0);
        const hasRecentFalls = hasFallenPastYear && fallDetails.length > 0;

        if (hasRecentFalls || riskCount >= 5 || efficacyScore < 40) return 'high';
        if (riskCount >= 3 || efficacyScore < 70) return 'moderate';
        return 'low';
    };

    const handleSubmit = () => {
        const efficacyScore = Object.values(fallsEfficacy).reduce((sum, v) => sum + v, 0);
        const riskCount = Object.values(riskFactors).filter(Boolean).length;

        onSubmit({
            hasFallenPastYear,
            numberOfFalls: fallDetails.length,
            fallDetails: fallDetails as FallsRiskAssessment['fallDetails'],
            fallsEfficacy: {
                ...fallsEfficacy,
                totalScore: efficacyScore,
            } as FallsRiskAssessment['fallsEfficacy'],
            riskFactors: riskFactors as FallsRiskAssessment['riskFactors'],
            overallRiskLevel: calculateRiskLevel(),
        });
    };

    const riskLevel = calculateRiskLevel();

    return (
        <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Falls Risk Assessment
                </h2>
                <p className="text-gray-600">
                    Based on CDC STEADI Framework. This helps identify fall risks and prevention strategies.
                </p>
            </div>

            {/* Risk Level Summary */}
            <div className={`mb-8 p-4 rounded-lg border ${riskLevel === 'high' ? 'bg-red-50 border-red-200' :
                riskLevel === 'moderate' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-green-50 border-green-200'
                }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{riskLevel === 'high' ? '⚠️' : riskLevel === 'moderate' ? '⚡' : '✅'}</span>
                        <span className={`font-semibold ${riskLevel === 'high' ? 'text-red-800' :
                            riskLevel === 'moderate' ? 'text-yellow-800' :
                                'text-green-800'
                            }`}>
                            Current Risk Level: {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Fall History */}
            <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Fall History (Past 12 Months)</h3>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 mb-4">
                    <input
                        type="checkbox"
                        checked={hasFallenPastYear}
                        onChange={(e) => setHasFallenPastYear(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-red-600"
                    />
                    <span className="font-medium text-gray-900">Has fallen in the past 12 months</span>
                </label>

                {hasFallenPastYear && (
                    <div className="space-y-4">
                        {fallDetails.map((fall, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-medium text-gray-900">Fall #{index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeFall(index)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                        title="Remove fall"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                        <select
                                            value={fall.location}
                                            onChange={(e) => updateFall(index, { location: e.target.value as FallDetail['location'] })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            title="Fall location"
                                        >
                                            <option value="other">Other</option>
                                            {FALL_LOCATIONS.map(loc => (
                                                <option key={loc.value} value={loc.value}>{loc.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Specific Location</label>
                                        <input
                                            type="text"
                                            value={fall.locationSpecific}
                                            onChange={(e) => updateFall(index, { locationSpecific: e.target.value })}
                                            placeholder="e.g., near toilet, top of stairs"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            title="Specific fall location"
                                        />
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={fall.causedInjury}
                                            onChange={(e) => updateFall(index, { causedInjury: e.target.checked })}
                                            className="w-4 h-4 rounded border-gray-300 text-red-600"
                                        />
                                        <span className="text-sm text-gray-700">Caused injury</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={fall.requiredMedicalAttention}
                                            onChange={(e) => updateFall(index, { requiredMedicalAttention: e.target.checked })}
                                            className="w-4 h-4 rounded border-gray-300 text-red-600"
                                        />
                                        <span className="text-sm text-gray-700">Required medical attention</span>
                                    </label>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addFall}
                            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                        >
                            + Add another fall
                        </button>
                    </div>
                )}
            </section>

            {/* Falls Efficacy Scale */}
            <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">😰 Fear of Falling</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Rate how concerned you are about falling during each activity (1 = Very Concerned, 10 = Not Concerned)
                </p>
                <div className="space-y-3">
                    {EFFICACY_ACTIVITIES.map(activity => (
                        <div key={activity.key} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                            <span className="flex-1 text-sm text-gray-700">{activity.label}</span>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={fallsEfficacy[activity.key]}
                                onChange={(e) => setFallsEfficacy(prev => ({ ...prev, [activity.key]: Number(e.target.value) }))}
                                className="w-24 md:w-40"
                                title={`Rate concern for ${activity.label}`}
                            />
                            <span className={`w-8 text-center font-medium ${fallsEfficacy[activity.key] <= 3 ? 'text-red-600' :
                                fallsEfficacy[activity.key] <= 6 ? 'text-yellow-600' :
                                    'text-green-600'
                                }`}>
                                {fallsEfficacy[activity.key]}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Risk Factors */}
            <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Risk Factors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {RISK_FACTORS.map(factor => (
                        <label
                            key={factor.key}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${riskFactors[factor.key]
                                ? 'bg-red-50 border-red-200'
                                : 'border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={riskFactors[factor.key]}
                                onChange={(e) => setRiskFactors(prev => ({ ...prev, [factor.key]: e.target.checked }))}
                                className="w-4 h-4 rounded border-gray-300 text-red-600"
                            />
                            <span className="text-sm text-gray-700">{factor.label}</span>
                        </label>
                    ))}
                </div>
            </section>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-200">
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
                    Continue to Review →
                </button>
            </div>
        </div>
    );
}
