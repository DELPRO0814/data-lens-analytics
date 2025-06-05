/**
 * AuthPage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 로그인/회원가입 폼을 하나의 컴포넌트에서 처리합니다.
 * - 이메일, 비밀번호 입력을 받고, 비밀번호는 눈 아이콘으로 표시/숨김 전환이 가능합니다.
 * - 로그인/회원가입 모드를 버튼으로 전환할 수 있습니다.
 * - 제출 시 Supabase 인증 API를 호출하며, 성공/실패 결과를 toast 메시지로 안내합니다.
 * - 로딩 중에는 버튼이 비활성화되고 "처리 중..."으로 표시됩니다.
 * - UI는 Tailwind CSS로 반응형 디자인이 적용되어 있습니다.
 * 
 * 상세 설명:
 * - 로그인/회원가입 상태는 isLogin으로 관리하며, 버튼 클릭으로 쉽게 전환할 수 있습니다.
 * - 이메일, 비밀번호 입력값은 useState로 관리합니다.
 * - 비밀번호 입력창 우측의 눈 아이콘을 클릭하면 비밀번호 표시/숨김을 토글할 수 있습니다.
 * - 폼 제출 시 Supabase의 signInWithPassword 또는 signUp 메서드를 호출합니다.
 * - 인증 성공/실패 시 toast 메시지로 사용자에게 즉시 안내합니다.
 * - 인증 처리 중에는 버튼이 비활성화되어 중복 제출을 방지합니다.
 * - Tailwind CSS를 사용해 모바일/데스크탑 모두에서 반응형으로 잘 보이도록 디자인되어 있습니다.
 */

import React, { useState } from 'react';
// supabase: 인증(로그인/회원가입) 처리에 사용되는 백엔드 서비스
import { supabase } from '@/integrations/supabase/client';
// toast: 사용자에게 알림 메시지를 띄우는 커스텀 훅
import { useToast } from '@/hooks/use-toast';
// lucide-react: 입력창에 사용할 아이콘들
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

// 인증 페이지 컴포넌트 정의
const AuthPage: React.FC = () => {
  // 로그인/회원가입 모드 상태(true면 로그인, false면 회원가입)
  const [isLogin, setIsLogin] = useState(true);
  // 입력된 이메일 값
  const [email, setEmail] = useState('');
  // 입력된 비밀번호 값
  const [password, setPassword] = useState('');
  // 비밀번호를 보이게 할지 여부(토글)
  const [showPassword, setShowPassword] = useState(false);
  // 인증 처리 중 로딩 상태(버튼 비활성화 등)
  const [loading, setLoading] = useState(false);
  // toast 메시지 띄우는 훅
  const { toast } = useToast();

  // 로그인 또는 회원가입 폼 제출 시 실행되는 함수
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼의 기본 제출 동작(새로고침) 방지
    setLoading(true);   // 로딩 시작

    try {
      if (isLogin) {
        // 로그인 모드일 때
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error; // 오류 발생 시 catch로 이동
        
        // 로그인 성공 시 toast 알림
        toast({
          title: "로그인 성공",
          description: "CRM 시스템에 오신 것을 환영합니다!",
        });
      } else {
        // 회원가입 모드일 때
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/` // 인증 후 리다이렉트 주소
          }
        });
        if (error) throw error;
        
        // 회원가입 성공 시 toast 알림
        toast({
          title: "회원가입 성공",
          description: "계정이 성공적으로 생성되었습니다.",
        });
      }
    } catch (error: any) {
      // 인증 실패 시 에러 메시지 출력 및 toast 알림
      console.error('Auth error:', error);
      toast({
        title: "오류",
        description: error.message || "인증 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  return (
    // 전체 페이지 중앙 정렬, 그라데이션 배경
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* 인증 폼 컨테이너: 흰색 박스, 그림자, 라운드 처리 */}
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* 상단: 타이틀과 안내문구 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CRM 시스템
          </h1>
          <p className="text-gray-600">
            {isLogin ? '로그인하여 시작하세요' : '새 계정을 만드세요'}
          </p>
        </div>

        {/* 이메일/비밀번호 입력 폼 */}
        <form onSubmit={handleAuth} className="space-y-6">
          {/* 이메일 입력란 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <div className="relative">
              {/* 입력창 왼쪽에 메일 아이콘 */}
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="이메일을 입력하세요"
                required
              />
            </div>
          </div>

          {/* 비밀번호 입력란 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <div className="relative">
              {/* 입력창 왼쪽에 자물쇠 아이콘 */}
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'} // 비밀번호 표시/숨김 토글
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="비밀번호를 입력하세요"
                required
                minLength={6}
              />
              {/* 오른쪽에 눈 아이콘(비밀번호 표시/숨김 토글 버튼) */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 로그인/회원가입 버튼: 로딩 중이면 비활성화 및 "처리 중..." 표시 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
          </button>
        </form>

        {/* 로그인/회원가입 모드 전환 버튼 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
