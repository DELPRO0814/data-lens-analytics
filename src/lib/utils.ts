/**
 * cn 유틸리티 함수
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 여러 Tailwind CSS 클래스명을 안전하게 합치고, 중복/충돌되는 클래스를 자동 병합합니다.
 * - 조건부, 배열, 객체 등 다양한 입력을 지원합니다.
 * - React 컴포넌트의 className 속성에 사용할 때 가장 안전하고 실용적입니다.
 * 
 * 상세 설명:
 * - clsx: 조건부로 클래스명을 조합해주는 라이브러리(불리언, 배열, 객체 등 다양한 입력 지원)
 * - twMerge: Tailwind CSS의 중복/충돌되는 클래스(예: px-2 px-4)를 자동으로 병합(가장 마지막 값이 우선)
 * - 사용 예시: <div className={cn("p-4", isActive && "bg-blue-500", customClass)} />
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// 여러 입력값을 받아서 안전하게 Tailwind 클래스 문자열로 반환
export function cn(...inputs: ClassValue[]) {
  // 1. clsx로 조건부/배열/객체 등 다양한 입력을 하나의 문자열로 합침
  // 2. twMerge로 Tailwind 중복/충돌 클래스 병합(마지막 값이 우선)
  return twMerge(clsx(inputs))
}
