'use client';

import type { AssessmentState } from '@/lib/types/federal-assessment';

interface ProgressBarProps {
    currentStep: AssessmentState['step'];
}

const STEPS = [
    { id: 'upload', label: 'Upload', icon: '📸' },
    { id: 'demographics', label: 'Demographics', icon: '👤' },
    { id: 'eligibility', label: 'Eligibility', icon: '✓' },
    { id: 'property', label: 'Property', icon: '🏠' },
    { id: 'adl', label: 'ADL', icon: '🛁' },
    { id: 'iadl', label: 'IADL', icon: '🍳' },
    { id: 'mobility', label: 'Mobility', icon: '🦽' },
    { id: 'falls-risk', label: 'Falls Risk', icon: '⚠️' },
    { id: 'review', label: 'Review', icon: '📋' },
] as const;

export function ProgressBar({ currentStep }: ProgressBarProps) {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    // Handle processing step - show it as same as review
    const displayIndex = currentStep === 'processing' ? STEPS.length - 1 : currentIndex;

    return (
        <div className="w-full">
            {/* Mobile: Simple progress bar */}
            <div className="md:hidden">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                        Step {displayIndex + 1} of {STEPS.length}
                    </span>
                    <span className="text-sm text-gray-600">
                        {displayIndex >= 0 ? STEPS[displayIndex].label : currentStep}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        // eslint-disable-next-line
                        style={{ width: `${((displayIndex + 1) / STEPS.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Desktop: Full step indicators */}
            <div className="hidden md:flex items-center justify-between overflow-x-auto pb-2">
                {STEPS.map((step, index) => {
                    const isComplete = index < displayIndex;
                    const isCurrent = index === displayIndex;

                    return (
                        <div key={step.id} className="flex items-center flex-1 min-w-0">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`
                                        flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium transition-all
                                        ${isComplete
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : isCurrent
                                                ? 'bg-blue-50 border-blue-600 text-blue-600'
                                                : 'bg-white border-gray-300 text-gray-400'
                                        }
                                    `}
                                >
                                    {isComplete ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ) : (
                                        <span className="text-base">{step.icon}</span>
                                    )}
                                </div>
                                <p className={`mt-1 text-xs font-medium text-center truncate max-w-[70px]
                                    ${isCurrent ? 'text-blue-600' : isComplete ? 'text-gray-900' : 'text-gray-500'}
                                `}>
                                    {step.label}
                                </p>
                            </div>

                            {index < STEPS.length - 1 && (
                                <div className="flex-1 h-0.5 mx-2 mt-[-20px]">
                                    <div className={`h-full transition-colors ${isComplete ? 'bg-blue-600' : 'bg-gray-300'}`} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}