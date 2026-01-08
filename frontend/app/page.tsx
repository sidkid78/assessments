'use client';

import { useState } from 'react';
import { ImageUploadStep } from '@/components/assessment/ImageUploadStep';
import { DemographicsStep } from '@/components/assessment/DemographicsStep';
import { EligibilityStep } from '@/components/assessment/EligibilityStep';
import { PropertyInfoStep } from '@/components/assessment/PropertyInfoStep';
import { ADLAssessmentStep } from '@/components/assessment/ADLAssessmentStep';
import { IADLAssessmentStep } from '@/components/assessment/IADLAssessmentStep';
import { MobilityAssessmentStep } from '@/components/assessment/MobilityAssessmentStep';
import { FallsRiskStep } from '@/components/assessment/FallsRiskStep';
import { ReviewStep } from '@/components/assessment/ReviewStep';
import { ProcessingStep } from '@/components/assessment/ProcessingStep';
import { ResultsDisplay } from '@/components/assessment/ResultsDisplay';
import { ProgressBar } from '@/components/assessment/ProgressBar';
import type {
  AssessmentState,
  AIAssessmentOutput,
  ClientDemographics,
  EligibilityVerification,
  PropertyCharacteristics,
  ADLAssessment,
  IADLAssessment,
  MobilityAssessment,
  FallsRiskAssessment,
} from '@/lib/types/federal-assessment';

const STEPS: AssessmentState['step'][] = [
  'upload', 'demographics', 'eligibility', 'property',
  'adl', 'iadl', 'mobility', 'falls-risk',
  'review', 'processing', 'results'
];

export default function AssessmentPage() {
  const [state, setState] = useState<AssessmentState>({
    step: 'upload',
    images: [],
    clientDemographics: {},
    eligibility: {},
    propertyCharacteristics: {},
    adlAssessment: {},
    iadlAssessment: {},
    mobilityAssessment: {},
    fallsRiskAssessment: {},
    clientInfo: {},
    propertyInfo: {},
    assessmentContext: {
      programType: 'OAHMP',
      budgetCap: 5000,
    },
  });

  // Step handlers
  const handleImagesSubmit = (images: AssessmentState['images']) => {
    setState(prev => ({ ...prev, images, step: 'demographics' }));
  };

  const handleDemographicsSubmit = (clientDemographics: Partial<ClientDemographics>) => {
    // Sync to legacy clientInfo for backward compatibility
    const clientInfo = {
      ...state.clientInfo,
      name: `${clientDemographics.firstName ?? ''} ${clientDemographics.lastName ?? ''}`.trim(),
      address: clientDemographics.address?.street
        ? `${clientDemographics.address.street}, ${clientDemographics.address.city}, ${clientDemographics.address.state} ${clientDemographics.address.zipCode}`
        : undefined,
      age: clientDemographics.age,
      livesAlone: clientDemographics.livesAlone,
    };
    setState(prev => ({ ...prev, clientDemographics, clientInfo, step: 'eligibility' }));
  };

  const handleEligibilitySubmit = (eligibility: Partial<EligibilityVerification>) => {
    setState(prev => ({ ...prev, eligibility, step: 'property' }));
  };

  const handlePropertySubmit = (propertyCharacteristics: Partial<PropertyCharacteristics>) => {
    // Sync to legacy propertyInfo
    const propertyInfo = {
      type: propertyCharacteristics.homeType,
      yearBuilt: propertyCharacteristics.yearBuilt,
      stories: propertyCharacteristics.numberOfStories,
    };
    setState(prev => ({ ...prev, propertyCharacteristics, propertyInfo, step: 'adl' }));
  };

  const handleADLSubmit = (adlAssessment: Partial<ADLAssessment>) => {
    setState(prev => ({ ...prev, adlAssessment, step: 'iadl' }));
  };

  const handleIADLSubmit = (iadlAssessment: Partial<IADLAssessment>) => {
    setState(prev => ({ ...prev, iadlAssessment, step: 'mobility' }));
  };

  const handleMobilitySubmit = (mobilityAssessment: Partial<MobilityAssessment>) => {
    // Sync mobility aids to legacy clientInfo
    const mobilityAids: string[] = [];
    if (mobilityAssessment.usesWheelchair?.frequency && mobilityAssessment.usesWheelchair.frequency > 0) mobilityAids.push('wheelchair');
    if (mobilityAssessment.usesWalker?.frequency && mobilityAssessment.usesWalker.frequency > 0) mobilityAids.push('walker');
    if (mobilityAssessment.usesCane?.frequency && mobilityAssessment.usesCane.frequency > 0) mobilityAids.push('cane');
    if (mobilityAssessment.usesOtherDevice?.deviceType) mobilityAids.push(mobilityAssessment.usesOtherDevice.deviceType);

    setState(prev => ({
      ...prev,
      mobilityAssessment,
      clientInfo: { ...prev.clientInfo, mobilityAids },
      step: 'falls-risk'
    }));
  };

  const handleFallsRiskSubmit = (fallsRiskAssessment: Partial<FallsRiskAssessment>) => {
    // Sync recent falls to legacy clientInfo
    setState(prev => ({
      ...prev,
      fallsRiskAssessment,
      clientInfo: { ...prev.clientInfo, recentFalls: fallsRiskAssessment.hasFallenPastYear },
      step: 'review'
    }));
  };

  const handleReviewConfirm = async () => {
    setState(prev => ({ ...prev, step: 'processing' }));

    try {
      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: state.images,
          selfReportedInfo: state.clientInfo,
          propertyInfo: state.propertyInfo,
          assessmentContext: state.assessmentContext,
          // Send full assessment data for enhanced AI analysis
          fullAssessment: {
            clientDemographics: state.clientDemographics,
            eligibility: state.eligibility,
            propertyCharacteristics: state.propertyCharacteristics,
            adlAssessment: state.adlAssessment,
            iadlAssessment: state.iadlAssessment,
            mobilityAssessment: state.mobilityAssessment,
            fallsRiskAssessment: state.fallsRiskAssessment,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Assessment failed');
      }

      const results: AIAssessmentOutput = await response.json();
      setState(prev => ({ ...prev, results, step: 'results' }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        step: 'review',
      }));
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(state.step);
    if (currentIndex > 0) {
      setState(prev => ({ ...prev, step: STEPS[currentIndex - 1] }));
    }
  };

  const handleStartNew = () => {
    setState({
      step: 'upload',
      images: [],
      clientDemographics: {},
      eligibility: {},
      propertyCharacteristics: {},
      adlAssessment: {},
      iadlAssessment: {},
      mobilityAssessment: {},
      fallsRiskAssessment: {},
      clientInfo: {},
      propertyInfo: {},
      assessmentContext: {
        programType: 'OAHMP',
        budgetCap: 5000,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Federal Home Safety Assessment
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                HUD OAHMP Compliant • AI-Powered Analysis • Full Clinical Assessment
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Program
                </div>
                <div className="text-sm font-medium text-foreground">
                  {state.assessmentContext.programType}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Budget Cap
                </div>
                <div className="text-sm font-medium text-foreground">
                  ${state.assessmentContext.budgetCap?.toLocaleString() || '5,000'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {state.step !== 'results' && (
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <ProgressBar currentStep={state.step} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state.error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-destructive">Error</h3>
                <p className="mt-1 text-sm text-destructive/80">{state.error}</p>
              </div>
            </div>
          </div>
        )}

        {state.step === 'upload' && (
          <ImageUploadStep
            existingImages={state.images}
            onSubmit={handleImagesSubmit}
          />
        )}

        {state.step === 'demographics' && (
          <DemographicsStep
            initialData={state.clientDemographics}
            onSubmit={handleDemographicsSubmit}
            onBack={handleBack}
          />
        )}

        {state.step === 'eligibility' && (
          <EligibilityStep
            clientAge={state.clientDemographics.age}
            initialData={state.eligibility}
            onSubmit={handleEligibilitySubmit}
            onBack={handleBack}
          />
        )}

        {state.step === 'property' && (
          <PropertyInfoStep
            existingInfo={state.propertyInfo}
            onSubmit={handlePropertySubmit}
            onBack={handleBack}
          />
        )}

        {state.step === 'adl' && (
          <ADLAssessmentStep
            initialData={state.adlAssessment}
            onSubmit={handleADLSubmit}
            onBack={handleBack}
          />
        )}

        {state.step === 'iadl' && (
          <IADLAssessmentStep
            initialData={state.iadlAssessment}
            onSubmit={handleIADLSubmit}
            onBack={handleBack}
          />
        )}

        {state.step === 'mobility' && (
          <MobilityAssessmentStep
            initialData={state.mobilityAssessment}
            onSubmit={handleMobilitySubmit}
            onBack={handleBack}
          />
        )}

        {state.step === 'falls-risk' && (
          <FallsRiskStep
            initialData={state.fallsRiskAssessment}
            onSubmit={handleFallsRiskSubmit}
            onBack={handleBack}
          />
        )}

        {state.step === 'review' && (
          <ReviewStep
            state={state}
            onConfirm={handleReviewConfirm}
            onBack={handleBack}
          />
        )}

        {state.step === 'processing' && <ProcessingStep />}

        {state.step === 'results' && state.results && (
          <ResultsDisplay
            results={state.results}
            images={state.images}
            clientInfo={state.clientInfo}
            onStartNew={handleStartNew}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Powered by Google Gemini AI • Compliant with HUD OAHMP Program 14.921
            </p>
            <p className="text-sm text-muted-foreground">
              For professional use by OTs, CAPS, and case workers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}