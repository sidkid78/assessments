'use client';

import { useState } from 'react';
import Image from 'next/image';
import * as XLSX from 'xlsx';
import type { AIAssessmentOutput, AssessmentImage, SelfReportedInfo } from '@/lib/types/federal-assessment';

interface ResultsDisplayProps {
    results: AIAssessmentOutput;
    images: AssessmentImage[];
    clientInfo: SelfReportedInfo;
    onStartNew: () => void;
}

type TabType = 'summary' | 'hazards' | 'recommendations' | 'equipment' | 'details';

export function ResultsDisplay({ results, images, clientInfo, onStartNew }: ResultsDisplayProps) {
    const [activeTab, setActiveTab] = useState<TabType>('summary');
    const [isDownloading, setIsDownloading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch('/api/assessments/federal/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assessment: results,
                    clientInfo: {
                        name: clientInfo.name || 'Client Name',
                        address: clientInfo.address || 'Address Not Provided',
                    },
                    format: 'buffer',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate report');
            }

            const data = await response.json();
            if (data.success && data.data.base64) {
                // Convert base64 to blob and download
                const byteCharacters = atob(data.data.base64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = data.data.filename || 'HomeAssessment.pdf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Failed to download report. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const getSeverityColor = (severity: number) => {
        if (severity >= 4) return 'text-red-600 bg-red-50 border-red-200';
        if (severity === 3) return 'text-orange-600 bg-orange-50 border-orange-200';
        if (severity === 2) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-blue-600 bg-blue-50 border-blue-200';
    };

    const getSeverityLabel = (severity: number) => {
        if (severity >= 4) return 'Critical';
        if (severity === 3) return 'High';
        if (severity === 2) return 'Moderate';
        if (severity === 1) return 'Low';
        return 'None';
    };

    const getPriorityColor = (priority: number) => {
        if (priority === 4) return 'text-red-600 bg-red-50 border-red-200';
        if (priority === 3) return 'text-orange-600 bg-orange-50 border-orange-200';
        if (priority === 2) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-blue-600 bg-blue-50 border-blue-200';
    };

    const getPriorityLabel = (priority: number) => {
        if (priority === 4) return 'Urgent';
        if (priority === 3) return 'High';
        if (priority === 2) return 'Medium';
        return 'Low';
    };

    const handleExportExcel = () => {
        setIsExporting(true);
        try {
            const workbook = XLSX.utils.book_new();

            // Summary Sheet
            const summaryData = [
                ['Home Safety Assessment Report'],
                [''],
                ['Client Name', clientInfo.name || 'Not Provided'],
                ['Property Address', clientInfo.address || 'Not Provided'],
                ['Assessment Date', new Date().toLocaleDateString()],
                [''],
                ['Overall Safety Score', results.summary.overallSafetyScore],
                ['Critical Issues', results.summary.criticalIssuesCount],
                ['Total Recommendations', results.recommendations.length],
                ['Estimated Cost Range', `$${results.summary.estimatedTotalCost.low.toLocaleString()} - $${results.summary.estimatedTotalCost.high.toLocaleString()}`],
                [''],
                ['Confidence Metrics'],
                ['Overall Confidence', `${results.confidence.overall}%`],
                ['Image Quality', `${results.confidence.imageQuality}%`],
                ['Hazard Detection', `${results.confidence.hazardDetection}%`],
                ['Recommendations', `${results.confidence.recommendations}%`],
                [''],
                ['Primary Risk Areas'],
                ...results.summary.primaryRiskAreas.map(area => [area]),
            ];
            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

            // Hazards Sheet
            const hazardsData = [
                ['ID', 'Location', 'Specific Area', 'Category', 'Description', 'Severity', 'Confidence', 'Affects ADLs'],
                ...results.detectedHazards.map(h => [
                    h.id,
                    h.location.room,
                    h.location.specificArea || '',
                    h.category,
                    h.description,
                    h.severity,
                    `${h.confidence}%`,
                    h.affectsADLs.join(', '),
                ]),
            ];
            const hazardsSheet = XLSX.utils.aoa_to_sheet(hazardsData);
            XLSX.utils.book_append_sheet(workbook, hazardsSheet, 'Hazards');

            // Recommendations Sheet
            const recsData = [
                ['ID', 'Room', 'Category', 'Subcategory', 'Description', 'Priority', 'Modification Type', 'Materials Cost', 'Labor Cost', 'Total Cost', 'Specifications', 'Requires Permit', 'Requires Contractor'],
                ...results.recommendations.map(r => [
                    r.id,
                    r.room,
                    r.category,
                    r.subcategory,
                    r.description,
                    getPriorityLabel(r.priority),
                    r.modificationType,
                    `$${r.estimatedCost.materials}`,
                    `$${r.estimatedCost.labor}`,
                    `$${r.estimatedCost.total}`,
                    r.specifications || '',
                    r.requiresPermit ? 'Yes' : 'No',
                    r.requiresLicensedContractor ? 'Yes' : 'No',
                ]),
            ];
            const recsSheet = XLSX.utils.aoa_to_sheet(recsData);
            XLSX.utils.book_append_sheet(workbook, recsSheet, 'Recommendations');

            // Equipment Sheet
            const equipData = [
                ['ID', 'Name', 'Category', 'Description', 'Priority', 'Estimated Cost', 'Reduces Risk', 'Requires Installation', 'Requires Training'],
                ...results.equipmentSuggestions.map(e => [
                    e.id,
                    e.name,
                    e.category,
                    e.description,
                    getPriorityLabel(e.priority),
                    `$${e.estimatedCost}`,
                    e.reducesRisk,
                    e.requiresInstallation ? 'Yes' : 'No',
                    e.requiresTraining ? 'Yes' : 'No',
                ]),
            ];
            const equipSheet = XLSX.utils.aoa_to_sheet(equipData);
            XLSX.utils.book_append_sheet(workbook, equipSheet, 'Equipment');

            // ADL Assessment Sheet
            if (results.adl) {
                const adl = results.adl;
                const adlData = [
                    ['ADL Assessment'],
                    [''],
                    ['Independence Level', (adl.independenceLevel || 'Not Assessed').replace(/_/g, ' ')],
                    ['Total Score', adl.totalScore || 0],
                    ['Total Activities with Difficulty', adl.totalDifficulties || 0],
                    [''],
                    ['Activity', 'Difficulty Level', 'Needs Help', 'Notes'],
                    ['Bathing', adl.bathing?.difficultyLevel ?? '', adl.bathing?.needsHelp ? 'Yes' : 'No', adl.bathing?.notes || ''],
                    ['Dressing Upper Body', adl.dressingUpperBody?.difficultyLevel ?? '', adl.dressingUpperBody?.needsHelp ? 'Yes' : 'No', adl.dressingUpperBody?.notes || ''],
                    ['Dressing Lower Body', adl.dressingLowerBody?.difficultyLevel ?? '', adl.dressingLowerBody?.needsHelp ? 'Yes' : 'No', adl.dressingLowerBody?.notes || ''],
                    ['Transferring', adl.transferring?.difficultyLevel ?? '', adl.transferring?.needsHelp ? 'Yes' : 'No', adl.transferring?.notes || ''],
                    ['Eating', adl.eating?.difficultyLevel ?? '', adl.eating?.needsHelp ? 'Yes' : 'No', adl.eating?.notes || ''],
                    ['Toileting', adl.toileting?.difficultyLevel ?? '', adl.toileting?.needsHelp ? 'Yes' : 'No', adl.toileting?.notes || ''],
                    ['Walking', adl.walking?.difficultyLevel ?? '', adl.walking?.needsHelp ? 'Yes' : 'No', adl.walking?.notes || ''],
                    ['Grooming', adl.grooming?.difficultyLevel ?? '', adl.grooming?.needsHelp ? 'Yes' : 'No', adl.grooming?.notes || ''],
                ];
                const adlSheet = XLSX.utils.aoa_to_sheet(adlData);
                XLSX.utils.book_append_sheet(workbook, adlSheet, 'ADL Assessment');
            }

            // IADL Assessment Sheet
            if (results.iadl) {
                const iadl = results.iadl;
                const iadlData = [
                    ['IADL Assessment'],
                    [''],
                    ['Independence Level', (iadl.independenceLevel || 'Not Assessed').replace(/_/g, ' ')],
                    ['Total Score', iadl.totalScore || 0],
                    ['Total Activities with Difficulty', iadl.totalDifficulties || 0],
                    [''],
                    ['Activity', 'Difficulty Level', 'Needs Help', 'Notes'],
                    ['Preparing Meals', iadl.preparingMeals?.difficultyLevel ?? '', iadl.preparingMeals?.needsHelp ? 'Yes' : 'No', iadl.preparingMeals?.notes || ''],
                    ['Light Housework', iadl.lightHousework?.difficultyLevel ?? '', iadl.lightHousework?.needsHelp ? 'Yes' : 'No', iadl.lightHousework?.notes || ''],
                    ['Shopping', iadl.shopping?.difficultyLevel ?? '', iadl.shopping?.needsHelp ? 'Yes' : 'No', iadl.shopping?.notes || ''],
                    ['Using Telephone', iadl.usingTelephone?.difficultyLevel ?? '', iadl.usingTelephone?.needsHelp ? 'Yes' : 'No', iadl.usingTelephone?.notes || ''],
                    ['Managing Finances', iadl.managingFinances?.difficultyLevel ?? '', iadl.managingFinances?.needsHelp ? 'Yes' : 'No', iadl.managingFinances?.notes || ''],
                ];
                const iadlSheet = XLSX.utils.aoa_to_sheet(iadlData);
                XLSX.utils.book_append_sheet(workbook, iadlSheet, 'IADL Assessment');
            }

            // Falls Risk Assessment Sheet
            if (results.fallsRisk) {
                const fr = results.fallsRisk;
                const fallsData = [
                    ['Falls Risk Assessment'],
                    [''],
                    ['Has Fallen Past Year', fr.hasFallenPastYear ? 'Yes' : 'No'],
                    ['Number of Falls', fr.numberOfFalls || 0],
                    [''],
                    ['Risk Factors'],
                    ['History of Falls', fr.riskFactors?.historyOfFalls ? 'Yes' : 'No'],
                    ['Fear of Falling', fr.riskFactors?.fearOfFalling ? 'Yes' : 'No'],
                    ['Mobility Problems', fr.riskFactors?.mobilityProblems ? 'Yes' : 'No'],
                    ['Balance Problems', fr.riskFactors?.balanceProblems ? 'Yes' : 'No'],
                    ['Vision Problems', fr.riskFactors?.visionProblems ? 'Yes' : 'No'],
                    ['Cognitive Impairment', fr.riskFactors?.cognitiveImpairment ? 'Yes' : 'No'],
                    ['Medication Risks', fr.riskFactors?.medicationRisks ? 'Yes' : 'No'],
                    ['Incontinence', fr.riskFactors?.incontinence ? 'Yes' : 'No'],
                    ['Foot Problems', fr.riskFactors?.footProblems ? 'Yes' : 'No'],
                    ['Environmental Hazards', fr.riskFactors?.environmentalHazards ? 'Yes' : 'No'],
                ];
                const fallsSheet = XLSX.utils.aoa_to_sheet(fallsData);
                XLSX.utils.book_append_sheet(workbook, fallsSheet, 'Falls Risk');
            }

            // Mobility Assessment Sheet
            if (results.mobility) {
                const mob = results.mobility;
                const mobilityData = [
                    ['Mobility Assessment'],
                    [''],
                    ['Mobility Aids'],
                    ['Uses Wheelchair', mob.usesWheelchair?.frequency ? 'Yes' : 'No', 'Indoor', mob.usesWheelchair?.indoorUse ? 'Yes' : 'No', 'Outdoor', mob.usesWheelchair?.outdoorUse ? 'Yes' : 'No'],
                    ['Uses Walker', mob.usesWalker?.frequency ? 'Yes' : 'No', 'Indoor', mob.usesWalker?.indoorUse ? 'Yes' : 'No', 'Outdoor', mob.usesWalker?.outdoorUse ? 'Yes' : 'No'],
                    ['Uses Cane', mob.usesCane?.frequency ? 'Yes' : 'No', 'Indoor', mob.usesCane?.indoorUse ? 'Yes' : 'No', 'Outdoor', mob.usesCane?.outdoorUse ? 'Yes' : 'No'],
                    ['Other Device', mob.usesOtherDevice?.deviceType || 'None'],
                    [''],
                    ['Balance and Gait'],
                    ['Balance Issues', mob.balanceIssues ? 'Yes' : 'No', mob.balanceNotes || ''],
                    ['Gait Issues', mob.gaitIssues ? 'Yes' : 'No', mob.gaitNotes || ''],
                    [''],
                    ['Endurance'],
                    ['Can Walk One Block', mob.canWalkOneBlock ? 'Yes' : 'No'],
                    ['Can Climb Flight of Stairs', mob.canClimbFlightOfStairs ? 'Yes' : 'No'],
                    ['Rest Frequency', mob.restFrequency || 'Not Assessed'],
                ];
                const mobilitySheet = XLSX.utils.aoa_to_sheet(mobilityData);
                XLSX.utils.book_append_sheet(workbook, mobilitySheet, 'Mobility');
            }

            // Generate filename
            const clientNamePart = clientInfo.name
                ? clientInfo.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)
                : 'Assessment';
            const datePart = new Date().toISOString().split('T')[0];
            const filename = `HomeAssessment_${clientNamePart}_${datePart}.xlsx`;

            // Download
            XLSX.writeFile(workbook, filename);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('Failed to export to Excel. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleEmailReport = () => {
        const subject = encodeURIComponent(`Home Safety Assessment Report - ${clientInfo.name || 'Client'}`);

        const bodyLines = [
            `Home Safety Assessment Report`,
            ``,
            `Client: ${clientInfo.name || 'Not Provided'}`,
            `Address: ${clientInfo.address || 'Not Provided'}`,
            `Date: ${new Date().toLocaleDateString()}`,
            ``,
            `SUMMARY`,
            `-------`,
            `Overall Safety Score: ${results.summary.overallSafetyScore}/100`,
            `Critical Issues: ${results.summary.criticalIssuesCount}`,
            `Total Recommendations: ${results.recommendations.length}`,
            `Estimated Cost: $${results.summary.estimatedTotalCost.low.toLocaleString()} - $${results.summary.estimatedTotalCost.high.toLocaleString()}`,
            ``,
            `Top 3 Priorities:`,
            ...results.summary.topThreeRecommendations.map((rec, i) => `${i + 1}. ${rec}`),
            ``,
            `Primary Risk Areas: ${results.summary.primaryRiskAreas.join(', ')}`,
        ];

        // Add ADL Assessment Summary
        if (results.adl) {
            bodyLines.push(
                ``,
                `ADL ASSESSMENT`,
                `--------------`,
                `Independence Level: ${(results.adl.independenceLevel || 'Not Assessed').replace(/_/g, ' ')}`,
                `Total Score: ${results.adl.totalScore || 0}`,
                `Activities with Difficulty: ${results.adl.totalDifficulties || 0}`
            );
        }

        // Add IADL Assessment Summary
        if (results.iadl) {
            bodyLines.push(
                ``,
                `IADL ASSESSMENT`,
                `---------------`,
                `Independence Level: ${(results.iadl.independenceLevel || 'Not Assessed').replace(/_/g, ' ')}`,
                `Total Score: ${results.iadl.totalScore || 0}`,
                `Activities with Difficulty: ${results.iadl.totalDifficulties || 0}`
            );
        }

        // Add Falls Risk Summary
        if (results.fallsRisk) {
            bodyLines.push(
                ``,
                `FALLS RISK ASSESSMENT`,
                `---------------------`,
                `Has Fallen Past Year: ${results.fallsRisk.hasFallenPastYear ? 'Yes' : 'No'}`,
                `Number of Falls: ${results.fallsRisk.numberOfFalls || 0}`
            );
        }

        // Add Mobility Summary
        if (results.mobility) {
            const aids = [];
            if (results.mobility.usesWheelchair?.frequency) aids.push('Wheelchair');
            if (results.mobility.usesWalker?.frequency) aids.push('Walker');
            if (results.mobility.usesCane?.frequency) aids.push('Cane');
            if (results.mobility.usesOtherDevice?.deviceType) aids.push(results.mobility.usesOtherDevice.deviceType);

            bodyLines.push(
                ``,
                `MOBILITY ASSESSMENT`,
                `-------------------`,
                `Mobility Aids: ${aids.length > 0 ? aids.join(', ') : 'None'}`,
                `Balance Issues: ${results.mobility.balanceIssues ? 'Yes' : 'No'}`,
                `Gait Issues: ${results.mobility.gaitIssues ? 'Yes' : 'No'}`
            );
        }

        bodyLines.push(
            ``,
            `---`,
            `This is an automated summary. Download the full PDF report for complete details.`
        );

        const body = encodeURIComponent(bodyLines.join('\n'));

        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-card rounded-lg shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Assessment Results
                        </h2>
                        <p className="text-gray-600">
                            AI-powered analysis complete • HUD OAHMP Compliant
                        </p>
                    </div>
                    <button
                        onClick={onStartNew}
                        className="px-6 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        Start New Assessment
                    </button>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">
                            {results.summary.overallSafetyScore}
                        </div>
                        <div className="text-sm text-gray-700 mt-1">Safety Score</div>
                        <div className="text-xs text-gray-500 mt-1">(0-100)</div>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                        <div className="text-3xl font-bold text-red-600">
                            {results.summary.criticalIssuesCount}
                        </div>
                        <div className="text-sm text-gray-700 mt-1">Critical Issues</div>
                        <div className="text-xs text-gray-500 mt-1">Severity 4</div>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">
                            {results.recommendations.length}
                        </div>
                        <div className="text-sm text-gray-700 mt-1">Recommendations</div>
                        <div className="text-xs text-gray-500 mt-1">Total</div>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                            ${results.summary.estimatedTotalCost.low.toLocaleString()}-
                            {results.summary.estimatedTotalCost.high.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-700 mt-1">Cost Estimate</div>
                        <div className="text-xs text-gray-500 mt-1">Total Range</div>
                    </div>
                </div>

                {/* Confidence Scores */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Confidence Metrics</h3>
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>Overall</span>
                                <span>{results.confidence.overall}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600"
                                    style={{ width: `${results.confidence.overall}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>Image Quality</span>
                                <span>{results.confidence.imageQuality}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-600"
                                    style={{ width: `${results.confidence.imageQuality}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>Hazard Detection</span>
                                <span>{results.confidence.hazardDetection}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-orange-600"
                                    style={{ width: `${results.confidence.hazardDetection}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>Recommendations</span>
                                <span>{results.confidence.recommendations}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-600"
                                    style={{ width: `${results.confidence.recommendations}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-card rounded-lg shadow-lg overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex">
                        {[
                            { id: 'summary', label: 'Executive Summary', count: null },
                            { id: 'hazards', label: 'Detected Hazards', count: results.detectedHazards.length },
                            {
                                id: 'recommendations',
                                label: 'Recommendations',
                                count: results.recommendations.length,
                            },
                            {
                                id: 'equipment',
                                label: 'Equipment',
                                count: results.equipmentSuggestions.length,
                            },
                            { id: 'details', label: 'Details', count: null },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`
                  flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                `}
                            >
                                {tab.label}
                                {tab.count !== null && (
                                    <span
                                        className={`ml-2 px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-8">
                    {/* Summary Tab */}
                    {activeTab === 'summary' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Primary Risk Areas
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {results.summary.primaryRiskAreas.map((area, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-full border border-red-200"
                                        >
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Top 3 Priority Recommendations
                                </h3>
                                <div className="space-y-3">
                                    {results.summary.topThreeRecommendations.map((rec, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                                            <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                            <p className="text-sm text-gray-900">{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {results.detectedRooms.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Detected Rooms
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        {results.detectedRooms.map((room, idx) => (
                                            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                                                <div className="font-medium text-gray-900 capitalize">
                                                    {room.roomType.replace('_', ' ')}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {room.imageIds.length} image{room.imageIds.length !== 1 ? 's' : ''}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {room.confidence}% confidence
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {results.existingAccessibility.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Existing Accessibility Features
                                    </h3>
                                    <div className="space-y-2">
                                        {results.existingAccessibility.map((feature, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                                            >
                                                <div>
                                                    <div className="font-medium text-gray-900">{feature.feature}</div>
                                                    <div className="text-sm text-gray-600">{feature.location}</div>
                                                </div>
                                                <span
                                                    className={`px-3 py-1 text-xs font-medium rounded-full ${feature.condition === 'good'
                                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                                        : feature.condition === 'fair'
                                                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                                            : 'bg-red-50 text-red-700 border border-red-200'
                                                        }`}
                                                >
                                                    {feature.condition}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Hazards Tab */}
                    {activeTab === 'hazards' && (
                        <div className="space-y-4">
                            {results.detectedHazards.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg
                                        className="mx-auto h-12 w-12 text-green-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <h3 className="mt-2 text-lg font-medium text-gray-900">No hazards detected</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        The AI did not identify any significant safety hazards in the uploaded images.
                                    </p>
                                </div>
                            ) : (
                                results.detectedHazards
                                    .sort((a, b) => b.severity - a.severity)
                                    .map(hazard => (
                                        <div
                                            key={hazard.id}
                                            className={`border rounded-lg p-6 ${getSeverityColor(hazard.severity)}`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span
                                                            className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${getSeverityColor(
                                                                hazard.severity
                                                            )}`}
                                                        >
                                                            {getSeverityLabel(hazard.severity)} - Severity {hazard.severity}
                                                        </span>
                                                        <span className="px-3 py-1 text-xs font-medium bg-white rounded-full border border-gray-300">
                                                            {hazard.category.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        {hazard.location.room}
                                                        {hazard.location.specificArea && ` - ${hazard.location.specificArea}`}
                                                    </h4>
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    {hazard.confidence}% confidence
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-900 mb-3">{hazard.description}</p>

                                            {hazard.affectsADLs.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-current">
                                                    <div className="text-xs font-semibold text-gray-700 mb-2">
                                                        Affects Activities of Daily Living:
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {hazard.affectsADLs.map((adl, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 text-xs bg-white rounded border border-gray-300"
                                                            >
                                                                {adl}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                            )}
                        </div>
                    )}

                    {/* Recommendations Tab */}
                    {activeTab === 'recommendations' && (
                        <div className="space-y-4">
                            {results.recommendations.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">No recommendations available</p>
                                </div>
                            ) : (
                                results.recommendations
                                    .sort((a, b) => b.priority - a.priority)
                                    .map(rec => (
                                        <div
                                            key={rec.id}
                                            className={`border rounded-lg p-6 ${getPriorityColor(rec.priority)}`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span
                                                            className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${getPriorityColor(
                                                                rec.priority
                                                            )}`}
                                                        >
                                                            {getPriorityLabel(rec.priority)} Priority
                                                        </span>
                                                        <span className="px-3 py-1 text-xs font-medium bg-white rounded-full border border-gray-300">
                                                            {rec.modificationType}
                                                        </span>
                                                        <span className="px-3 py-1 text-xs font-medium bg-white rounded-full border border-gray-300">
                                                            {rec.category.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        {rec.room} - {rec.subcategory}
                                                    </h4>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-gray-900">
                                                        ${rec.estimatedCost.total.toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        Materials: ${rec.estimatedCost.materials.toLocaleString()} | Labor: $
                                                        {rec.estimatedCost.labor.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-900 mb-3">{rec.description}</p>

                                            {rec.specificLocation && (
                                                <p className="text-sm text-gray-700 mb-3">
                                                    <strong>Location:</strong> {rec.specificLocation}
                                                </p>
                                            )}

                                            <div className="bg-white bg-opacity-50 rounded p-3 mb-3">
                                                <p className="text-xs font-semibold text-gray-700 mb-1">
                                                    Why this is a priority:
                                                </p>
                                                <p className="text-sm text-gray-900">{rec.priorityJustification}</p>
                                            </div>

                                            {rec.specifications && (
                                                <div className="mb-3">
                                                    <p className="text-xs font-semibold text-gray-700 mb-1">
                                                        Specifications:
                                                    </p>
                                                    <p className="text-sm text-gray-900">{rec.specifications}</p>
                                                </div>
                                            )}

                                            {rec.productRecommendations && rec.productRecommendations.length > 0 && (
                                                <div className="mb-3">
                                                    <p className="text-xs font-semibold text-gray-700 mb-2">
                                                        Product Recommendations:
                                                    </p>
                                                    <ul className="text-sm text-gray-900 space-y-1">
                                                        {rec.productRecommendations.map((product, idx) => (
                                                            <li key={idx}>• {product}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-current">
                                                {rec.requiresLicensedContractor && (
                                                    <span className="px-2 py-1 text-xs bg-white rounded border border-gray-300">
                                                        ⚠️ Licensed contractor required
                                                    </span>
                                                )}
                                                {rec.requiresPermit && (
                                                    <span className="px-2 py-1 text-xs bg-white rounded border border-gray-300">
                                                        📋 Permit required
                                                    </span>
                                                )}
                                                {rec.requiresEnvironmentalReview && (
                                                    <span className="px-2 py-1 text-xs bg-white rounded border border-gray-300">
                                                        🌍 Environmental review required
                                                    </span>
                                                )}
                                                {rec.fallsRiskReduction !== 'none' && (
                                                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded border border-green-300">
                                                        🛡️ {rec.fallsRiskReduction} fall risk reduction
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    )}

                    {/* Equipment Tab */}
                    {activeTab === 'equipment' && (
                        <div className="space-y-4">
                            {results.equipmentSuggestions.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">No equipment suggestions available</p>
                                </div>
                            ) : (
                                results.equipmentSuggestions
                                    .sort((a, b) => b.priority - a.priority)
                                    .map(equip => (
                                        <div key={equip.id} className="border border-gray-200 rounded-lg p-6">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span
                                                            className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${getPriorityColor(
                                                                equip.priority
                                                            )}`}
                                                        >
                                                            {getPriorityLabel(equip.priority)} Priority
                                                        </span>
                                                        <span className="px-3 py-1 text-xs font-medium bg-gray-100 rounded-full">
                                                            {equip.category.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-lg font-semibold text-gray-900">{equip.name}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-gray-900">
                                                        ${equip.estimatedCost.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-900 mb-3">{equip.description}</p>

                                            <div className="bg-gray-50 rounded p-3 mb-3">
                                                <p className="text-xs font-semibold text-gray-700 mb-1">
                                                    Reduces Risk:
                                                </p>
                                                <p className="text-sm text-gray-900">{equip.reducesRisk}</p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {equip.requiresInstallation && (
                                                    <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200">
                                                        🔧 Installation required
                                                    </span>
                                                )}
                                                {equip.requiresTraining && (
                                                    <span className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded border border-purple-200">
                                                        📚 Training recommended
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    )}

                    {/* Details Tab */}
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            {results.limitations.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Assessment Limitations
                                    </h3>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <ul className="space-y-2">
                                            {results.limitations.map((limitation, idx) => (
                                                <li key={idx} className="text-sm text-yellow-800 flex items-start">
                                                    <span className="mr-2">⚠️</span>
                                                    <span>{limitation}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {results.additionalPhotosNeeded.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Additional Photos Recommended
                                    </h3>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <ul className="space-y-2">
                                            {results.additionalPhotosNeeded.map((photo, idx) => (
                                                <li key={idx} className="text-sm text-blue-800 flex items-start">
                                                    <span className="mr-2">📸</span>
                                                    <span>{photo}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {results.requiresProfessionalAssessment && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Professional Assessment Recommended
                                    </h3>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <svg
                                                className="h-6 w-6 text-red-600 mr-3 shrink-0"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                />
                                            </svg>
                                            <div>
                                                <p className="text-sm font-semibold text-red-800 mb-2">
                                                    In-Person Assessment Required
                                                </p>
                                                <p className="text-sm text-red-700">
                                                    {results.professionalAssessmentReason ||
                                                        'This home requires an in-person assessment by a qualified Occupational Therapist (OT) or Certified Aging-in-Place Specialist (CAPS) to properly evaluate complex safety concerns and provide comprehensive recommendations.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleDownloadPDF}
                                        disabled={isDownloading}
                                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDownloading ? 'Generating...' : 'Download PDF Report'}
                                    </button>
                                    <button
                                        onClick={handleExportExcel}
                                        disabled={isExporting}
                                        className="px-6 py-3 bg-white text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isExporting ? 'Exporting...' : 'Export to Excel'}
                                    </button>
                                    <button
                                        onClick={handleEmailReport}
                                        className="px-6 py-3 bg-white text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Email Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
