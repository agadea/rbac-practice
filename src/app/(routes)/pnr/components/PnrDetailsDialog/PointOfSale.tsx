import React from "react";
import FieldRow from "./FieldRow";

export default function PointOfSale({ transformed, item, renderVal }: any) {
  const pos = transformed?.pointOfSale ?? item?.point_of_sale ?? null;
  if (!pos) {
    return (
      <div className="p-3 border rounded-md">
        <div className="text-sm text-muted-foreground">
          No hay información de punto de venta.
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-[56vh] overflow-auto">
      <h4 className="text-sm font-medium">Point of Sale</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 min-h-[200px]">
        {/* POS card */}
        <div className="p-3 border rounded-md flex flex-col h-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <FieldRow label="Agente / Usuario">
                {renderVal(pos.agentId ?? pos.user)}
              </FieldRow>
            </div>
            <div>
              <FieldRow label="Country">{renderVal(pos.country)}</FieldRow>
            </div>
            <div>
              <FieldRow label="KIU Device">
                {renderVal(pos.kiuDeviceId ?? pos.kiu_device_id)}
              </FieldRow>
            </div>

            <div>
              <FieldRow label="Sale Channel">
                {renderVal(pos.saleChannel ?? pos.sale_channel)}
              </FieldRow>
            </div>

            <div>
              <FieldRow label="Office Issue">
                {renderVal(pos.officeIssueCode ?? pos.office_issue_code)}
              </FieldRow>
            </div>
          </div>
        </div>

        {/* Raw POS card (se muestra al lado en md+) */}
        {pos.raw ? (
          <div className="p-3 border rounded-md flex flex-col h-full">
            <div className="text-sm font-medium">Raw POS</div>
            <div className="mt-2 overflow-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {JSON.stringify(pos.raw ?? pos, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="p-3 border rounded-md text-sm text-muted-foreground">
            No hay raw POS.
          </div>
        )}
      </div>
    </div>
  );
}
