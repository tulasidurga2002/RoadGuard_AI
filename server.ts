import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini SDK on server only
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API endpoint: AI Damage Explanation
app.post('/api/gemini/explain-damage', async (req, res) => {
  try {
    const { damageType, confidence, severity, priorityScore, roadName, context } = req.body;

    if (!ai) {
      // Fallback explanation if key is not configured
      return res.json({
        explanation: `${damageType} detected with ${confidence}% confidence on ${roadName || 'the road'}. Based on structural severity (${severity}) and estimated traffic risk, this issue warrants inspection according to RoadGuard prioritization metrics.`,
        suggestedAction: severity === 'Critical' || priorityScore > 80
          ? 'Dispatch rapid response maintenance team for emergency safety patching within 24 hours.'
          : 'Schedule routine road inspection and surface sealing in the upcoming maintenance cycle.',
        urgency: severity === 'Critical' ? 'Immediate' : severity === 'High' ? 'Elevated' : 'Standard',
      });
    }

    const prompt = `You are the AI Road Infrastructure Assistant for "RoadGuard AI", an intelligent road damage detection and maintenance prioritization platform.
Generate a concise, professional engineering summary for the following detected road defect:
- Damage Type: ${damageType}
- YOLO Detection Confidence: ${confidence}%
- Severity Rating: ${severity}
- RoadGuard Maintenance Priority Score: ${priorityScore}/100
- Location: ${roadName || 'Urban roadway'}
- Additional Context: ${context || 'Normal traffic corridor'}

Provide:
1. "explanation": A clear 2-sentence summary explaining the defect, physical hazard (e.g. tire puncture risk, water seepage, structural sub-base erosion), and safety significance.
2. "suggestedAction": A specific engineering maintenance action (e.g., cold-mix asphalt patching, hot-pour crack sealant, milling and overlay, warning signage).
3. "urgency": "Immediate" | "Elevated" | "Standard" | "Monitored"

Return strictly valid JSON with keys: "explanation", "suggestedAction", "urgency".`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({
      explanation: parsed.explanation || `${damageType} identified at ${roadName}. Inspection recommended.`,
      suggestedAction: parsed.suggestedAction || 'Schedule field verification and surface repair.',
      urgency: parsed.urgency || 'Standard',
    });
  } catch (error: any) {
    console.error('Error generating explanation:', error);
    return res.json({
      explanation: 'Automated defect assessment generated based on detected geometrical dimensions and traffic risk indicators.',
      suggestedAction: 'Perform physical visual inspection to verify depth and structural compromise.',
      urgency: 'Elevated',
    });
  }
});

// API endpoint: AI Full Maintenance Report
app.post('/api/gemini/generate-report', async (req, res) => {
  try {
    const { reportId, damageType, confidence, severity, priorityScore, roadName, latitude, longitude, reportCount, description } = req.body;

    if (!ai) {
      return res.json({
        reportId,
        executiveSummary: `Civil engineering evaluation for RoadGuard Report ${reportId}. Defect classified as ${damageType} (${severity} severity) at ${roadName}. Maintenance priority calculated at ${priorityScore}/100 with ${reportCount || 1} verified citizen reports.`,
        subBaseRisk: severity === 'Critical' ? 'High potential for subsurface moisture ingress and base course degradation.' : 'Surface wear confined to wearing course.',
        recommendedMaterials: damageType.toLowerCase().includes('crack')
          ? ['Polymer-modified asphalt crack sealant (ASTM D6690)', 'Hot-air lance preparatory tool', 'Fine aggregate dusting']
          : ['Hot-mix asphalt (HMA) Superpave', 'Bituminous tack coat emulsion (SS-1h)', 'Vibratory plate compactor'],
        trafficMitigation: priorityScore > 70 ? 'Single-lane closure with arrow board during off-peak hours.' : 'Short-duration rolling work zone with safety cones.',
        estimatedWorkHours: priorityScore > 80 ? '3 - 5 hours' : '1 - 2 hours',
        disclaimer: 'This document is generated by RoadGuard AI as decision support. Final authorization requires field sign-off by a certified municipal engineer.',
      });
    }

    const prompt = `You are a municipal civil engineer and road asset manager. Generate a comprehensive Road Damage Maintenance Advisory for:
- Report ID: ${reportId}
- Damage Type: ${damageType}
- Severity: ${severity}
- Priority Score: ${priorityScore}/100
- Location: ${roadName} (GPS: ${latitude}, ${longitude})
- Number of Associated Reports: ${reportCount || 1}
- User Notes: ${description || 'None provided'}

Provide a JSON object with:
1. "executiveSummary": 2-3 sentences synthesizing the situation for district maintenance supervisors.
2. "subBaseRisk": Analysis of potential base/sub-base structural failure if unaddressed.
3. "recommendedMaterials": Array of 3-4 professional asphalt/concrete materials or tools needed.
4. "trafficMitigation": Traffic management requirement during repair (lane closures, flaggers, etc.).
5. "estimatedWorkHours": Estimated crew hours required (e.g. "2 - 4 hours").
6. "disclaimer": Standard engineering decision-support disclaimer.

Return strictly valid JSON matching these fields.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({ error: 'Failed to generate AI report' });
  }
});

// API endpoint: AI Dashboard Insights
app.post('/api/gemini/dashboard-insights', async (req, res) => {
  try {
    const { totalReports, criticalCount, resolvedCount, topDamageType, roadHealthScore } = req.body;

    if (!ai) {
      return res.json({
        summary: `Network Road Health index stands at ${roadHealthScore}/100. Key priority is addressing ${criticalCount} critical structural alerts, predominantly consisting of ${topDamageType}.`,
        keyObservations: [
          `${criticalCount} high-risk zones require immediate crew allocation to prevent vehicle hazard escalation.`,
          `${resolvedCount} repairs verified this quarter show positive maintenance turnaround.`,
          `Preventative crack sealing should be prioritized before rainy periods to arrest alligator crack spread.`,
        ],
        strategicRecommendation: 'Mobilize asphalt patching units to high-density corridor clusters.',
      });
    }

    const prompt = `Synthesize high-level municipal road network insights for RoadGuard AI Admin Dashboard:
- Total Logged Reports: ${totalReports}
- Critical Severity Issues: ${criticalCount}
- Resolved Maintenance Tasks: ${resolvedCount}
- Most Frequent Defect: ${topDamageType}
- Network Road Health Score: ${roadHealthScore}/100

Return a JSON object with:
1. "summary": A 2-sentence executive summary for municipal leadership.
2. "keyObservations": An array of 3 actionable observations.
3. "strategicRecommendation": 1 concrete operational directive for this week.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Error generating insights:', error);
    return res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'RoadGuard AI Platform',
    geminiConfigured: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RoadGuard AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
