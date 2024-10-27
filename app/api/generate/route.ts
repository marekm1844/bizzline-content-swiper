import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

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

    // Prepare the system prompt based on platform
    const systemPrompt =
      platform === "linkedin"
        ? "You are a professional social media content creator specializing in LinkedIn posts. Create engaging, professional content that encourages discussion and demonstrates thought leadership. Include relevant hashtags. Make it a short post, 4-5 sentences."
        : "You are a social media content creator specializing in Twitter posts. Create concise, engaging content within 280 characters. Include relevant hashtags and emojis where appropriate.";

    // Prepare the user prompt with the article content
    const userPrompt = `Based on this article: "${articleContent}", create a ${platform} post that engages the audience and drives discussion. For LinkedIn, focus on professional insights and industry relevance. For Twitter, be concise and use appropriate emojis.`;

    // Generate content using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    // Generate image search keywords
    const imageKeywordsResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at extracting relevant keywords for image search. Provide 2-3 most relevant keywords that would make a good image search query for the social media post. Return only the keywords, no explanation.",
        },
        {
          role: "user",
          content: `Create image search keywords for this ${platform} post: ${completion.choices[0].message.content}`,
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
      text: completion.choices[0].message.content,
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
