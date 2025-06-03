
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
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
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
  { path: '/order-forecast', label: '고객 주문 예측', icon: TrendingUp }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
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
        fixed left-0 top-0 h-full bg-white shadow-lg z-30 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-auto
        ${isOpen ? 'w-64' : 'w-64 md:w-16'}
      `}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className={`font-bold text-xl text-blue-600 ${!isOpen && 'md:hidden'}`}>
            CRM 시스템
          </h1>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
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
                  flex items-center px-4 py-3 mx-2 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
                onClick={() => window.innerWidth < 768 && onToggle()}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={`ml-3 ${!isOpen && 'md:hidden'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
