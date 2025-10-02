import React from "react";

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
    <div className="max-h-[56vh] overflow-auto space-y-2">
      <h4 className="text-sm font-medium">Point of Sale</h4>
      <div className="p-3 border rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <strong>Agent / User:</strong> {renderVal(pos.agentId ?? pos.user)}
          </div>
          <div>
            <strong>Country:</strong> {renderVal(pos.country)}
          </div>
          <div>
            <strong>KIU Device:</strong>{" "}
            {renderVal(pos.kiuDeviceId ?? pos.kiu_device_id)}
          </div>
          <div>
            <strong>Sale Channel:</strong>{" "}
            {renderVal(pos.saleChannel ?? pos.sale_channel)}
          </div>
          <div className="md:col-span-2">
            <strong>Office Issue:</strong>{" "}
            {renderVal(pos.officeIssueCode ?? pos.office_issue_code)}
          </div>
        </div>
      </div>
      {/* Raw separado en su propia tarjeta */}
      {pos.raw && (
        <div className="p-3 border rounded-md">
          <div className="text-sm font-medium">Raw POS</div>
          <pre className="whitespace-pre-wrap text-sm mt-2">
            {JSON.stringify(pos.raw ?? pos, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
