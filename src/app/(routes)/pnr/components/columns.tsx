"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import type { PnrListItem } from "../types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const pnrColumns: ColumnDef<PnrListItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        aria-label="Select all"
        checked={table.getIsAllPageRowsSelected()}
        ref={(el) => {
          if (!el) return;
          el.indeterminate = table.getIsSomePageRowsSelected();
        }}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        aria-label={`Select row ${row.index}`}
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
      />
    ),
  },
  {
    accessorKey: "locator",
    header: () => <span>Locator</span>,
    cell: ({ row }) => (
      <div
        className="max-w-[150px] truncate"
        title={String(row.getValue("locator") ?? "")}
      >
        <span className="font-medium">{row.getValue("locator") as string}</span>
      </div>
    ),
  },
  {
    accessorKey: "passenger",
    header: () => <span>Passenger</span>,
    cell: ({ row }) => (
      <div
        className="max-w-[240px] truncate"
        title={String(row.getValue("passenger") ?? "")}
      >
        {row.getValue("passenger") ?? "-"}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => <span>Created</span>,
    cell: ({ row }) => {
      const v = row.getValue("createdAt") as string | null | undefined;
      const iso = v ?? new Date(0).toISOString();
      return (
        <div className="max-w-[180px] truncate" title={String(iso)}>
          {new Date(iso).toLocaleString()}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <span>Actions</span>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div
          className="max-w-[120px] truncate text-right"
          title={String(row.getValue("locator"))}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Acciones
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => console.log("Ver", item.id)}>
                Ver
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export default pnrColumns;

// Fábrica que permite inyectar un handler para la acción "Ver"
export function createPnrColumns(
  onView: (item: PnrListItem) => void
): ColumnDef<PnrListItem>[] {
  return [
    // select column
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          aria-label="Select all"
          checked={table.getIsAllPageRowsSelected()}
          ref={(el) => {
            if (!el) return;
            el.indeterminate = table.getIsSomePageRowsSelected();
          }}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select row ${row.index}`}
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
        />
      ),
    },
    // locator
    {
      accessorKey: "locator",
      header: () => <span>Locator</span>,
      cell: ({ row }) => (
        <div
          className="max-w-[150px] truncate"
          title={String(row.getValue("locator") ?? "")}
        >
          <span className="font-medium">
            {row.getValue("locator") as string}
          </span>
        </div>
      ),
    },
    // passenger
    {
      accessorKey: "passenger",
      header: () => <span>Passenger</span>,
      cell: ({ row }) => (
        <div
          className="max-w-[240px] truncate"
          title={String(row.getValue("passenger") ?? "")}
        >
          {row.getValue("passenger") ?? "-"}
        </div>
      ),
    },
    // createdAt
    {
      accessorKey: "createdAt",
      header: () => <span>Created</span>,
      cell: ({ row }) => {
        const v = row.getValue("createdAt") as string | null | undefined;
        const iso = v ?? new Date(0).toISOString();
        return (
          <div className="max-w-[180px] truncate" title={String(iso)}>
            {new Date(iso).toLocaleString()}
          </div>
        );
      },
    },
    // actions que llaman al handler inyectado
    {
      id: "actions",
      header: () => <span>Actions</span>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="max-w-[120px] truncate text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Acciones
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => onView(item)}>
                  Ver
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
