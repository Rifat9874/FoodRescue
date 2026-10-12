"use client";
import RequireRole from "@/components/RequireRole";
import RequestList from "@/components/RequestList";
import { useAuth } from "@/components/AuthProvider";

const TITLES = {
  DONOR: "Pickup requests for your food",
  NGO: "Your pickup requests",
  VOLUNTEER: "Pickup tasks",
  ADMIN: "All pickup requests",
};

function Heading() {
  const { user } = useAuth();
  return <div className="page-header"><h1>{TITLES[user?.role]}</h1></div>;
}

export default function RequestsPage() {
  return (
    <main className="container page">
      <RequireRole>
        <Heading />
        <RequestList />
      </RequireRole>
    </main>
  );
}
