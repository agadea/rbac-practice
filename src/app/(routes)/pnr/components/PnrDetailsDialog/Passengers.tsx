export default function Passengers({
  transformed,
  renderVal,
  badgeForDocument,
}: any) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 max-h-[56vh] overflow-auto">
      <div>
        <h4 className="text-sm font-medium">Record locator</h4>
        <pre className="whitespace-pre-wrap text-sm">
          {JSON.stringify(transformed?.recordLocator ?? null, null, 2)}
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
                    transformed?.pointOfSale?.user
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Agente / Usuario
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {renderVal(transformed?.pointOfSale?.country)}
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

          {(transformed?.passengers ?? []).map((p: any) => (
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
                        {p.travelDocuments[0].type ?? p.travelDocuments[0].code}
                      </div>
                      {badgeForDocument(p.travelDocuments[0])}
                    </div>
                  ) : (
                    <div className="text-sm">Sin documento</div>
                  )}
                </div>
              </div>

              <div className="mt-2 text-sm">
                <div>
                  <strong>FOIDs:</strong>{" "}
                  {p.foids.length
                    ? p.foids.map((f: any) => f.documentNumberMasked).join(", ")
                    : "—"}
                </div>
                <div className="mt-1">
                  <strong>Direcciones:</strong>{" "}
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
