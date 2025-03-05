import { getUserSubscriptions } from "./queries";
import { SubscriptionDashboard } from "./components/subscription-dashboard";

export default async function SubscriptionsPage() {

    const subscriptions = await getUserSubscriptions();

    return (
        <div className="container mx-auto py-6">
            {/* <pre>{JSON.stringify(subscriptions, null, 2)}</pre> */}
            <SubscriptionDashboard initialSubscriptions={subscriptions} />
        </div>
    );
}