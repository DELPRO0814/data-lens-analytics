
import React from 'react';
// lucide-react에서 아이콘 타입 불러오기
import { LucideIcon } from 'lucide-react';

// MetricCard 컴포넌트가 받을 수 있는 props 타입 정의
interface MetricCardProps {
  
  title: string; // 카드 제목(예: "총 고객 수")
  value: string | number; // 카드에 표시할 값(예: 1200)
  icon: LucideIcon; // 카드 우측에 표시할 아이콘 컴포넌트
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'; // 카드 색상 테마
  trend?: { // (선택) 트렌드 정보: 증감률 등
    value: number; // 트렌드 수치(예: 3.5)
    isPositive: boolean; // 상승 여부(true면 +, false면 -)
  };
  onClick?: () => void; // (선택) 카드 클릭 시 실행할 함수
}

// 색상별 그라데이션 및 스타일 매핑
const colorClasses = {
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-gradient-to-r from-blue-100 to-cyan-100',
    iconText: 'text-blue-600',
    shadow: 'shadow-blue-200/50'
  },
  green: {
    gradient: 'from-green-500 to-emerald-500',
    iconBg: 'bg-gradient-to-r from-green-100 to-emerald-100',
    iconText: 'text-green-600',
    shadow: 'shadow-green-200/50'
  },
  purple: {
    gradient: 'from-purple-500 to-violet-500',
    iconBg: 'bg-gradient-to-r from-purple-100 to-violet-100',
    iconText: 'text-purple-600',
    shadow: 'shadow-purple-200/50'
  },
  orange: {
    gradient: 'from-orange-500 to-amber-500',
    iconBg: 'bg-gradient-to-r from-orange-100 to-amber-100',
    iconText: 'text-orange-600',
    shadow: 'shadow-orange-200/50'
  },
  red: {
    gradient: 'from-red-500 to-pink-500',
    iconBg: 'bg-gradient-to-r from-red-100 to-pink-100',
    iconText: 'text-red-600',
    shadow: 'shadow-red-200/50'
  },
};

// MetricCard 컴포넌트 정의
const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend,
  onClick 
}) => {
  const colorConfig = colorClasses[color];

  return (
    // 카드 전체 컨테이너: 글래스모피즘 효과, 그라데이션 테두리, 애니메이션
    <div 
      className={`
        glass-card animated-card rounded-2xl p-6 relative overflow-hidden group
        ${onClick ? 'cursor-pointer hover:shadow-2xl' : ''} 
        ${colorConfig.shadow}
      `}
      onClick={onClick}
    >
      {/* 배경 그라데이션 효과 */}
      <div className={`absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-r ${colorConfig.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
      
      {/* 카드 내부: 좌측(텍스트), 우측(아이콘)로 배치 */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          {/* 제목: 작은 글씨, 회색, 아래 여백 */}
          <p className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">{title}</p>
          {/* 값: 크고 굵은 글씨, 진한 회색 */}
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {/* 트렌드(증감률)가 있으면 아래에 % 표시, 색상은 상승/하락에 따라 다름 */}
          {trend && (
            <div className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${trend.isPositive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
              }
            `}>
              <span className="mr-1">
                {trend.isPositive ? '↗' : '↘'}
              </span>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
        {/* 아이콘 영역: 그라데이션 배경, 둥근 모서리, 애니메이션 */}
        <div className={`
          p-4 rounded-2xl ${colorConfig.iconBg} 
          group-hover:scale-110 transition-all duration-300
          shadow-lg relative overflow-hidden
        `}>
          {/* 아이콘 배경 shimmer 효과 */}
          <div className="absolute inset-0 shimmer rounded-2xl opacity-0 group-hover:opacity-100"></div>
          {/* 아이콘 컴포넌트: 크기 28px */}
          <Icon className={`w-7 h-7 ${colorConfig.iconText} relative z-10`} />
        </div>
      </div>

      {/* 하단 장식선 */}
      <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${colorConfig.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
    </div>
  );
};

export default MetricCard;
