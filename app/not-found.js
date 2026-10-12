import Link from "next/link";
import EmptyState from "@/components/EmptyState";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="container page">
      <EmptyState
        icon="search"
        title="Page not found"
        action={<Link className="btn" href="/">Back to home</Link>}
      >
        The page you are looking for does not exist or has been moved.
      </EmptyState>
    </main>
  );
}
