"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, ThumbsUp, ThumbsDown, Link, Send } from "lucide-react";
import { generateContent } from "@/lib/contentGenerator";
import { addToLibrary, ContentLibrary } from "@/lib/contentLibrary";
import Image from "next/image";
import { Article } from "@/lib/types";
import { marked } from "marked";

const EXAMPLE_ARTICLES: Article[] = [
  {
    title: "Mastercard shifts B2B marketing focus",
    url: "https://www.marketingweek.com/mastercard-b2b-marketing/",
    description:
      "Mastercard’s sales team used to inundate marketing with requests for “pretty pictures” but the brand’s B2B marketing lead has redefined its role by prioritising human relationships.",
    image:
      "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=2787&auto=format&fit=crop",
    content: `Mastercard has completely overhauled its B2B marketing function over the past seven years, releasing it from its former role as service provider to sales to a team deemed critical to growth.

On joining Mastercard as its vice-president of B2B marketing in 2017, Lisa Maxwell, said the B2B marketing function was still “in its infancy” and the wider business, in particular sales, thought the role of its B2B marketers was simply to provide “pretty pictures”.

Talking at the IAA B2B Brand Summit in London yesterday (17 October), she said the sales team would often say “I need to go to a customer tomorrow, please could you make the deck look nice?”.

Seven years on, the marketing function has developed hugely and she believes this has come from prioritising human relationships, both with B2B buyers and internal stakeholders.

She started by running an employee survey to get better insights into the issues. One of the sentiments that came out was that the sales team did not feel capable of talking about all the products and solutions in an effective way.

To combat this, the marketing function decided to “join hands” with the sales team and the Mastercard employee training function to tackle the problem together, rather than attempt to solve the issue alone.

She said this process of coming together involved building foundational materials for the sales team that everyone could use to gain a better understanding of the B2B solutions offered by the business.

Maxwell added that the sales excellence team could then measure the sentiment from the sales team before and after the training to get data on the developing confidence of the sales function. “Now, the sales teams feel extremely conversant on all the products and solutions,” she said, adding that the joined-up approach to training has become one of the systems that Mastercard employs “consistently” to create a synergy between teams.
## Looking outwards
From a consumer point of view, Mastercard is a well-known brand. Many people have a card featuring its distinct red and yellow logo in their wallet and the proposition is clear. But the B2B challenge is more nuanced, Maxwell said. 

On joining the brand, she was tasked with helping businesses better understand that Mastercard is “more than just a card company”, and that its offer also includes other financial solutions and services for businesses.

Once internal stakeholder relationships had improved, Maxwell then took the same approach of prioritisng human relationships to help develop the brand’s B2B business with customers.

“When you go to a client meeting with LinkedIn, for instance, you’re meeting a person who happens to work in an organisation, but you have to think, ‘how do I talk to you as a whole person, as someone who probably has a Mastercard in their pocket, but who is also interested in buying a service or solution from Mastercard’,” she said.

She added it’s crucial to begin by connecting on a human level and then extending this to the services and solutions Mastercard can provide.
One of the ways the business centres the human aspect is by carefully considering what consumers and partner businesses want.

During the Grammys, for example, Mastercard joined forces with ride-sharing company Lyft, one of its B2B partners, to launch a purpose-driven campaign to encourage more people to use Mastercard – every time someone at the event paid for Lyft with their Mastercard, a tree would be planted. The campaign also linked to social good, which helped engage consumers emotionally, she said.

Maxwell said the goal of the partnership was to understand and unite the aims of both consumers and partner businesses. She added: “This shows how centring the human in the story helps both the consumer side and the B2B side of the business.”`,
  },
  {
    title: "Custom URL",
    url: "",
    description: "Enter your own article URL",
    content: "",
  },
];

interface ContentSwiperProps {
  onSaveContent: (library: ContentLibrary) => void;
  contentLibrary: ContentLibrary;
}

export default function ContentSwiper({
  onSaveContent,
  contentLibrary,
}: ContentSwiperProps) {
  const [articleUrl, setArticleUrl] = useState("");
  const [platform, setPlatform] = useState("linkedin");
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState("custom");
  const [selectedArticleData, setSelectedArticleData] =
    useState<Article | null>(null);

  const handleArticleSelect = (value: string) => {
    setSelectedArticle(value);
    if (value !== "custom") {
      const article = EXAMPLE_ARTICLES.find((a) => a.url === value);
      if (article) {
        setArticleUrl(article.url);
        setSelectedArticleData(article);
      }
    } else {
      setArticleUrl("");
      setSelectedArticleData(null);
    }
  };

  const handleGenerate = async () => {
    if (!isValidUrl(articleUrl)) {
      toast("Incorrect URL format", {
        style: { background: "red", color: "white" },
      });
      return;
    }

    setIsGenerating(true);
    try {
      const generatedContent = await generateContent(articleUrl, platform);
      setContent(generatedContent);
    } catch (error) {
      toast("Failed to generate content. Please try again.", {
        style: { background: "red", color: "white" },
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSwipe = async (liked: boolean) => {
    if (liked) {
      const urlName = new URL(articleUrl).hostname;
      const updatedLibrary = addToLibrary(contentLibrary, urlName, content);
      onSaveContent(updatedLibrary);
      toast("The content has been added to your library.", {
        style: { background: "green", color: "white" },
      });
    }
    await handleGenerate();
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Generate Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedArticle} onValueChange={handleArticleSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an article or enter URL" />
            </SelectTrigger>
            <SelectContent>
              {EXAMPLE_ARTICLES.map((article) => (
                <SelectItem
                  key={article.url || "custom"}
                  value={article.url || "custom"}
                >
                  {article.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedArticle === "custom" && (
            <div className="flex items-center space-x-2">
              <Link className="h-5 w-5 text-gray-500" />
              <Input
                type="url"
                placeholder="Enter article URL"
                value={articleUrl}
                onChange={(e) => setArticleUrl(e.target.value)}
                className="flex-grow"
              />
            </div>
          )}

          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {content && (
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Generated Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">{content}</p>
            <div className="flex justify-between pt-4">
              <Button
                onClick={() => handleSwipe(false)}
                variant="outline"
                className="w-[48%]"
              >
                <ThumbsDown className="mr-2 h-5 w-5" />
                Dislike
              </Button>
              <Button
                onClick={() => handleSwipe(true)}
                className="w-[48%] bg-green-600 hover:bg-green-700"
              >
                <ThumbsUp className="mr-2 h-5 w-5" />
                Like
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedArticleData && selectedArticleData.content && (
        <Card className="bg-white shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Article Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedArticleData.image && (
              <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
                <Image
                  src={selectedArticleData.image}
                  alt={selectedArticleData.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {selectedArticleData.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {selectedArticleData.description}
              </p>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: marked(selectedArticleData.content),
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
