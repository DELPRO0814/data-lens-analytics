/**
 * AlertBanner 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 여러 개의 알림 메시지(배너)를 한 번에 화면 상단 등에 표시합니다.
 * - 각 알림은 타입(warning, info, success)에 따라 색상과 아이콘이 달라집니다.
 * - 알림마다 제목, 메시지, (있을 경우) 액션 버튼, 닫기(X) 버튼이 표시됩니다.
 * - 액션 버튼은 actionLabel과 onAction이 모두 있을 때만 나타나며, 클릭 시 원하는 동작을 실행할 수 있습니다.
 * - 닫기 버튼을 누르면 해당 알림이 사라집니다(onDismiss 호출).
 * - 알림이 하나도 없으면 아무것도 렌더링하지 않습니다.
 *
 * 상세 설명:
 * - props로 받은 alerts 배열을 순회하며 각각의 알림을 렌더링합니다.
 * - 알림의 type(warning, info, success)에 따라 배경색, 텍스트색, 아이콘이 다르게 적용됩니다.
 * - 액션 버튼은 actionLabel과 onAction이 모두 있을 때만 나타나며, 클릭 시 onAction 함수가 실행됩니다.
 * - 닫기(X) 버튼을 누르면 onDismiss 함수가 호출되어 해당 알림이 사라집니다.
 * - 알림이 없으면(null 또는 빈 배열) 컴포넌트는 아무것도 렌더링하지 않습니다.
 */

import React from 'react';
import { AlertTriangle, X, Calendar } from 'lucide-react'; // 아이콘 불러오기
import { Button } from '@/components/ui/button'; // 커스텀 버튼 컴포넌트 불러오기

// AlertBanner 컴포넌트에 전달되는 props(속성) 타입 정의
interface AlertBannerProps {
  alerts: Array<{
    id: string; // 각 알림의 고유 식별자
    type: 'warning' | 'info' | 'success'; // 알림의 종류(경고, 정보, 성공)
    title: string; // 알림의 제목(굵게 표시)
    message: string; // 알림의 본문 메시지
    actionLabel?: string; // (선택) 액션 버튼에 표시할 텍스트
    onAction?: () => void; // (선택) 액션 버튼 클릭 시 실행할 함수
  }>;
  onDismiss: (id: string) => void; // 알림을 닫을 때 호출되는 함수(알림 id 전달)
}

// AlertBanner 컴포넌트 정의
const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onDismiss }) => {
  // 알림이 하나도 없으면 아무것도 표시하지 않음
  if (alerts.length === 0) return null;

  // 알림 종류(type)에 따라 배경색과 테두리색을 다르게 지정
  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-orange-100 border-orange-300';
      case 'info': return 'bg-blue-100 border-blue-300';
      case 'success': return 'bg-green-100 border-green-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  // 알림 종류(type)에 따라 텍스트 색상을 다르게 지정
  const getTextColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-orange-800';
      case 'info': return 'text-blue-800';
      case 'success': return 'text-green-800';
      default: return 'text-gray-800';
    }
  };

  // 알림 종류(type)에 따라 아이콘을 다르게 표시
  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'info': return <Calendar className="w-5 h-5" />;
      case 'success': return <Calendar className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    // 여러 개의 알림을 위에서 아래로 나열
    <div className="space-y-2 mb-4">
      {alerts.map((alert) => (
        // 각 알림 박스
        <div
          key={alert.id}
          className={
            // 배경색, 테두리색, 텍스트색을 동적으로 적용
            `border rounded-lg p-4 ${getBackgroundColor(alert.type)} ${getTextColor(alert.type)}`
          }
        >
          <div className="flex items-center justify-between">
            {/* 왼쪽: 아이콘 + 제목 + 메시지 */}
            <div className="flex items-center space-x-3">
              {getIcon(alert.type)}
              <div>
                <h4 className="font-semibold">{alert.title}</h4>
                <p className="text-sm">{alert.message}</p>
              </div>
            </div>
            {/* 오른쪽: 액션 버튼(있을 때만)과 닫기(X) 버튼 */}
            <div className="flex items-center space-x-2">
              {/* 액션 버튼: actionLabel과 onAction이 모두 있을 때만 표시 */}
              {alert.actionLabel && alert.onAction && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={alert.onAction}
                  className="text-sm"
                >
                  {alert.actionLabel}
                </Button>
              )}
              {/* 닫기(X) 버튼: 항상 표시, 클릭 시 onDismiss 호출 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(alert.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertBanner;
