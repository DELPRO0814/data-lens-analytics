
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Phone, 
  Package, 
  TrendingUp, 
  Target, 
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

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onCollapse: () => void;
}

const menuItems = [
  { path: '/', label: '대시보드', icon: BarChart3 },
  { path: '/customers', label: '고객', icon: Users },
  { path: '/contacts', label: '연락처', icon: Phone },
  { path: '/products', label: '제품', icon: Package },
  { path: '/predictions', label: '예측', icon: TrendingUp },
  { path: '/segments', label: '세그먼트', icon: Target },
  { path: '/sales-activities', label: '영업 활동', icon: Activity },
  { path: '/engagements', label: '참여', icon: Heart },
  { path: '/orders', label: '주문', icon: ShoppingCart },
  { path: '/issues', label: '이슈', icon: AlertTriangle },
  { path: '/claims', label: '클레임', icon: Shield },
  { path: '/sales-forecast', label: '영업 접촉 예측', icon: Calendar },
  { path: '/profit-grade', label: '고객 수익 등급', icon: DollarSign },
  { path: '/order-forecast', label: '고객 주문 예측', icon: TrendingUp },
  { path: '/priority-dashboard', label: '우선순위 대시보드', icon: Star },
  { path: '/opportunity-analysis', label: '영업 기회 분석', icon: TrendingDown }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, isCollapsed, onCollapse }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white shadow-lg z-30 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-auto
        ${isCollapsed ? 'md:w-16' : 'md:w-64'}
        w-64
      `}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className={`font-bold text-xl text-blue-600 transition-opacity duration-300 ${isCollapsed ? 'md:opacity-0 md:hidden' : 'opacity-100'}`}>
            CRM 시스템
          </h1>
          <div className="flex items-center space-x-2">
            {/* Desktop collapse button */}
            <button
              onClick={onCollapse}
              className="p-2 rounded-lg hover:bg-gray-100 hidden md:block"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            {/* Mobile close button */}
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
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
                onClick={() => window.innerWidth < 768 && onToggle()}
                title={isCollapsed ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={`ml-3 transition-opacity duration-300 ${isCollapsed ? 'md:opacity-0 md:hidden' : 'opacity-100'}`}>
                  {item.label}
                </span>
                
                {/* Tooltip for collapsed state */}
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
