
import React from 'react';
import { Menu, LogOut, User, Bell, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Header 컴포넌트가 받을 수 있는 props 타입 정의
interface HeaderProps {
  onMenuToggle: () => void; // 메뉴(햄버거) 버튼 클릭 시 실행 함수
  user: any;                // 현재 로그인한 사용자 정보
}

// Header 컴포넌트 정의
const Header: React.FC<HeaderProps> = ({ onMenuToggle, user }) => {
  // toast 메시지 훅
  const { toast } = useToast();

  // 로그아웃 처리 함수
  const handleSignOut = async () => {
    try {
      // Supabase 로그아웃 요청
      await supabase.auth.signOut();
      // 성공 시 toast 알림
      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });
    } catch (error) {
      // 실패 시 콘솔 출력 및 에러 메시지 표시
      console.error('Sign out error:', error);
      toast({
        title: "오류",
        description: "로그아웃 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    // 상단 헤더 바: 글래스모피즘 효과, 그라데이션 테두리, 고정 높이, flex 레이아웃
    <header className="glass-card border-b-0 border-b-gradient-to-r from-blue-200 to-purple-200 h-16 flex items-center justify-between px-6 relative z-10 m-4 rounded-2xl">
      {/* 좌측: 메뉴(햄버거) 버튼 (모바일에서만 보임) */}
      <button
        onClick={onMenuToggle}
        className="p-3 rounded-xl hover:bg-white/30 transition-all duration-200 md:hidden group"
      >
        <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>

      {/* 중앙: 현재 시간 표시 */}
      <div className="hidden md:flex items-center space-x-4">
        <div className="text-sm text-gray-600">
          {new Date().toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
          })}
        </div>
      </div>

      {/* 우측: 알림, 사용자 정보 및 로그아웃 버튼 */}
      <div className="flex items-center space-x-3">
        {/* 알림 버튼 */}
        {/* <button className="p-2 rounded-xl hover:bg-white/30 transition-all duration-200 relative group">
          <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
        </button> */}

        {/* 설정 버튼 */}
        {/* <button className="p-2 rounded-xl hover:bg-white/30 transition-all duration-200 group">
          <Settings className="w-5 h-5 text-gray-600 group-hover:text-gray-800 group-hover:rotate-90 transition-all duration-300" />
        </button> */}
        
        {/* 사용자 정보 영역 */}
        <div className="flex items-center space-x-3 bg-white/50 rounded-xl px-4 py-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-gray-800">
              {user?.email?.split('@')[0] || '사용자'}
            </div>
            <div className="text-xs text-gray-500">관리자</div>
          </div>
        </div>
        
        {/* 로그아웃 버튼 */}
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">로그아웃</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
