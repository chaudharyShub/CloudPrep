import { Link } from 'react-router';
import { Compass } from 'lucide-react';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <EmptyState
      icon={Compass}
      headingLevel="h1"
      title="Page not found"
      description="The page you're looking for doesn't exist or has moved."
      action={
        <Link to="/dashboard" className={buttonClasses()}>
          Go to dashboard
        </Link>
      }
      className="py-24"
    />
  );
}
