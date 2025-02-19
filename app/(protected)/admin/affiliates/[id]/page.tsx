import { getAffiliateById, getAffiliateStats } from "../queries";
import { AffiliateStats } from "../components/affiliate-stats";
import { notFound } from "next/navigation";

interface AffiliatePageProps {
  params: {
    id: string;
  };
}

export default async function AffiliatePage({ params }: AffiliatePageProps) {
  const [affiliate, stats] = await Promise.all([
    getAffiliateById(params.id),
    getAffiliateStats(params.id),
  ]);

  if (!affiliate) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Affiliate Overview</h3>
        <p className="text-sm text-muted-foreground">
          View commission statistics and payment history
        </p>
      </div>
      <AffiliateStats stats={stats} />
      {/* 这里可以添加更多组件，如支付历史、推广链接等 */}
    </div>
  );
}
