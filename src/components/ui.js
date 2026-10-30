// Small presentational pieces used on many pages. Server components: no state, no hooks.
import { IconInbox } from "./Icons";

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

// An empty screen is an invitation to act: say what is missing and offer the next step.
export function EmptyState({ title, children, action, Icon = IconInbox }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Icon width={24} height={24} />
      </span>
      <h2 className="text-xl font-semibold">{title}</h2>
      {children && <p className="mt-2 max-w-md text-muted">{children}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

const STATUS_STYLE = {
  placed: "badge-neutral",
  preparing: "badge-warn",
  "on the way": "badge-warn",
  delivered: "badge-ok",
  cancelled: "badge-bad",
};

// Status is always written as text, never colour alone.
export function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_STYLE[status] ?? "badge-neutral"}`}>{status}</span>;
}

export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}
