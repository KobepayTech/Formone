import type { FC } from 'react';
import { Flame } from 'lucide-react';

interface DemandBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical';
}

const DemandBadge: FC<DemandBadgeProps> = ({ level }) => {
  const getStyles = () => {
    switch (level) {
      case 'low':
        return 'bg-success-50 text-success-500';
      case 'medium':
        return 'bg-warning-50 text-warning-500';
      case 'high':
        return 'bg-urgent-50 text-urgent-500';
      case 'critical':
        return 'bg-error-50 text-error-500';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getLabel = () => {
    switch (level) {
      case 'low': return 'Low Demand';
      case 'medium': return 'Medium Demand';
      case 'high': return 'High Demand';
      case 'critical': return 'Critical Demand';
      default: return level;
    }
  };

  const showFire = level === 'high' || level === 'critical';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStyles()}`}
    >
      {showFire && <Flame className="h-3 w-3" />}
      {getLabel()}
    </span>
  );
};

export default DemandBadge;
