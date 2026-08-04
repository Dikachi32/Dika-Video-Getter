"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ApiKeySettings } from "@/components/settings/ApiKeySettings";
import { OutputSettings } from "@/components/settings/OutputSettings";
import { VoiceSettings } from "@/components/settings/VoiceSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, Monitor, Mic } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-1">Settings</h1>
              <p className="text-muted-foreground">
                Configure your AI studio preferences and API credentials
              </p>
            </div>

            <Tabs defaultValue="api-keys" className="space-y-6">
              <TabsList className="bg-card border border-border p-1">
                <TabsTrigger value="api-keys" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Key className="w-4 h-4" />
                  API Keys
                </TabsTrigger>
                <TabsTrigger value="output" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Monitor className="w-4 h-4" />
                  Output
                </TabsTrigger>
                <TabsTrigger value="voice" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Mic className="w-4 h-4" />
                  Voice
                </TabsTrigger>
              </TabsList>

              <TabsContent value="api-keys" className="mt-0">
                <ApiKeySettings />
              </TabsContent>

              <TabsContent value="output" className="mt-0">
                <OutputSettings />
              </TabsContent>

              <TabsContent value="voice" className="mt-0">
                <VoiceSettings />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}