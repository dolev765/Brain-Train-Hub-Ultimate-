
import React from 'react';

interface ScoreBarProps {
  label: string;
  score: number;
  color: string;
  Icon: React.ElementType;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ label, score, color, Icon }) => {
  const percentage = Math.round(score * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1 text-slate-300">
        <div className="flex items-center gap-2">
            <Icon className="w-5 h-5"/>
            <span className="font-medium">{label}</span>
        </div>
        <span className="text-sm font-bold text-cyan-400">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5">
        <div
          className={`${color} h-2.5 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ScoreBar;
