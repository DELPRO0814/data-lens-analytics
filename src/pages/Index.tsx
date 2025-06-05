/**
 * Index(메인) 페이지
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 프로젝트의 시작점이 되는 메인(홈) 페이지입니다.
 * - 심플한 배경과 중앙 정렬된 인사말, 안내 문구를 표시합니다.
 * - Tailwind CSS로 반응형/중앙 정렬/색상 스타일이 적용되어 있습니다.
 *
 * 상세 설명:
 * - 추후 대시보드, 로그인, 주요 기능 등으로 자유롭게 교체/확장할 수 있는 기본 구조입니다.
 * - 현재는 "Welcome to Your Blank App"와 안내 메시지만 표시합니다.
 * - 이 파일을 수정해 원하는 메인 페이지로 변경하세요.
 */

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Blank App</h1>
        <p className="text-xl text-gray-600">Start building your amazing project here!</p>
      </div>
    </div>
  );
};

export default Index;
