'use client';

import { useState } from 'react';
import type { MobilityAssessment } from '@/lib/types/federal-assessment';
import { FREQUENCY_LEVELS } from '@/lib/types/federal-assessment';

interface MobilityAssessmentStepProps {
    initialData: Partial<MobilityAssessment>;
    onSubmit: (data: Partial<MobilityAssessment>) => void;
    onBack: () => void;
}

const FREQUENCY_OPTIONS = [
    { value: FREQUENCY_LEVELS.NEVER, label: 'Never' },
    { value: FREQUENCY_LEVELS.RARELY, label: 'Rarely' },
    { value: FREQUENCY_LEVELS.SOMETIMES, label: 'Sometimes' },
    { value: FREQUENCY_LEVELS.FREQUENTLY, label: 'Frequently' },
    { value: FREQUENCY_LEVELS.ALWAYS, label: 'Always' },
];

export function MobilityAssessmentStep({ initialData, onSubmit, onBack }: MobilityAssessmentStepProps) {
    const [data, setData] = useState<Partial<MobilityAssessment>>({
        usesWheelchair: initialData.usesWheelchair ?? { frequency: 0, indoorUse: false, outdoorUse: false },
        usesWalker: initialData.usesWalker ?? { frequency: 0, indoorUse: false, outdoorUse: false },
        usesCane: initialData.usesCane ?? { frequency: 0, indoorUse: false, outdoorUse: false },
        usesOtherDevice: initialData.usesOtherDevice ?? { deviceType: '', frequency: 0, indoorUse: false, outdoorUse: false },
        balanceIssues: initialData.balanceIssues ?? false,
        balanceNotes: initialData.balanceNotes ?? '',
        gaitIssues: initialData.gaitIssues ?? false,
        gaitNotes: initialData.gaitNotes ?? '',
        canWalkOneBlock: initialData.canWalkOneBlock ?? true,
        canClimbFlightOfStairs: initialData.canClimbFlightOfStairs ?? true,
        restFrequency: initialData.restFrequency ?? 'never',
    });

    const updateMobilityAid = (
        aid: 'usesWheelchair' | 'usesWalker' | 'usesCane' | 'usesOtherDevice',
        updates: Partial<{ frequency: number; indoorUse: boolean; outdoorUse: boolean; deviceType?: string }>
    ) => {
        setData(prev => ({
            ...prev,
            [aid]: { ...(prev[aid] as object), ...updates },
        }));
    };

    const handleSubmit = () => {
        onSubmit(data);
    };

    return (
        <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Mobility Assessment
                </h2>
                <p className="text-gray-600">
                    Help us understand your current mobility status and any devices you use.
                </p>
            </div>

            {/* Mobility Aids Section */}
            <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🦽</span> Mobility Aids
                </h3>
                <div className="space-y-6">
                    {/* Wheelchair */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Wheelchair</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Usage Frequency</label>
                                <select
                                    title="Usage Frequency"
                                    value={data.usesWheelchair?.frequency ?? 0}
                                    onChange={(e) => updateMobilityAid('usesWheelchair', { frequency: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {FREQUENCY_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.usesWheelchair?.indoorUse ?? false}
                                    onChange={(e) => updateMobilityAid('usesWheelchair', { indoorUse: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">Indoor use</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.usesWheelchair?.outdoorUse ?? false}
                                    onChange={(e) => updateMobilityAid('usesWheelchair', { outdoorUse: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">Outdoor use</span>
                            </label>
                        </div>
                    </div>

                    {/* Walker */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Walker</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Usage Frequency</label>
                                <select
                                    title="Usage Frequency"
                                    value={data.usesWalker?.frequency ?? 0}
                                    onChange={(e) => updateMobilityAid('usesWalker', { frequency: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {FREQUENCY_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.usesWalker?.indoorUse ?? false}
                                    onChange={(e) => updateMobilityAid('usesWalker', { indoorUse: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">Indoor use</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.usesWalker?.outdoorUse ?? false}
                                    onChange={(e) => updateMobilityAid('usesWalker', { outdoorUse: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">Outdoor use</span>
                            </label>
                        </div>
                    </div>

                    {/* Cane */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Cane</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Usage Frequency</label>
                                <select
                                    title="Usage Frequency"
                                    value={data.usesCane?.frequency ?? 0}
                                    onChange={(e) => updateMobilityAid('usesCane', { frequency: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {FREQUENCY_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.usesCane?.indoorUse ?? false}
                                    onChange={(e) => updateMobilityAid('usesCane', { indoorUse: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">Indoor use</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.usesCane?.outdoorUse ?? false}
                                    onChange={(e) => updateMobilityAid('usesCane', { outdoorUse: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">Outdoor use</span>
                            </label>
                        </div>
                    </div>

                    {/* Other Device */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Other Device</h4>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={data.usesOtherDevice?.deviceType ?? ''}
                                onChange={(e) => updateMobilityAid('usesOtherDevice', { deviceType: e.target.value })}
                                placeholder="Device name (e.g., rollator, scooter)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Usage Frequency</label>
                                    <select
                                        title="Usage Frequency"
                                        value={data.usesOtherDevice?.frequency ?? 0}
                                        onChange={(e) => updateMobilityAid('usesOtherDevice', { frequency: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        {FREQUENCY_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.usesOtherDevice?.indoorUse ?? false}
                                        onChange={(e) => updateMobilityAid('usesOtherDevice', { indoorUse: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">Indoor use</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.usesOtherDevice?.outdoorUse ?? false}
                                        onChange={(e) => updateMobilityAid('usesOtherDevice', { outdoorUse: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">Outdoor use</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Balance & Gait */}
            <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>⚖️</span> Balance & Gait
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <label className="flex items-center gap-3 cursor-pointer mb-3">
                            <input
                                type="checkbox"
                                checked={data.balanceIssues ?? false}
                                onChange={(e) => setData(prev => ({ ...prev, balanceIssues: e.target.checked }))}
                                className="w-5 h-5 rounded border-gray-300 text-orange-600"
                            />
                            <span className="font-medium text-gray-900">Has balance issues</span>
                        </label>
                        {data.balanceIssues && (
                            <textarea
                                value={data.balanceNotes ?? ''}
                                onChange={(e) => setData(prev => ({ ...prev, balanceNotes: e.target.value }))}
                                placeholder="Describe balance issues..."
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        )}
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <label className="flex items-center gap-3 cursor-pointer mb-3">
                            <input
                                type="checkbox"
                                checked={data.gaitIssues ?? false}
                                onChange={(e) => setData(prev => ({ ...prev, gaitIssues: e.target.checked }))}
                                className="w-5 h-5 rounded border-gray-300 text-orange-600"
                            />
                            <span className="font-medium text-gray-900">Has gait issues</span>
                        </label>
                        {data.gaitIssues && (
                            <textarea
                                value={data.gaitNotes ?? ''}
                                onChange={(e) => setData(prev => ({ ...prev, gaitNotes: e.target.value }))}
                                placeholder="Describe gait issues..."
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        )}
                    </div>
                </div>
            </section>

            {/* Endurance */}
            <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🏃</span> Endurance
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={data.canWalkOneBlock ?? true}
                                onChange={(e) => setData(prev => ({ ...prev, canWalkOneBlock: e.target.checked }))}
                                className="w-5 h-5 rounded border-gray-300 text-green-600"
                            />
                            <span className="text-gray-700">Can walk one block without stopping</span>
                        </label>
                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={data.canClimbFlightOfStairs ?? true}
                                onChange={(e) => setData(prev => ({ ...prev, canClimbFlightOfStairs: e.target.checked }))}
                                className="w-5 h-5 rounded border-gray-300 text-green-600"
                            />
                            <span className="text-gray-700">Can climb a flight of stairs</span>
                        </label>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            How often do you need to rest during daily activities?
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {(['never', 'occasionally', 'frequently', 'always'] as const).map(level => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setData(prev => ({ ...prev, restFrequency: level }))}
                                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${data.restFrequency === level
                                        ? 'bg-blue-50 text-blue-700 border-blue-500'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
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
                    Continue to Falls Risk Assessment →
                </button>
            </div>
        </div>
    );
}
