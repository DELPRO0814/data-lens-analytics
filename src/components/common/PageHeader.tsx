/**
 * PageHeader 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 페이지 상단에 제목과 설명, 그리고 "추가" 버튼을 일관된 디자인으로 보여주는 용도입니다.
 * - title은 항상 필수로 표시됩니다.
 * - description이 있으면 제목 아래에 표시됩니다.
 * - onAdd 함수가 전달되면 우측에 "추가" 버튼이 나타나고, 클릭 시 해당 함수가 실행됩니다.
 * - 버튼 텍스트는 addButtonText로 바꿀 수 있으며, 기본값은 "추가"입니다.
 * 
 * 상세 설명:
 * - title(문자열)은 페이지의 메인 제목으로 항상 표시됩니다.
 * - description(문자열)은 있을 때만 제목 아래에 설명으로 표시됩니다.
 * - onAdd(함수)가 있으면 우측에 추가 버튼이 나타나고, 클릭 시 해당 함수가 실행됩니다.
 * - addButtonText(문자열)는 버튼에 표시할 텍스트로, 기본값은 "추가"입니다.
 * - 예시: 고객 목록 페이지라면 "고객 목록" 제목, "새 고객 추가" 버튼 등이 이 컴포넌트로 구현됩니다.
 */

import React from 'react';
// Button 컴포넌트와 Plus(+) 아이콘을 불러옵니다.
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// PageHeader 컴포넌트가 받을 수 있는 속성(props) 타입 정의
interface PageHeaderProps {
  title: string; // 페이지의 제목(필수)
  description?: string; // 페이지의 설명(선택)
  onAdd?: () => void; // 추가 버튼 클릭 시 실행할 함수(선택)
  addButtonText?: string; // 추가 버튼에 표시할 텍스트(선택, 기본값: "추가")
}

// PageHeader 컴포넌트 정의
const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  onAdd, 
  addButtonText = "추가" // addButtonText가 전달되지 않으면 "추가" 사용
}) => {
  return (
    // 헤더 전체 영역: 제목/설명(좌측) + 추가 버튼(우측)
    <div className="flex items-center justify-between mb-6">
      {/* 좌측: 제목과 설명 */}
      <div>
        {/* 제목(항상 표시) */}
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {/* 설명(있을 때만 표시) */}
        {description && (
          <p className="text-gray-600 mt-1">{description}</p>
        )}
      </div>
      {/* 우측: 추가 버튼(추가 기능이 있을 때만 표시) */}
      {onAdd && (
        <Button onClick={onAdd}>
          {/* Plus 아이콘과 버튼 텍스트 */}
          <Plus className="w-4 h-4 mr-2" />
          {addButtonText}
        </Button>
      )}
    </div>
  );
};

export default PageHeader;
