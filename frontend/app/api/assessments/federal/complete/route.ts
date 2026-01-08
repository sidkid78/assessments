/**
 * Complete Federal Assessment Pipeline API
 * 
 * POST /api/assessments/federal/complete
 * 
 * One-stop endpoint that:
 * 1. Analyzes home images using Gemini AI
 * 2. Generates a HUD OAHMP compliant PDF report
 * 3. Optionally saves to Firestore
 * 
 * This is the recommended endpoint for full assessment workflows.
 */

import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { processAssessmentImages } from '@/lib/ai/federal-assessment-processor';
import { FederalAssessmentReport } from '@/lib/ai/federal-assessment-report';
import type { AIAssessmentOutput } from '@/lib/types/federal-assessment';

// Request body schema
interface CompleteAssessmentRequest {
    // Images to analyze
    images: Array<{
        id: string;
        url: string;
        room?: string;
        userNotes?: string;
    }>;

    // Client information
    client: {
        name: string;
        address?: string;
        age?: number;
        livesAlone?: boolean;
        mobilityAids?: string[];
        recentFalls?: boolean;
        primaryConcerns?: string[];
        medicalConditions?: string[];
    };

    // Property information
    property?: {
        type?: string;
        yearBuilt?: number;
        stories?: number;
    };

    // Assessment configuration
    config?: {
        programType?: 'OAHMP' | 'CIL' | 'AAA' | 'CDBG' | 'OTHER';
        budgetCap?: number;
        priorityAreas?: string[];
    };

    // Report options
    report?: {
        assessorName?: string;
        organizationName?: string;
        caseNumber?: string;
        generatePdf?: boolean;  // Default: true
        pdfFormat?: 'base64' | 'url';  // Default: 'base64'
    };

    // Storage options
    storage?: {
        saveToFirestore?: boolean;
        projectId?: string;
        homeownerId?: string;
    };
}

interface CompleteAssessmentResponse {
    success: boolean;
    data?: {
        assessment: AIAssessmentOutput;
        pdf?: {
            base64?: string;
            url?: string;
            filename: string;
        };
        metadata: {
            assessmentId: string;
            processingTimeMs: number;
            imageCount: number;
            hazardsFound: number;
            recommendationsCount: number;
            estimatedCost: { low: number; high: number };
            withinBudget: boolean;
        };
    };
    error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<CompleteAssessmentResponse>> {
    const startTime = Date.now();

    try {
        const body: CompleteAssessmentRequest = await request.json();

        // Validate required fields
        if (!body.images || !Array.isArray(body.images) || body.images.length === 0) {
            return NextResponse.json(
                { success: false, error: 'At least one image is required' },
                { status: 400 }
            );
        }

        if (!body.client?.name) {
            return NextResponse.json(
                { success: false, error: 'Client name is required' },
                { status: 400 }
            );
        }

        // Check for API key
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { success: false, error: 'AI service not configured' },
                { status: 500 }
            );
        }

        const programType = body.config?.programType || 'OAHMP';
        const budgetCap = body.config?.budgetCap || 5000;

        // Step 1: Analyze images with AI
        console.log(`[Complete Assessment] Starting analysis for ${body.client.name}`);

        const assessment = await processAssessmentImages(body.images, {
            clientAge: body.client.age,
            livesAlone: body.client.livesAlone,
            mobilityAids: body.client.mobilityAids,
            recentFalls: body.client.recentFalls,
            primaryConcerns: body.client.primaryConcerns,
            propertyType: body.property?.type,
            yearBuilt: body.property?.yearBuilt,
            stories: body.property?.stories,
            programType,
            budgetCap,
            priorityAreas: body.config?.priorityAreas,
        });

        const analysisTime = Date.now() - startTime;
        console.log(`[Complete Assessment] Analysis completed in ${analysisTime}ms`);

        // Generate assessment ID
        const assessmentId = `assess-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

        // Calculate total cost
        const totalCost = assessment.recommendations.reduce((sum, r) => sum + r.estimatedCost.total, 0);
        const withinBudget = totalCost <= budgetCap;

        // Step 2: Generate PDF (if requested)
        let pdfData: { base64?: string; url?: string; filename: string } | undefined;

        if (body.report?.generatePdf !== false) {
            console.log(`[Complete Assessment] Generating PDF report`);

            const reportElement = React.createElement(FederalAssessmentReport, {
                assessment,
                clientName: body.client.name,
                clientAddress: body.client.address || 'Address Not Provided',
                assessmentDate: new Date(),
                assessorName: body.report?.assessorName || 'AI-Assisted Assessment',
                organizationName: body.report?.organizationName || 'HOMEase AI',
                programType,
                caseNumber: body.report?.caseNumber,
            });

            const pdfBuffer = await renderToBuffer(reportElement as any);

            const date = new Date().toISOString().split('T')[0];
            const safeName = body.client.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
            const filename = `HomeAssessment_${safeName}_${date}.pdf`;

            // For now, return as base64. Could integrate with cloud storage for URL.
            pdfData = {
                base64: pdfBuffer.toString('base64'),
                filename,
            };

            console.log(`[Complete Assessment] PDF generated (${pdfBuffer.length} bytes)`);
        }

        // Step 3: Save to Firestore (if requested)
        if (body.storage?.saveToFirestore) {
            // TODO: Implement Firestore storage
            console.log(`[Complete Assessment] Firestore storage requested but not yet implemented`);
        }

        const totalTime = Date.now() - startTime;

        // Build response
        const response: CompleteAssessmentResponse = {
            success: true,
            data: {
                assessment,
                pdf: pdfData,
                metadata: {
                    assessmentId,
                    processingTimeMs: totalTime,
                    imageCount: body.images.length,
                    hazardsFound: assessment.detectedHazards.length,
                    recommendationsCount: assessment.recommendations.length,
                    estimatedCost: assessment.summary.estimatedTotalCost,
                    withinBudget,
                },
            },
        };

        console.log(`[Complete Assessment] Complete in ${totalTime}ms`, {
            assessmentId,
            hazards: assessment.detectedHazards.length,
            recommendations: assessment.recommendations.length,
            safetyScore: assessment.summary.overallSafetyScore,
            estimatedCost: totalCost,
            withinBudget,
        });

        return NextResponse.json(response);

    } catch (error) {
        console.error('[Complete Assessment] Error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

// GET endpoint for documentation
export async function GET(): Promise<NextResponse> {
    return NextResponse.json({
        endpoint: '/api/assessments/federal/complete',
        description: 'Complete assessment pipeline: analyze images + generate PDF in one call',
        methods: ['POST'],
        workflow: [
            '1. Validate inputs',
            '2. Analyze images with Gemini AI',
            '3. Generate HUD OAHMP compliant PDF report',
            '4. (Optional) Save to Firestore',
            '5. Return assessment data + PDF',
        ],
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
            client: {
                type: 'object',
                required: true,
                properties: {
                    name: 'string (required) - Client full name',
                    address: 'string (optional) - Property address',
                    age: 'number (optional)',
                    livesAlone: 'boolean (optional)',
                    mobilityAids: 'string[] (optional)',
                    recentFalls: 'boolean (optional)',
                    primaryConcerns: 'string[] (optional)',
                    medicalConditions: 'string[] (optional)',
                },
            },
            property: {
                type: 'object',
                required: false,
                properties: {
                    type: 'string - single_family_detached, condo, etc.',
                    yearBuilt: 'number',
                    stories: 'number',
                },
            },
            config: {
                type: 'object',
                required: false,
                properties: {
                    programType: 'OAHMP | CIL | AAA | CDBG | OTHER (default: OAHMP)',
                    budgetCap: 'number (default: 5000)',
                    priorityAreas: 'string[] (optional)',
                },
            },
            report: {
                type: 'object',
                required: false,
                properties: {
                    assessorName: 'string (default: AI-Assisted Assessment)',
                    organizationName: 'string (default: HOMEase AI)',
                    caseNumber: 'string (optional)',
                    generatePdf: 'boolean (default: true)',
                    pdfFormat: 'base64 | url (default: base64)',
                },
            },
            storage: {
                type: 'object',
                required: false,
                properties: {
                    saveToFirestore: 'boolean (default: false)',
                    projectId: 'string (optional)',
                    homeownerId: 'string (optional)',
                },
            },
        },
        responseBody: {
            success: 'boolean',
            data: {
                assessment: 'AIAssessmentOutput - Full assessment data',
                pdf: {
                    base64: 'string - Base64 encoded PDF',
                    filename: 'string - Suggested filename',
                },
                metadata: {
                    assessmentId: 'string',
                    processingTimeMs: 'number',
                    imageCount: 'number',
                    hazardsFound: 'number',
                    recommendationsCount: 'number',
                    estimatedCost: '{ low: number, high: number }',
                    withinBudget: 'boolean',
                },
            },
            error: 'string (if success=false)',
        },
        example: {
            request: {
                images: [
                    { id: 'img-1', url: 'https://...', room: 'bathroom' },
                ],
                client: {
                    name: 'Mary Johnson',
                    address: '456 Oak Lane, Austin, TX 78702',
                    age: 74,
                    livesAlone: true,
                    recentFalls: true,
                    primaryConcerns: ['bathroom safety', 'lighting'],
                },
                config: {
                    programType: 'OAHMP',
                    budgetCap: 5000,
                },
                report: {
                    organizationName: 'Central Texas AAA',
                    caseNumber: 'CT-2025-001',
                },
            },
        },
    });
}
