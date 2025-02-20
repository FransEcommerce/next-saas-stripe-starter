import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { CreateUserButton } from "./components/create-user-button";
import { UsersList } from "./components/users-list";
import { getUsers } from "./queries";

export const metadata = constructMetadata({
  title: "Users Management – Admin Panel",
  description: "Manage user accounts and permissions",
});

export default async function UsersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const users = await getUsers();

  return (
    <>
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <DashboardHeader
            heading="Users"
            text="Manage user accounts, roles and permissions."
          />
          <div className="flex items-center space-x-2">
            <CreateUserButton />
          </div>
        </div>
        <UsersList users={users} />
      </div>
    </>
  );
}
