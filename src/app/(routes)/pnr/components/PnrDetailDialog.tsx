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
import { resolvePassengerNames } from "@/lib/utils";

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
          <DialogTitle>Detalle PNR  {item?.locator}</DialogTitle>
          <DialogDescription className="mt-2 mb-4 text-sm text-muted-foreground">
            Información detallada del PNR seleccionado.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <Tabs
            defaultValue="passengers"
            value={activeTab}
            onValueChange={(v) => setActiveTab(v)}
          >
            <TabsList>
              <TabsTrigger value="passengers">Pasajeros</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="contact">Contacto</TabsTrigger>
              <TabsTrigger value="warnings">Warnings</TabsTrigger>
              <TabsTrigger value="raw">Raw JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="passengers">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 max-h-[56vh] overflow-auto">
                <div>
                  <h4 className="text-sm font-medium">Record locator</h4>
                  <pre className="whitespace-pre-wrap text-sm">
                    {JSON.stringify(
                      transformed?.recordLocator ??
                        item?.record_locator ??
                        item?.locator,
                      null,
                      2
                    )}
                  </pre>
                </div>

                <div>
                  <h4 className="text-sm font-medium">Point of sale</h4>
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">
                          {renderVal(
                            transformed?.pointOfSale?.agentId ??
                              transformed?.pointOfSale?.user ??
                              item?.point_of_sale?.agent_id ??
                              item?.point_of_sale?.user
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Agente / Usuario
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {renderVal(
                          transformed?.pointOfSale?.country ??
                            item?.point_of_sale?.country
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-sm space-y-1">
                      <div>
                        <strong>User:</strong>{" "}
                        {renderVal(
                          transformed?.pointOfSale?.user ??
                            item?.point_of_sale?.user
                        )}
                      </div>
                      <div>
                        <strong>Agent ID:</strong>{" "}
                        {renderVal(
                          transformed?.pointOfSale?.agentId ??
                            item?.point_of_sale?.agent_id
                        )}
                      </div>
                      <div>
                        <strong>KIU Device:</strong>{" "}
                        {renderVal(
                          transformed?.pointOfSale?.kiuDeviceId ??
                            item?.point_of_sale?.kiu_device_id
                        )}
                      </div>
                      <div>
                        <strong>Country:</strong>{" "}
                        {renderVal(
                          transformed?.pointOfSale?.country ??
                            item?.point_of_sale?.country
                        )}
                      </div>
                      <div>
                        <strong>Sale Channel:</strong>{" "}
                        {renderVal(
                          transformed?.pointOfSale?.saleChannel ??
                            item?.point_of_sale?.sale_channel
                        )}
                      </div>
                      <div>
                        <strong>Office Issue:</strong>{" "}
                        {renderVal(
                          transformed?.pointOfSale?.officeIssueCode ??
                            item?.point_of_sale?.office_issue_code
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium">Passengers</h4>
                  <div className="space-y-3">
                    {(transformed?.passengers ?? []).length === 0 && (
                      <div className="text-sm text-muted-foreground">
                        No hay pasajeros registrados.
                      </div>
                    )}

                    {(transformed?.passengers ?? []).map((p) => (
                      <div key={p.id} className="p-3 border rounded-md">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-sm font-medium">
                              {p.givenName} {p.surname}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {p.passengerType} • Edad: {p.age ?? "—"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {p.travelDocuments[0] ? (
                              <div className="flex items-center gap-2">
                                <div className="text-sm">
                                  {p.travelDocuments[0].type ??
                                    p.travelDocuments[0].code}
                                </div>
                                {badgeForDocument(p.travelDocuments[0])}
                              </div>
                            ) : (
                              <Badge variant="outline">Sin documento</Badge>
                            )}
                          </div>
                        </div>

                        <div className="mt-2 text-sm">
                          <div>
                            <strong>FOIDs:</strong>{" "}
                            {p.foids.length
                              ? p.foids
                                  .map((f) => f.documentNumberMasked)
                                  .join(", ")
                              : "—"}
                          </div>
                          <div className="mt-1">
                            <strong>Direcciones:</strong>{" "}
                            {p.addresses.length
                              ? p.addresses
                                  .map(
                                    (a) =>
                                      `${a.details ?? ""} ${a.city ?? ""} ${
                                        a.country ?? ""
                                      }`
                                  )
                                  .join(" · ")
                              : "—"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents">
              <div className="max-h-[56vh] overflow-auto space-y-2">
                {(transformed?.passengers ?? []).flatMap(
                  (p) => p.travelDocuments
                ).length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No hay documentos.
                  </div>
                )}
                {(transformed?.passengers ?? [])
                  .flatMap((p) => p.travelDocuments)
                  .map((d, i) => (
                    <div
                      key={d.id ?? i}
                      className="p-3 border rounded-md flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{d.type ?? d.code}</div>
                        <div className="text-sm text-muted-foreground">
                          {d.issuingPlace ?? ""} • Expira: {d.expiryDate ?? "—"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">{d.numberMasked}</div>
                        {badgeForDocument(d)}
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="contact">
              <div className="max-h-[56vh] overflow-auto space-y-2">
                <h4 className="text-sm font-medium">Contacts</h4>
                <div className="p-3 border rounded-md">
                  {/* Preferimos los contacts normalizados si están disponibles */}
                  {Array.isArray(
                    transformed?.contacts ??
                      transformed?.raw?.contacts_list ??
                      item?.contacts_list
                  ) ? (
                    (
                      transformed?.contacts ??
                      transformed?.raw?.contacts_list ??
                      item?.contacts_list ??
                      []
                    ).length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        No hay contactos registrados.
                      </div>
                    ) : (
                      (
                        transformed?.contacts ??
                        transformed?.raw?.contacts_list ??
                        item?.contacts_list ??
                        []
                      ).map((c: any, i: number) => (
                        <div key={i} className="mb-2 text-sm">
                          {/* intentar mostrar email/phone/description si existen */}
                          {c && typeof c === "object" ? (
                            <div>
                              <div>
                                <strong>Type:</strong>{" "}
                                {renderVal(c.type ?? c.contact_type ?? c.kind)}
                              </div>
                              <div>
                                <strong>Value:</strong>{" "}
                                {renderVal(
                                  c.description ??
                                    c.value ??
                                    c.contact_value ??
                                    c.contact
                                )}
                              </div>

                              {/* association_list (raw) o associationKeys (normalizado) pueden contener passenger_reference_keys */}
                              {(Array.isArray(c.association_list) ||
                                Array.isArray(c.associationKeys)) && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  <strong>Associated to:</strong>{" "}
                                  {(() => {
                                    // recolectar todas las passenger_reference_keys desde el objeto normalizado o el raw
                                    const keys: string[] = [];
                                    if (Array.isArray(c.associationKeys)) {
                                      keys.push(
                                        ...c.associationKeys.map(String)
                                      );
                                    } else if (
                                      Array.isArray(c.association_list)
                                    ) {
                                      for (const a of c.association_list) {
                                        if (!a) continue;
                                        const prs =
                                          a.passenger_reference_keys ??
                                          a.passenger_reference_key ??
                                          a.passenger_keys ??
                                          null;
                                        if (Array.isArray(prs))
                                          keys.push(...prs.map(String));
                                        else if (prs) keys.push(String(prs));
                                      }
                                    }
                                    // Pasamos los pasajeros transformados para resolver nombres
                                    const names = resolvePassengerNames(
                                      transformed?.passengers ?? [],
                                      keys
                                    );
                                    return names.length
                                      ? names.join(", ")
                                      : keys.join(", ");
                                  })()}
                                </div>
                              )}

                              {c.note && (
                                <div className="text-muted-foreground">
                                  {renderVal(c.note)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>{renderVal(c)}</div>
                          )}
                        </div>
                      ))
                    )
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(
                        transformed?.contacts ??
                          transformed?.raw?.contacts_list ??
                          item?.contacts_list ??
                          {},
                        null,
                        2
                      )}
                    </pre>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="warnings">
              <div className="max-h-[56vh] overflow-auto space-y-2">
                <h4 className="text-sm font-medium">Warnings</h4>
                {(transformed?.warnings ?? []).length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Sin advertencias.
                  </div>
                )}
                <ul className="list-disc list-inside">
                  {(transformed?.warnings ?? []).map((w, i) => (
                    <li key={i} className="text-sm">
                      {w.message}
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="raw">
              <div className="max-h-[56vh] overflow-auto">
                {showRaw ? (
                  <pre className="whitespace-pre-wrap text-sm">
                    {JSON.stringify(raw ?? item, null, 2)}
                  </pre>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Carga JSON al abrir la pestaña.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
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
