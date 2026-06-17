import { Link } from 'react-router';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
        <Compass className="h-7 w-7 text-brand-600" />
      </div>
      <div>
        <p className="font-display text-5xl font-bold text-brand-600">404</p>
        <h1 className="mt-2 text-xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-1 max-w-md text-sm text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link
        to="/"
        className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        Back to home
      </Link>
    </div>
  );
}
