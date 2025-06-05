/**
 * Supabase 클라이언트 초기화 파일 (자동 생성됨)
 * --------------------------------------------------------------
 * 이 파일은 Supabase 연결을 설정하는 공식 클라이언트입니다.
 * 주의: 직접 수정하지 마세요. 환경 변수 등을 통해 설정값을 관리하는 것이 좋습니다.
 */

// Supabase JS 라이브러리와 타입 임포트
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types'; // 데이터베이스 스키마 타입

// Supabase 프로젝트 설정값 (공개 가능한 정보)
const SUPABASE_URL = "https://xvkijkxniuqdaowkvrhh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2a2lqa3huaXVxZGFvd2t2cmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MTk2MjMsImV4cCI6MjA2NDQ5NTYyM30.0LtNohBWoHP4P_CmjEZuDlIDufPe6gB4UC-4e4BEBUs";

/**
 * Supabase 클라이언트 인스턴스 생성
 * - createClient()로 연결 초기화
 * - <Database> 제네릭으로 TypeScript 타입 지원 활성화
 * - 공개키(anon key)를 사용하므로 민감한 작업에는 서버 사이드 사용 권장
 */
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// 사용 예시:
// import { supabase } from "@/integrations/supabase/client";
// const { data, error } = await supabase.from('table').select('*');
