import OpenAI from "openai";
import { foodAnalysisSchema, type FoodAnalysis } from "@/lib/validation/food";

const SYSTEM = `You are a nutrition estimation assistant. Given a photo of food, identify the most likely dish,
estimate the visible portion, and estimate calories and macros for THAT portion. Portion sizes from photos are
uncertain — reflect this in "confidence". If the image is not food, respond with confidence "low" and food_name "Not food".
Respond ONLY with JSON matching the schema.`;

export async function analyzeFoodImage(base64: string, mime: string): Promise<FoodAnalysis> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_VISION_MODEL || "gpt-4o-mini";
  const res = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "food_analysis",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            food_name: { type: "string" },
            estimated_portion: { type: "string" },
            calories: { type: "number" },
            protein_g: { type: "number" },
            carbs_g: { type: "number" },
            fat_g: { type: "number" },
            fiber_g: { type: "number" },
            confidence: { type: "string", enum: ["low", "medium", "high"] },
          },
          required: ["food_name", "estimated_portion", "calories", "protein_g", "carbs_g", "fat_g", "fiber_g", "confidence"],
        },
      },
    },
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: [
        { type: "text", text: "Analyze this meal." },
        { type: "image_url", image_url: { url: `data:${mime};base64,${base64}`, detail: "low" } },
      ] },
    ],
  });
  const raw = res.choices[0]?.message?.content ?? "";
  const parsed = foodAnalysisSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) throw new Error("AI returned an invalid response");
  return parsed.data;
}
