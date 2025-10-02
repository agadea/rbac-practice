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
import type { PnrListItem } from "../types";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import transformPnr from "@/lib/pnrTransform";
import { Ticket } from "lucide-react";
import Passengers from "./PnrDetailsDialog/Passengers";
import Documents from "./PnrDetailsDialog/Documents";
import Contacts from "./PnrDetailsDialog/Contacts";
import Warnings from "./PnrDetailsDialog/Warnings";
import RawView from "./PnrDetailsDialog/RawView";
import PointOfSale from "./PnrDetailsDialog/PointOfSale";
import TabsContainer from "./PnrDetailsDialog/TabsContainer";

export function PnrDetailDialog({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: PnrListItem | null;
}) {
  const raw = React.useMemo(() => {
    if (!item) return null;
    return {
      record_locator: item.record_locator ?? item.locator,
      point_of_sale: item.point_of_sale ?? null,
      passengers_information: item.passengers_information ?? null,
      travel_documents: item.travel_document_information ?? null,
      contacts_list: item.contacts_list ?? null,
    } as any;
  }, [item]);

  const transformed = React.useMemo(
    () => (raw ? transformPnr(raw) : null),
    [raw]
  );

  const [activeTab, setActiveTab] = React.useState<string>("passengers");
  const [showRaw, setShowRaw] = React.useState(false);

  React.useEffect(() => {
    setShowRaw(activeTab === "raw");
  }, [activeTab]);

  const badgeForDocument = (doc: any) => {
    if (!doc) return null;
    if (doc.expired) return <Badge variant="destructive">Expirado</Badge>;
    if (doc.expiresSoon)
      return <Badge variant="secondary">Expira pronto</Badge>;
    return <Badge variant="default">Válido</Badge>;
  };

  const renderVal = (v: any) => {
    if (v === undefined || v === null) return "—";
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  };

  // Usamos resolvePassengerNames importado desde utils. Lo llamamos con transformed.passengers

  return (
    <Dialog open={open} onOpenChange={(val) => (val ? null : onClose())}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-3xl  max-h-[90vh]"
      >
        <DialogHeader>
          <DialogTitle>
            <span className="inline-flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              <span>Detalle PNR {item?.locator}</span>
            </span>
          </DialogTitle>
          <DialogDescription className="mt-2 mb-4 text-sm text-muted-foreground">
            Información detallada del PNR seleccionado.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <TabsContainer
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabs={[
              { value: "passengers", label: "Pasajeros" },
              { value: "documents", label: "Documentos" },
              { value: "pos", label: "POS" },
              { value: "contact", label: "Contacto" },
              { value: "warnings", label: "Warnings" },
              { value: "raw", label: "Raw JSON" },
            ]}
          >
            <TabsContent value="passengers">
              <Passengers
                transformed={transformed}
                renderVal={renderVal}
                badgeForDocument={badgeForDocument}
              />
            </TabsContent>

            <TabsContent value="documents">
              <Documents
                transformed={transformed}
                renderVal={renderVal}
                badgeForDocument={badgeForDocument}
              />
            </TabsContent>

            <TabsContent value="contact">
              <Contacts
                transformed={transformed}
                item={item}
                renderVal={renderVal}
              />
            </TabsContent>

            <TabsContent value="pos">
              <PointOfSale
                transformed={transformed}
                item={item}
                renderVal={renderVal}
              />
            </TabsContent>

            <TabsContent value="warnings">
              <Warnings transformed={transformed} />
            </TabsContent>

            <TabsContent value="raw">
              <RawView raw={raw} item={item} showRaw={showRaw} />
            </TabsContent>
          </TabsContainer>
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
