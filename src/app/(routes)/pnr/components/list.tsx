"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { PnrListItem } from "../types";
import PnrDetailDialog from "./PnrDetailDialog";

export function PnrList({ items = [] }: { items?: PnrListItem[] }) {
  // placeholder data when none provided
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PnrListItem | null>(null);
  const data = items.length > 0 ? items : [];

  // avoid locale-dependent rendering during SSR/hydration by
  // showing a deterministic string first, then switch to localized
  // representation after the component mounts on the client
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Mostrando {data.length} PNRS
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Filtrar
          </Button>
        </div>
      </div>

      <div className="overflow-auto rounded-md border bg-background">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Locator</th>
              <th className="px-3 py-2">Passenger</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr
                key={p.id}
                className="border-t last:border-b hover:bg-accent/50"
              >
                <td className="px-3 py-2 align-top">{p.locator}</td>
                <td className="px-3 py-2 align-top">{p.passenger}</td>
                <td className="px-3 py-2 align-top">
                  {mounted
                    ? new Date(
                        p.createdAt ?? new Date(0).toISOString()
                      ).toLocaleString()
                    : new Date(
                        p.createdAt ?? new Date(0).toISOString()
                      ).toISOString()}
                </td>
                <td className="px-3 py-2 align-top">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelected(p);
                        setOpen(true);
                      }}
                    >
                      Ver
                    </Button>
                    {/* Edit action removed per request */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PnrDetailDialog
        open={open}
        onClose={() => setOpen(false)}
        item={selected}
      />
    </div>
  );
}

export default PnrList;
