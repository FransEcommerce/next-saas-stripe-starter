"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileText,
  Key,
  LayoutGrid,
  RefreshCcw,
  Sparkles,
  Tag,
  ShoppingCart
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { downloadPluginManager } from "../actions"; // 导入 Server Action

interface PluginManagerCardProps {
  isInstalled: boolean;
  userId: string; // 添加 userId 属性
  initialVersion: string;
}

export function PluginManagerCard({
  isInstalled,
  userId,
  initialVersion,
}: PluginManagerCardProps) {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<string>('');
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState(initialVersion);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: <ShoppingCart className="h-4 w-4" />, text: "Creating order...", progress: 10, delay: 1500 },
    { icon: <Key className="h-4 w-4" />, text: "Generating license...", progress: 40, delay: 2000 },
    { icon: <Download className="h-4 w-4" />, text: "Preparing download...", progress: 70, delay: 1500 },
    { icon: <CheckCircle className="h-4 w-4" />, text: "Download complete", progress: 100, delay: 1000 }
  ];

  const handleDownload = async () => {
    setDownloadError(null);
    setCurrentStep(0);
    
    try {
      const result = await downloadPluginManager(userId);
      
      if (result.isNewOrder) {
        // Show full progress for new orders
        for (let i = 0; i < steps.length; i++) {
          setCurrentStep(i);
          setDownloadProgress(steps[i].progress);
          setDownloadStatus(steps[i].text);
          await new Promise(resolve => setTimeout(resolve, steps[i].delay));
        }
      } else {
        // Skip to first two steps for repeat downloads
        setCurrentStep(2);
        setDownloadProgress(steps[2].progress);
        setDownloadStatus(steps[2].text);
        await new Promise(resolve => setTimeout(resolve, steps[2].delay));
        
        setCurrentStep(3);
        setDownloadProgress(steps[3].progress);
        setDownloadStatus(steps[3].text);
        await new Promise(resolve => setTimeout(resolve, steps[3].delay));
      }
      
      // 确保显示100%完成
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = 'plugin-manager.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setCurrentVersion(result.version);
      
      // 延迟后刷新页面
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error downloading:', error);
      setDownloadError(error instanceof Error ? error.message : 'Download failed');
      setDownloadProgress(0);
      setDownloadStatus('');
      setCurrentStep(-1);
    }
  };

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-background dark:from-blue-400/20 dark:via-purple-400/15 dark:to-background">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 dark:bg-primary/10" />
        <div className="absolute -left-4 bottom-4 h-32 w-32 rounded-full bg-primary/5 dark:bg-primary/10" />
        <div className="absolute right-1/4 top-1/4 h-16 w-16 rounded-full bg-primary/5 dark:bg-primary/10" />
      </div>

      {/* Content */}
      <div className="relative">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center rounded-full border border-amber-500/20 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 px-3 py-1 text-sm font-medium text-amber-600 dark:border-amber-400/30 dark:from-amber-400/30 dark:via-purple-400/30 dark:to-pink-400/30 dark:text-amber-300">
                  <Sparkles className="mr-1 h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                  Premium Tool
                </div>
                {isInstalled ? (
                  <Badge
                    variant="outline"
                    className="border-green-200 bg-green-50 text-green-700"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" /> Installed
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-amber-200 bg-amber-50 text-amber-700"
                  >
                    <AlertCircle className="mr-1 h-3 w-3" /> Not Installed
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-bold">
                  Plugin Manager
                </CardTitle>
                <Badge
                  variant="outline"
                  className="border-green-200 bg-green-50 text-green-700"
                >
                  <Tag className="mr-1 h-3 w-3" /> v{currentVersion}
                </Badge>
              </div>
              <CardDescription className="max-w-[600px] text-base">
                Experience seamless plugin management with our advanced tool.
                Designed to enhance your workflow and maximize productivity.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Feature Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative overflow-hidden rounded-xl border bg-background/60 p-4 backdrop-blur-sm">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium leading-none">Easy Downloads</h4>
                  <p className="text-sm text-muted-foreground">
                    Download plugins with a single click
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl border bg-background/60 p-4 backdrop-blur-sm">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <RefreshCcw className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium leading-none">
                    One-Click Updates
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Keep all plugins up to date easily
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl border bg-background/60 p-4 backdrop-blur-sm">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <LayoutGrid className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium leading-none">
                    Central Management
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Manage all your plugins in one place
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Download Progress */}
          {downloadProgress > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center ${index <= currentStep ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${index <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {step.icon}
                    </div>
                    <span className="mt-2 text-xs">{step.text}</span>
                  </div>
                ))}
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-primary/10">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-700"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{downloadStatus}</span>
                <span className="font-medium">{downloadProgress}%</span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2">
          {isInstalled ? (
            <>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
                Download Again
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Documentation
              </Button>
              <Button size="lg" className="gap-2">
                <Key className="h-4 w-4" />
                View License
              </Button>
            </>
          ) : (
            <Button
              size="lg"
              onClick={handleDownload}
              disabled={downloadProgress > 0 && downloadProgress < 100}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Plugin Manager
            </Button>
          )}
        </CardFooter>
      </div>
    </Card>
  );
}
