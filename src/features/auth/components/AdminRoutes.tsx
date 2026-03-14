import { Navigate } from "react-router";
import type { User } from "../../../types";

interface AdminRouteProps {
  user: User | null;
  children: React.ReactNode;
}

function AdminRoutes({ user, children }: AdminRouteProps) {
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/" />;
  }

  return <div>{children}</div>;
}

export default AdminRoutes