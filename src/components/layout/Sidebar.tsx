
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
  TrendingDown,
  Sparkles
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
  { path: '/', label: '대시보드', icon: BarChart3, gradient: 'from-blue-500 to-cyan-500' },
  { path: '/customers', label: '고객', icon: Users, gradient: 'from-green-500 to-emerald-500' },
  { path: '/products', label: '제품', icon: Package, gradient: 'from-orange-500 to-amber-500' },
  { path: '/predictions', label: '예측', icon: TrendingUp, gradient: 'from-purple-500 to-violet-500' },
  { path: '/sales-activities', label: '영업 활동', icon: Activity, gradient: 'from-pink-500 to-rose-500' },
  { path: '/engagements', label: '참여', icon: Heart, gradient: 'from-red-500 to-pink-500' },
  { path: '/orders', label: '주문', icon: ShoppingCart, gradient: 'from-indigo-500 to-blue-500' },
  { path: '/issues', label: '이슈', icon: AlertTriangle, gradient: 'from-yellow-500 to-orange-500' },
  { path: '/claims', label: '클레임', icon: Shield, gradient: 'from-slate-500 to-gray-500' },
  { path: '/profit-grade', label: '고객 수익 등급', icon: DollarSign, gradient: 'from-green-500 to-teal-500' },
  //{ path: '/order-forecast', label: '고객 주문 예측', icon: TrendingDown, gradient: 'from-blue-500 to-purple-500' },
  { path: '/priority-dashboard', label: '우선순위 대시보드', icon: Star, gradient: 'from-yellow-500 to-amber-500' },
];

// 선택적 메뉴 항목(optionalMenuItems): 필요 시 주석 해제하여 추가 가능
const optionalMenuItems = [
  // { path: '/contacts', label: '연락처', icon: Phone, gradient: 'from-blue-500 to-indigo-500' },
  // { path: '/segments', label: '세그먼트', icon: Target, gradient: 'from-purple-500 to-pink-500' },
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* 실제 사이드바 영역 */}
      <div className={`
        fixed left-0 top-0 h-full glass-sidebar z-30 transition-all duration-00 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}      // 모바일: 열림/닫힘 슬라이드
        md:translate-x-0 md:static md:z-999                   // 데스크탑: 항상 보임
        ${isCollapsed ? 'md:w-20' : 'md:w-72'}                // 데스크탑: 접힘/펼침 너비
        w-72
      `}>
        {/* 상단: 로고/타이틀 + 접기/닫기 버튼 */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          {/* 타이틀: 접힌 상태에서는 숨김 */}
          <div className={`transition-all duration-300 ${isCollapsed ? 'md:opacity-0 md:hidden' : 'opacity-100'}`}>
            <h1 className="font-bold text-2xl gradient-text flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-blue-500" />
              CRM 시스템
            </h1>
            <p className="text-sm text-gray-600 mt-1">비즈니스 관리 플랫폼</p>
          </div>
          <div className="flex items-center space-x-2">
            {/* 데스크탑: 접기/펼치기 버튼 */}
            <button
              onClick={onCollapse}
              className="p-2 rounded-xl hover:bg-white/30 transition-all duration-200 hidden md:block group"
            >
              {isCollapsed ? 
                <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" /> : 
                <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
              }
            </button>
            {/* 모바일: 닫기(X) 버튼 */}
            <button
              onClick={onToggle}
              className="p-2 rounded-xl hover:bg-white/30 transition-all duration-200 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <nav className="mt-6 px-0.5">
          <div className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              // 현재 경로와 메뉴 경로가 일치하면 활성화 처리
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-4 py-3 mx-1 rounded-xl transition-all duration-300 relative group
                    ${isActive 
                      ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg transform scale-[1.02]' 
                      : 'text-gray-700 hover:bg-white/40 hover:scale-[1.01]'
                    }
                  `}
                  // 모바일에서는 메뉴 클릭 시 자동으로 사이드바 닫힘
                  onClick={() => window.innerWidth < 768 && onToggle()}
                  // 접힌 상태에서 툴팁용 title 속성
                  title={isCollapsed ? item.label : ''}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* 메뉴 아이콘 */}
                  <div className={`
                    flex-shrink-0 p-1 rounded-lg transition-all duration-200
                    ${isActive ? 'bg-white/20' : 'group-hover:bg-white/20'}
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {/* 메뉴 라벨: 접힌 상태에서는 숨김 */}
                  <span className={`ml-3 font-medium transition-all duration-300 w-full truncate ${isCollapsed ? 'md:opacity-0 md:hidden' : 'opacity-100'}`}>
                    {item.label}
                  </span>
                  
                  {/* 활성화 상태 표시 */}
                  {isActive && (
                    <div className="absolute right-2 w-2 h-2 bg-white rounded-full"></div>
                  )}
                  
                  {/* 접힌 상태에서 마우스 오버 시 툴팁 표시(데스크탑) */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 hidden md:block pointer-events-none">
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* 하단 장식 */}
        <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 transition-all duration-300 ${isCollapsed ? 'md:opacity-0' : 'opacity-100'}`}>
          <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
