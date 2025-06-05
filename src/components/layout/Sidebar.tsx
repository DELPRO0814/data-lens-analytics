/**
 * Sidebar 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - CRM 시스템의 좌측 네비게이션 메뉴로 데스크탑/모바일 반응형을 지원합니다.
 * - 메뉴 접기/펼치기, 모바일 오버레이, 활성화 하이라이트, 툴팁 등 다양한 UI 기능을 포함합니다.
 * - coreMenuItems(필수 메뉴)와 optionalMenuItems(선택 메뉴)로 구성되어 쉽게 메뉴 구조를 관리할 수 있습니다.
 * - 현재 경로와 일치하는 메뉴는 하이라이트 처리되어 시각적 피드백을 제공합니다.
 * - 접힌 상태에서는 아이콘만 표시되며, 마우스 오버 시 툴팁으로 메뉴명을 보여줍니다.
 * 
 * 상세 설명:
 * - isOpen: 모바일에서의 사이드바 열림 상태를 제어합니다.
 * - onToggle: 모바일에서 사이드바를 열고 닫는 토글 함수입니다.
 * - isCollapsed: 데스크탑에서의 사이드바 접힘 상태를 관리합니다.
 * - onCollapse: 데스크탑에서 사이드바를 접고 펼치는 토글 함수입니다.
 * - useLocation 훅으로 현재 경로를 추적해 활성 메뉴를 판별합니다.
 * - Tailwind CSS의 transform/transition을 활용해 부드러운 애니메이션을 구현했습니다.
 * - 접힌 상태에서의 툴팁은 CSS group-hover와 absolute positioning으로 구현되었습니다.
 * - 반응형 처리를 위해 window.innerWidth를 사용해 모바일 환경을 감지합니다.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// lucide-react에서 다양한 아이콘 불러오기
import { 
  Users, 
  // Phone, // 연락처 메뉴(필요시 주석 해제)
  Package, 
  TrendingUp, 
  // Target, // 세그먼트 메뉴(필요시 주석 해제)
  Activity, 
  Heart, 
  ShoppingCart, 
  AlertTriangle, 
  Shield, 
  Calendar, 
  DollarSign, 
  BarChart3,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingDown
} from 'lucide-react';

// Sidebar 컴포넌트가 받을 수 있는 props 타입 정의
interface SidebarProps {
  isOpen: boolean;        // 모바일에서 사이드바 오픈 여부
  onToggle: () => void;   // 오픈/닫기 토글 함수
  isCollapsed: boolean;   // 데스크탑에서 사이드바 접힘 여부
  onCollapse: () => void; // 접기/펼치기 토글 함수
}

// 주요 메뉴 항목(coreMenuItems): 경로, 라벨, 아이콘 지정
const coreMenuItems = [
  { path: '/', label: '대시보드', icon: BarChart3 },
  { path: '/customers', label: '고객', icon: Users },
  { path: '/products', label: '제품', icon: Package },
  { path: '/predictions', label: '예측', icon: TrendingUp },
  { path: '/sales-activities', label: '영업 활동', icon: Activity },
  { path: '/engagements', label: '참여', icon: Heart },
  { path: '/orders', label: '주문', icon: ShoppingCart },
  { path: '/issues', label: '이슈', icon: AlertTriangle },
  { path: '/claims', label: '클레임', icon: Shield },
  { path: '/sales-forecast', label: '영업 접촉 예측', icon: Calendar },
  { path: '/profit-grade', label: '고객 수익 등급', icon: DollarSign },
  { path: '/order-forecast', label: '고객 주문 예측', icon: TrendingUp },
  { path: '/priority-dashboard', label: '우선순위 대시보드', icon: Star },
  // { path: '/opportunity-analysis', label: '영업 기회 분석', icon: TrendingDown }
];

// 선택적 메뉴 항목(optionalMenuItems): 필요 시 주석 해제하여 추가 가능
const optionalMenuItems = [
  // { path: '/contacts', label: '연락처', icon: Phone },
  // { path: '/segments', label: '세그먼트', icon: Target },
];

// 최종 메뉴 항목 배열
const menuItems = [...coreMenuItems, ...optionalMenuItems];

// Sidebar 컴포넌트 정의
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, isCollapsed, onCollapse }) => {
  // 현재 URL 경로를 가져옴(활성화 메뉴 표시용)
  const location = useLocation();

  return (
    <>
      {/* 모바일에서 사이드바가 열려 있을 때, 뒷배경 오버레이(클릭 시 닫힘) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* 실제 사이드바 영역 */}
      <div className={`
        fixed left-0 top-0 h-full bg-white shadow-lg z-30 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}      // 모바일: 열림/닫힘 슬라이드
        md:translate-x-0 md:static md:z-auto                   // 데스크탑: 항상 보임
        ${isCollapsed ? 'md:w-16' : 'md:w-64'}                // 데스크탑: 접힘/펼침 너비
        w-64
      `}>
        {/* 상단: 로고/타이틀 + 접기/닫기 버튼 */}
        <div className="flex items-center justify-between p-4 border-b">
          {/* 타이틀: 접힌 상태에서는 숨김 */}
          <h1 className={`font-bold text-xl text-blue-600 transition-opacity duration-300 ${isCollapsed ? 'md:opacity-0 md:hidden' : 'opacity-100'}`}>
            CRM 시스템
          </h1>
          <div className="flex items-center space-x-2">
            {/* 데스크탑: 접기/펼치기 버튼 */}
            <button
              onClick={onCollapse}
              className="p-2 rounded-lg hover:bg-gray-100 hidden md:block"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            {/* 모바일: 닫기(X) 버튼 */}
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <nav className="mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // 현재 경로와 메뉴 경로가 일치하면 활성화 처리
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-4 py-3 mx-2 rounded-lg transition-colors relative group
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
                // 모바일에서는 메뉴 클릭 시 자동으로 사이드바 닫힘
                onClick={() => window.innerWidth < 768 && onToggle()}
                // 접힌 상태에서 툴팁용 title 속성
                title={isCollapsed ? item.label : ''}
              >
                {/* 메뉴 아이콘 */}
                <Icon className="w-5 h-5 flex-shrink-0" />
                {/* 메뉴 라벨: 접힌 상태에서는 숨김 */}
                <span className={`ml-3 transition-opacity duration-300 ${isCollapsed ? 'md:opacity-0 md:hidden' : 'opacity-100'}`}>
                  {item.label}
                </span>
                
                {/* 접힌 상태에서 마우스 오버 시 툴팁 표시(데스크탑) */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 hidden md:block">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
