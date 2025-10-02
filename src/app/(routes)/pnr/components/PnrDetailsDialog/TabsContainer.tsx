import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabDef = { value: string; label: string };

export default function TabsContainer({
  activeTab,
  setActiveTab,
  children,
  className,
  tabs = [
    { value: "passengers", label: "Pasajeros" },
    { value: "documents", label: "Documentos" },
    { value: "contact", label: "Contacto" },
    { value: "warnings", label: "Warnings" },
    { value: "raw", label: "Raw JSON" },
  ] as TabDef[],
}: {
  activeTab: string;
  setActiveTab: (v: string) => void;
  children: React.ReactNode;
  className?: string;
  tabs?: TabDef[];
}) {
  return (
    <Tabs
      defaultValue="passengers"
      value={activeTab}
      onValueChange={(v) => setActiveTab(v)}
    >
      <TabsList className={className}>
        {tabs.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {children}
    </Tabs>
  );
}
