"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import type { PassengerRow } from "../types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const passengerColumns: ColumnDef<PassengerRow>[] = [
  {
    accessorKey: "passengerName",
    header: () => <span>Pasajero</span>,
    cell: ({ row }) => (
      <div
        className="max-w-[240px] truncate"
        title={String(row.getValue("passengerName") ?? "")}
      >
        {row.getValue("passengerName") ?? "-"}
      </div>
    ),
  },
  {
    accessorKey: "locator",
    header: () => <span>Localizador</span>,
    cell: ({ row }) => (
      <div
        className="max-w-[140px] truncate"
        title={String(row.getValue("locator") ?? "")}
      >
        {row.getValue("locator") ?? "-"}
      </div>
    ),
  },
  {
    accessorKey: "ticketNumber",
    header: () => <span>Nº Ticket</span>,
    cell: ({ row }) => <div>{row.getValue("ticketNumber") ?? "-"}</div>,
  },
  {
    accessorKey: "doc",
    header: () => <span>DOC</span>,
    cell: ({ row }) => <div>{row.getValue("doc") ?? "-"}</div>,
  },
  {
    accessorKey: "email",
    header: () => <span>Correo</span>,
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">
        {row.getValue("email") ?? "-"}
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: () => <span>Telefono</span>,
    cell: ({ row }) => <div>{row.getValue("phone") ?? "-"}</div>,
  },
  {
    accessorKey: "status",
    header: () => <span>Estatus</span>,
    cell: ({ row }) => <div>{row.getValue("status") ?? "-"}</div>,
  },
  {
    id: "actions",
    header: () => <span>Acciones</span>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="text-right">
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

export default passengerColumns;
