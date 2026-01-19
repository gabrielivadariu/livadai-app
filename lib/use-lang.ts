"use client";

import { useEffect, useState } from "react";

export type Lang = "ro" | "en";

const normalizeLang = (value: string | null): Lang => {
  if (value?.toLowerCase().startsWith("en")) return "en";
  return "ro";
};

export const useLang = (fallback: Lang = "ro") => {
  const [lang, setLang] = useState<Lang>(fallback);

  useEffect(() => {
    const stored = window.localStorage.getItem("livadai-lang");
    setLang(normalizeLang(stored));
  }, []);

  return lang;
};
