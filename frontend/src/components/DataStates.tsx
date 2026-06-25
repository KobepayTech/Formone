import type { FC } from 'react';
import { Loader2, AlertTriangle, Inbox } from 'lucide-react';

export const LoadingState: FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
    <Loader2 className="h-7 w-7 animate-spin" />
    <p className="text-sm">{label}</p>
  </div>
);

export const ErrorState: FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-50">
      <AlertTriangle className="h-6 w-6 text-error-500" />
    </div>
    <p className="max-w-sm text-sm text-gray-600">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        Try again
      </button>
    )}
  </div>
);

export const EmptyState: FC<{ message: string; icon?: typeof Inbox }> = ({ message, icon: Icon = Inbox }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-gray-400">
    <Icon className="h-10 w-10 text-gray-300" />
    <p className="text-sm">{message}</p>
  </div>
);
