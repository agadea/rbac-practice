import { resolvePassengerNames } from "@/lib/utils";

export default function Contacts({ transformed, item, renderVal }: any) {
  const contacts =
    transformed?.contacts ??
    transformed?.raw?.contacts_list ??
    item?.contacts_list ??
    [];
  if (!Array.isArray(contacts))
    return (
      <pre className="whitespace-pre-wrap text-sm">
        {JSON.stringify(contacts, null, 2)}
      </pre>
    );

  return (
    <div className="max-h-[56vh] overflow-auto space-y-2">
      <h4 className="text-sm font-medium">Contacts</h4>
      <div className="p-3 border rounded-md">
        {contacts.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No hay contactos registrados.
          </div>
        ) : (
          contacts.map((c: any, i: number) => (
            <div key={i} className="mb-2 text-sm">
              {c && typeof c === "object" ? (
                <div>
                  <div>
                    <strong>Type:</strong>{" "}
                    {renderVal(c.type ?? c.contact_type ?? c.kind)}
                  </div>
                  <div>
                    <strong>Value:</strong>{" "}
                    {renderVal(
                      c.description ?? c.value ?? c.contact_value ?? c.contact
                    )}
                  </div>

                  {(Array.isArray(c.association_list) ||
                    Array.isArray(c.associationKeys)) && (
                    <div className="text-sm text-muted-foreground mt-1">
                      <strong>Associated to:</strong>{" "}
                      {(() => {
                        const keys: string[] = [];
                        if (Array.isArray(c.associationKeys))
                          keys.push(...c.associationKeys.map(String));
                        else if (Array.isArray(c.association_list)) {
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
        )}
      </div>
    </div>
  );
}
