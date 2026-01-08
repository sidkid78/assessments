'use client';

import { useState } from 'react';
import type { ClientDemographics } from '@/lib/types/federal-assessment';

interface DemographicsStepProps {
    initialData: Partial<ClientDemographics>;
    onSubmit: (data: Partial<ClientDemographics>) => void;
    onBack: () => void;
}

const RACE_OPTIONS = [
    { value: 'white', label: 'White' },
    { value: 'black_african_american', label: 'Black or African American' },
    { value: 'american_indian_alaska_native', label: 'American Indian or Alaska Native' },
    { value: 'asian', label: 'Asian' },
    { value: 'native_hawaiian_pacific_islander', label: 'Native Hawaiian or Other Pacific Islander' },
    { value: 'other', label: 'Two or More Races' },
] as const;

const ETHNICITY_OPTIONS = ['Hispanic or Latino', 'Not Hispanic or Latino'] as const;

const CONTACT_METHODS = ['phone', 'email', 'mail'] as const;

export function DemographicsStep({ initialData, onSubmit, onBack }: DemographicsStepProps) {
    const [data, setData] = useState<Partial<ClientDemographics>>({
        firstName: initialData.firstName ?? '',
        lastName: initialData.lastName ?? '',
        dateOfBirth: initialData.dateOfBirth ?? '',
        age: initialData.age ?? undefined,
        race: initialData.race ?? ['white'],
        ethnicity: initialData.ethnicity ?? 'not_hispanic_latino',
        phoneNumber: initialData.phoneNumber ?? '',
        email: initialData.email ?? '',
        preferredContactMethod: initialData.preferredContactMethod ?? 'phone',
        address: initialData.address ?? {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            county: '',
        },
        householdSize: initialData.householdSize ?? 1,
        householdMembersOver62: initialData.householdMembersOver62 ?? 1,
        primaryCaregiver: initialData.primaryCaregiver ?? undefined,
        agingInPlaceImportance: initialData.agingInPlaceImportance ?? 5,
        livesAlone: initialData.livesAlone ?? false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateAddress = (field: keyof NonNullable<ClientDemographics['address']>, value: string) => {
        setData(prev => ({
            ...prev,
            address: { ...(prev.address ?? {}), [field]: value } as ClientDemographics['address'],
        }));
    };

    const validateAndSubmit = () => {
        const newErrors: Record<string, string> = {};

        if (!data.firstName?.trim()) newErrors.firstName = 'First name is required';
        if (!data.lastName?.trim()) newErrors.lastName = 'Last name is required';
        if (!data.age || data.age < 18) newErrors.age = 'Valid age is required';
        if (!data.address?.street) newErrors.street = 'Street address is required';
        if (!data.address?.city) newErrors.city = 'City is required';
        if (!data.address?.state) newErrors.state = 'State is required';
        if (!data.address?.zipCode) newErrors.zipCode = 'ZIP code is required';

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onSubmit(data);
        }
    };

    return (
        <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Client Demographics
                </h2>
                <p className="text-gray-600">
                    HUD-required demographic information for program eligibility.
                </p>
            </div>

            {/* Personal Information */}
            <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>👤</span> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            title="Enter first name"
                            type="text"
                            value={data.firstName ?? ''}
                            onChange={(e) => setData(prev => ({ ...prev, firstName: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            title="Enter last name"
                            type="text"
                            value={data.lastName ?? ''}
                            onChange={(e) => setData(prev => ({ ...prev, lastName: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <div className="relative">
                            <input
                                title="Select date of birth"
                                type="date"
                                value={data.dateOfBirth ?? ''}
                                onChange={(e) => {
                                    const dob = e.target.value;
                                    const age = dob ? Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000) : undefined;
                                    setData(prev => ({ ...prev, dateOfBirth: dob, age }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Age <span className="text-red-500">*</span>
                        </label>
                        <input
                            title="Enter age"
                            type="number"
                            min="18"
                            max="120"
                            value={data.age ?? ''}
                            onChange={(e) => setData(prev => ({ ...prev, age: Number(e.target.value) || undefined }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.age ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Race (HUD Required)</label>
                        <select
                            title="Select race"
                            value={data.race?.[0] ?? 'white'}
                            onChange={(e) => {
                                const raceValue = e.target.value as any;
                                setData(prev => ({ ...prev, race: [raceValue] }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            {RACE_OPTIONS.map(race => (
                                <option key={race.value} value={race.value}>{race.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ethnicity (HUD Required)</label>
                        <select
                            title="Select ethnicity"
                            value={data.ethnicity ?? ''}
                            onChange={(e) => setData(prev => ({ ...prev, ethnicity: e.target.value as ClientDemographics['ethnicity'] }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            {ETHNICITY_OPTIONS.map(eth => (
                                <option key={eth} value={eth}>{eth}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>📞</span> Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            value={data.phoneNumber ?? ''}
                            onChange={(e) => setData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                            placeholder="(555) 555-5555"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={data.email ?? ''}
                            onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="email@example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact</label>
                        <select
                            title="Select preferred contact method"
                            value={data.preferredContactMethod ?? 'phone'}
                            onChange={(e) => setData(prev => ({ ...prev, preferredContactMethod: e.target.value as 'phone' | 'email' | 'mail' }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            {CONTACT_METHODS.map(method => (
                                <option key={method} value={method}>{method.charAt(0).toUpperCase() + method.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            {/* Address */}
            <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🏠</span> Property Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Street Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            title="Enter street address"
                            type="text"
                            value={data.address?.street ?? ''}
                            onChange={(e) => updateAddress('street', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.street ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            City <span className="text-red-500">*</span>
                        </label>
                        <input
                            title="Enter city"
                            type="text"
                            value={data.address?.city ?? ''}
                            onChange={(e) => updateAddress('city', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.city ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                State <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                maxLength={2}
                                value={data.address?.state ?? ''}
                                onChange={(e) => updateAddress('state', e.target.value.toUpperCase())}
                                placeholder="TX"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.state ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ZIP Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.address?.zipCode ?? ''}
                                onChange={(e) => updateAddress('zipCode', e.target.value)}
                                placeholder="12345"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.zipCode ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                        <input
                            title="Enter county"
                            type="text"
                            value={data.address?.county ?? ''}
                            onChange={(e) => updateAddress('county', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </section>

            {/* Household Information */}
            <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>👨‍👩‍👧</span> Household Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Household Size</label>
                        <input
                            title="Enter household size"
                            type="number"
                            min="1"
                            max="20"
                            value={data.householdSize ?? 1}
                            onChange={(e) => setData(prev => ({ ...prev, householdSize: Number(e.target.value) }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Members Age 62+</label>
                        <input
                            title="Enter number of household members over 62"
                            type="number"
                            min="0"
                            max="20"
                            value={data.householdMembersOver62 ?? 0}
                            onChange={(e) => setData(prev => ({ ...prev, householdMembersOver62: Number(e.target.value) }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                            type="checkbox"
                            checked={data.livesAlone ?? false}
                            onChange={(e) => setData(prev => ({ ...prev, livesAlone: e.target.checked }))}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">Lives alone</span>
                    </label>
                </div>
            </section>

            {/* Aging in Place */}
            <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🏡</span> Aging in Place
                </h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        How important is it to remain in your current home? (1 = Not Important, 5 = Very Important)
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            title="Select aging in place importance"
                            type="range"
                            min="1"
                            max="5"
                            value={data.agingInPlaceImportance ?? 5}
                            onChange={(e) => setData(prev => ({ ...prev, agingInPlaceImportance: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 }))}
                            className="flex-1"
                        />
                        <span className="text-lg font-bold text-blue-600 w-8 text-center">
                            {data.agingInPlaceImportance ?? 5}
                        </span>
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
                    onClick={validateAndSubmit}
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Continue to Eligibility →
                </button>
            </div>
        </div>
    );
}
