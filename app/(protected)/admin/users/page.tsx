import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
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
            <Link href="/admin/users/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </Link>
          </div>
        </div>
        <UsersList users={users} />
      </div>
    </>
  );
}
