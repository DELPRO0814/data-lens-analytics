/**
 * useIsMobile 커스텀 훅
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 현재 브라우저 창의 너비가 모바일(768px 미만)인지 여부를 실시간으로 알려주는 React 훅입니다.
 * - 반응형 UI 구현 시, 모바일/데스크탑 레이아웃 분기 등에 활용할 수 있습니다.
 * - window.matchMedia와 addEventListener("change")를 활용하여 창 크기 변경에도 자동으로 반영됩니다.
 *
 * 상세 설명:
 * - MOBILE_BREAKPOINT 상수(768px) 기준으로 모바일 여부를 판단합니다.
 * - 컴포넌트 마운트 시 matchMedia로 현재 상태를 체크하고, 창 크기 변경 시마다 상태를 갱신합니다.
 * - SSR 환경을 고려해 초기값을 undefined로 두고, 반환 시 항상 boolean 타입으로 변환합니다.
 * - 언마운트 시 이벤트 리스너를 해제하여 메모리 누수를 방지합니다.
 */

import * as React from "react"

// 모바일 화면의 최대 너비(768px 미만을 모바일로 간주)
const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // isMobile: 현재 모바일 화면인지 여부를 저장하는 상태
  // undefined로 초기화(SSR 환경에서 window가 없을 수 있음)
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // matchMedia를 사용해 미디어 쿼리 객체 생성
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    // 창 크기 변경 시 실행할 함수
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    // 미디어 쿼리 변화 감지 이벤트 등록
    mql.addEventListener("change", onChange)
    // 마운트 시 한 번 현재 상태를 반영
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    // 언마운트 시 이벤트 해제(clean up)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // undefined일 때도 false로 반환(!!로 boolean 변환)
  return !!isMobile
}
