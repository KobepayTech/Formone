import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this is where we'd report to an error-tracking service.
    console.error('Uncaught error in component tree:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-50">
            <AlertTriangle className="h-7 w-7 text-error-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Something went wrong</h1>
            <p className="mt-1 max-w-md text-sm text-gray-500">
              An unexpected error occurred. Try reloading the page — if the problem
              persists, please contact support.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
