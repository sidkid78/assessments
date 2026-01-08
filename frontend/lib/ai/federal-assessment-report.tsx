/**
 * Federal Home Assessment PDF Report Generator
 * 
 * Generates HUD OAHMP compliant PDF reports from AI assessment outputs.
 * Uses @react-pdf/renderer for React-based PDF generation.
 * 
 * Install: pnpm add @react-pdf/renderer
 */

import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    Image,
} from '@react-pdf/renderer';
import type { AIAssessmentOutput, RecommendedModification, ADLAssessment, IADLAssessment, FallsRiskAssessment, MobilityAssessment } from '../types/federal-assessment';

// =============================================================================
// FONT REGISTRATION (Optional - for better typography)
// =============================================================================

// Register fonts if needed (uncomment and add font files)
// Font.register({
//   family: 'Inter',
//   fonts: [
//     { src: '/fonts/Inter-Regular.ttf' },
//     { src: '/fonts/Inter-Bold.ttf', fontWeight: 'bold' },
//   ],
// });

// =============================================================================
// STYLES
// =============================================================================

const colors = {
    primary: '#3b82f6', // Bright Blue (matching web theme)
    secondary: '#1e3a8a', // Dark Navy
    accent: '#f97316', // Orange
    text: '#1e293b',
    lightText: '#64748b',
    muted: '#64748b', // Restored for compatibility
    border: '#e2e8f0',
    background: '#ffffff',
    light: '#f8fafc', // Restored for compatibility
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    danger: '#ef4444', // Restored for compatibility (alias to error)
    white: '#ffffff',
    gray: '#f8fafc',
};

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: colors.text,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 10,
        color: colors.muted,
    },
    headerRight: {
        alignItems: 'flex-end',
    },

    // Sections
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },

    // Summary Box
    summaryBox: {
        backgroundColor: colors.light,
        padding: 15,
        borderRadius: 4,
        marginBottom: 20,
    },
    summaryTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
        color: colors.primary,
    },
    summaryText: {
        fontSize: 10,
        lineHeight: 1.5,
        marginBottom: 5,
    },
    summaryRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    summaryLabel: {
        width: '40%',
        fontWeight: 'bold',
        color: colors.secondary,
    },
    summaryValue: {
        width: '60%',
    },

    // Score Display
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    scoreCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    scoreNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    scoreLabel: {
        fontSize: 8,
        color: 'white',
    },
    scoreDescription: {
        flex: 1,
    },

    // Tables
    table: {
        marginBottom: 15,
        width: '100%',
        borderWidth: 1,
        borderColor: colors.border,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.light,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        alignItems: 'center',
        height: 24,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        alignItems: 'center',
        minHeight: 24,
    },
    tableCell: {
        padding: 5,
        fontSize: 9,
        borderRightWidth: 1,
        borderRightColor: colors.border,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    label: {
        fontSize: 10,
        color: colors.muted,
        marginBottom: 2,
    },
    value: {
        fontSize: 12,
        color: colors.text,
        fontWeight: 'bold',
    },
    subLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 5,
        marginBottom: 2,
    },
    text: {
        fontSize: 10,
        lineHeight: 1.4,
        color: colors.text,
    },

    tableHeaderCell: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 9,
    },
    tableRowAlt: {
        backgroundColor: colors.light,
    },

    // Hazard Card
    hazardCard: {
        marginBottom: 10,
        padding: 10,
        borderLeftWidth: 4,
        backgroundColor: colors.light,
    },
    hazardTitle: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    hazardDescription: {
        marginBottom: 4,
        color: colors.secondary,
    },
    hazardMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    // Badge
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 8,
        marginRight: 5,
    },

    // Recommendation Card
    recCard: {
        marginBottom: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 4,
    },
    recHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    recTitle: {
        fontWeight: 'bold',
        flex: 1,
    },
    recCost: {
        fontWeight: 'bold',
        color: colors.primary,
    },
    recBody: {
        marginBottom: 8,
    },
    recFooter: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 8,
        color: colors.muted,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 10,
    },

    // Utilities

    mb5: { marginBottom: 5 },
    mb10: { marginBottom: 10 },
    mb15: { marginBottom: 15 },
    bold: { fontWeight: 'bold' },
    italic: { fontStyle: 'italic' },
    textCenter: { textAlign: 'center' },
    textRight: { textAlign: 'right' },
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getSeverityColor(severity: number): string {
    if (severity >= 4) return colors.danger;
    if (severity >= 3) return colors.warning;
    if (severity >= 2) return '#f59e0b'; // Amber-500
    return colors.success;
}

function getPriorityLabel(priority: number): string {
    switch (priority) {
        case 4: return 'URGENT';
        case 3: return 'HIGH';
        case 2: return 'MEDIUM';
        default: return 'LOW';
    }
}

function getPriorityColor(priority: number): string {
    switch (priority) {
        case 4: return colors.danger;
        case 3: return colors.warning;
        case 2: return '#f59e0b';
        default: return colors.success;
    }
}

function getSafetyScoreColor(score: number): string {
    if (score >= 80) return colors.success;
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return colors.warning;
    return colors.danger;
}

function getSafetyScoreLabel(score: number): string {
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Needs Attention';
    return 'Critical';
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(date: Date = new Date()): string {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// =============================================================================
// DOCUMENT COMPONENTS
// =============================================================================

interface ReportProps {
    assessment: AIAssessmentOutput;
    clientName?: string;
    clientAddress?: string;
    assessmentDate?: Date;
    assessorName?: string;
    organizationName?: string;
    programType?: string;
    caseNumber?: string;
}

// Cover Page Component
const CoverPage: React.FC<ReportProps> = ({
    assessment,
    clientName = 'Client Name',
    clientAddress = 'Address Not Provided',
    assessmentDate = new Date(),
    assessorName = 'AI-Assisted Assessment',
    organizationName = 'HOMEase AI',
    programType = 'HUD OAHMP',
    caseNumber,
}) => (
    <Page size="LETTER" style={styles.page}>
        < View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.primary, marginBottom: 10 }}>
                Home Safety Assessment Report
            </Text>
            <Text style={{ fontSize: 14, color: colors.secondary, marginBottom: 40 }}>
                {programType} Compliant Assessment
            </Text>

            <View style={{
                backgroundColor: colors.light,
                padding: 30,
                borderRadius: 8,
                width: '80%',
                marginBottom: 40
            }}>
                <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 5 }}>Prepared For:</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 3 }}>{clientName}</Text>
                <Text style={{ fontSize: 11, color: colors.secondary, marginBottom: 15 }}>{clientAddress}</Text>

                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, color: colors.muted }}>Assessment Date</Text>
                        <Text style={{ fontSize: 11 }}>{formatDate(assessmentDate)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, color: colors.muted }}>Assessor</Text>
                        <Text style={{ fontSize: 11 }}>{assessorName}</Text>
                    </View>
                </View>

                {caseNumber && (
                    <View>
                        <Text style={{ fontSize: 9, color: colors.muted }}>Case Number</Text>
                        <Text style={{ fontSize: 11 }}>{caseNumber}</Text>
                    </View>
                )}
            </View>

            {/* Safety Score Preview */}
            <View style={{ alignItems: 'center', marginBottom: 30 }}>
                <View style={[
                    styles.scoreCircle,
                    {
                        backgroundColor: getSafetyScoreColor(assessment.summary.overallSafetyScore),
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                    }
                ]}>
                    <Text style={[styles.scoreNumber, { fontSize: 28 }]}>
                        {assessment.summary.overallSafetyScore}
                    </Text>
                    <Text style={styles.scoreLabel}>SAFETY</Text>
                </View>
                <Text style={{ fontSize: 12, color: colors.secondary, marginTop: 10 }}>
                    Overall Safety Score: {getSafetyScoreLabel(assessment.summary.overallSafetyScore)}
                </Text>
            </View>

            <Text style={{ fontSize: 10, color: colors.muted }}>
                Prepared by {organizationName}
            </Text>
        </View >

        <View style={styles.footer}>
            <Text>Confidential Assessment Report</Text>
            <Text>Page 1</Text>
        </View>
    </Page >
);

// Executive Summary Page
const ExecutiveSummaryPage: React.FC<{ assessment: AIAssessmentOutput; pageNumber: number }> = ({
    assessment,
    pageNumber
}) => (
    <Page size="LETTER" style={styles.page}>
        < View style={styles.header} >
            <View>
                <Text style={styles.headerTitle}>Executive Summary</Text>
                <Text style={styles.headerSubtitle}>Key Findings and Recommendations</Text>
            </View>
        </View >

        {/* Overall Metrics */}
        < View style={styles.section} >
            <View style={{ flexDirection: 'row', gap: 15 }}>
                {/* Safety Score */}
                <View style={{ flex: 1, backgroundColor: colors.light, padding: 15, borderRadius: 4 }}>
                    <Text style={{ fontSize: 9, color: colors.muted, marginBottom: 5 }}>SAFETY SCORE</Text>
                    <Text style={{
                        fontSize: 36,
                        fontWeight: 'bold',
                        color: getSafetyScoreColor(assessment.summary.overallSafetyScore)
                    }}>
                        {assessment.summary.overallSafetyScore}
                    </Text>
                    <Text style={{ fontSize: 10 }}>{getSafetyScoreLabel(assessment.summary.overallSafetyScore)}</Text>
                </View>

                {/* Hazards Found */}
                <View style={{ flex: 1, backgroundColor: colors.light, padding: 15, borderRadius: 4 }}>
                    <Text style={{ fontSize: 9, color: colors.muted, marginBottom: 5 }}>HAZARDS IDENTIFIED</Text>
                    <Text style={{ fontSize: 36, fontWeight: 'bold', color: colors.danger }}>
                        {assessment.detectedHazards.length}
                    </Text>
                    <Text style={{ fontSize: 10 }}>
                        {assessment.summary.criticalIssuesCount} Critical
                    </Text>
                </View>

                {/* Estimated Cost */}
                <View style={{ flex: 1, backgroundColor: colors.light, padding: 15, borderRadius: 4 }}>
                    <Text style={{ fontSize: 9, color: colors.muted, marginBottom: 5 }}>EST. TOTAL COST</Text>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary }}>
                        {formatCurrency(assessment.summary.estimatedTotalCost.low)}
                    </Text>
                    <Text style={{ fontSize: 10 }}>
                        to {formatCurrency(assessment.summary.estimatedTotalCost.high)}
                    </Text>
                </View>
            </View>
        </View >

        {/* Primary Risk Areas */}
        < View style={styles.section} >
            <Text style={styles.sectionTitle}>Primary Risk Areas</Text>
            {
                assessment.summary.primaryRiskAreas.map((area, i) => (
                    <View key={i} style={{ flexDirection: 'row', marginBottom: 5 }}>
                        <Text style={{ color: colors.danger, marginRight: 8 }}>●</Text>
                        <Text>{area}</Text>
                    </View>
                ))
            }
        </View >

        {/* Top Recommendations */}
        < View style={styles.section} >
            <Text style={styles.sectionTitle}>Top Recommendations</Text>
            {
                assessment.summary.topThreeRecommendations.map((rec, i) => (
                    <View key={i} style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' }}>
                        <View style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: colors.primary,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 10,
                        }}>
                            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{i + 1}</Text>
                        </View>
                        <Text style={{ flex: 1 }}>{rec}</Text>
                    </View>
                ))
            }
        </View >

        {/* Limitations */}
        {
            assessment.limitations.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Assessment Limitations</Text>
                    {assessment.limitations.map((limitation, i) => (
                        <View key={i} style={{ flexDirection: 'row', marginBottom: 3 }}>
                            <Text style={{ color: colors.warning, marginRight: 8 }}>⚠</Text>
                            <Text style={{ flex: 1, color: colors.secondary }}>{limitation}</Text>
                        </View>
                    ))}
                </View>
            )
        }

        {/* Professional Assessment Recommendation */}
        {
            assessment.requiresProfessionalAssessment && (
                <View style={{
                    backgroundColor: '#fef3c7',
                    padding: 12,
                    borderRadius: 4,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.warning,
                }}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
                        Professional Assessment Recommended
                    </Text>
                    <Text style={{ color: colors.secondary }}>
                        {assessment.professionalAssessmentReason ||
                            'A licensed Occupational Therapist should verify these findings before modifications begin.'}
                    </Text>
                </View>
            )
        }

        <View style={styles.footer}>
            <Text>Confidential Assessment Report</Text>
            <Text>Page {pageNumber}</Text>
        </View>
    </Page >
);

// Hazards Detail Page
const HazardsPage: React.FC<{ assessment: AIAssessmentOutput; pageNumber: number }> = ({
    assessment,
    pageNumber
}) => (
    <Page size="LETTER" style={styles.page}>
        < View style={styles.header} >
            <View>
                <Text style={styles.headerTitle}>Identified Hazards</Text>
                <Text style={styles.headerSubtitle}>{assessment.detectedHazards.length} hazards found</Text>
            </View>
        </View >

        {
            assessment.detectedHazards.map((hazard, i) => (
                <View
                    key={hazard.id}
                    style={[
                        styles.hazardCard,
                        { borderLeftColor: getSeverityColor(hazard.severity) }
                    ]}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                        <Text style={styles.hazardTitle}>
                            {hazard.location.room.replace(/_/g, ' ').toUpperCase()}
                            {hazard.location.specificArea && ` - ${hazard.location.specificArea}`}
                        </Text>
                        <View style={[
                            styles.badge,
                            { backgroundColor: getSeverityColor(hazard.severity) }
                        ]}>
                            <Text style={{ color: 'white' }}>
                                Severity: {hazard.severity}/4
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.hazardDescription}>{hazard.description}</Text>

                    <View style={styles.hazardMeta}>
                        <Text style={{ fontSize: 8, color: colors.muted }}>
                            Category: {hazard.category.replace(/_/g, ' ')}
                        </Text>
                        {hazard.affectsADLs.length > 0 && (
                            <Text style={{ fontSize: 8, color: colors.muted }}>
                                Affects: {hazard.affectsADLs.join(', ')}
                            </Text>
                        )}
                    </View>
                </View>
            ))
        }

        < View style={styles.footer} >
            <Text>Confidential Assessment Report</Text>
            <Text>Page {pageNumber}</Text>
        </View >
    </Page >
);

// Recommendations Page
const RecommendationsPage: React.FC<{
    recommendations: RecommendedModification[];
    title: string;
    pageNumber: number;
}> = ({
    recommendations,
    title,
    pageNumber
}) => (
        <Page size="LETTER" style={styles.page}>
            < View style={styles.header} >
                <View>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <Text style={styles.headerSubtitle}>{recommendations.length} modifications recommended</Text>
                </View>
            </View >

            {
                recommendations.map((rec, i) => (
                    <View key={rec.id} style={styles.recCard}>
                        <View style={styles.recHeader}>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                                    <View style={[
                                        styles.badge,
                                        { backgroundColor: getPriorityColor(rec.priority) }
                                    ]}>
                                        <Text style={{ color: 'white' }}>{getPriorityLabel(rec.priority)}</Text>
                                    </View>
                                    <Text style={{ fontSize: 8, color: colors.muted, marginLeft: 5 }}>
                                        {rec.category.replace(/_/g, ' ').toUpperCase()}
                                    </Text>
                                </View>
                                <Text style={styles.recTitle}>{rec.description}</Text>
                            </View>
                            <Text style={styles.recCost}>{formatCurrency(rec.estimatedCost.total)}</Text>
                        </View>

                        <View style={styles.recBody}>
                            <Text style={{ fontSize: 9, marginBottom: 3 }}>
                                <Text style={{ fontWeight: 'bold' }}>Location: </Text>
                                {rec.room}{rec.specificLocation ? ` - ${rec.specificLocation}` : ''}
                            </Text>
                            <Text style={{ fontSize: 9, marginBottom: 3 }}>
                                <Text style={{ fontWeight: 'bold' }}>Justification: </Text>
                                {rec.priorityJustification}
                            </Text>
                            <Text style={{ fontSize: 9 }}>
                                <Text style={{ fontWeight: 'bold' }}>Fall Risk Reduction: </Text>
                                {rec.fallsRiskReduction.toUpperCase()}
                            </Text>
                        </View>

                        <View style={styles.recFooter}>
                            <View style={[styles.badge, { backgroundColor: colors.light, borderWidth: 1, borderColor: colors.border }]}>
                                <Text style={{ fontSize: 7 }}>
                                    {rec.modificationType === 'maintenance' ? '🔧 Maintenance' : '🏗️ Rehabilitation'}
                                </Text>
                            </View>
                            {rec.requiresLicensedContractor && (
                                <View style={[styles.badge, { backgroundColor: '#dbeafe' }]}>
                                    <Text style={{ fontSize: 7, color: colors.primary }}>Licensed Contractor</Text>
                                </View>
                            )}
                            {rec.requiresPermit && (
                                <View style={[styles.badge, { backgroundColor: '#fef3c7' }]}>
                                    <Text style={{ fontSize: 7, color: colors.warning }}>Permit Required</Text>
                                </View>
                            )}
                        </View>

                        {/* Cost Breakdown */}
                        <View style={{ marginTop: 8, flexDirection: 'row', gap: 20 }}>
                            <Text style={{ fontSize: 8, color: colors.muted }}>
                                Materials: {formatCurrency(rec.estimatedCost.materials)}
                            </Text>
                            <Text style={{ fontSize: 8, color: colors.muted }}>
                                Labor: {formatCurrency(rec.estimatedCost.labor)}
                            </Text>
                        </View>
                    </View>
                ))
            }

            < View style={styles.footer} >
                <Text>Confidential Assessment Report</Text>
                <Text>Page {pageNumber}</Text>
            </View >
        </Page >
    );

// Cost Summary Page
const CostSummaryPage: React.FC<{ assessment: AIAssessmentOutput; budgetCap?: number; pageNumber: number }> = ({
    assessment,
    budgetCap = 5000,
    pageNumber
}) => {
    const totalCost = assessment.recommendations.reduce((sum, r) => sum + r.estimatedCost.total, 0);
    const urgentCost = assessment.recommendations
        .filter(r => r.priority === 4)
        .reduce((sum, r) => sum + r.estimatedCost.total, 0);
    const highCost = assessment.recommendations
        .filter(r => r.priority === 3)
        .reduce((sum, r) => sum + r.estimatedCost.total, 0);
    const mediumCost = assessment.recommendations
        .filter(r => r.priority === 2)
        .reduce((sum, r) => sum + r.estimatedCost.total, 0);
    const lowCost = assessment.recommendations
        .filter(r => r.priority === 1)
        .reduce((sum, r) => sum + r.estimatedCost.total, 0);

    const withinBudget = totalCost <= budgetCap;

    return (
        <Page size="LETTER" style={styles.page}>
            < View style={styles.header} >
                <View>
                    <Text style={styles.headerTitle}>Cost Summary</Text>
                    <Text style={styles.headerSubtitle}>Budget Analysis and Funding Recommendations</Text>
                </View>
            </View >

            {/* Budget Status */}
            < View style={
                [
                    styles.summaryBox,
                    {
                        borderLeftWidth: 4,
                        borderLeftColor: withinBudget ? colors.success : colors.warning,
                    }
                ]} >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={{ fontSize: 12, color: colors.muted }}>Total Estimated Cost</Text>
                        <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.primary }}>
                            {formatCurrency(totalCost)}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 10, color: colors.muted }}>OAHMP Budget Cap</Text>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{formatCurrency(budgetCap)}</Text>
                        <Text style={{
                            fontSize: 10,
                            color: withinBudget ? colors.success : colors.danger,
                            fontWeight: 'bold'
                        }}>
                            {withinBudget ? '✓ Within Budget' : `⚠ ${formatCurrency(totalCost - budgetCap)} Over Budget`}
                        </Text>
                    </View>
                </View>
            </View >

            {/* Cost by Priority */}
            < View style={styles.section} >
                <Text style={styles.sectionTitle}>Cost Breakdown by Priority</Text>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Priority Level</Text>
                        <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Items</Text>
                        <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Cost</Text>
                        <Text style={[styles.tableHeaderCell, { width: '25%' }]}>% of Total</Text>
                    </View>

                    {[
                        { label: 'URGENT', cost: urgentCost, count: assessment.recommendations.filter(r => r.priority === 4).length, color: colors.danger },
                        { label: 'HIGH', cost: highCost, count: assessment.recommendations.filter(r => r.priority === 3).length, color: colors.warning },
                        { label: 'MEDIUM', cost: mediumCost, count: assessment.recommendations.filter(r => r.priority === 2).length, color: '#f59e0b' },
                        { label: 'LOW', cost: lowCost, count: assessment.recommendations.filter(r => r.priority === 1).length, color: colors.success },
                    ].map((row, i) => (
                        <View key={i} style={[styles.tableRow, ...(i % 2 === 0 ? [styles.tableRowAlt] : [])]}>
                            <View style={{ width: '30%', flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 8, height: 8, backgroundColor: row.color, marginRight: 8, borderRadius: 2 }} />
                                <Text style={styles.tableCell}>{row.label}</Text>
                            </View>
                            <Text style={[styles.tableCell, { width: '20%' }]}>{row.count}</Text>
                            <Text style={[styles.tableCell, { width: '25%' }]}>{formatCurrency(row.cost)}</Text>
                            <Text style={[styles.tableCell, { width: '25%' }]}>
                                {totalCost > 0 ? `${Math.round((row.cost / totalCost) * 100)}%` : '0%'}
                            </Text>
                        </View>
                    ))}

                    <View style={[styles.tableRow, { backgroundColor: colors.light, fontWeight: 'bold' }]}>
                        <Text style={[styles.tableCell, { width: '30%', fontWeight: 'bold' }]}>TOTAL</Text>
                        <Text style={[styles.tableCell, { width: '20%', fontWeight: 'bold' }]}>
                            {assessment.recommendations.length}
                        </Text>
                        <Text style={[styles.tableCell, { width: '25%', fontWeight: 'bold' }]}>
                            {formatCurrency(totalCost)}
                        </Text>
                        <Text style={[styles.tableCell, { width: '25%', fontWeight: 'bold' }]}>100%</Text>
                    </View>
                </View>
            </View >

            {/* Funding Recommendation */}
            {
                !withinBudget && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Funding Recommendations</Text>
                        <View style={{ backgroundColor: '#fef3c7', padding: 12, borderRadius: 4 }}>
                            <Text style={{ marginBottom: 8 }}>
                                The total cost exceeds the OAHMP budget cap. Consider the following options:
                            </Text>
                            <View style={{ marginLeft: 10 }}>
                                <Text style={{ marginBottom: 4 }}>• Prioritize URGENT and HIGH priority items first</Text>
                                <Text style={{ marginBottom: 4 }}>• Apply for supplemental CDBG funding ({formatCurrency(totalCost - budgetCap)} needed)</Text>
                                <Text style={{ marginBottom: 4 }}>• Phase modifications over multiple grant cycles</Text>
                                <Text>• Seek additional funding from state/local programs</Text>
                            </View>
                        </View>
                    </View>
                )
            }

            {/* Equipment Costs */}
            {
                assessment.equipmentSuggestions.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Adaptive Equipment (Additional)</Text>
                        <Text style={{ fontSize: 9, color: colors.muted, marginBottom: 10 }}>
                            These items may be covered separately or require additional funding:
                        </Text>
                        {assessment.equipmentSuggestions.map((equip) => (
                            <View key={equip.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                <Text style={{ fontSize: 9 }}>{equip.name}</Text>
                                <Text style={{ fontSize: 9, color: colors.primary }}>{formatCurrency(equip.estimatedCost)}</Text>
                            </View>
                        ))}
                    </View>
                )
            }

            <View style={styles.footer}>
                <Text>Confidential Assessment Report</Text>
                <Text>Page {pageNumber}</Text>
            </View>
        </Page >
    );
};

// =============================================================================
// ADL ASSESSMENT PAGE
// =============================================================================

const ADLPage: React.FC<{ assessment: AIAssessmentOutput; pageNumber: number }> = ({ assessment, pageNumber }) => {
    if (!assessment.adl) return null;

    const adlItems: Array<{ key: keyof ADLAssessment; label: string }> = [
        { key: 'eating', label: 'Eating' },
        { key: 'dressingUpperBody', label: 'Dressing (Upper Body)' },
        { key: 'dressingLowerBody', label: 'Dressing (Lower Body)' },
        { key: 'bathing', label: 'Bathing' },
        { key: 'toileting', label: 'Toileting' },
        { key: 'transferring', label: 'Transferring' },
        { key: 'walking', label: 'Walking (Indoors)' },
        { key: 'grooming', label: 'Grooming' },
    ];

    const getDifficultyText = (level: number) => {
        switch (level) {
            case 0: return 'Independent';
            case 1: return 'Some Difficulty';
            case 2: return 'Great Difficulty';
            case 3: return 'Unable to Do';
            default: return 'Unknown';
        }
    };

    return (
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>ADL Assessment</Text>
                <Text style={styles.headerSubtitle}>Activities of Daily Living</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Independence Overview</Text>
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Overall Independence Level</Text>
                        <Text style={styles.value}>{(assessment.adl.independenceLevel || 'UNKNOWN').replace(/_/g, ' ').toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Total Score</Text>
                        <Text style={styles.value}>{assessment.adl.totalScore} / 24</Text>
                        <Text style={{ fontSize: 9, color: colors.muted }}>(Lower score = more independent)</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ADL Details</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableCell, { width: '30%' }]}>Activity</Text>
                        <Text style={[styles.tableCell, { width: '25%' }]}>Status</Text>
                        <Text style={[styles.tableCell, { width: '15%' }]}>Needs Help</Text>
                        <Text style={[styles.tableCell, { width: '30%' }]}>Notes</Text>
                    </View>
                    {adlItems.map(({ key, label }) => {
                        const activity = assessment.adl![key];
                        // Ensure we are only rendering valid activity objects
                        if (!activity || typeof activity !== 'object' || !('difficultyLevel' in activity)) return null;

                        // We need to treat 'activity' as 'any' or specific shape because TS might not narrow 'keyof ADLAssessment' perfectly 
                        // when iterating, or we can use a stricter type for 'activity' if we construct the array differently.
                        // For now, explicit property access on the union type is safe if we guard or cast.
                        const act = activity as { difficultyLevel: number; needsHelp: boolean; notes?: string };

                        return (
                            <View key={key} style={styles.tableRow}>
                                <Text style={[styles.tableCell, { width: '30%' }]}>{label}</Text>
                                <Text style={[styles.tableCell, { width: '25%' }]}>{getDifficultyText(act.difficultyLevel)}</Text>
                                <Text style={[styles.tableCell, { width: '15%' }]}>{act.needsHelp ? 'Yes' : 'No'}</Text>
                                <Text style={[styles.tableCell, { width: '30%', fontSize: 9 }]}>{act.notes || '-'}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            <View style={styles.footer}>
                <Text>Confidential Assessment Report</Text>
                <Text>Page {pageNumber}</Text>
            </View>
        </Page>
    );
};

// =============================================================================
// IADL ASSESSMENT PAGE
// =============================================================================

const IADLPage: React.FC<{ assessment: AIAssessmentOutput; pageNumber: number }> = ({ assessment, pageNumber }) => {
    if (!assessment.iadl) return null;

    const iadlItems: Array<{ key: keyof IADLAssessment; label: string }> = [
        { key: 'usingTelephone', label: 'Using Telephone' },
        { key: 'shopping', label: 'Shopping' },
        { key: 'preparingMeals', label: 'Food Preparation' },
        { key: 'lightHousework', label: 'Light Housekeeping' },
        { key: 'laundry', label: 'Laundry' },
        { key: 'transportation', label: 'Transportation' },
        { key: 'medications', label: 'Medications' },
        { key: 'managingFinances', label: 'Finances' },
    ];

    const getDifficultyText = (level: number) => {
        switch (level) {
            case 0: return 'Independent';
            case 1: return 'Some Difficulty';
            case 2: return 'Great Difficulty';
            case 3: return 'Unable to Do';
            default: return 'Unknown';
        }
    };

    return (
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>IADL Assessment</Text>
                <Text style={styles.headerSubtitle}>Instrumental Activities of Daily Living</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Independence Overview</Text>
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Overall Independence Level</Text>
                        <Text style={styles.value}>{(assessment.iadl.independenceLevel || 'UNKNOWN').replace(/_/g, ' ').toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Total Score</Text>
                        <Text style={styles.value}>{assessment.iadl.totalScore} / 24</Text>
                        <Text style={{ fontSize: 9, color: colors.muted }}>(Lower score = more independent)</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>IADL Details</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableCell, { width: '30%' }]}>Activity</Text>
                        <Text style={[styles.tableCell, { width: '25%' }]}>Status</Text>
                        <Text style={[styles.tableCell, { width: '15%' }]}>Needs Help</Text>
                        <Text style={[styles.tableCell, { width: '30%' }]}>Notes</Text>
                    </View>
                    {iadlItems.map(({ key, label }) => {
                        const activity = assessment.iadl![key];
                        if (!activity || typeof activity !== 'object' || !('difficultyLevel' in activity)) return null;

                        const act = activity as { difficultyLevel: number; needsHelp: boolean; notes?: string };

                        return (
                            <View key={key} style={styles.tableRow}>
                                <Text style={[styles.tableCell, { width: '30%' }]}>{label}</Text>
                                <Text style={[styles.tableCell, { width: '25%' }]}>{getDifficultyText(act.difficultyLevel)}</Text>
                                <Text style={[styles.tableCell, { width: '15%' }]}>{act.needsHelp ? 'Yes' : 'No'}</Text>
                                <Text style={[styles.tableCell, { width: '30%', fontSize: 9 }]}>{act.notes || '-'}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            <View style={styles.footer}>
                <Text>Confidential Assessment Report</Text>
                <Text>Page {pageNumber}</Text>
            </View>
        </Page>
    );
};

// =============================================================================
// FALLS RISK & MOBILITY PAGE
// =============================================================================

const FallsRiskPage: React.FC<{ assessment: AIAssessmentOutput; pageNumber: number }> = ({ assessment, pageNumber }) => {
    const { fallsRisk, mobility } = assessment;

    if (!fallsRisk || !mobility) return null;

    return (
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Falls Risk & Mobility</Text>
                <Text style={styles.headerSubtitle}>Assessment of Stability, Gait, and Fall Factors</Text>
            </View>

            {/* Falls History */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Falls History (Past 12 Months)</Text>
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>History of Falls</Text>
                        <Text style={styles.value}>{fallsRisk.hasFallenPastYear ? 'YES' : 'NO'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Number of Falls</Text>
                        <Text style={styles.value}>{fallsRisk.numberOfFalls}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Risk Category</Text>
                        <Text style={[styles.value, { color: fallsRisk.overallRiskLevel === 'high' ? colors.danger : colors.text }]}>
                            {fallsRisk.overallRiskLevel.toUpperCase()}
                        </Text>
                    </View>
                </View>
                {fallsRisk.fallDetails && fallsRisk.fallDetails.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.subLabel}>Fall Incidents:</Text>
                        {fallsRisk.fallDetails.map((fall, i) => (
                            <Text key={i} style={styles.text}>
                                • {fall.location} {fall.locationSpecific ? `(${fall.locationSpecific})` : ''} -
                                {fall.causedInjury ? ' Injury Reported' : ' No Injury'}
                            </Text>
                        ))}
                    </View>
                )}
            </View>

            {/* Mobility Aids */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mobility Equipment</Text>
                <View style={styles.row}>
                    {mobility.usesCane && mobility.usesCane.frequency > 0 && (
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Cane</Text>
                            <Text style={styles.text}>Used: {mobility.usesCane.indoorUse ? 'Indoors ' : ''}{mobility.usesCane.outdoorUse ? 'Outdoors' : ''}</Text>
                        </View>
                    )}
                    {mobility.usesWalker && mobility.usesWalker.frequency > 0 && (
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Walker</Text>
                            <Text style={styles.text}>Used: {mobility.usesWalker.indoorUse ? 'Indoors ' : ''}{mobility.usesWalker.outdoorUse ? 'Outdoors' : ''}</Text>
                        </View>
                    )}
                    {mobility.usesWheelchair && mobility.usesWheelchair.frequency > 0 && (
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Wheelchair</Text>
                            <Text style={styles.text}>Used: {mobility.usesWheelchair.indoorUse ? 'Indoors ' : ''}{mobility.usesWheelchair.outdoorUse ? 'Outdoors' : ''}</Text>
                        </View>
                    )}
                    {(!mobility.usesCane?.frequency && !mobility.usesWalker?.frequency && !mobility.usesWheelchair?.frequency) && (
                        <Text style={styles.text}>No mobility aids reported.</Text>
                    )}
                </View>
            </View>

            {/* Balance & Gait */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Balance & Gait Assessment</Text>
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Balance Issues</Text>
                        <Text style={styles.value}>{mobility.balanceIssues ? 'Yes' : 'No'}</Text>
                        {mobility.balanceNotes && <Text style={styles.text}>{mobility.balanceNotes}</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Gait Issues</Text>
                        <Text style={styles.value}>{mobility.gaitIssues ? 'Yes' : 'No'}</Text>
                        {mobility.gaitNotes && <Text style={styles.text}>{mobility.gaitNotes}</Text>}
                    </View>
                </View>
                <View style={{ marginTop: 10 }}>
                    <Text style={styles.label}>Endurance</Text>
                    <Text style={styles.text}>• Walk one block: {mobility.canWalkOneBlock ? 'Yes' : 'No'}</Text>
                    <Text style={styles.text}>• Climb stairs: {mobility.canClimbFlightOfStairs ? 'Yes' : 'No'}</Text>
                </View>
            </View>

            {/* Falls Efficacy */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Falls Efficacy Score (FES)</Text>
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Confidence Score</Text>
                        <Text style={styles.value}>{fallsRisk.fallsEfficacyScore || fallsRisk.fallsEfficacy?.totalScore || 'N/A'} / 100</Text>
                        <Text style={{ fontSize: 9, color: colors.muted }}>(Lower score = less confident / higher fear)</Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <Text>Confidential Assessment Report</Text>
                <Text>Page {pageNumber}</Text>
            </View>
        </Page>
    );
};

// =============================================================================
// MAIN DOCUMENT COMPONENT
// =============================================================================

export const FederalAssessmentReport: React.FC<ReportProps> = (props) => {
    const { assessment } = props;

    // Split recommendations into pages (max ~4 per page)
    const urgentHighRecs = assessment.recommendations.filter(r => r.priority >= 3);
    const mediumLowRecs = assessment.recommendations.filter(r => r.priority < 3);

    let pageNumber = 1;

    return (
        <Document>
            {/* Cover Page */}
            <CoverPage {...props} />

            {/* Executive Summary */}
            <ExecutiveSummaryPage assessment={assessment} pageNumber={++pageNumber} />

            {/* ADL Assessment */}
            <ADLPage assessment={assessment} pageNumber={++pageNumber} />

            {/* IADL Assessment */}
            <IADLPage assessment={assessment} pageNumber={++pageNumber} />

            {/* Falls Risk & Mobility */}
            <FallsRiskPage assessment={assessment} pageNumber={++pageNumber} />

            {/* Hazards (if any) */}
            {assessment.detectedHazards.length > 0 && (
                <HazardsPage assessment={assessment} pageNumber={++pageNumber} />
            )}

            {/* High Priority Recommendations */}
            {urgentHighRecs.length > 0 && (
                <RecommendationsPage
                    recommendations={urgentHighRecs}
                    title="Priority Recommendations"
                    pageNumber={++pageNumber}
                />
            )}

            {/* Other Recommendations */}
            {mediumLowRecs.length > 0 && (
                <RecommendationsPage
                    recommendations={mediumLowRecs}
                    title="Additional Recommendations"
                    pageNumber={++pageNumber}
                />
            )}

            {/* Cost Summary */}
            <CostSummaryPage
                assessment={assessment}
                budgetCap={props.programType === 'OAHMP' ? 5000 : undefined}
                pageNumber={++pageNumber}
            />
        </Document>
    );
};

export default FederalAssessmentReport;
