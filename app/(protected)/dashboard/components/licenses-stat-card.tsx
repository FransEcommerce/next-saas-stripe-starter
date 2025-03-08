import { Key } from "lucide-react";
import { StatCard } from "./stat-card";

interface LicensesStatCardProps {
  totalLicenses: number;
  activeLicenses: number;
}

export function LicensesStatCard({ totalLicenses, activeLicenses }: LicensesStatCardProps) {
  // Calculate the progress percentage based on active vs total licenses
  const progress = totalLicenses > 0 ? (activeLicenses / totalLicenses) * 100 : 0;
  
  return (
    <StatCard
      title="My Licenses"
      value={totalLicenses}
      description={
        <span>
          <span className="text-green-500">{activeLicenses}</span> activated
        </span>
      }
      icon={Key}
      progress={progress}
    />
  );
}
