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
import type { PnrListItem } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { pnrColumns, createPnrColumns } from "./columns";
import PnrDetailDialog from "./PnrDetailDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PnrDataTable({
  data,
  columns = pnrColumns,
}: {
  data: PnrListItem[];
  columns?: ColumnDef<PnrListItem>[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PnrListItem | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");

  // usamos columnas creadas dinámicamente para poder inyectar onView
  const dynamicColumns = createPnrColumns((item: PnrListItem) => {
    setSelected(item);
    setOpen(true);
  });

  const table = useReactTable({
    data,
    columns: dynamicColumns,
    state: { sorting, rowSelection, globalFilter },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full">
      {/* Contenedor con ancho máximo y responsive; la tabla usa table-fixed para respetar anchos */}
      <div className="w-full overflow-auto">
        <div className="mb-4">
          <Input
            placeholder="Buscar PNR, pasajero, locator..."
            value={globalFilter}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
          />
        </div>
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
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={dynamicColumns.length}>
                  No hay resultados que coincidan con "{globalFilter}".
                </TableCell>
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
      <PnrDetailDialog
        open={open}
        onClose={() => setOpen(false)}
        item={selected}
      />
    </div>
  );
}

export default PnrDataTable;
