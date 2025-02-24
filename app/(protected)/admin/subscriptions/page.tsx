import { getSubscriptions, getUsers, getPlans } from "./queries";
import { SubscriptionList } from "./components/subscription-list";
import { CreateSubscriptionButton } from "./components/create-subscription-button";

export default async function SubscriptionsPage() {
  const [subscriptions, users, plans] = await Promise.all([
    getSubscriptions(),
    getUsers(),
    getPlans(),
  ]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <CreateSubscriptionButton users={users} plans={plans} />
      </div>
      <SubscriptionList
        subscriptions={subscriptions}
        users={users}
        plans={plans}
      />
    </div>
  );
}