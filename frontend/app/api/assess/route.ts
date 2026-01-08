/**
 * Simple Assessment API Route
 * 
 * POST /api/assess
 * 
 * This is a simplified endpoint that matches what the main assessment page expects.
 * It accepts images and client/property info, then returns the AI analysis.
 */

import { NextRequest, NextResponse } from 'next/server';
import { processAssessmentImages } from '@/lib/ai/federal-assessment-processor';
import type { AIAssessmentInput, AIAssessmentOutput } from '@/lib/types/federal-assessment';

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body: AIAssessmentInput = await request.json();

        // Validate required fields
        if (!body.images || !Array.isArray(body.images) || body.images.length === 0) {
            return NextResponse.json(
                { error: 'At least one image is required' },
                { status: 400 }
            );
        }

        // Check for API key
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'AI service not configured. Please set GEMINI_API_KEY environment variable.' },
                { status: 500 }
            );
        }

        console.log(`[Assessment API] Processing ${body.images.length} images`);
        console.log(`[Assessment API] Full assessment data:`, {
            hasADL: !!body.fullAssessment?.adlAssessment,
            hasIADL: !!body.fullAssessment?.iadlAssessment,
            hasMobility: !!body.fullAssessment?.mobilityAssessment,
            hasFallsRisk: !!body.fullAssessment?.fallsRiskAssessment,
        });

        // Call the AI processor with both legacy and full assessment data
        const assessment: AIAssessmentOutput = await processAssessmentImages(body.images, {
            // Legacy fields for backward compatibility
            clientAge: body.selfReportedInfo?.age,
            livesAlone: body.selfReportedInfo?.livesAlone,
            mobilityAids: body.selfReportedInfo?.mobilityAids,
            recentFalls: body.selfReportedInfo?.recentFalls,
            primaryConcerns: body.selfReportedInfo?.primaryConcerns,
            propertyType: body.propertyInfo?.type,
            yearBuilt: body.propertyInfo?.yearBuilt,
            stories: body.propertyInfo?.stories,
            programType: body.assessmentContext.programType,
            budgetCap: body.assessmentContext.budgetCap,
            priorityAreas: body.assessmentContext.priorityAreas,
            // New comprehensive assessment data
            fullAssessment: body.fullAssessment,
        });

        console.log(`[Assessment API] Analysis complete:`, {
            hazards: assessment.detectedHazards.length,
            recommendations: assessment.recommendations.length,
            safetyScore: assessment.summary.overallSafetyScore,
        });

        return NextResponse.json(assessment);

    } catch (error) {
        console.error('[Assessment API] Error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

// GET endpoint for API documentation
export async function GET(): Promise<NextResponse> {
    return NextResponse.json({
        endpoint: '/api/assess',
        description: 'Simple assessment endpoint: analyze images and return AI assessment',
        method: 'POST',
        requestBody: {
            images: {
                type: 'array',
                required: true,
                description: 'Array of images to analyze',
                items: {
                    id: 'string (required)',
                    url: 'string (required) - URL or base64 data URI',
                    room: 'string (optional)',
                    userNotes: 'string (optional)',
                },
            },
            selfReportedInfo: {
                type: 'object',
                required: false,
                properties: {
                    age: 'number (optional)',
                    livesAlone: 'boolean (optional)',
                    mobilityAids: 'string[] (optional)',
                    recentFalls: 'boolean (optional)',
                    primaryConcerns: 'string[] (optional)',
                    currentMedicalConditions: 'string[] (optional)',
                },
            },
            propertyInfo: {
                type: 'object',
                required: false,
                properties: {
                    type: 'string (optional)',
                    yearBuilt: 'number (optional)',
                    stories: 'number (optional)',
                },
            },
            assessmentContext: {
                type: 'object',
                required: true,
                properties: {
                    programType: 'OAHMP | CIL | AAA | CDBG | OTHER',
                    budgetCap: 'number (default: 5000)',
                    priorityAreas: 'string[] (optional)',
                },
            },
        },
        responseBody: 'AIAssessmentOutput object with hazards, recommendations, and summary',
    });
}
