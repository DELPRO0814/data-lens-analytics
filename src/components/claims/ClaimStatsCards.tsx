import React from 'react';
// ✅ 보내주신 card.tsx에서 필요한 모든 컴포넌트를 가져옵니다.
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription, // CardDescription을 추가로 import 합니다.
} from "@/components/ui/card";
import { AlertTriangle, ListChecks, Percent, Target } from 'lucide-react'; 

// 개별 스탯 카드를 위한 재사용 컴포넌트
const StatCard = ({ title, value, icon, description }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      {/* CardTitle의 기본 폰트 크기가 크므로, 여기서는 더 작은 스타일을 적용합니다. */}
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {/* ✅ [개선] 일반 <p> 태그 대신 CardDescription 컴포넌트를 사용합니다. */}
      <CardDescription className="text-xs">
        {description}
      </CardDescription>
    </CardContent>
  </Card>
);

// 4개의 스탯 카드를 묶어서 표시하는 메인 컴포넌트
const ClaimStatsCards = ({ stats }: { stats: any }) => {
  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="총 예측 건수"
        value={stats.totalCount}
        icon={<ListChecks className="h-4 w-4 text-muted-foreground" />}
        description="모든 클레임 예측의 총합"
      />
      <StatCard
        title="고위험 클레임"
        value={stats.highRiskCount}
        icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
        description="예측 수준 'High'인 클레임"
      />
      <StatCard
        title="평균 발생 확률"
        value={`${stats.avgProbability.toFixed(1)}%`}
        icon={<Percent className="h-4 w-4 text-muted-foreground" />}
        description="전체 클레임의 평균 발생 확률"
      />
      <StatCard
        title="평균 신뢰도"
        value={`${stats.avgConfidence.toFixed(1)}%`}
        icon={<Target className="h-4 w-4 text-muted-foreground" />}
        description="AI 예측 모델의 평균 신뢰도"
      />
    </div>
  );
};

export default ClaimStatsCards;