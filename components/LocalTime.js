"use client";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";

// Formats the date in the visitor's own time zone (after the page loads).
export default function LocalTime({ value }) {
  const [text, setText] = useState("");
  useEffect(() => setText(formatDate(value)), [value]);
  return <time dateTime={value ? new Date(value).toISOString() : undefined}>{text || "…"}</time>;
}
