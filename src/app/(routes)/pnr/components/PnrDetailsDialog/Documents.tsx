export default function Documents({
  transformed,
  renderVal,
  badgeForDocument,
}: any) {
  const docs = (transformed?.passengers ?? []).flatMap(
    (p: any) => p.travelDocuments
  );
  return (
    <div className="max-h-[56vh] overflow-auto space-y-2">
      {docs.length === 0 && (
        <div className="text-sm text-muted-foreground">No hay documentos.</div>
      )}
      {docs.map((d: any, i: number) => (
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
  );
}
