import type { FC } from 'react';

interface StatusBadgeProps {
  status: string;
  type: 'application' | 'payment' | 'document' | 'ticket';
}

const StatusBadge: FC<StatusBadgeProps> = ({ status, type }) => {
  const getStyles = () => {
    switch (type) {
      case 'application':
        switch (status) {
          case 'submitted':
            return 'bg-info-50 text-info-500';
          case 'paid':
          case 'completed':
            return 'bg-success-50 text-success-500';
          case 'under_review':
            return 'bg-warning-50 text-warning-500';
          case 'interview_scheduled':
            return 'bg-purple-50 text-purple-600';
          case 'accepted':
            return 'bg-success-50 text-success-600';
          case 'rejected':
            return 'bg-error-50 text-error-500';
          case 'waitlisted':
            return 'bg-warning-50 text-warning-600';
          case 'pending_payment':
            return 'bg-warning-50 text-warning-500';
          default:
            return 'bg-gray-100 text-gray-600';
        }
      case 'payment':
        switch (status) {
          case 'completed':
            return 'bg-success-50 text-success-500';
          case 'pending':
            return 'bg-warning-50 text-warning-500';
          case 'failed':
            return 'bg-error-50 text-error-500';
          case 'refunded':
            return 'bg-info-50 text-info-500';
          default:
            return 'bg-gray-100 text-gray-600';
        }
      case 'document':
        switch (status) {
          case 'pending':
            return 'bg-warning-50 text-warning-500';
          case 'verified':
            return 'bg-success-50 text-success-500';
          case 'rejected':
            return 'bg-error-50 text-error-500';
          case 'flagged':
            return 'bg-warning-50 text-warning-600';
          case 'blockchain_anchored':
            return 'bg-brand-50 text-brand-600';
          default:
            return 'bg-gray-100 text-gray-600';
        }
      case 'ticket':
        switch (status) {
          case 'generated':
            return 'bg-info-50 text-info-500';
          case 'printed':
            return 'bg-success-50 text-success-500';
          case 'downloaded':
            return 'bg-brand-50 text-brand-600';
          case 'used':
            return 'bg-gray-100 text-gray-600';
          case 'expired':
            return 'bg-error-50 text-error-500';
          default:
            return 'bg-gray-100 text-gray-600';
        }
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'application':
        switch (status) {
          case 'submitted': return 'Submitted';
          case 'paid': return 'Paid';
          case 'under_review': return 'Under Review';
          case 'interview_scheduled': return 'Interview Scheduled';
          case 'accepted': return 'Accepted';
          case 'rejected': return 'Rejected';
          case 'waitlisted': return 'Waitlisted';
          case 'pending_payment': return 'Pending Payment';
          default: return status;
        }
      case 'payment':
        switch (status) {
          case 'completed': return 'Completed';
          case 'pending': return 'Pending';
          case 'failed': return 'Failed';
          case 'refunded': return 'Refunded';
          default: return status;
        }
      case 'document':
        switch (status) {
          case 'pending': return 'Pending';
          case 'verified': return 'Verified';
          case 'rejected': return 'Rejected';
          case 'flagged': return 'Flagged';
          case 'blockchain_anchored': return 'Blockchain Anchored';
          default: return status;
        }
      case 'ticket':
        switch (status) {
          case 'generated': return 'Generated';
          case 'printed': return 'Printed';
          case 'downloaded': return 'Downloaded';
          case 'used': return 'Used';
          case 'expired': return 'Expired';
          default: return status;
        }
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStyles()}`}
    >
      {getLabel()}
    </span>
  );
};

export default StatusBadge;
