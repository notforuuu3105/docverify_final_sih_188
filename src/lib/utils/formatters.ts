// Helper formatting utilities

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatPercent(val?: number): string {
  if (val === undefined || isNaN(val)) return '0%';
  return `${Number(val).toFixed(1)}%`;
}

export function getVerdictBadgeClass(verdict?: string): string {
  switch (verdict) {
    case 'authentic':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'tampered':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    case 'forged':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'suspicious':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
}

export function getSeverityBadgeClass(severity?: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    case 'high':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    case 'medium':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    case 'low':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
  }
}

export function getTagColorClass(tag: 'red' | 'yellow' | 'green' | 'blue'): {
  border: string;
  bg: string;
  badge: string;
  indicator: string;
} {
  switch (tag) {
    case 'red':
      return {
        border: 'border-rose-500',
        bg: 'bg-rose-500/20',
        badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        indicator: 'bg-rose-500',
      };
    case 'yellow':
      return {
        border: 'border-amber-500',
        bg: 'bg-amber-500/20',
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        indicator: 'bg-amber-500',
      };
    case 'green':
      return {
        border: 'border-emerald-500',
        bg: 'bg-emerald-500/20',
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        indicator: 'bg-emerald-500',
      };
    case 'blue':
      return {
        border: 'border-sky-500',
        bg: 'bg-sky-500/20',
        badge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
        indicator: 'bg-sky-500',
      };
  }
}
