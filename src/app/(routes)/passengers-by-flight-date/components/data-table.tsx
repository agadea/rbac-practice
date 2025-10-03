"use client";

import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  RowSelectionState,
} from "@tanstack/react-table";
import type { PassengerRow } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import passengerColumns from "./columns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";

export function PassengersDataTable({
  data,
  columns = passengerColumns,
  searchAction,
}: {
  data: PassengerRow[];
  columns?: ColumnDef<PassengerRow>[];
  // función server action pasada desde el Server Component
  searchAction?: (
    flightNumber: number,
    flightDate: string
  ) => Promise<PassengerRow[]>;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");
  // Datepicker y vuelo
  const [dateOpen, setDateOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [month, setMonth] = useState<Date | undefined>(date);
  const [dateValue, setDateValue] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [rows, setRows] = useState<PassengerRow[]>(data || []);
  const [loading, setLoading] = useState(false);

  function formatDate(d: Date | undefined) {
    if (!d) return "";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
  function isValidDate(d: Date | undefined) {
    return !!d && !isNaN(d.getTime());
  }

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, rowSelection, globalFilter },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Cuando cambian dateValue/flightNumber usamos la searchAction (server) si está disponible.
  // Añadimos debounce para evitar demasiadas peticiones.
  React.useEffect(() => {
    if (!searchAction) return;
    if (!flightNumber || !dateValue) return;

    let mounted = true;
    let cancelled = false;

    const payloadDate = date
      ? date.toISOString().slice(0, 10)
      : (() => {
          const m = dateValue.match(/(\d{2})\/(\d{2})\/(\d{4})/);
          if (m) return `${m[3]}-${m[2]}-${m[1]}`;
          try {
            return new Date(dateValue).toISOString().slice(0, 10);
          } catch {
            return dateValue;
          }
        })();

    const deb = setTimeout(() => {
      setLoading(true);
      // llamar la server action (se ejecuta en servidor)
      searchAction(Number(flightNumber), payloadDate)
        .then((res) => {
          if (!mounted || cancelled) return;
          setRows(res ?? []);
          setError(null);
        })
        .catch((err) => {
          if (!mounted || cancelled) return;
          console.error("searchAction error:", err);
          setRows([]);
          setError(err?.message ?? String(err));
        })
        .finally(() => {
          if (!mounted || cancelled) return;
          setLoading(false);
        });
    }, 500);

    return () => {
      cancelled = true;
      mounted = false;
      clearTimeout(deb);
    };
  }, [dateValue, flightNumber, searchAction]);

  // estado para errores devueltos al invocar la action
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="w-full">
      <div className="w-full overflow-auto">
        <div className="mb-4 flex items-center gap-3">
          {/* Datepicker y vuelo */}
          <div className="flex items-center gap-2">
            <div className="w-[160px] flex items-center">
              <Label htmlFor="flight-date" className="sr-only">
                Fecha
              </Label>
              <div className="relative flex gap-2">
                <Input
                  id="flight-date"
                  value={dateValue}
                  placeholder="dd/mm/yyyy"
                  className="bg-background pr-10 h-10"
                  onChange={(e) => {
                    setDateValue(e.target.value);
                    const d = new Date(
                      e.target.value.replace(
                        /(\d{2})\/(\d{2})\/(\d{4})/,
                        "$2/$1/$3"
                      )
                    );
                    if (isValidDate(d)) {
                      setDate(d);
                      setMonth(d);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setDateOpen(true);
                    }
                  }}
                />
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-picker"
                      variant="ghost"
                      className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                    >
                      <CalendarIcon className="size-3.5" />
                      <span className="sr-only">Seleccionar fecha</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="end"
                    alignOffset={-8}
                    sideOffset={10}
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      captionLayout="dropdown"
                      month={month}
                      onMonthChange={setMonth}
                      onSelect={(d) => {
                        setDate(d);
                        setDateValue(formatDate(d));
                        setDateOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="w-[120px] flex items-center">
              <Label htmlFor="flight-number" className="sr-only">
                Nº Vuelo
              </Label>
              <Input
                id="flight-number"
                value={flightNumber}
                placeholder="Ej: 1234"
                className="h-10"
                onChange={(e) => setFlightNumber(e.target.value)}
              />
            </div>
          </div>
          {/* Buscador */}
          <div className="flex-1">
            <Input
              placeholder="Buscar pasajero, locator, ticket..."
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              className="h-10"
            />
          </div>
          {/* Exportar */}
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={() => console.log("Exportar a Excel")}
                >
                  Exportar a Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {error ? (
          <div className="mb-4 p-3 rounded-md bg-destructive text-destructive-foreground text-sm">
            {`Error al buscar pasajeros: ${error}`}
          </div>
        ) : null}

        <Table className="table-fixed w-full">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableCell key={h.id}>
                    {h.isPlaceholder ? null : (
                      <div>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </div>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              // Skeleton simple
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-muted rounded animate-pulse w-full" />
                    <div className="h-4 bg-muted rounded animate-pulse w-full" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                >{`No hay resultados que coincidan con "${globalFilter}".`}</TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center gap-2 justify-end mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Prev
        </Button>
        <span className="text-sm">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount()}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default PassengersDataTable;
