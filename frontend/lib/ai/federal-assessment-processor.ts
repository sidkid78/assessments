/**
 * Federal Home Assessment AI Processor
 * 
 * Uses Google Gemini 2.5 Flash to analyze home images and produce
 * HUD OAHMP compliant assessment reports.
 */

import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type } from '@google/genai';
import type {
    AIAssessmentInput,
    AIAssessmentOutput,
    RecommendedModification,
    AdaptiveEquipment,
    ADLAssessment,
    IADLAssessment,
    MobilityAssessment,
    FallsRiskAssessment,
} from '../types/federal-assessment';

// =============================================================================
// SYSTEM PROMPT - The core instruction set for Gemini
// =============================================================================

export const FEDERAL_ASSESSMENT_SYSTEM_PROMPT = `You are an expert AI assistant trained to perform home safety assessments for aging-in-place and disability accessibility programs. Your assessments must comply with federal program requirements including:

- HUD Older Adults Home Modification Program (OAHMP) - Program 14.921
- ACL Centers for Independent Living (CIL) standards
- Area Agency on Aging (AAA) assessment requirements
- CDC STEADI Fall Prevention Framework
- SAFER-HOME v3 Assessment Tool methodology

## YOUR ROLE

You are assisting Occupational Therapists (OTs), Certified Aging-in-Place Specialists (CAPS), and case workers by:
1. Analyzing photos of home environments for safety hazards
2. Identifying barriers to Activities of Daily Living (ADLs) and Instrumental ADLs (IADLs)
3. Recommending evidence-based home modifications
4. Estimating costs within federal program budget caps ($5,000 for OAHMP)
5. Prioritizing modifications by urgency and impact

## ASSESSMENT FRAMEWORK

### Activities of Daily Living (ADLs) - Katz Index
Assess how the home environment affects these 8 basic self-care activities:
1. **Bathing/Showering** - Tub/shower access, grab bars, non-slip surfaces
2. **Dressing Upper Body** - Closet accessibility, lighting, seating
3. **Dressing Lower Body** - Seating, reach to drawers, floor clearance  
4. **Transferring** - Bed height, chair firmness, grab bars
5. **Eating** - Table height, kitchen accessibility, seating
6. **Toileting** - Toilet height, grab bars, floor space, lighting
7. **Walking** - Floor hazards, lighting, doorway width, obstacles
8. **Grooming** - Mirror height, counter access, lighting, storage reach

### Instrumental ADLs (IADLs) - Lawton-Brody Scale
Assess how the home affects these 8 independent living activities:
1. **Preparing Meals** - Kitchen layout, appliance access, storage reach
2. **Light Housework** - Floor condition, storage, mobility paths
3. **Shopping** - Entry/exit access, package handling areas
4. **Using Telephone** - Device placement, seating, lighting
5. **Laundry** - Washer/dryer access, folding area, carrying path
6. **Transportation** - Garage/entry access, key management
7. **Medications** - Storage, lighting, counter space
8. **Managing Finances** - Desk/table access, lighting, seating

### Hazard Categories
Classify all hazards into these categories:
- \`fall_risk\` - Immediate fall danger (wet floors, loose rugs, clutter)
- \`accessibility\` - Barriers to movement (narrow doors, high thresholds)
- \`lighting\` - Inadequate illumination
- \`flooring\` - Surface conditions (uneven, slippery, worn)
- \`grab_bars_missing\` - No support where needed
- \`trip_hazard\` - Objects/transitions that could cause trips
- \`burn_risk\` - Hot surfaces, water temp, cooking hazards
- \`electrical\` - Outlet placement, cord hazards, switch access
- \`structural\` - Damage affecting safety (stairs, railings)
- \`plumbing\` - Faucet type, water control issues
- \`ventilation\` - Mold risk, air quality
- \`safety_devices\` - Missing smoke/CO detectors
- \`door_hardware\` - Knob type, lock access, swing direction
- \`storage_reach\` - Items too high/low to access safely
- \`other\` - Hazards not fitting other categories

### Severity Levels (0-4)
- **0 (None)**: No hazard present
- **1 (Low)**: Minor issue, low injury risk
- **2 (Moderate)**: Should be addressed, moderate risk
- **3 (High)**: Significant risk, prioritize fixing
- **4 (Critical)**: Immediate danger, fix before occupancy continues

### Priority Levels (1-4)
- **1 (Low)**: Address when convenient, minimal impact
- **2 (Medium)**: Should fix within 3-6 months
- **3 (High)**: Fix within 1-3 months, significant safety impact
- **4 (Urgent)**: Fix immediately, high injury/fall risk

## MODIFICATION CATEGORIES (HUD OAHMP Appendix B Aligned)

### Maintenance Items (Preferred - Lower Cost)
- Grab bars installation
- Handrails repair/installation
- Non-slip strips/mats
- Lever door handles
- Lighting improvements
- Smoke/CO detector installation
- Threshold modifications
- Cabinet hardware changes

### Rehabilitation Items (Higher Cost - Requires Justification)
- Tub cuts or walk-in shower conversion
- Comfort-height toilet installation
- Ramp construction
- Door widening
- Flooring replacement
- Stair lift installation

## COST ESTIMATION GUIDELINES (2024 Prices)

### Bathroom Modifications
- Grab bars (each): $50-150 materials, $75-150 labor
- Raised toilet seat: $30-80
- Comfort-height toilet: $200-400 + $150-300 labor
- Tub cut: $400-800
- Walk-in shower conversion: $2,500-5,000
- Handheld showerhead: $30-100 + $50-100 labor
- Non-slip strips: $20-50
- Shower chair: $40-150

### General Safety
- Smoke detector: $20-50 each
- CO detector: $30-60 each
- Motion-sensor lights: $25-75 each
- Lever door handles: $20-50 each + $30-50 labor
- Threshold ramps: $50-200

### Accessibility
- Interior ramp (per linear foot): $100-200
- Exterior ramp (per linear foot): $150-300
- Door widening: $500-1,500
- Stair railings (per linear foot): $50-100

### Flooring
- Non-slip treatment: $2-5 per sq ft
- Vinyl/LVP flooring: $3-8 per sq ft + labor
- Carpet removal: $1-2 per sq ft

## CRITICAL RULES

1. **Always identify bathroom hazards** - 91% of homes have bathroom hazards per HUD data
2. **Prioritize grab bars** - Most cost-effective fall prevention
3. **Stay within $5,000 cap** when possible - Flag if exceeding
4. **Distinguish maintenance vs rehabilitation** - Prefer maintenance items
5. **Consider the user's mobility** - Adjust recommendations if they use walker/wheelchair
6. **Be conservative with severity** - Don't over-alarm, but don't miss real hazards
7. **Provide actionable recommendations** - Specific products and placement
8. **Note limitations honestly** - What you can't assess from photos
9. **Recommend professional OT visit** when hazards are complex or safety-critical

## EXAMPLE HAZARD DESCRIPTIONS

GOOD: "Bathtub lacks grab bars on entry wall. Standard tub with no support for standing transfers. High fall risk for users with balance issues."

BAD: "Bathroom needs work."

GOOD: "Throw rug on hardwood floor in hallway between bedroom and bathroom. Creates trip hazard, especially for nighttime bathroom visits."

BAD: "Rug is a problem."`;


// =============================================================================
// JSON SCHEMA for Structured Output
// =============================================================================

export const ASSESSMENT_OUTPUT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        confidence: {
            type: Type.OBJECT,
            properties: {
                overall: { type: Type.NUMBER },
                imageQuality: { type: Type.NUMBER },
                hazardDetection: { type: Type.NUMBER },
                recommendations: { type: Type.NUMBER }
            },
        },
        detectedRooms: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    roomType: {
                        type: Type.STRING,
                        enum: ["bathroom", "bedroom", "kitchen", "living_room", "hallway", "entrance", "stairs", "laundry", "garage", "other"]
                    },
                    imageIds: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    confidence: { type: Type.NUMBER }
                },
            }
        },
        detectedHazards: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    imageId: { type: Type.STRING },
                    category: {
                        type: Type.STRING,
                        enum: ["fall_risk", "accessibility", "lighting", "flooring", "grab_bars_missing", "trip_hazard", "burn_risk", "electrical", "structural", "plumbing", "ventilation", "safety_devices", "door_hardware", "storage_reach", "other"]
                    },
                    description: { type: Type.STRING },
                    severity: { type: Type.INTEGER },
                    location: {
                        type: Type.OBJECT,
                        properties: {
                            room: { type: Type.STRING },
                            specificArea: { type: Type.STRING }
                        },
                    },
                    affectsADLs: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    confidence: { type: Type.NUMBER }
                },
            }
        },
        existingAccessibility: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    feature: { type: Type.STRING },
                    imageId: { type: Type.STRING },
                    location: { type: Type.STRING },
                    condition: {
                        type: Type.STRING,
                        enum: ["good", "fair", "poor"]
                    }
                },
            }
        },
        recommendations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    category: {
                        type: Type.STRING,
                        enum: ["bathroom", "grab_bars", "general_fall_prevention", "lighting", "flooring", "doors_interior", "doors_exterior", "kitchen", "accessibility", "stairs_railings", "ramps", "home_safety_devices", "electrical", "hvac_plumbing", "pathways_walkways", "adaptive_equipment", "miscellaneous_repairs"]
                    },
                    subcategory: { type: Type.STRING },
                    description: { type: Type.STRING },
                    room: { type: Type.STRING },
                    specificLocation: { type: Type.STRING },
                    addressesHazard: { type: Type.STRING },
                    affectedADLs: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    affectedIADLs: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    fallsRiskReduction: {
                        type: Type.STRING,
                        enum: ["none", "low", "moderate", "high"]
                    },
                    priority: { type: Type.INTEGER },
                    priorityJustification: { type: Type.STRING },
                    estimatedCost: {
                        type: Type.OBJECT,
                        properties: {
                            materials: { type: Type.NUMBER },
                            labor: { type: Type.NUMBER },
                            total: { type: Type.NUMBER }
                        },
                    },
                    modificationType: {
                        type: Type.STRING,
                        enum: ["maintenance", "rehabilitation"]
                    },
                    requiresLicensedContractor: { type: Type.BOOLEAN },
                    requiresPermit: { type: Type.BOOLEAN },
                    requiresEnvironmentalReview: { type: Type.BOOLEAN },
                    specifications: { type: Type.STRING },
                    productRecommendations: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                },
            }
        },
        equipmentSuggestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    category: {
                        type: Type.STRING,
                        enum: ["bathroom_large", "bathroom_small", "mobility_transfer", "kitchen_aids", "personal_care", "vision_aids", "hearing_aids", "organization", "safety_devices", "other"]
                    },
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    addressesADL: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    addressesIADL: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    reducesRisk: { type: Type.STRING },
                    estimatedCost: { type: Type.NUMBER },
                    requiresInstallation: { type: Type.BOOLEAN },
                    requiresTraining: { type: Type.BOOLEAN },
                    priority: { type: Type.INTEGER }
                },
            }
        },
        summary: {
            type: Type.OBJECT,
            properties: {
                overallSafetyScore: { type: Type.NUMBER },
                criticalIssuesCount: { type: Type.INTEGER },
                primaryRiskAreas: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                estimatedTotalCost: {
                    type: Type.OBJECT,
                    properties: {
                        low: { type: Type.NUMBER },
                        high: { type: Type.NUMBER }
                    },
                },
                topThreeRecommendations: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            },
        },
        limitations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        additionalPhotosNeeded: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        requiresProfessionalAssessment: { type: Type.BOOLEAN },
        professionalAssessmentReason: { type: Type.STRING }
    },
};

// =============================================================================
// GEMINI API INTEGRATION
// =============================================================================

interface GeminiConfig {
    apiKey?: string;
    model?: string;
    maxTokens?: number;
}

export async function analyzeHomeImages(
    input: AIAssessmentInput,
    config: GeminiConfig = {}
): Promise<AIAssessmentOutput> {
    // Initialize GoogleGenAI - will use GEMINI_API_KEY env var if apiKey not provided
    const ai = new GoogleGenAI({
        apiKey: config.apiKey || process.env.GEMINI_API_KEY
    });

    // Build the prompt with context
    const userPrompt = buildUserPrompt(input);

    // Prepare image parts
    const imageParts = await Promise.all(
        input.images.map(async (img) => {
            // If URL, fetch and convert to base64
            if (img.url.startsWith('http')) {
                const response = await fetch(img.url);
                const buffer = await response.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                const mimeType = response.headers.get('content-type') || 'image/jpeg';
                return {
                    inlineData: {
                        mimeType,
                        data: base64,
                    },
                };
            }
            // If already base64
            const base64Data = img.url.replace(/^data:image\/\w+;base64,/, '');
            return {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data,
                },
            };
        })
    );

    // Create the content parts - system instruction + user prompt + images
    const contents = [
        FEDERAL_ASSESSMENT_SYSTEM_PROMPT,
        userPrompt,
        ...imageParts,
    ];

    try {
        const response = await ai.models.generateContent({
            model: config.model || 'gemini-3-flash-preview',
            contents,
            config: {
                maxOutputTokens: config.maxTokens || 8192,
                temperature: 0.2, // Lower for more consistent structured output
                topP: 0.8,
                responseMimeType: 'application/json',
                responseSchema: ASSESSMENT_OUTPUT_SCHEMA,
                safetySettings: [
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                ],
            },
        });

        const text = response.text;

        if (!text) {
            throw new Error('Gemini API returned an empty response');
        }

        // Parse JSON response
        const parsed = JSON.parse(text) as AIAssessmentOutput;

        // Validate and enrich the response
        return validateAndEnrichOutput(parsed, input);
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error(`Failed to analyze images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// =============================================================================
// PROMPT BUILDER
// =============================================================================

function buildUserPrompt(input: AIAssessmentInput): string {
    let prompt = `## ASSESSMENT REQUEST

Please analyze the following ${input.images.length} image(s) of a home and provide a comprehensive safety assessment.

### Images Provided:
${input.images.map((img, i) => `- Image ${i + 1} (ID: ${img.id})${img.room ? ` - ${img.room}` : ''}${img.userNotes ? ` - User note: "${img.userNotes}"` : ''}`).join('\n')}
`;

    // Add client context if available
    if (input.selfReportedInfo) {
        prompt += `\n### Client Information:\n`;
        if (input.selfReportedInfo.age) {
            prompt += `- Age: ${input.selfReportedInfo.age} years old\n`;
        }
        if (input.selfReportedInfo.livesAlone !== undefined) {
            prompt += `- Lives alone: ${input.selfReportedInfo.livesAlone ? 'Yes' : 'No'}\n`;
        }
        if (input.selfReportedInfo.mobilityAids?.length) {
            prompt += `- Uses mobility aids: ${input.selfReportedInfo.mobilityAids.join(', ')}\n`;
        }
        if (input.selfReportedInfo.recentFalls) {
            prompt += `- Has fallen in past year: Yes (HIGH PRIORITY for fall prevention)\n`;
        }
        if (input.selfReportedInfo.primaryConcerns?.length) {
            prompt += `- Primary concerns: ${input.selfReportedInfo.primaryConcerns.join(', ')}\n`;
        }
        if (input.selfReportedInfo.currentMedicalConditions?.length) {
            prompt += `- Medical conditions: ${input.selfReportedInfo.currentMedicalConditions.join(', ')}\n`;
        }
    }

    // Add property context if available
    if (input.propertyInfo) {
        prompt += `\n### Property Information:\n`;
        if (input.propertyInfo.type) {
            prompt += `- Property type: ${input.propertyInfo.type}\n`;
        }
        if (input.propertyInfo.yearBuilt) {
            prompt += `- Year built: ${input.propertyInfo.yearBuilt}\n`;
        }
        if (input.propertyInfo.stories) {
            prompt += `- Stories: ${input.propertyInfo.stories}\n`;
        }
    }

    // Add comprehensive assessment data if available
    if (input.fullAssessment) {
        const fa = input.fullAssessment;

        if (fa.adlAssessment && fa.adlAssessment.totalScore !== undefined) {
            prompt += `\n### ADL Assessment (Katz Index):\n`;
            prompt += `- Total difficulty score: ${fa.adlAssessment.totalScore}/24 (higher = more difficulty)\n`;
            prompt += `- Independence level: ${fa.adlAssessment.independenceLevel || 'Not specified'}\n`;
            if (fa.adlAssessment.identifiedHazards?.length) {
                prompt += `- Client-identified ADL hazards: ${fa.adlAssessment.identifiedHazards.join(', ')}\n`;
            }
        }

        if (fa.iadlAssessment && fa.iadlAssessment.totalScore !== undefined) {
            prompt += `\n### IADL Assessment (Lawton-Brody Scale):\n`;
            prompt += `- Total difficulty score: ${fa.iadlAssessment.totalScore}/24\n`;
            prompt += `- Independence level: ${fa.iadlAssessment.independenceLevel || 'Not specified'}\n`;
            if (fa.iadlAssessment.identifiedHazards?.length) {
                prompt += `- Client-identified IADL hazards: ${fa.iadlAssessment.identifiedHazards.join(', ')}\n`;
            }
        }

        if (fa.mobilityAssessment) {
            prompt += `\n### Mobility Assessment:\n`;
            if (fa.mobilityAssessment.usesWheelchair?.frequency) {
                prompt += `- Wheelchair use: ${fa.mobilityAssessment.usesWheelchair.frequency > 2 ? 'Frequently' : 'Occasionally'}\n`;
            }
            if (fa.mobilityAssessment.usesWalker?.frequency) {
                prompt += `- Walker use: ${fa.mobilityAssessment.usesWalker.frequency > 2 ? 'Frequently' : 'Occasionally'}\n`;
            }
            if (fa.mobilityAssessment.balanceIssues) {
                prompt += `- ⚠️ Balance issues reported\n`;
            }
            if (fa.mobilityAssessment.gaitIssues) {
                prompt += `- ⚠️ Gait issues reported\n`;
            }
        }

        if (fa.fallsRiskAssessment) {
            prompt += `\n### Falls Risk Assessment (CDC STEADI):\n`;
            prompt += `- Overall risk level: ${fa.fallsRiskAssessment.overallRiskLevel?.toUpperCase() || 'Unknown'}\n`;
            if (fa.fallsRiskAssessment.hasFallenPastYear) {
                prompt += `- ⚠️ HAS FALLEN IN PAST YEAR (${fa.fallsRiskAssessment.numberOfFalls || 'unknown'} times) - HIGH PRIORITY\n`;
            }
            if (fa.fallsRiskAssessment.fallsEfficacyScore) {
                prompt += `- Falls efficacy score: ${fa.fallsRiskAssessment.fallsEfficacyScore}/40 (concern level about falling)\n`;
            }
        }

        if (fa.eligibility?.isEligible === false) {
            prompt += `\n### Program Eligibility Note:\n`;
            prompt += `- Client may not meet all program requirements. Focus on low-cost, high-impact modifications.\n`;
        }
    }

    // Add assessment context
    prompt += `\n### Assessment Context:\n`;
    prompt += `- Program type: ${input.assessmentContext.programType}\n`;
    prompt += `- Budget cap: $${input.assessmentContext.budgetCap || 5000}\n`;

    if (input.assessmentContext.priorityAreas?.length) {
        prompt += `- Priority areas to assess: ${input.assessmentContext.priorityAreas.join(', ')}\n`;
    }

    prompt += `\n### Instructions:
1. Carefully examine each image for safety hazards
2. Consider the client's ADL/IADL scores and falls risk level when prioritizing hazards
3. Identify which room/area each image shows
4. Note any existing accessibility features (grab bars, ramps, etc.)
5. List all hazards with severity and which ADLs/IADLs they specifically affect
6. Recommend specific modifications, prioritized by urgency and the client's functional limitations
7. Estimate costs and stay within the $${input.assessmentContext.budgetCap || 5000} budget cap when possible
8. Note any limitations in what you can assess from the images
9. Recommend professional OT assessment if warranted

Respond with valid JSON matching the required schema.`;

    return prompt;
}


// =============================================================================
// OUTPUT VALIDATION & ENRICHMENT
// =============================================================================

function validateAndEnrichOutput(
    output: AIAssessmentOutput,
    input: AIAssessmentInput
): AIAssessmentOutput {
    // Ensure all required fields exist
    const validated: AIAssessmentOutput = {
        confidence: {
            overall: output.confidence?.overall ?? 50,
            imageQuality: output.confidence?.imageQuality ?? 50,
            hazardDetection: output.confidence?.hazardDetection ?? 50,
            recommendations: output.confidence?.recommendations ?? 50,
        },
        detectedRooms: output.detectedRooms || [],
        detectedHazards: output.detectedHazards || [],
        existingAccessibility: output.existingAccessibility || [],
        recommendations: output.recommendations || [],
        equipmentSuggestions: output.equipmentSuggestions || [],
        summary: {
            overallSafetyScore: output.summary?.overallSafetyScore ?? 50,
            criticalIssuesCount: output.summary?.criticalIssuesCount ?? 0,
            primaryRiskAreas: output.summary?.primaryRiskAreas || [],
            estimatedTotalCost: output.summary?.estimatedTotalCost || { low: 0, high: 0 },
            topThreeRecommendations: output.summary?.topThreeRecommendations || [],
        },
        limitations: output.limitations || [],
        additionalPhotosNeeded: output.additionalPhotosNeeded || [],
        requiresProfessionalAssessment: output.requiresProfessionalAssessment ?? false,
        professionalAssessmentReason: output.professionalAssessmentReason,

        // Merged functional assessment data
        adl: input.fullAssessment?.adlAssessment as ADLAssessment | undefined,
        iadl: input.fullAssessment?.iadlAssessment as IADLAssessment | undefined,
        mobility: input.fullAssessment?.mobilityAssessment as MobilityAssessment | undefined,
        fallsRisk: input.fullAssessment?.fallsRiskAssessment as FallsRiskAssessment | undefined,
    };

    // Generate IDs if missing
    validated.detectedHazards = validated.detectedHazards.map((h, i) => ({
        ...h,
        id: h.id || `hazard-${i + 1}`,
    }));

    validated.recommendations = validated.recommendations.map((r, i) => ({
        ...r,
        id: r.id || `rec-${i + 1}`,
    }));

    validated.equipmentSuggestions = validated.equipmentSuggestions.map((e, i) => ({
        ...e,
        id: e.id || `equip-${i + 1}`,
    }));

    // Calculate summary stats if not provided
    if (!validated.summary.criticalIssuesCount) {
        validated.summary.criticalIssuesCount = validated.detectedHazards.filter(
            (h) => h.severity >= 4
        ).length;
    }

    // Ensure cost estimates are reasonable
    const totalCost = validated.recommendations.reduce(
        (sum, r) => sum + (r.estimatedCost?.total || 0),
        0
    );

    if (validated.summary.estimatedTotalCost.low === 0) {
        validated.summary.estimatedTotalCost = {
            low: Math.round(totalCost * 0.8),
            high: Math.round(totalCost * 1.2),
        };
    }

    // Flag if over budget
    const budgetCap = input.assessmentContext.budgetCap || 5000;
    if (totalCost > budgetCap && !validated.limitations.includes('Total cost exceeds program budget cap')) {
        validated.limitations.push(
            `Total recommended modifications ($${totalCost}) exceed program budget cap ($${budgetCap}). Prioritization required.`
        );
    }

    return validated;
}


// =============================================================================
// CONVENIENCE FUNCTION FOR NEXT.JS API ROUTES
// =============================================================================

export async function processAssessmentImages(
    images: Array<{ id: string; url: string; room?: string; userNotes?: string }>,
    options?: {
        clientAge?: number;
        livesAlone?: boolean;
        mobilityAids?: string[];
        recentFalls?: boolean;
        primaryConcerns?: string[];
        propertyType?: string;
        yearBuilt?: number;
        stories?: number;
        programType?: 'OAHMP' | 'CIL' | 'AAA' | 'CDBG' | 'OTHER';
        budgetCap?: number;
        priorityAreas?: string[];
        fullAssessment?: any; // Comprehensive assessment data
    }
): Promise<AIAssessmentOutput> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    const input: AIAssessmentInput = {
        images,
        selfReportedInfo: {
            age: options?.clientAge,
            livesAlone: options?.livesAlone,
            mobilityAids: options?.mobilityAids,
            recentFalls: options?.recentFalls,
            primaryConcerns: options?.primaryConcerns,
        },
        propertyInfo: {
            type: options?.propertyType,
            yearBuilt: options?.yearBuilt,
            stories: options?.stories,
        },
        assessmentContext: {
            programType: options?.programType || 'OAHMP',
            budgetCap: options?.budgetCap || 5000,
            priorityAreas: options?.priorityAreas,
        },
        fullAssessment: options?.fullAssessment,
    };

    return analyzeHomeImages(input, { apiKey });
}

// =============================================================================
// EXPORT TYPES
// =============================================================================

export type { AIAssessmentInput, AIAssessmentOutput };