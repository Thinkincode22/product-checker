import { GoogleGenerativeAI } from "@google/generative-ai";

export const compareImages = async (apiKey, image1Base64, image2Base64) => {
    if (!apiKey) throw new Error("API Key is required");

    const genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-2.5-flash for speed and cost efficiency
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are analyzing two shelf photos to detect missing products.
Image 1 is the "Stock" or "Reference" photo.
Image 2 is the "Current" photo to check.

Your task:
1. Identify ALL items that are MISSING in Image 2 that were in Image 1
2. For each missing item, provide its approximate bounding box in pixels

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "missing": [
    {
      "label": "item name or description",
      "box": [x1, y1, x2, y2]
    }
  ],
  "summary": "brief summary of what's missing"
}

Bounding box coordinates must be:
- x1, y1 = top-left corner pixel coordinates
- x2, y2 = bottom-right corner pixel coordinates
- Relative to Image 2 (the second photo)
- Reasonable estimate based on visual inspection

If nothing is missing, return: {"missing": [], "summary": "No missing items detected"}
  `;

    // Helper to remove data:image/png;base64, prefix if present
    const cleanBase64 = (b64) => b64.split(',')[1] || b64;

    const imageParts = [
        {
            inlineData: {
                data: cleanBase64(image1Base64),
                mimeType: "image/jpeg", // Assuming jpeg/png, API handles most standard types
            },
        },
        {
            inlineData: {
                data: cleanBase64(image2Base64),
                mimeType: "image/jpeg",
            },
        },
    ];

    try {
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();
        
        // Parse JSON response
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                console.log('[Gemini] Successfully parsed response:', parsed);
                return parsed;
            }
        } catch {
            console.warn("Could not parse JSON response, returning raw text:", text);
        }
        
        return { missing: [], summary: text };
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error(error.message || "Failed to compare images");
    }
};
