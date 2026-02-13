"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { wines as defaultWines, Wine } from "@/data/wines";
import { menuItems as defaultMenu, MenuItem } from "@/data/menu";
import { siteContent as defaultContent, SiteContent } from "@/data/content";

interface DataContextType {
  wines: Wine[];
  menuItems: MenuItem[];
  content: SiteContent;
  loading: boolean;
}

const DataContext = createContext<DataContextType>({
  wines: defaultWines,
  menuItems: defaultMenu,
  content: defaultContent,
  loading: true,
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [wines, setWines] = useState<Wine[]>(defaultWines);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenu);
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [wRes, mRes, cRes] = await Promise.allSettled([
          fetch("/api/public/wines"),
          fetch("/api/public/menu"),
          fetch("/api/public/content"),
        ]);
        if (wRes.status === "fulfilled" && wRes.value.ok) setWines(await wRes.value.json());
        if (mRes.status === "fulfilled" && mRes.value.ok) setMenuItems(await mRes.value.json());
        if (cRes.status === "fulfilled" && cRes.value.ok) setContent(await cRes.value.json());
      } catch {
        // Keep defaults
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ wines, menuItems, content, loading }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
