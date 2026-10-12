"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import Alert from "./Alert";
import { Spinner } from "./Loading";

// UI guard for pages. (Real security is enforced again inside every API route.)
export default function RequireRole({ roles, children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) return <Spinner />;
  if (roles && !roles.includes(user.role)) {
    return <Alert type="error">You do not have permission to view this page.</Alert>;
  }
  return children;
}
