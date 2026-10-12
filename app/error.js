"use client";
import EmptyState from "@/components/EmptyState";

export default function GlobalError({ reset }) {
  return (
    <main className="container page">
      <EmptyState
        icon="alert"
        title="Something went wrong"
        action={<button className="btn" onClick={reset}>Try again</button>}
      >
        An unexpected error occurred. Please try again in a moment.
      </EmptyState>
    </main>
  );
}
