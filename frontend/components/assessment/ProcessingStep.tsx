'use client';

import { useEffect, useState } from 'react';

const PROCESSING_STEPS = [
    'Analyzing image quality and composition...',
    'Detecting rooms and spatial layout...',
    'Identifying safety hazards and fall risks...',
    'Assessing accessibility barriers...',
    'Evaluating existing safety features...',
    'Calculating modification costs...',
    'Prioritizing recommendations...',
    'Generating compliance report...',
];

export function ProcessingStep() {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => (prev + 1) % PROCESSING_STEPS.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-card rounded-lg shadow-lg p-12">
            <div className="max-w-2xl mx-auto text-center">
                {/* Spinner */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="w-24 h-24 border-8 border-blue-200 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-24 h-24 border-8 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Analyzing Your Home Assessment
                </h2>
                <p className="text-gray-600 mb-8">
                    Our AI is processing your images using advanced computer vision and HUD OAHMP guidelines
                </p>

                {/* Current Step */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                    <div className="flex items-center justify-center">
                        <svg
                            className="animate-pulse h-5 w-5 text-blue-600 mr-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                        <p className="text-sm font-medium text-blue-900">
                            {PROCESSING_STEPS[currentStep]}
                        </p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="space-y-3">
                    {PROCESSING_STEPS.map((step, index) => (
                        <div
                            key={index}
                            className={`flex items-center justify-center text-sm ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                                }`}
                        >
                            {index < currentStep ? (
                                <svg
                                    className="h-5 w-5 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            ) : index === currentStep ? (
                                <div className="h-5 w-5 mr-2 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <div className="h-5 w-5 mr-2 border-2 border-gray-300 rounded-full"></div>
                            )}
                            <span className={index <= currentStep ? 'font-medium' : ''}>
                                {step}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Estimated Time */}
                <p className="mt-8 text-sm text-gray-500">
                    This typically takes 30-60 seconds • Powered by Google Gemini AI
                </p>
            </div>
        </div>
    );
}
