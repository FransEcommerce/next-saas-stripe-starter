import { Package } from "lucide-react";
import { StatCard } from "./stat-card";

interface PluginsStatCardProps {
  totalPlugins: number;
  ownedPlugins: number;
}

export function PluginsStatCard({ totalPlugins, ownedPlugins }: PluginsStatCardProps) {
  // Calculate the progress percentage based on owned vs total plugins
  const progress = totalPlugins > 0 ? (ownedPlugins / totalPlugins) * 100 : 0;
  
  return (
    <StatCard
      title="Available Plugins"
      value={totalPlugins}
      description={
        <span>
          <span className="text-green-500">{ownedPlugins}</span> owned
        </span>
      }
      icon={Package}
      progress={progress}
    />
  );
}
