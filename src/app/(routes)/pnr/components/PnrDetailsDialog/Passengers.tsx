import FieldRow from "./FieldRow";
import { Badge } from "@/components/ui/badge";

export default function Passengers({
  transformed,
  renderVal,
  badgeForDocument,
}: any) {
  return (
    <div className="max-h-[56vh] overflow-hidden">
      <h4 className="text-sm font-medium">Passengers</h4>

      <div className="mt-2 grid grid-cols-1 gap-2">
        {/* Left: stacked passenger detail cards with internal scroll if needed */}
        <div className="space-y-3 overflow-auto max-h-[36vh] pr-2">
          {(transformed?.passengers ?? []).length === 0 && (
            <div className="text-sm text-muted-foreground">
              No hay pasajeros registrados.
            </div>
          )}

          {(transformed?.passengers ?? []).map((p: any) => (
            <div key={p.id} className="p-3 border rounded-md">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {p.givenName} {p.surname}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.travelDocuments[0] ? (
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-foreground truncate">
                        {p.travelDocuments[0].type ?? p.travelDocuments[0].code}
                      </div>
                      {badgeForDocument(p.travelDocuments[0])}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="warning">Sin documento</Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FieldRow label="Tipo / Edad">
                    {p.passengerType} • Edad: {p.age ?? "—"}
                  </FieldRow>

                  <FieldRow label="FOIDs">
                    {p.foids.length
                      ? p.foids
                          .map((f: any) => f.documentNumberMasked)
                          .join(", ")
                      : "—"}
                  </FieldRow>

                  <FieldRow label="Direcciones">
                    {p.addresses.length
                      ? p.addresses
                          .map(
                            (a: any) =>
                              `${a.details ?? ""} ${a.city ?? ""} ${
                                a.country ?? ""
                              }`
                          )
                          .join(" · ")
                      : "—"}
                  </FieldRow>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Raw card placed under the list, with internal scrolling and limited height */}
        <div className="p-3 border rounded-md mt-2 overflow-auto max-h-[18vh]">
          <div className="text-sm font-medium">Raw Passengers</div>
          <div className="mt-2">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {JSON.stringify(
                { passengers: transformed?.passengers ?? [] },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
