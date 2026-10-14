'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import type { NodeStatus, RoadmapNode } from '@/lib/types';

const STATUS_STYLES: Record<
  NodeStatus,
  {
    container: string;
    badge: string;
    icon: string;
    badgeLabel: string;
  }
> = {
  mastered: {
    container: 'border-emerald-500/60 bg-emerald-950/80 text-emerald-50',
    badge: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/40',
    icon: 'text-emerald-400',
    badgeLabel: 'Mastered',
  },
  weak: {
    container: 'weak-glow cursor-pointer border-rose-500 bg-rose-950/80 text-rose-50',
    badge: 'bg-rose-500/15 text-rose-300 ring-rose-500/40',
    icon: 'text-rose-400',
    badgeLabel: 'Needs review',
  },
  next: {
    container: 'border-sky-500/60 bg-sky-950/80 text-sky-50',
    badge: 'bg-sky-500/15 text-sky-300 ring-sky-500/40',
    icon: 'text-sky-400',
    badgeLabel: 'Up next',
  },
};

function StatusIcon({ status, className }: { status: NodeStatus; className: string }) {
  if (status === 'mastered') return <CheckCircle2 className={className} aria-hidden />;
  if (status === 'weak') return <AlertTriangle className={className} aria-hidden />;
  return <ChevronRight className={className} aria-hidden />;
}

function CustomNode({ data }: NodeProps<RoadmapNode>) {
  const status: NodeStatus = data.status in STATUS_STYLES ? data.status : 'next';
  const styles = STATUS_STYLES[status];

  return (
    <div
      className={`w-60 rounded-xl border-2 px-4 py-3 shadow-lg transition-colors duration-300 ${styles.container}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-slate-900 !bg-slate-400"
      />

      <div className="flex items-center gap-2.5">
        <StatusIcon status={status} className={`h-5 w-5 shrink-0 ${styles.icon}`} />
        <p className="text-sm font-semibold leading-tight">{data.label}</p>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${styles.badge}`}
        >
          {styles.badgeLabel}
        </span>
        {status === 'weak' && (
          <span className="text-[11px] font-medium text-rose-300/80">Click to start</span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-slate-900 !bg-slate-400"
      />
    </div>
  );
}

export default memo(CustomNode);
