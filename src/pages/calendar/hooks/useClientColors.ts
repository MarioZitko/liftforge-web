import { useCallback, useEffect, useRef } from "react";

export interface ClientColor {
  bg: string;
  border: string;
  text: string;
  chip: string;
}

const PALETTE: ClientColor[] = [
  { bg: "bg-blue-500", border: "border-blue-500", text: "text-blue-600", chip: "bg-blue-100 text-blue-700 border-blue-200" },
  { bg: "bg-emerald-500", border: "border-emerald-500", text: "text-emerald-600", chip: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { bg: "bg-violet-500", border: "border-violet-500", text: "text-violet-600", chip: "bg-violet-100 text-violet-700 border-violet-200" },
  { bg: "bg-rose-500", border: "border-rose-500", text: "text-rose-600", chip: "bg-rose-100 text-rose-700 border-rose-200" },
  { bg: "bg-amber-500", border: "border-amber-500", text: "text-amber-600", chip: "bg-amber-100 text-amber-700 border-amber-200" },
  { bg: "bg-cyan-500", border: "border-cyan-500", text: "text-cyan-600", chip: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  { bg: "bg-fuchsia-500", border: "border-fuchsia-500", text: "text-fuchsia-600", chip: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200" },
  { bg: "bg-teal-500", border: "border-teal-500", text: "text-teal-600", chip: "bg-teal-100 text-teal-700 border-teal-200" },
];

const STORAGE_KEY = "liftforge-client-colors";

function loadMap(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveMap(map: Record<string, number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function useClientColors() {
  const mapRef = useRef<Record<string, number>>(loadMap());

  useEffect(() => {
    mapRef.current = loadMap();
  }, []);

  const getColor = useCallback((clientId: string): ClientColor => {
    if (mapRef.current[clientId] === undefined) {
      const usedIndices = Object.values(mapRef.current);
      let idx = 0;
      while (usedIndices.includes(idx) && idx < PALETTE.length) idx++;
      if (idx >= PALETTE.length) idx = usedIndices.length % PALETTE.length;
      mapRef.current[clientId] = idx;
      saveMap(mapRef.current);
    }
    return PALETTE[mapRef.current[clientId]];
  }, []);

  return { getColor };
}
