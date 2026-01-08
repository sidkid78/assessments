'use client';

import { useState } from 'react';
import type { EligibilityVerification } from '@/lib/types/federal-assessment';

interface EligibilityStepProps {
    clientAge?: number;
    initialData: Partial<EligibilityVerification>;
    onSubmit: (data: Partial<EligibilityVerification>) => void;
    onBack: () => void;
}

const HOMEOWNERSHIP_TYPES = [
    { value: 'sole_owner', label: 'Sole owner' },
    { value: 'joint_owner', label: 'Joint owner' },
    { value: 'spouse_of_owner', label: 'Spouse of owner' },
    { value: 'trust', label: 'Trust' },
    { value: 'other', label: 'Other' },
] as const;

const DOCUMENTATION = [
    { key: 'deed', label: 'Deed or title' },
    { key: 'mortgage', label: 'Mortgage statement' },
    { key: 'tax_records', label: 'Property tax records' },
    { key: 'other', label: 'Other documentation' },
] as const;

export function EligibilityStep({ clientAge, initialData, onSubmit, onBack }: EligibilityStepProps) {
    const [data, setData] = useState<Partial<EligibilityVerification>>({
        meetsAgeRequirement: initialData.meetsAgeRequirement ?? (clientAge ? clientAge >= 62 : false),
        isHomeowner: initialData.isHomeowner ?? true,
        ownershipType: initialData.ownershipType ?? 'sole_owner',
        ownershipDocumentation: initialData.ownershipDocumentation ?? 'deed',
        householdIncome: initialData.householdIncome ?? undefined,
        areaMedianIncome: initialData.areaMedianIncome ?? 80000,
        incomePercentOfAMI: initialData.incomePercentOfAMI ?? undefined,
        meetsIncomeRequirement: initialData.meetsIncomeRequirement ?? false,
        isPrimaryResidence: initialData.isPrimaryResidence ?? true,
        yearsAtResidence: initialData.yearsAtResidence ?? undefined,
        isEligible: initialData.isEligible ?? false,
    });

    const updateDocumentation = (docType: string, checked: boolean) => {
        setData(prev => ({
            ...prev,
            ownershipDocumentation: docType as any,
        }));
    };

    const calculateEligibility = () => {
        const ageOk = clientAge ? clientAge >= 62 : false;
        const incomeOk = (data.incomePercentOfAMI ?? 100) <= 80;
        const residenceOk = data.isPrimaryResidence ?? false;

        return {
            meetsAgeRequirement: ageOk,
            meetsIncomeRequirement: incomeOk,
            isEligible: ageOk && incomeOk && residenceOk,
        };
    };

    const handleIncomeChange = (income: number) => {
        const ami = data.areaMedianIncome ?? 80000; // Default AMI
        const percentOfAMI = income > 0 && ami > 0 ? Math.round((income / ami) * 100) : undefined;
        setData(prev => ({
            ...prev,
            householdIncome: income,
            incomePercentOfAMI: percentOfAMI,
            meetsIncomeRequirement: (percentOfAMI ?? 100) <= 80,
        }));
    };

    const handleSubmit = () => {
        const eligibility = calculateEligibility();
        onSubmit({
            ...data,
            ...eligibility,
        });
    };

    const eligibility = calculateEligibility();
    const ageCheck = clientAge ? clientAge >= 62 : false;

    return (
        <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Eligibility Verification
                </h2>
                <p className="text-gray-600">
                    HUD OAHMP requires verification of age, income, and homeownership status.
                </p>
            </div>

            {/* Eligibility Summary */}
            <div className={`mb-8 p-4 rounded-lg border ${eligibility.isEligible ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                }`}>
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{eligibility.isEligible ? '✅' : '⚠️'}</span>
                    <div>
                        <h3 className={`font-semibold ${eligibility.isEligible ? 'text-green-800' : 'text-yellow-800'}`}>
                            {eligibility.isEligible ? 'Appears Eligible for OAHMP' : 'Eligibility Pending'}
                        </h3>
                        <p className="text-sm text-gray-600">
                            Based on information provided. Final determination by program administrator.
                        </p>
                    </div>
                </div>
            </div>

            {/* Age Verification */}
            <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🎂</span> Age Requirement (62+)
                </h3>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client Age</label>
                        <input
                            title="Client Age"
                            type="number"
                            min="18"
                            max="120"
                            value={clientAge ?? ''}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                        />
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${ageCheck ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {ageCheck ? '✓ Meets age requirement' : '✗ Under 62'}
                    </div>
                </div>
            </section>

            {/* Homeownership */}
            <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🏠</span> Homeownership Status
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ownership Type</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {HOMEOWNERSHIP_TYPES.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setData(prev => ({ ...prev, ownershipType: type.value as any }))}
                                    className={`p-3 text-left rounded-lg border-2 text-sm transition-all ${data.ownershipType === type.value
                                        ? 'bg-blue-50 text-blue-700 border-blue-500'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Documentation Available</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {DOCUMENTATION.map(doc => (
                                <label
                                    key={doc.key}
                                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${data.ownershipDocumentation === doc.key
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="ownershipDocumentation"
                                        checked={data.ownershipDocumentation === doc.key}
                                        onChange={() => setData(prev => ({ ...prev, ownershipDocumentation: doc.key as any }))}
                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        title={`Select ${doc.label}`}
                                    />
                                    <span className="text-sm text-gray-700">{doc.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                            type="checkbox"
                            checked={data.isPrimaryResidence ?? true}
                            onChange={(e) => setData(prev => ({ ...prev, isPrimaryResidence: e.target.checked }))}
                            className="w-5 h-5 rounded border-gray-300 text-green-600"
                            title="Confirm primary residence"
                        />
                        <span className="font-medium text-gray-900">This is my primary residence</span>
                    </label>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Years at this residence</label>
                        <input
                            title="Years at residence"
                            type="number"
                            min="0"
                            max="100"
                            value={data.yearsAtResidence ?? ''}
                            onChange={(e) => setData(prev => ({ ...prev, yearsAtResidence: Number(e.target.value) }))}
                            className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </section>

            {/* Income Verification */}
            <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>💰</span> Income Verification (≤80% AMI)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Annual Household Income</label>
                        <input
                            title="Annual Household Income"
                            type="range"
                            min="0"
                            max="150000"
                            step="1000"
                            value={data.householdIncome ?? 0}
                            onChange={(e) => handleIncomeChange(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mb-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                            <span>$0</span>
                            <span>$75k</span>
                            <span>$150k+</span>
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input
                                title="Annual Income Amount"
                                type="number"
                                value={data.householdIncome ?? 0}
                                onChange={(e) => handleIncomeChange(Number(e.target.value))}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area Median Income (AMI)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input
                                title="Area Median Income"
                                type="number"
                                min="0"
                                value={data.areaMedianIncome ?? 80000}
                                onChange={(e) => {
                                    const ami = Number(e.target.value);
                                    const income = data.householdIncome ?? 0;
                                    const percentOfAMI = income > 0 && ami > 0 ? Math.round((income / ami) * 100) : undefined;
                                    setData(prev => ({
                                        ...prev,
                                        areaMedianIncome: ami,
                                        incomePercentOfAMI: percentOfAMI,
                                        meetsIncomeRequirement: (percentOfAMI ?? 100) <= 80,
                                    }));
                                }}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Default: $80,000. Lookup at HUD website.</p>
                    </div>
                    <div className="flex items-end">
                        <div className={`w-full p-3 rounded-lg text-center ${(data.incomePercentOfAMI ?? 100) <= 80
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            <span className="text-2xl font-bold">{data.incomePercentOfAMI ?? '—'}%</span>
                            <p className="text-sm">of AMI</p>
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
                    Continue to Property Info →
                </button>
            </div>
        </div>
    );
}
