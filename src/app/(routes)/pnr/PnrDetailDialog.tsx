"use client";

import * as React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PnrListItem } from "./types";

export function PnrDetailDialog({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: PnrListItem | null;
}) {
  return (
    <Dialog open={open} onOpenChange={(val) => (val ? null : onClose())}>
      <DialogContent showCloseButton={false} className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalle PNR — {item?.locator}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 grid gap-4 grid-cols-1 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium">Record locator</h4>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(item?.record_locator ?? item?.locator, null, 2)}
            </pre>
          </div>

          <div>
            <h4 className="text-sm font-medium">Point of sale</h4>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(item?.point_of_sale ?? {}, null, 2)}
            </pre>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-sm font-medium">Passengers information</h4>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(item?.passengers_information ?? {}, null, 2)}
            </pre>
          </div>

          <div>
            <h4 className="text-sm font-medium">Travel documents</h4>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(item?.travel_document_information ?? {}, null, 2)}
            </pre>
          </div>

          <div>
            <h4 className="text-sm font-medium">Contacts</h4>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(item?.contacts_list ?? [], null, 2)}
            </pre>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PnrDetailDialog;
