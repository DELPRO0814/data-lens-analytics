/**
 * MetricCard 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 대시보드 등에서 주요 숫자 지표(메트릭)를 카드 형태로 표시합니다.
 * - 카드에는 제목, 값, (선택) 트렌드(증감률), 아이콘이 포함됩니다.
 * - 색상 테마(color)에 따라 카드 우측 아이콘 배경/테두리/글씨색이 달라집니다.
 * - onClick이 있으면 카드 전체가 클릭 가능하며, 호버 시 그림자 효과가 생깁니다.
 * - 트렌드가 있으면 값 아래에 +3.5% 또는 -2.1% 등으로 표시되며, 색상도 상승/하락에 따라 달라집니다.
 *
 * 상세 설명:
 * - title(문자열)은 카드 상단에 작은 글씨로 표시됩니다.
 * - value(숫자/문자열)는 크고 굵은 글씨로 강조됩니다.
 * - icon(아이콘 컴포넌트)는 카드 우측에 컬러 테마에 맞게 표시됩니다.
 * - trend가 있으면 증감률(%)이 값 아래에 표시되고, 상승이면 초록, 하락이면 빨간색으로 표시됩니다.
 * - onClick이 있으면 카드 전체가 클릭 가능하며, 호버 시 그림자 효과가 강화됩니다.
 * - Tailwind CSS로 일관된 디자인과 반응형 UI를 제공합니다.
 */

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

// 색상별 Tailwind CSS 클래스 매핑
const colorClasses = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
  red: 'bg-red-50 text-red-600 border-red-200',
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
  return (
    // 카드 전체 컨테이너: 흰색 배경, 둥근 모서리, 그림자, 테두리
    // onClick이 있으면 커서 포인터 및 호버 시 그림자 효과
    <div 
      className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      {/* 카드 내부: 좌측(텍스트), 우측(아이콘)로 배치 */}
      <div className="flex items-center justify-between">
        <div>
          {/* 제목: 작은 글씨, 회색, 아래 여백 */}
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {/* 값: 크고 굵은 글씨, 진한 회색 */}
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {/* 트렌드(증감률)가 있으면 아래에 % 표시, 색상은 상승/하락에 따라 다름 */}
          {trend && (
            <p className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'} mt-1`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </p>
          )}
        </div>
        {/* 아이콘 영역: 배경색, 텍스트색, 테두리색은 colorClasses에서 가져옴, 둥근 모서리, 패딩 */}
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          {/* 아이콘 컴포넌트: 크기 24px */}
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;