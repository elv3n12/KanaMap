import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
};

export function ObsPanel({ children, className = "", header, footer }: Props) {
  return (
    <div className={`obs-panel flex flex-col overflow-hidden ${className}`}>
      {header ? <div className="border-b border-obs-border px-4 py-3">{header}</div> : null}
      <div className="min-h-0 flex-1">{children}</div>
      {footer ? <div className="border-t border-obs-border px-4 py-2">{footer}</div> : null}
    </div>
  );
}
