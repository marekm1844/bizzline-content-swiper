import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

// Separate prompts for LinkedIn and X
const LINKEDIN_PROMPT = `You are a professional LinkedIn content creator specializing in business and professional content.
Create an engaging post that:
1. Has a compelling title (max 80 characters). Do not include hashtags in the title.
2. Demonstrates thought leadership and industry expertise
3. Encourages professional discussion and engagement
4. Includes 1-2 relevant hashtags
5. Maintains a professional tone
6. Is between 400-600 characters

Return the response in this format exactly:
TITLE: [Your title here]
CONTENT: [Your content here]`;

const X_PROMPT = `You are a social media expert specializing in X (formerly Twitter) content.
Create an engaging post that:
1. Has a catchy, attention-grabbing title (max 50 characters)
2. Is concise and impactful
3. Uses appropriate emojis to enhance engagement
4. Includes 1-2 relevant hashtags
5. Stays within 280 characters total (including title)
6. Creates urgency or curiosity

Return the response in this format exactly:
TITLE: [Your title here]
CONTENT: [Your content here]`;

async function searchUnsplashImage(query: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&per_page=1`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch image from Unsplash");
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }

    // Fallback image if no results
    return "https://images.unsplash.com/photo-1560472354-b33ff0c44a43";
  } catch (error) {
    console.error("Error fetching Unsplash image:", error);
    // Return a default image on error
    return "https://images.unsplash.com/photo-1560472354-b33ff0c44a43";
  }
}

export async function POST(request: NextRequest) {
  try {
    const { articleUrl, platform, articleContent } = await request.json();

    // Select the appropriate prompt based on platform
    const systemPrompt = platform === "linkedin" ? LINKEDIN_PROMPT : X_PROMPT;

    // Generate title and content together
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Based on this article, create a ${platform} post: "${articleContent}"`,
        },
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content || "";

    // Parse the response using regular expressions
    const titleMatch = response.match(/TITLE:\s*([^\n]+)/);
    const contentMatch = response.match(/CONTENT:\s*([\s\S]+)$/);

    const title = titleMatch
      ? titleMatch[1].trim()
      : `${platform === "linkedin" ? "LinkedIn" : "X"} Post`;
    const content = contentMatch ? contentMatch[1].trim() : response;

    // Generate image keywords with platform-specific guidance
    const imageKeywordsResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            platform === "linkedin"
              ? "You are an expert at finding professional, business-oriented image keywords. Provide 2-3 keywords that would make a good professional image search query."
              : "You are an expert at finding engaging, attention-grabbing image keywords. Provide 2-3 keywords that would make a good social media image search query.",
        },
        {
          role: "user",
          content: `Create image search keywords for this ${platform} post: ${content}`,
        },
      ],
      temperature: 0.7,
    });

    // Get the image URL from Unsplash
    const imageKeywords =
      imageKeywordsResponse.choices[0].message.content ||
      "professional business";
    const imageUrl = await searchUnsplashImage(imageKeywords);

    return NextResponse.json({
      text: content,
      title: title,
      imagePrompt: imageKeywords,
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
