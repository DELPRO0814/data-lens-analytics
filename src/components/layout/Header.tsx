/**
 * Header 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 상단 네비게이션 바 역할을 하며, 좌측에는 메뉴(햄버거) 버튼, 우측에는 사용자 정보(이메일)와 로그아웃 버튼이 있습니다.
 * - 메뉴 버튼 클릭 시 onMenuToggle 함수가 호출되어 사이드 메뉴를 토글합니다.
 * - 로그아웃 버튼 클릭 시 Supabase 인증 로그아웃을 실행하고, 성공/실패 시 toast로 안내합니다.
 * - user prop을 통해 현재 로그인한 사용자의 정보를 받아와 이메일을 표시합니다.
 *
 * 상세 설명:
 * - 모바일 환경에서는 좌측의 햄버거 버튼만 보이고, 데스크탑에서는 항상 헤더가 고정됩니다.
 * - 로그아웃 처리(handleSignOut)는 Supabase 인증 로그아웃 후 toast로 성공/실패 안내를 합니다.
 * - 사용자 정보가 없으면 '사용자'라는 텍스트가 표시됩니다.
 * - Tailwind CSS를 활용해 반응형, 일관된 디자인을 제공합니다.
 */

import React from 'react';
import { Menu, LogOut, User } from 'lucide-react';
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
    // 상단 헤더 바: 흰색 배경, 그림자, 하단 테두리, 고정 높이, flex 레이아웃
    <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4 relative z-10">
      {/* 좌측: 메뉴(햄버거) 버튼 (모바일에서만 보임) */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* 중앙: 공간을 차지하여 양쪽 정렬 유지 */}
      <div className="flex-1" />

      {/* 우측: 사용자 정보 및 로그아웃 버튼 */}
      <div className="flex items-center space-x-4">
        {/* 사용자 이메일 표시 영역 */}
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-700">
            {user?.email || '사용자'}
          </span>
        </div>
        
        {/* 로그아웃 버튼 */}
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>로그아웃</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
