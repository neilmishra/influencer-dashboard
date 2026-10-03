import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { dashboardRouteForRole } from "@/lib/auth-routes";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.role) {
    redirect(dashboardRouteForRole(session.user.role));
  }

  return <LoginForm />;
}