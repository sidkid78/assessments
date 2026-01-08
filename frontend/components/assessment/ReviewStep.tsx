'use client';

import Image from 'next/image';
import type { AssessmentState } from '@/lib/types/federal-assessment';

interface ReviewStepProps {
    state: AssessmentState;
    onConfirm: () => void;
    onBack: () => void;
}

function ScoreBadge({ score, max, label }: { score: number; max: number; label: string }) {
    const percentage = (score / max) * 100;
    const color = percentage <= 25 ? 'bg-green-100 text-green-800' :
        percentage <= 50 ? 'bg-yellow-100 text-yellow-800' :
            percentage <= 75 ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800';

    return (
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
            {label}: {score}/{max}
        </div>
    );
}

function RiskBadge({ level }: { level?: 'low' | 'moderate' | 'high' }) {
    const config = {
        low: { color: 'bg-green-100 text-green-800', label: 'Low Risk' },
        moderate: { color: 'bg-yellow-100 text-yellow-800', label: 'Moderate Risk' },
        high: { color: 'bg-red-100 text-red-800', label: 'High Risk' },
    };
    const { color, label } = config[level ?? 'low'];
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
            {label}
        </span>
    );
}

export function ReviewStep({ state, onConfirm, onBack }: ReviewStepProps) {
    const hasADL = Object.keys(state.adlAssessment ?? {}).length > 0;
    const hasIADL = Object.keys(state.iadlAssessment ?? {}).length > 0;
    const hasMobility = Object.keys(state.mobilityAssessment ?? {}).length > 0;
    const hasFallsRisk = Object.keys(state.fallsRiskAssessment ?? {}).length > 0;

    return (
        <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Review Complete Assessment
                </h2>
                <p className="text-gray-600">
                    Please review all collected information before submitting for AI analysis.
                </p>
            </div>

            <div className="space-y-6">
                {/* Images Summary */}
                <section className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span>📸</span> Uploaded Images ({state.images.length})
                    </h3>
                    <div className="grid grid-cols-6 gap-2">
                        {state.images.slice(0, 6).map(image => (
                            <div key={image.id} className="relative aspect-square bg-gray-100 rounded overflow-hidden">
                                <Image src={image.url} alt="" fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                    {state.images.length > 6 && (
                        <p className="mt-2 text-sm text-gray-500">+ {state.images.length - 6} more images</p>
                    )}
                </section>

                {/* Client Demographics */}
                <section className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span>👤</span> Client Demographics
                    </h3>
                    <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                            <dt className="text-gray-500">Name</dt>
                            <dd className="font-medium">{state.clientInfo.name || 'Not provided'}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Age</dt>
                            <dd className="font-medium">{state.clientInfo.age ? `${state.clientInfo.age} years` : 'Not provided'}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Lives Alone</dt>
                            <dd className="font-medium">{state.clientInfo.livesAlone ? 'Yes' : 'No'}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Address</dt>
                            <dd className="font-medium truncate" title={state.clientInfo.address}>
                                {state.clientInfo.address || 'Not provided'}
                            </dd>
                        </div>
                    </dl>
                </section>

                {/* Eligibility */}
                {Object.keys(state.eligibility ?? {}).length > 0 && (
                    <section className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <span>✓</span> Eligibility
                            {state.eligibility.isEligible && (
                                <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                    Eligible
                                </span>
                            )}
                        </h3>
                        <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                                <dt className="text-gray-500">Age 62+</dt>
                                <dd className={state.eligibility.meetsAgeRequirement ? 'text-green-600 font-medium' : 'text-red-600'}>
                                    {state.eligibility.meetsAgeRequirement ? '✓ Yes' : '✗ No'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Income ≤80% AMI</dt>
                                <dd className={state.eligibility.meetsIncomeRequirement ? 'text-green-600 font-medium' : 'text-red-600'}>
                                    <span className="text-lg font-bold text-blue-600">{state.eligibility?.incomePercentOfAMI ?? '—'}%</span>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Primary Residence</dt>
                                <dd className={state.eligibility.isPrimaryResidence ? 'text-green-600 font-medium' : 'text-red-600'}>
                                    {state.eligibility.isPrimaryResidence ? '✓ Yes' : '✗ No'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Ownership</dt>
                                <dd className="font-medium">{state.eligibility.ownershipType?.replace(/_/g, ' ') || 'N/A'}</dd>
                            </div>
                        </dl>
                    </section>
                )}

                {/* Property */}
                <section className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span>🏠</span> Property Information
                    </h3>
                    <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                            <dt className="text-gray-500">Type</dt>
                            <dd className="font-medium">{state.propertyInfo.type || 'Not provided'}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Year Built</dt>
                            <dd className="font-medium">{state.propertyInfo.yearBuilt || 'Unknown'}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Stories</dt>
                            <dd className="font-medium">{state.propertyInfo.stories || 'N/A'}</dd>
                        </div>
                    </dl>
                </section>

                {/* Functional Assessments Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ADL */}
                    {hasADL && (
                        <section className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                            <h3 className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <span>🛁</span> ADL Assessment
                            </h3>
                            <div className="flex items-center justify-between">
                                <ScoreBadge
                                    score={state.adlAssessment.totalScore ?? 0}
                                    max={24}
                                    label="Score"
                                />
                                <span className="text-sm text-gray-600">
                                    {state.adlAssessment.independenceLevel?.replace(/_/g, ' ') || 'N/A'}
                                </span>
                            </div>
                        </section>
                    )}

                    {/* IADL */}
                    {hasIADL && (
                        <section className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                            <h3 className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <span>🍳</span> IADL Assessment
                            </h3>
                            <div className="flex items-center justify-between">
                                <ScoreBadge
                                    score={state.iadlAssessment.totalScore ?? 0}
                                    max={24}
                                    label="Score"
                                />
                                <span className="text-sm text-gray-600">
                                    {state.iadlAssessment.independenceLevel?.replace(/_/g, ' ') || 'N/A'}
                                </span>
                            </div>
                        </section>
                    )}

                    {/* Mobility */}
                    {hasMobility && (
                        <section className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                            <h3 className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <span>🦽</span> Mobility Assessment
                            </h3>
                            <div className="text-sm text-gray-600 space-y-1">
                                {state.clientInfo.mobilityAids && state.clientInfo.mobilityAids.length > 0 ? (
                                    <p>Aids: {state.clientInfo.mobilityAids.join(', ')}</p>
                                ) : (
                                    <p>No mobility aids</p>
                                )}
                                {state.mobilityAssessment.balanceIssues && <p className="text-orange-700">⚠️ Balance issues</p>}
                                {state.mobilityAssessment.gaitIssues && <p className="text-orange-700">⚠️ Gait issues</p>}
                            </div>
                        </section>
                    )}

                    {/* Falls Risk */}
                    {hasFallsRisk && (
                        <section className="border border-red-200 bg-red-50 rounded-lg p-4">
                            <h3 className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <span>⚠️</span> Falls Risk Assessment
                            </h3>
                            <div className="flex items-center justify-between">
                                <RiskBadge level={state.fallsRiskAssessment.overallRiskLevel} />
                                <span className="text-sm text-gray-600">
                                    {state.fallsRiskAssessment.hasFallenPastYear
                                        ? `${state.fallsRiskAssessment.numberOfFalls ?? 0} falls past year`
                                        : 'No recent falls'}
                                </span>
                            </div>
                        </section>
                    )}
                </div>

                {/* Assessment Context */}
                <section className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span>⚙️</span> Assessment Parameters
                    </h3>
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <dt className="text-gray-500">Program</dt>
                            <dd className="font-medium">{state.assessmentContext.programType}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Budget Cap</dt>
                            <dd className="font-medium">${state.assessmentContext.budgetCap?.toLocaleString()}</dd>
                        </div>
                    </dl>
                </section>

                {/* Processing Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <svg className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h4 className="text-sm font-medium text-yellow-800">Processing Notice</h4>
                            <p className="mt-1 text-sm text-yellow-700">
                                AI analysis takes 30-60 seconds. All {state.images.length} images will be analyzed for hazards
                                and accessibility barriers, with recommendations based on your ADL/IADL scores and falls risk level.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
                <button
                    onClick={onBack}
                    className="shrink-0 px-6 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                    ← Back
                </button>
                <button
                    onClick={onConfirm}
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Start AI Analysis 🚀
                </button>
            </div>
        </div>
    );
}
