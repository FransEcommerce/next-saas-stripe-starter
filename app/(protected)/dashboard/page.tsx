import { getCurrentUser } from "@/lib/session";
import { checkPluginManagerDownloaded, getLatestPluginManagerVersion } from "./queries";
import { PluginManagerCard } from "./components/plugin-manager-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Key, ShoppingBag, CreditCard } from "lucide-react";
import { InteractiveBarChart } from "@/components/charts/interactive-bar-chart";

export default async function Dashboard() {
  const user = await getCurrentUser();
  const isInstalled = user?.id ? await checkPluginManagerDownloaded(user.id) : false;
  const latestVersion = await getLatestPluginManagerVersion();

  return (
    <div className="flex flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Welcome back, {user?.name || 'User'}</h1>
        </div>

        <PluginManagerCard 
          isInstalled={isInstalled} 
          userId={user?.id || ''} 
          initialVersion={latestVersion.version}
        />

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Plugins</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+4</span> in catalog
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-1">
                <div className="h-full w-full bg-gradient-to-r from-primary to-primary/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">2</span> recently activated
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-1">
                <div className="h-full w-3/4 bg-gradient-to-r from-primary to-primary/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+2</span> this month
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-1">
                <div className="h-full w-1/2 bg-gradient-to-r from-primary to-primary/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Professional Plan</p>
              <div className="absolute bottom-0 left-0 right-0 h-1">
                <div className="h-full w-1/4 bg-gradient-to-r from-primary to-primary/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Trends */}
        <InteractiveBarChart />
      </main>
    </div>
  );
}
