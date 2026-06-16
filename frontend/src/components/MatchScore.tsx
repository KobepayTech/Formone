import type { FC } from 'react';

interface MatchScoreProps {
  score: number;
}

const MatchScore: FC<MatchScoreProps> = ({ score }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return '#27AE60';
    if (score >= 60) return '#3B82F6';
    if (score >= 40) return '#F2994A';
    return '#E74C3C';
  };

  const getBgColor = () => {
    if (score >= 80) return 'bg-success-50';
    if (score >= 60) return 'bg-info-50';
    if (score >= 40) return 'bg-warning-50';
    return 'bg-error-50';
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-2 py-1 ${getBgColor()}`}>
      <div className="relative h-10 w-10">
        <svg className="h-10 w-10 -rotate-90" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke={getColor()}
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-gray-700">
          {score}
        </span>
      </div>
      <span className="text-xs font-medium text-gray-600 pr-1">Match</span>
    </div>
  );
};

export default MatchScore;
