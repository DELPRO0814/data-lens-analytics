
import React from 'react';
// recharts 라이브러리에서 차트 관련 컴포넌트 불러오기
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// ChartCard 컴포넌트가 받을 수 있는 props(속성) 타입 정의 2025.06.13 kim shin
interface ChartCardProps {
  title: string;        // 차트 카드 상단에 표시할 제목
  data: any[];          // 차트에 사용할 데이터 배열
  type: 'bar' | 'pie';  // 차트 타입(bar: 막대, pie: 파이)
  dataKey?: string;     // 데이터에서 값으로 사용할 필드명 (기본값: 'value')
  nameKey?: string;     // 데이터에서 이름(라벨)으로 사용할 필드명 (기본값: 'name')
}

// 파이차트의 각 조각에 사용할 더 생동감 있는 색상 배열
const COLORS = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', 
  '#EF4444', '#06B6D4', '#84CC16', '#F97316',
  '#EC4899', '#6366F1', '#14B8A6', '#F59E0B'
];

// 그라데이션 정의를 위한 렌더링 함수
const renderGradientDefs = () => (
  <defs>
    <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2}/>
    </linearGradient>
    <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.2}/>
    </linearGradient>
    <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#10B981" stopOpacity={0.2}/>
    </linearGradient>
  </defs>
);

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 rounded-xl shadow-lg border border-white/30">
        <p className="text-sm font-medium text-gray-800 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ChartCard 컴포넌트 정의
const ChartCard: React.FC<ChartCardProps> = ({
  title,
  data,
  type,
  dataKey = 'value', // dataKey가 없으면 'value' 사용
  nameKey = 'name'   // nameKey가 없으면 'name' 사용
}) => {
  return (
    // 카드 형태의 차트 컨테이너: 글래스모피즘 효과 적용
    <div className="glass-card rounded-2xl p-6 animated-card relative overflow-hidden group">
      {/* 배경 장식 */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
      
      {/* 카드 상단 제목 */}
      <div className="relative z-10 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
      </div>
      
      {/* 차트 영역: 높이 고정, 반응형 */}
      <div className="h-80 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          {/* type에 따라 막대(bar) 또는 파이(pie) 차트 렌더링 */}
          {type === 'bar' ? (
            // 막대 차트
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              {renderGradientDefs()}
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
              <XAxis 
                dataKey={nameKey} 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={dataKey} radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`bar-cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            // 파이 차트
            <PieChart>
              <Pie
                data={data}
                cx="50%" cy="50%"                 // 원의 중심 위치
                labelLine={false}                 // 라벨선 숨김
                label={({ name, percent }) =>     // 각 조각에 라벨 표시
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}                 // 파이차트 반지름
                innerRadius={40}                  // 도넛 형태로 만들기
                paddingAngle={2}                  // 조각 간 간격
                fill="#8884d8"
                dataKey={dataKey}                 // 값으로 사용할 필드명
              >
                {/* 각 조각마다 색상 다르게 지정 */}
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 하단 통계 정보 */}
      <div className="mt-4 pt-4 border-t border-white/20 relative z-10">
        <div className="flex justify-between text-sm text-gray-600">
          <span>총 항목: {data.length}개</span>
          <span>총 합계: {data.reduce((sum, item) => sum + (item[dataKey] || 0), 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;
