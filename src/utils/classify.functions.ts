import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  location: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(2000),
});

const SIGNAL_TYPES = ["water", "health", "climate", "infrastructure", "food"] as const;
const SEVERITIES = ["low", "medium", "high", "critical"] as const;

export type ClassifierResult = {
  type: (typeof SIGNAL_TYPES)[number];
  severity: (typeof SEVERITIES)[number];
  severityScore: number;
  estimatedAffected: number;
  summary: string;
  recommendedAction: string;
  matchedActor: string;
  estimatedCost: number;
  executionDays: number;
  impactScore: number;
};

export const classifyReport = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; result: ClassifierResult } | { ok: false; error: string }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ok: false, error: "AI service not configured." };

    const systemPrompt = `You are the discernment engine of Atlas Sanctum, a humanitarian coordination platform. You receive raw community reports of suffering and classify them into structured signals so responders can act.

You are precise, sober, and proportionate. Never exaggerate. Never minimise. If the report is vague, score conservatively.

Severity scoring rubric (0-1):
- low (0.20-0.45): localized inconvenience, no immediate threat
- medium (0.45-0.65): meaningful harm, response useful within days
- high (0.65-0.85): widespread or escalating harm, response needed in 24-72h
- critical (0.85-1.00): imminent risk to life or large displacement, hours matter

Signal types: water, health, climate, infrastructure, food.

Recommend an action that a real NGO could execute. Match it to a plausible actor (UNICEF, MSF, WaterAid, ACF, Red Cross, local NGOs etc). Estimate cost in USD and execution time in days based on the action's actual logistics.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "emit_signal",
          description: "Emit a structured suffering signal classification.",
          parameters: {
            type: "object",
            properties: {
              type: { type: "string", enum: SIGNAL_TYPES },
              severity: { type: "string", enum: SEVERITIES },
              severityScore: { type: "number", minimum: 0, maximum: 1 },
              estimatedAffected: { type: "integer", minimum: 1 },
              summary: { type: "string", description: "One-sentence neutral summary, ≤180 chars." },
              recommendedAction: { type: "string", description: "Concrete intervention, ≤140 chars." },
              matchedActor: { type: "string", description: "Plausible NGO or agency that could execute." },
              estimatedCost: { type: "integer", minimum: 0, description: "USD." },
              executionDays: { type: "integer", minimum: 0, maximum: 90 },
              impactScore: { type: "number", minimum: 0, maximum: 1, description: "Projected impact of the action." },
            },
            required: [
              "type", "severity", "severityScore", "estimatedAffected",
              "summary", "recommendedAction", "matchedActor",
              "estimatedCost", "executionDays", "impactScore",
            ],
            additionalProperties: false,
          },
        },
      },
    ];

    let response: Response;
    try {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Location: ${data.location}\n\nReport:\n${data.description}` },
          ],
          tools,
          tool_choice: { type: "function", function: { name: "emit_signal" } },
        }),
      });
    } catch (err) {
      console.error("AI gateway network error:", err);
      return { ok: false, error: "Could not reach the AI service." };
    }

    if (response.status === 429) return { ok: false, error: "Too many reports right now — try again in a moment." };
    if (response.status === 402) return { ok: false, error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." };
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("AI gateway error", response.status, text);
      return { ok: false, error: `AI service error (${response.status}).` };
    }

    const json = await response.json();
    const toolCall = json?.choices?.[0]?.message?.tool_calls?.[0];
    const argStr = toolCall?.function?.arguments;
    if (!argStr) {
      console.error("Missing tool call in AI response", JSON.stringify(json).slice(0, 500));
      return { ok: false, error: "AI did not return a structured classification." };
    }

    try {
      const parsed = JSON.parse(argStr) as ClassifierResult;
      return { ok: true, result: parsed };
    } catch (err) {
      console.error("Failed to parse tool args:", err, argStr);
      return { ok: false, error: "Could not parse AI response." };
    }
  });
