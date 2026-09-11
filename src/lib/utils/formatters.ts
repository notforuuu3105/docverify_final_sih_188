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
      return 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm';
    case 'tampered':
      return 'bg-rose-50 text-rose-800 border-rose-300 shadow-sm';
    case 'forged':
      return 'bg-purple-50 text-purple-900 border-purple-300 shadow-sm';
    case 'suspicious':
      return 'bg-amber-50 text-amber-900 border-amber-300 shadow-sm';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300 shadow-sm';
  }
}

export function getSeverityBadgeClass(severity?: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-rose-100 text-rose-900 border-rose-300 font-semibold';
    case 'high':
      return 'bg-orange-100 text-orange-900 border-orange-300 font-semibold';
    case 'medium':
      return 'bg-amber-100 text-amber-900 border-amber-300 font-semibold';
    case 'low':
      return 'bg-blue-100 text-blue-900 border-blue-300 font-semibold';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300 font-semibold';
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
        border: 'border-rose-600',
        bg: 'bg-rose-50',
        badge: 'bg-rose-50 text-rose-800 border-rose-300',
        indicator: 'bg-rose-600',
      };
    case 'yellow':
      return {
        border: 'border-amber-600',
        bg: 'bg-amber-50',
        badge: 'bg-amber-50 text-amber-800 border-amber-300',
        indicator: 'bg-amber-600',
      };
    case 'green':
      return {
        border: 'border-emerald-600',
        bg: 'bg-emerald-50',
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        indicator: 'bg-emerald-600',
      };
    case 'blue':
      return {
        border: 'border-sky-600',
        bg: 'bg-sky-50',
        badge: 'bg-sky-50 text-sky-800 border-sky-300',
        indicator: 'bg-sky-600',
      };
  }
}
