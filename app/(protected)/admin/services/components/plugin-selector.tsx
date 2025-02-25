"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Plugin {
  id: string;
  name: string;
  version: string;
  avatar?: string;
  childVersions: {
    id: string;
    name: string;
    version: string;
    avatar?: string;
    versionNumber: number;
  }[];
}

interface PluginSelectorProps {
  plugins: Plugin[];
  selectedPlugins: string[];
  onChange: (pluginIds: string[]) => void;
}

export function PluginSelector({
  plugins,
  selectedPlugins,
  onChange,
}: PluginSelectorProps) {
  const [expandedPlugins, setExpandedPlugins] = useState<string[]>([]);

  const toggleExpand = (e: React.MouseEvent, pluginId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedPlugins(prev =>
      prev.includes(pluginId)
        ? prev.filter(id => id !== pluginId)
        : [...prev, pluginId]
    );
  };

  const handlePluginSelect = (pluginId: string) => {
    const plugin = plugins.find(p => p.id === pluginId);
    if (!plugin) return;

    let newSelectedPlugins = [...selectedPlugins];
    const isSelected = selectedPlugins.includes(pluginId);

    if (isSelected) {
      // 取消选择主插件时，也取消其所有版本
      newSelectedPlugins = newSelectedPlugins.filter(
        id => id !== pluginId && !plugin.childVersions.some(cv => cv.id === id)
      );
    } else {
      // 选择主插件时，同时选择所有版本
      newSelectedPlugins.push(pluginId);
      plugin.childVersions.forEach(cv => {
        if (!newSelectedPlugins.includes(cv.id)) {
          newSelectedPlugins.push(cv.id);
        }
      });
    }

    onChange(newSelectedPlugins);
  };

  const handleVersionSelect = (e: React.MouseEvent, versionId: string, parentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newSelectedPlugins = selectedPlugins.includes(versionId)
      ? selectedPlugins.filter(id => id !== versionId)
      : [...selectedPlugins, versionId];
    onChange(newSelectedPlugins);
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {plugins.map(plugin => {
        const isSelected = selectedPlugins.includes(plugin.id);
        return (
          <Card 
            key={plugin.id} 
            className={cn(
              "overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer relative",
              isSelected && "ring-2 ring-green-500 ring-offset-2"
            )}
            onClick={() => handlePluginSelect(plugin.id)}
          >
            <div className="p-4">
              <div className="flex items-start space-x-4">
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  {plugin.avatar ? (
                    <Image
                      src={plugin.avatar}
                      alt={plugin.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <span className="text-2xl font-bold text-muted-foreground">
                        {plugin.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{plugin.name}</h4>
                      {isSelected && (
                        <div className="rounded-full bg-green-500/10 p-1">
                          <Check className="h-3 w-3 text-green-500" />
                        </div>
                      )}
                    </div>
                    {plugin.childVersions.length > 0 && (
                      <button
                        onClick={(e) => toggleExpand(e, plugin.id)}
                        className="flex items-center space-x-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted"
                      >
                        <span>{expandedPlugins.includes(plugin.id) ? "Close" : "View"}</span>
                        {expandedPlugins.includes(plugin.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">v{plugin.version}</p>
                </div>
              </div>

              <AnimatePresence>
                {expandedPlugins.includes(plugin.id) && plugin.childVersions.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-2 border-t pt-4">
                      {plugin.childVersions
                        .sort((a, b) => b.versionNumber - a.versionNumber)
                        .map(version => {
                          const isVersionSelected = selectedPlugins.includes(version.id);
                          return (
                            <div
                              key={version.id}
                              onClick={(e) => handleVersionSelect(e, version.id, plugin.id)}
                              className={cn(
                                "flex items-center space-x-2 pl-16 transition-colors hover:bg-green-500/10 rounded-md p-2 cursor-pointer",
                                isVersionSelected && "bg-green-500/5"
                              )}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-medium">v{version.version}</p>
                                  {version.versionNumber === Math.max(...plugin.childVersions.map(v => v.versionNumber)) && (
                                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">Latest</span>
                                  )}
                                </div>
                                {isVersionSelected && (
                                  <div className="rounded-full bg-green-500/10 p-1">
                                    <Check className="h-3 w-3 text-green-500" />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
