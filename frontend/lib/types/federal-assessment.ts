/**
 * Federal Home Modification Assessment Schema
 * 
 * Compliant with:
 * - HUD Older Adults Home Modification Program (OAHMP) - Program 14.921
 * - ACL Centers for Independent Living (CIL) requirements
 * - Area Agency on Aging (AAA) assessment standards
 * 
 * Based on:
 * - HUD OAHMP Evaluation Cohort 1 Interim Report (June 2023)
 * - Katz Index of Independence in ADLs
 * - Lawton-Brody IADL Scale
 * - CDC Home Safety Checklist
 * - SAFER-HOME v3 Assessment Tool
 */

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export const DIFFICULTY_LEVELS = {
    NONE: 0,           // No difficulty, no help needed
    SOME: 1,           // Some difficulty, but no help needed
    MUCH: 2,           // Much difficulty, but no help needed
    UNABLE: 3,         // Unable without help
} as const;

export const FREQUENCY_LEVELS = {
    NEVER: 0,
    RARELY: 1,
    SOMETIMES: 2,
    FREQUENTLY: 3,
    ALWAYS: 4,
} as const;

export const CONFIDENCE_LEVELS = {
    NOT_CONFIDENT: 1,
    FAIRLY_CONFIDENT: 2,
    FAIRLY_CONCERNED: 3,
    VERY_CONCERNED: 4,
} as const;

export const HAZARD_SEVERITY = {
    NONE: 0,
    LOW: 1,
    MODERATE: 2,
    HIGH: 3,
    CRITICAL: 4,
} as const;

export const PRIORITY_LEVELS = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    URGENT: 4,
} as const;

// =============================================================================
// CLIENT DEMOGRAPHICS (Required for eligibility)
// =============================================================================

export interface ClientDemographics {
    // Basic Info
    clientId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string; // ISO date
    age: number;
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';

    // Contact
    phone: string;
    phoneNumber?: string; // Alternative field name used in some components
    email?: string;
    preferredContactMethod: 'phone' | 'email' | 'mail';
    preferredLanguage: string;

    // Address
    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        county?: string;
    };

    // Race/Ethnicity (HUD required for reporting)
    race: Array<
        | 'white'
        | 'black_african_american'
        | 'american_indian_alaska_native'
        | 'asian'
        | 'native_hawaiian_pacific_islander'
        | 'other'
    >;
    ethnicity: 'hispanic_latino' | 'not_hispanic_latino';

    // Living Situation
    livesAlone: boolean;
    householdSize: number;
    adultsOver62: number;
    householdMembersOver62?: number; // Alternative field name
    hasCaregiver: boolean;
    caregiverRelationship?: string;
    primaryCaregiver?: string; // Alternative field name

    // Importance of aging in place (1-5 scale)
    agingInPlaceImportance: 1 | 2 | 3 | 4 | 5;
}

// =============================================================================
// ELIGIBILITY VERIFICATION (HUD OAHMP Requirements)
// =============================================================================

export interface EligibilityVerification {
    // Age requirement: 62+
    meetsAgeRequirement: boolean;

    // Homeownership
    isHomeowner: boolean;
    ownershipType: 'sole_owner' | 'joint_owner' | 'spouse_of_owner' | 'trust' | 'other';
    ownershipDocumentation: 'deed' | 'mortgage' | 'tax_records' | 'other';

    // Income (must be ≤80% AMI)
    householdIncome: number;
    areaMedianIncome: number;
    incomePercentOfAMI: number;
    meetsIncomeRequirement: boolean;
    incomeDocumentation: string[];

    // Property
    isPrimaryResidence: boolean;
    yearsAtResidence: number;

    // Overall eligibility
    isEligible: boolean;
    eligibilityNotes?: string;
    verifiedBy: string;
    verifiedDate: string;
}

// =============================================================================
// PROPERTY CHARACTERISTICS
// =============================================================================

export interface PropertyCharacteristics {
    propertyType:
    | 'single_family_detached'
    | 'single_family_attached'
    | 'manufactured_mobile'
    | 'condo_multiunit'
    | 'apartment'
    | 'other';
    homeType?: string; // Alternative field name used in some components

    yearBuilt?: number;
    squareFootage?: number;
    stories: number;
    numberOfStories?: number; // Alternative field name
    hasBasement: boolean;
    hasGarage: boolean;

    // Entry points
    primaryEntryType: 'ground_level' | 'steps' | 'ramp' | 'elevator';
    numberOfStepsToEntry: number;

    // Rooms
    bedrooms: number;
    bathrooms: number;
    halfBaths: number;

    // Current accessibility features
    existingAccessibilityFeatures: string[];
}

// =============================================================================
// ACTIVITIES OF DAILY LIVING (ADL) ASSESSMENT
// Katz Index of Independence - Standard for HUD/Medicare/Medicaid
// =============================================================================

export interface ADLAssessment {
    // Each ADL scored 0-3 (DIFFICULTY_LEVELS)
    bathing: {
        difficultyLevel: number;
        needsHelp: boolean;
        notes?: string;
        hazardsIdentified: string[];
    };

    dressingUpperBody: {
        difficultyLevel: number;
        needsHelp: boolean;
        notes?: string;
        hazardsIdentified: string[];
    };

    dressingLowerBody: {
        difficultyLevel: number;
        needsHelp: boolean;
        notes?: string;
        hazardsIdentified: string[];
    };

    transferring: { // Getting in/out of bed or chairs
        difficultyLevel: number;
        needsHelp: boolean;
        notes?: string;
        hazardsIdentified: string[];
    };

    eating: {
        difficultyLevel: number;
        needsHelp: boolean;
        notes?: string;
        hazardsIdentified: string[];
    };

    toileting: {
        difficultyLevel: number;
        needsHelp: boolean;
        notes?: string;
        hazardsIdentified: string[];
    };

    walking: { // Walking across small room
        difficultyLevel: number;
        needsHelp: boolean;
        notes?: string;
        hazardsIdentified: string[];
    };

    grooming: {
        difficultyLevel: number;
        needsHelp: boolean;
        notes?: string;
        hazardsIdentified: string[];
    };

    // Calculated scores
    totalDifficulties: number; // Count of ADLs with difficulty (0-8)
    totalScore: number; // Sum of difficulty levels (0-24, lower = more independent)
    identifiedHazards?: string[]; // Hazards identified across all activities
    independenceLevel:
    | 'fully_independent'
    | 'mostly_independent'
    | 'moderately_impaired'
    | 'significant_assistance'
    | 'dependent';
}

// =============================================================================
// INSTRUMENTAL ACTIVITIES OF DAILY LIVING (IADL) ASSESSMENT
// Lawton-Brody Scale - Required for comprehensive aging assessments
// =============================================================================

export interface IADLAssessment {
    preparingMeals: {
        difficultyLevel: number;
        needsHelp: boolean;
        notes?: string;
        hazardsIdentified: string[];
    };

    lightHousework: {
        difficultyLevel: number;
        needsHelp: boolean;
        notes?: string;
        hazardsIdentified: string[];
    };

    shopping: {
        difficultyLevel: number;
        needsHelp: boolean;
        notes?: string;
        hazardsIdentified: string[];
    };

    usingTelephone: {
        difficultyLevel: number;
        needsHelp: boolean;
        notes?: string;
        hazardsIdentified: string[];
    };

    laundry: {
        difficultyLevel: number;
        needsHelp: boolean;
        notes?: string;
        hazardsIdentified: string[];
    };

    transportation: {
        difficultyLevel: number;
        needsHelp: boolean;
        notes?: string;
        hazardsIdentified: string[];
    };

    medications: {
        difficultyLevel: number;
        needsHelp: boolean;
        notes?: string;
        hazardsIdentified: string[];
    };

    managingFinances: {
        difficultyLevel: number;
        needsHelp: boolean;
        notes?: string;
        hazardsIdentified: string[];
    };

    // Calculated scores
    totalDifficulties: number; // Count of IADLs with difficulty (0-8)
    totalScore: number; // Sum of difficulty levels (0-24, lower = more independent)
    identifiedHazards?: string[]; // Hazards identified across all activities
    independenceLevel:
    | 'fully_independent'
    | 'mostly_independent'
    | 'moderately_impaired'
    | 'significant_assistance'
    | 'dependent';
}

// =============================================================================
// MOBILITY ASSESSMENT
// =============================================================================

export interface MobilityAssessment {
    // Current mobility aids used
    usesWheelchair: {
        frequency: number; // FREQUENCY_LEVELS
        indoorUse: boolean;
        outdoorUse: boolean;
    };

    usesWalker: {
        frequency: number;
        indoorUse: boolean;
        outdoorUse: boolean;
    };

    usesCane: {
        frequency: number;
        indoorUse: boolean;
        outdoorUse: boolean;
    };

    usesOtherDevice: {
        deviceType?: string;
        frequency: number;
        indoorUse: boolean;
        outdoorUse: boolean;
    };

    // Balance and gait
    balanceIssues: boolean;
    balanceNotes?: string;

    gaitIssues: boolean;
    gaitNotes?: string;

    // Endurance
    canWalkOneBlock: boolean;
    canClimbFlightOfStairs: boolean;
    restFrequency: 'never' | 'occasionally' | 'frequently' | 'always';
}

// =============================================================================
// FALLS RISK ASSESSMENT
// CDC STEADI Framework Compliant
// =============================================================================

export interface FallsRiskAssessment {
    // Fall history (past 12 months)
    hasFallenPastYear: boolean;
    numberOfFalls: number;

    fallDetails: Array<{
        location: 'bathroom' | 'bedroom' | 'kitchen' | 'stairs' | 'entrance' | 'yard' | 'other';
        locationSpecific?: string;
        causedInjury: boolean;
        injuryType?: string;
        requiredMedicalAttention: boolean;
        wasHospitalized: boolean;
        nightsHospitalized?: number;
    }>;

    // Fear of falling (Falls Efficacy Scale - Short Form)
    // Each activity rated 1-10 (1 = very concerned, 10 = not concerned)
    fallsEfficacy: {
        cleaningHouse: number;
        gettingDressed: number;
        preparingMeals: number;
        takingBath: number;
        goingShopping: number;
        gettingInOutChair: number;
        goingUpDownStairs: number;
        walkingInNeighborhood: number;
        reachingInCabinets: number;
        answeringDoor: number;
        totalScore: number; // Sum 10-100, lower = more concerned
    };

    // Risk factors
    riskFactors: {
        historyOfFalls: boolean;
        fearOfFalling: boolean;
        mobilityProblems: boolean;
        balanceProblems: boolean;
        visionProblems: boolean;
        cognitiveImpairment: boolean;
        medicationRisks: boolean; // 4+ meds or psychoactive meds
        incontinence: boolean;
        footProblems: boolean;
        environmentalHazards: boolean;
    };

    // Summary
    overallRiskLevel: 'low' | 'moderate' | 'high';
    fallsEfficacyScore?: number; // Total score from fallsEfficacy section
    notes?: string;
}

// =============================================================================
// HOME HAZARD ASSESSMENT (By Room/Area)
// Based on SAFER-HOME v3 and CDC Home Safety Checklist
// =============================================================================

export interface RoomHazardAssessment {
    roomType: string;
    roomLocation?: string; // e.g., \"main floor\", \"upstairs\"

    hazards: Array<{
        hazardType: string;
        hazardCategory: HazardCategory;
        description: string;
        severity: number; // HAZARD_SEVERITY
        photoUrl?: string;
        affectsADL: string[]; // Which ADLs this hazard affects
        recommendedFix: string;
        estimatedCost: {
            low: number;
            high: number;
        };
        priority: number; // PRIORITY_LEVELS
    }>;

    overallCondition: 'good' | 'fair' | 'poor' | 'hazardous';
    accessibilityScore: number; // 0-100
    notes?: string;
}

export type HazardCategory =
    | 'fall_risk'
    | 'accessibility'
    | 'lighting'
    | 'flooring'
    | 'grab_bars_missing'
    | 'trip_hazard'
    | 'burn_risk'
    | 'electrical'
    | 'structural'
    | 'plumbing'
    | 'ventilation'
    | 'safety_devices'
    | 'door_hardware'
    | 'storage_reach'
    | 'other';

export interface HomeHazardAssessment {
    // Entry & Exterior
    frontEntrance: RoomHazardAssessment;
    backSideEntrance?: RoomHazardAssessment;
    pathwaysWalkways: RoomHazardAssessment;

    // Interior Common Areas
    hallwayFoyer: RoomHazardAssessment;
    livingRoom: RoomHazardAssessment;

    // Bathroom(s) - Most critical for HUD
    bathrooms: RoomHazardAssessment[];

    // Kitchen
    kitchen: RoomHazardAssessment;

    // Bedroom(s)
    bedrooms: RoomHazardAssessment[];

    // Stairs (if applicable)
    interiorStairs?: RoomHazardAssessment;
    exteriorStairs?: RoomHazardAssessment;

    // Laundry
    laundry?: RoomHazardAssessment;

    // General Safety Systems
    generalSafety: {
        smokeDetectorsWorking: boolean;
        smokeDetectorLocations: string[];
        coDetectorsWorking: boolean;
        coDetectorLocations: string[];
        waterHeaterTemp: number | null; // Should be ≤120°F
        fireExtinguisherPresent: boolean;
        emergencyNumbersPosted: boolean;
    };

    // Summary Statistics
    summary: {
        totalHazardsIdentified: number;
        criticalHazards: number;
        highPriorityHazards: number;
        moderateHazards: number;
        lowHazards: number;
        estimatedTotalCost: {
            low: number;
            high: number;
        };
        primaryConcernAreas: string[];
    };
}

// =============================================================================
// RECOMMENDED MODIFICATIONS
// Aligned with HUD OAHMP Appendix B categories
// =============================================================================

export interface RecommendedModification {
    id: string;
    category: ModificationCategory;
    subcategory: string;
    description: string;

    // Location
    room: string;
    specificLocation?: string;

    // Justification (critical for grant compliance)
    addressesHazard: string;
    affectedADLs: string[];
    affectedIADLs: string[];
    fallsRiskReduction: 'none' | 'low' | 'moderate' | 'high';

    // Priority
    priority: number; // PRIORITY_LEVELS
    priorityJustification: string;

    // Cost estimate
    estimatedCost: {
        materials: number;
        labor: number;
        total: number;
    };

    // Classification (HUD requirement)
    modificationType: 'maintenance' | 'rehabilitation';
    requiresLicensedContractor: boolean;
    requiresPermit: boolean;
    requiresEnvironmentalReview: boolean;

    // Photos
    beforePhotoUrl?: string;

    // Specifications
    specifications?: string;
    productRecommendations?: string[];
}

export type ModificationCategory =
    | 'bathroom'
    | 'grab_bars'
    | 'general_fall_prevention'
    | 'lighting'
    | 'flooring'
    | 'doors_interior'
    | 'doors_exterior'
    | 'kitchen'
    | 'accessibility'
    | 'stairs_railings'
    | 'ramps'
    | 'home_safety_devices'
    | 'electrical'
    | 'hvac_plumbing'
    | 'pathways_walkways'
    | 'adaptive_equipment'
    | 'miscellaneous_repairs';

// =============================================================================
// ADAPTIVE EQUIPMENT RECOMMENDATIONS
// =============================================================================

export interface AdaptiveEquipment {
    id: string;
    category: AdaptiveEquipmentCategory;
    name: string;
    description: string;

    // Purpose
    addressesADL: string[];
    addressesIADL: string[];
    reducesRisk: string;

    // Details
    estimatedCost: number;
    requiresInstallation: boolean;
    requiresTraining: boolean;

    // Priority
    priority: number;
}

export type AdaptiveEquipmentCategory =
    | 'bathroom_large' // Toilet risers, transfer benches, shower chairs
    | 'bathroom_small' // Grab bars, non-slip mats, handheld showerheads
    | 'mobility_transfer' // Bed rails, transfer poles, lift chairs
    | 'kitchen_aids'
    | 'personal_care'
    | 'vision_aids'
    | 'hearing_aids'
    | 'organization' // Declutter, storage solutions
    | 'safety_devices' // Medical alert, etc.
    | 'other';

// =============================================================================
// COMPLETE FEDERAL ASSESSMENT OUTPUT
// This is the main schema that our AI should produce
// =============================================================================

export interface FederalHomeAssessment {
    // Metadata
    assessmentId: string;
    assessmentDate: string;
    assessorType: 'OT' | 'OTA' | 'CAPS' | 'AI_ASSISTED';
    assessorName?: string;
    assessorCredentials?: string;

    // Status
    status: 'draft' | 'pending_review' | 'approved' | 'completed';
    version: number;

    // Client & Property
    client: ClientDemographics;
    eligibility: EligibilityVerification;
    property: PropertyCharacteristics;

    // Functional Assessments
    adlAssessment: ADLAssessment;
    iadlAssessment: IADLAssessment;
    mobilityAssessment: MobilityAssessment;
    fallsRiskAssessment: FallsRiskAssessment;

    // Home Assessment
    homeHazardAssessment: HomeHazardAssessment;

    // Recommendations
    recommendedModifications: RecommendedModification[];
    adaptiveEquipment: AdaptiveEquipment[];

    // Cost Summary
    costSummary: {
        totalEstimatedCost: number;
        withinOAHMPCap: boolean; // ≤$5,000
        modificationsTotal: number;
        equipmentTotal: number;

        // Breakdown by priority
        urgentCosts: number;
        highPriorityCosts: number;
        mediumPriorityCosts: number;
        lowPriorityCosts: number;

        // Potential funding sources
        oahmpEligible: number;
        requiresSupplementalFunding: boolean;
        supplementalAmountNeeded: number;
    };

    // Quality of Life Impact (for outcome tracking)
    projectedOutcomes: {
        expectedADLImprovement: string;
        expectedFallsReduction: string;
        expectedIndependenceIncrease: string;
        qualityOfLifeImpact: 'minimal' | 'moderate' | 'significant' | 'major';
    };

    // Executive Summary (for case workers/grant reports)
    executiveSummary: {
        overallAssessment: string;
        primaryConcerns: string[];
        topRecommendations: string[];
        estimatedTimelineWeeks: number;
        urgentActionsRequired: string[];
    };

    // Compliance & Documentation
    compliance: {
        meetsHUDRequirements: boolean;
        requiresEnvironmentalReview: boolean;
        environmentalReviewType?: 'categorical_exclusion' | 'environmental_assessment' | 'full_review';
        documentationComplete: boolean;
        missingDocuments: string[];
    };

    // Photos
    photos: Array<{
        id: string;
        url: string;
        room: string;
        hazardId?: string;
        caption: string;
        type: 'hazard' | 'context' | 'measurement';
    }>;

    // Timestamps
    createdAt: string;
    updatedAt: string;
    reviewedAt?: string;
    approvedAt?: string;
}

// =============================================================================
// SELF-REPORTED CLIENT INFO (for simplified intake forms)
// =============================================================================

export interface SelfReportedInfo {
    name?: string;
    address?: string;
    age?: number;
    livesAlone?: boolean;
    mobilityAids?: string[];
    recentFalls?: boolean;
    primaryConcerns?: string[];
    currentMedicalConditions?: string[];
}

// =============================================================================
// AI ANALYSIS INPUT (What we send to Gemini)
// =============================================================================

export interface AIAssessmentInput {
    // Images from user
    images: Array<{
        id: string;
        url: string;
        room?: string;
        userNotes?: string;
    }>;

    // Client self-reported info (if available)
    selfReportedInfo?: SelfReportedInfo;

    // Property info (if known)
    propertyInfo?: {
        type?: string;
        yearBuilt?: number;
        stories?: number;
    };

    // Assessment context
    assessmentContext: {
        programType: 'OAHMP' | 'CIL' | 'AAA' | 'CDBG' | 'OTHER';
        budgetCap?: number;
        priorityAreas?: string[];
    };

    // Full comprehensive assessment data (optional)
    fullAssessment?: {
        clientDemographics?: Partial<ClientDemographics>;
        eligibility?: Partial<EligibilityVerification>;
        propertyCharacteristics?: Partial<PropertyCharacteristics>;
        adlAssessment?: Partial<ADLAssessment>;
        iadlAssessment?: Partial<IADLAssessment>;
        mobilityAssessment?: Partial<MobilityAssessment>;
        fallsRiskAssessment?: Partial<FallsRiskAssessment>;
    };
}

// =============================================================================
// AI ANALYSIS OUTPUT (What Gemini returns - structured)
// =============================================================================

export interface AIAssessmentOutput {
    // Confidence in analysis
    confidence: {
        overall: number; // 0-100
        imageQuality: number;
        hazardDetection: number;
        recommendations: number;
    };

    // Functional Assessment Data (merged from input)
    adl?: ADLAssessment;
    iadl?: IADLAssessment;
    mobility?: MobilityAssessment;
    fallsRisk?: FallsRiskAssessment;

    // Detected rooms/areas
    detectedRooms: Array<{
        roomType: string;
        imageIds: string[];
        confidence: number;
    }>;

    // Hazards detected from images
    detectedHazards: Array<{
        id: string;
        imageId: string;
        category: HazardCategory;
        description: string;
        severity: number;
        location: {
            room: string;
            specificArea?: string;
            boundingBox?: { x: number; y: number; width: number; height: number };
        };
        affectsADLs: string[];
        confidence: number;
    }>;

    // Positive features detected
    existingAccessibility: Array<{
        feature: string;
        imageId: string;
        location: string;
        condition: 'good' | 'fair' | 'poor';
    }>;

    // Recommended modifications (prioritized)
    recommendations: RecommendedModification[];

    // Adaptive equipment suggestions
    equipmentSuggestions: AdaptiveEquipment[];

    // Summary for display
    summary: {
        overallSafetyScore: number; // 0-100
        criticalIssuesCount: number;
        primaryRiskAreas: string[];
        estimatedTotalCost: { low: number; high: number };
        topThreeRecommendations: string[];
    };

    // Limitations/caveats
    limitations: string[];
    additionalPhotosNeeded: string[];
    requiresProfessionalAssessment: boolean;
    professionalAssessmentReason?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function calculateADLScore(adl: ADLAssessment): number {
    const activities = [
        adl.bathing,
        adl.dressingUpperBody,
        adl.dressingLowerBody,
        adl.transferring,
        adl.eating,
        adl.toileting,
        adl.walking,
        adl.grooming,
    ];

    return activities.reduce((sum, activity) => sum + activity.difficultyLevel, 0);
}

export function calculateIADLScore(iadl: IADLAssessment): number {
    const activities = [
        iadl.preparingMeals,
        iadl.lightHousework,
        iadl.shopping,
        iadl.usingTelephone,
        iadl.laundry,
        iadl.transportation,
        iadl.medications,
        iadl.managingFinances,
    ];

    return activities.reduce((sum, activity) => sum + activity.difficultyLevel, 0);
}

export function calculateFallsEfficacyScore(fallsEfficacy: FallsRiskAssessment['fallsEfficacy']): number {
    return (
        fallsEfficacy.cleaningHouse +
        fallsEfficacy.gettingDressed +
        fallsEfficacy.preparingMeals +
        fallsEfficacy.takingBath +
        fallsEfficacy.goingShopping +
        fallsEfficacy.gettingInOutChair +
        fallsEfficacy.goingUpDownStairs +
        fallsEfficacy.walkingInNeighborhood +
        fallsEfficacy.reachingInCabinets +
        fallsEfficacy.answeringDoor
    );
}

export function isWithinOAHMPBudget(totalCost: number): boolean {
    return totalCost <= 5000;
}

export function getIndependenceLevel(score: number, maxScore: number): string {
    const percentage = score / maxScore;
    if (percentage <= 0.25) return 'independent';
    if (percentage <= 0.5) return 'moderate_assistance';
    if (percentage <= 0.75) return 'significant_assistance';
    return 'dependent';
}

export function prioritizeModifications(
    mods: RecommendedModification[],
    budget: number
): RecommendedModification[] {
    // Sort by priority (highest first), then by cost-effectiveness
    const sorted = [...mods].sort((a, b) => {
        if (b.priority !== a.priority) {
            return b.priority - a.priority;
        }
        // If same priority, prefer lower cost
        return a.estimatedCost.total - b.estimatedCost.total;
    });

    // Filter to fit within budget
    let runningTotal = 0;
    return sorted.filter(mod => {
        if (runningTotal + mod.estimatedCost.total <= budget) {
            runningTotal += mod.estimatedCost.total;
            return true;
        }
        return false;
    });
}

// =============================================================================
// UI STATE TYPES (for the assessment workflow)
// =============================================================================

export interface AssessmentImage {
    id: string;
    url: string;
    file?: File;
    room?: string;
    userNotes?: string;
    thumbnail?: string;
}

export interface AssessmentState {
    step:
    | 'upload'
    | 'demographics'
    | 'eligibility'
    | 'property'
    | 'adl'
    | 'iadl'
    | 'mobility'
    | 'falls-risk'
    | 'review'
    | 'processing'
    | 'results';
    images: AssessmentImage[];

    // Client Demographics (expanded)
    clientDemographics: Partial<ClientDemographics>;

    // Eligibility Verification
    eligibility: Partial<EligibilityVerification>;

    // Property Characteristics (expanded)
    propertyCharacteristics: Partial<PropertyCharacteristics>;

    // Functional Assessments
    adlAssessment: Partial<ADLAssessment>;
    iadlAssessment: Partial<IADLAssessment>;
    mobilityAssessment: Partial<MobilityAssessment>;
    fallsRiskAssessment: Partial<FallsRiskAssessment>;

    // Legacy fields (for backward compatibility)
    clientInfo: {
        name?: string;
        address?: string;
        age?: number;
        livesAlone?: boolean;
        mobilityAids?: string[];
        recentFalls?: boolean;
        primaryConcerns?: string[];
        currentMedicalConditions?: string[];
    };
    propertyInfo: {
        type?: string;
        yearBuilt?: number;
        stories?: number;
    };
    assessmentContext: {
        programType: 'OAHMP' | 'CIL' | 'AAA' | 'CDBG' | 'OTHER';
        budgetCap?: number;
        priorityAreas?: string[];
    };

    results?: AIAssessmentOutput;
    error?: string;
}