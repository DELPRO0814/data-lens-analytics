/**
 * ChartCard 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 카드 형태로 막대(bar) 또는 파이(pie) 차트를 표시합니다.
 * - title(제목)은 항상 카드 상단에 표시됩니다.
 * - type에 따라 막대/파이 차트가 동적으로 결정되어 렌더링됩니다.
 * - dataKey, nameKey로 데이터의 값/라벨 필드를 지정할 수 있으며(기본값: value, name), 다양한 데이터 구조에 대응합니다.
 * - 파이차트는 각 조각마다 COLORS 배열을 순환해 색상이 다르게 지정됩니다.
 * - ResponsiveContainer로 감싸져 있어 어떤 화면 크기에서도 차트가 자동으로 크기에 맞게 표시됩니다.
 *
 * 상세 설명:
 * - recharts 라이브러리의 BarChart, PieChart 등 다양한 차트 컴포넌트를 활용합니다.
 * - 막대 차트에는 X/Y축, 격자선, 툴팁이 포함되어 있습니다.
 * - 파이 차트는 각 조각에 %와 라벨이 표시되며, labelLine은 숨김 처리되어 깔끔한 디자인을 유지합니다.
 * - 차트 영역은 고정 높이(h-64)로 설정되어 일관된 레이아웃을 제공합니다.
 */

import React from 'react';
// recharts 라이브러리에서 차트 관련 컴포넌트 불러오기
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// ChartCard 컴포넌트가 받을 수 있는 props(속성) 타입 정의
interface ChartCardProps {
  title: string;        // 차트 카드 상단에 표시할 제목
  data: any[];          // 차트에 사용할 데이터 배열
  type: 'bar' | 'pie';  // 차트 타입(bar: 막대, pie: 파이)
  dataKey?: string;     // 데이터에서 값으로 사용할 필드명 (기본값: 'value')
  nameKey?: string;     // 데이터에서 이름(라벨)으로 사용할 필드명 (기본값: 'name')
}

// 파이차트의 각 조각에 사용할 색상 배열
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// ChartCard 컴포넌트 정의
const ChartCard: React.FC<ChartCardProps> = ({
  title,
  data,
  type,
  dataKey = 'value', // dataKey가 없으면 'value' 사용
  nameKey = 'name'   // nameKey가 없으면 'name' 사용
}) => {
  return (
    // 카드 형태의 차트 컨테이너
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      {/* 카드 상단 제목 */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {/* 차트 영역: 높이 고정, 반응형 */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {/* type에 따라 막대(bar) 또는 파이(pie) 차트 렌더링 */}
          {type === 'bar' ? (
            // 막대 차트
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" /> {/* 배경 격자선 */}
              <XAxis dataKey={nameKey} />              {/* X축: 이름 */}
              <YAxis />                                {/* Y축: 값 */}
              <Tooltip />                              {/* 마우스 오버 시 툴팁 */}
              <Bar dataKey={dataKey} fill="#3B82F6" /> {/* 데이터 막대 */}
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
                outerRadius={80}                  // 파이차트 반지름
                fill="#8884d8"
                dataKey={dataKey}                 // 값으로 사용할 필드명
              >
                {/* 각 조각마다 색상 다르게 지정 */}
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip /> {/* 마우스 오버 시 툴팁 */}
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartCard;
