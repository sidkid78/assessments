/**
 * Federal Assessment PDF Report Generator API
 * 
 * POST /api/assessments/federal/report
 * 
 * Generates a HUD OAHMP compliant PDF report from assessment data.
 * 
 * Install required dependency:
 * pnpm add @react-pdf/renderer
 */

import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { FederalAssessmentReport } from '@/lib/ai/federal-assessment-report';
import type { AIAssessmentOutput } from '@/lib/types/federal-assessment';

// Request body schema
interface ReportGenerationRequest {
    assessment: AIAssessmentOutput;
    clientInfo?: {
        name?: string;
        address?: string;
    };
    assessmentDate?: string;  // ISO date string
    assessorName?: string;
    organizationName?: string;
    programType?: 'OAHMP' | 'CIL' | 'AAA' | 'CDBG' | 'OTHER';
    caseNumber?: string;
    format?: 'pdf' | 'buffer';  // 'pdf' returns file, 'buffer' returns base64
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body: ReportGenerationRequest = await request.json();

        // Validate required fields
        if (!body.assessment) {
            return NextResponse.json(
                { success: false, error: 'Assessment data is required' },
                { status: 400 }
            );
        }

        // Create the React element for the PDF
        const reportElement = React.createElement(FederalAssessmentReport, {
            assessment: body.assessment,
            clientName: body.clientInfo?.name || 'Client Name',
            clientAddress: body.clientInfo?.address || 'Address Not Provided',
            assessmentDate: body.assessmentDate ? new Date(body.assessmentDate) : new Date(),
            assessorName: body.assessorName || 'AI-Assisted Assessment',
            organizationName: body.organizationName || 'HOMEase AI',
            programType: body.programType || 'OAHMP',
            caseNumber: body.caseNumber,
        });

        // Render to buffer - eslint-disable-next-line for strict typing with react-pdf
        // The FederalAssessmentReport returns a valid Document but TypeScript can't infer it
        const pdfBuffer = await renderToBuffer(reportElement as any);

        // Return based on format requested
        if (body.format === 'buffer') {
            // Return as base64 for client-side handling
            const base64 = pdfBuffer.toString('base64');
            return NextResponse.json({
                success: true,
                data: {
                    base64,
                    mimeType: 'application/pdf',
                    filename: generateFilename(body),
                },
            });
        }

        // Default: Return as downloadable PDF file
        const filename = generateFilename(body);

        return new NextResponse(Uint8Array.from(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=\"${filename}\"`,
                'Content-Length': pdfBuffer.length.toString(),
            },
        });

    } catch (error) {
        console.error('PDF generation error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

// Generate filename based on client info and date
function generateFilename(body: ReportGenerationRequest): string {
    const date = body.assessmentDate
        ? new Date(body.assessmentDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

    const clientName = body.clientInfo?.name
        ? body.clientInfo.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)
        : 'Assessment';

    return `HomeAssessment_${clientName}_${date}.pdf`;
}

// GET endpoint for documentation
export async function GET(): Promise<NextResponse> {
    return NextResponse.json({
        endpoint: '/api/assessments/federal/report',
        description: 'Generates HUD OAHMP compliant PDF reports from assessment data',
        methods: ['POST'],
        requestBody: {
            assessment: {
                type: 'AIAssessmentOutput',
                required: true,
                description: 'The assessment data from /api/assessments/federal',
            },
            clientInfo: {
                type: 'object',
                required: false,
                properties: {
                    name: 'string - Client full name',
                    address: 'string - Property address',
                },
            },
            assessmentDate: 'string (ISO date) - Date of assessment',
            assessorName: 'string - Name of assessor or \"AI-Assisted\"',
            organizationName: 'string - AAA/CIL organization name',
            programType: 'OAHMP | CIL | AAA | CDBG | OTHER',
            caseNumber: 'string - Case/reference number',
            format: {
                type: 'string',
                enum: ['pdf', 'buffer'],
                default: 'pdf',
                description: '\"pdf\" returns downloadable file, \"buffer\" returns base64 JSON',
            },
        },
        responseFormats: {
            pdf: 'Direct PDF file download (Content-Type: application/pdf)',
            buffer: {
                success: 'boolean',
                data: {
                    base64: 'string - Base64 encoded PDF',
                    mimeType: 'application/pdf',
                    filename: 'string - Suggested filename',
                },
            },
        },
        example: {
            assessment: '{ ... AIAssessmentOutput from /api/assessments/federal }',
            clientInfo: { name: 'John Smith', address: '123 Main St, Austin, TX 78701' },
            assessmentDate: '2025-01-05',
            assessorName: 'HOMEase AI Assessment',
            organizationName: 'Central Texas AAA',
            programType: 'OAHMP',
            caseNumber: 'CT-AAA-2025-001',
        },
    });
}