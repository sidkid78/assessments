AI-powered home safety assessment system compliant with HUD OAHMP, AAA, and CIL requirements.

## Installation

```bash
# Add the required dependency for PDF generation
pnpm add @react-pdf/renderer
```

## Environment Variables

```env
GEMINI_API_KEY=your-gemini-api-key
```

## API Endpoints

### 1. Analyze Images Only

**POST** `/api/assessments/federal`

Analyzes home images and returns structured assessment data.

```typescript
const response = await fetch('/api/assessments/federal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    images: [
      { id: 'img-1', url: 'https://...', room: 'bathroom' }
    ],
    client: {
      age: 72,
      livesAlone: true,
      recentFalls: true
    },
    config: {
      programType: 'OAHMP',
      budgetCap: 5000
    }
  })
});
```

### 2. Generate PDF Report

**POST** `/api/assessments/federal/report`

Generates a PDF report from existing assessment data.

```typescript
const response = await fetch('/api/assessments/federal/report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    assessment: assessmentData, // from /api/assessments/federal
    clientInfo: {
      name: 'John Smith',
      address: '123 Main St, Austin, TX'
    },
    programType: 'OAHMP',
    caseNumber: 'CT-2025-001'
  })
});

// Response is a PDF file
const blob = await response.blob();
```

### 3. Complete Pipeline (Recommended)

**POST** `/api/assessments/federal/complete`

One-stop endpoint: analyze images + generate PDF in one call.

```typescript
const response = await fetch('/api/assessments/federal/complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    images: [
      { id: 'img-1', url: 'https://...', room: 'bathroom' },
      { id: 'img-2', url: 'data:image/jpeg;base64,...', room: 'kitchen' }
    ],
    client: {
      name: 'Mary Johnson',
      address: '456 Oak Lane, Austin, TX 78702',
      age: 74,
      livesAlone: true,
      recentFalls: true,
      primaryConcerns: ['bathroom safety', 'lighting']
    },
    config: {
      programType: 'OAHMP',
      budgetCap: 5000
    },
    report: {
      organizationName: 'Central Texas AAA',
      caseNumber: 'CT-2025-001'
    }
  })
});

const result = await response.json();
// result.data.assessment - Full assessment data
// result.data.pdf.base64 - PDF as base64 string
// result.data.metadata - Processing stats
```

## Assessment Output Schema

The AI produces a structured output following this schema:

```typescript
interface AIAssessmentOutput {
  confidence: {
    overall: number;      // 0-100
    imageQuality: number;
    hazardDetection: number;
    recommendations: number;
  };
  
  detectedRooms: Array<{
    roomType: string;     // bathroom, bedroom, kitchen, etc.
    imageIds: string[];
    confidence: number;
  }>;
  
  detectedHazards: Array<{
    id: string;
    imageId: string;
    category: HazardCategory;  // fall_risk, grab_bars_missing, etc.
    description: string;
    severity: number;          // 0-4
    location: { room: string; specificArea?: string };
    affectsADLs: string[];     // bathing, walking, etc.
    confidence: number;
  }>;
  
  recommendations: Array<{
    id: string;
    category: string;          // grab_bars, bathroom, lighting, etc.
    description: string;
    room: string;
    priority: number;          // 1-4 (4 = urgent)
    estimatedCost: { materials: number; labor: number; total: number };
    modificationType: 'maintenance' | 'rehabilitation';
    fallsRiskReduction: 'none' | 'low' | 'moderate' | 'high';
    requiresLicensedContractor: boolean;
    requiresPermit: boolean;
  }>;
  
  summary: {
    overallSafetyScore: number;        // 0-100
    criticalIssuesCount: number;
    primaryRiskAreas: string[];
    estimatedTotalCost: { low: number; high: number };
    topThreeRecommendations: string[];
  };
  
  limitations: string[];
  requiresProfessionalAssessment: boolean;
}
```

## Compliance

This system is designed to comply with:

- **HUD OAHMP** (Program 14.921) - Older Adults Home Modification Program
- **Katz Index** - Activities of Daily Living assessment
- **Lawton-Brody Scale** - Instrumental ADL assessment
- **CDC STEADI** - Fall Prevention Framework
- **SAFER-HOME v3** - Home hazard assessment methodology

## File Structure

```
app/
├── lib/
│   ├── ai/
│   │   ├── index.ts                      # Module exports
│   │   ├── federal-assessment-processor.ts  # Gemini AI integration
│   │   └── federal-assessment-report.tsx    # PDF report components
│   └── types/
│       └── federal-assessment.ts         # TypeScript schemas
└── api/
    └── assessments/
        └── federal/
            ├── route.ts                  # Image analysis endpoint
            ├── report/
            │   └── route.ts              # PDF generation endpoint
            └── complete/
                └── route.ts              # Full pipeline endpoint
```

## Usage Example: Frontend Integration

```tsx
'use client';

import { useState } from 'react';

export function AssessmentForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  async function handleSubmit(images: File[], clientInfo: any) {
    setLoading(true);
    
    // Convert images to base64
    const imageData = await Promise.all(
      images.map(async (file, i) => {
        const base64 = await fileToBase64(file);
        return {
          id: `img-${i}`,
          url: base64,
          room: 'unknown'
        };
      })
    );
    
    const response = await fetch('/api/assessments/federal/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images: imageData,
        client: clientInfo,
        config: { programType: 'OAHMP' },
        report: { organizationName: 'HOMEase AI' }
      })
    });
    
    const data = await response.json();
    setResult(data);
    setLoading(false);
    
    // Download PDF
    if (data.data?.pdf?.base64) {
      downloadPdf(data.data.pdf.base64, data.data.pdf.filename);
    }
  }
  
  return (/* ... */);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

function downloadPdf(base64: string, filename: string) {
  const link = document.createElement('a');
  link.href = `data:application/pdf;base64,${base64}`;
  link.download = filename;
  link.click();
}
```

## Cost Estimation

The AI uses 2024 price data for cost estimates:

| Item | Materials | Labor | Total |
|------|-----------|-------|-------|
| Grab bar (each) | $50-150 | $75-150 | $125-300 |
| Comfort-height toilet | $200-400 | $150-300 | $350-700 |
| Tub cut | $400-800 | included | $400-800 |
| Handheld showerhead | $30-100 | $50-100 | $80-200 |
| Lever door handles | $20-50 | $30-50 | $50-100 |
| Smoke detector | $20-50 | $0-30 | $20-80 |
| Motion-sensor light | $25-75 | $30-50 | $55-125 |

## Budget Compliance

- **OAHMP Budget Cap**: $5,000 per household
- The system automatically flags when recommendations exceed the budget
- Recommendations are prioritized to fit within budget constraints
- Suggestions for supplemental funding sources are provided
`
}
Response

Successfully wrote to C:\Users\sidki\source\repos\homease-ai-new\homease-ai2\homease-ai\app\lib\ai\README.md
