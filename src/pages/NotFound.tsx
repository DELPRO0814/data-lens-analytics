/**
 * NotFound(404) 페이지 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 존재하지 않는 경로로 접근 시 표시되는 404 에러 페이지입니다.
 * - 현재 접근한 경로(location.pathname)를 콘솔에 에러 로그로 남깁니다.
 * - 사용자에게 "페이지를 찾을 수 없음" 메시지와 홈으로 돌아가는 링크를 제공합니다.
 * - Tailwind CSS로 중앙 정렬, 반응형, 컬러 스타일이 적용되어 있습니다.
 *
 * 상세 설명:
 * - useLocation 훅으로 현재 경로를 추적하여 에러 로그에 활용합니다.
 * - useEffect로 경로가 바뀔 때마다 콘솔에 404 에러 로그를 남깁니다(운영 모니터링/디버깅에 유용).
 * - 홈으로 돌아가는 링크는 "/"로 연결되어 있습니다.
 * - 실제 서비스에서는 이 페이지를 좀 더 브랜딩하거나, 문의 안내, 자동 리다이렉트 등으로 확장할 수 있습니다.
 */

import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // 404 접근 시 콘솔에 경로 로그 남기기 (운영/디버깅용)
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
