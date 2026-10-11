"use client";

import { useEffect } from "react";
import { rememberSource } from "@/lib/storage";

export function SourceCapture() {
  useEffect(rememberSource, []);
  return null;
}
