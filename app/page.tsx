"use client";

import { useState } from "react";
import ContentSwiper from "@/components/ContentSwiper";
import { Sidebar } from "@/components/Sidebar";
import { ContentLibrary } from "@/lib/contentLibrary";
import { Button } from "@/components/ui/button";
import { Menu, Sparkles } from "lucide-react";

export default function Home() {
  const [contentLibrary, setContentLibrary] = useState<ContentLibrary>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSaveContent = (updatedLibrary: ContentLibrary) => {
    setContentLibrary(updatedLibrary);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 to-indigo-100 relative">
      <Sidebar
        contentLibrary={contentLibrary}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center">
              <Sparkles className="h-8 w-8 mr-3 text-indigo-500" />
              Your Content Hub
            </h1>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden bg-white hover:bg-gray-100"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Welcome to Your Content Generator
            </h2>
            <p className="text-gray-600">
              Create, manage, and organize your marketing content with ease. Use
              the content swiper below to get started!
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <ContentSwiper
              onSaveContent={handleSaveContent}
              contentLibrary={contentLibrary}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
