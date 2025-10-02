export default function FieldRow({ label, children, value }: any) {
  // Responsive: column on small screens, row on sm+
  return (
    <div className="min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground truncate">
            {children ?? value}
          </div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}
