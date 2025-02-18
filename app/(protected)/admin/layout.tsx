import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AdminNav } from "./components/admin-nav";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function Dashboard({ children }: ProtectedLayoutProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  return (
    <div className="space-y-6">
      <AdminNav />
      {children}
    </div>
  );
}
