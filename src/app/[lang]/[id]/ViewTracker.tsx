"use client";

import { useEffect } from "react";

export default function ViewTracker({ id }: { id: number }) {
  useEffect(() => {
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }, [id]);

  return null;
}
