/**
 * 커스텀 AlertDialog(경고/확인 모달) 컴포넌트
 * ---------------------------------------------------------------
 * - Radix UI의 AlertDialog 컴포넌트를 감싸서 Tailwind CSS 스타일과 일관된 API로 제공합니다.
 * - AlertDialog, AlertDialogTrigger, AlertDialogContent 등 여러 하위 컴포넌트로 구성되어 있습니다.
 * - AlertDialogOverlay: 반투명 배경, AlertDialogContent: 중앙 모달, Header/Title/Description/Footer 등 구조화.
 * - Action/Cancel 버튼은 커스텀 스타일이 적용되어 있습니다.
 * - forwardRef, cn 유틸, buttonVariants 등으로 확장성과 커스터마이즈를 지원합니다.
 * - 접근성(키보드, 포커스, 스크린리더 등)과 애니메이션이 기본 적용되어 있습니다.
 */

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

// AlertDialog: Radix의 Root 컴포넌트를 그대로 export
const AlertDialog = AlertDialogPrimitive.Root

// AlertDialogTrigger: 모달을 여는 버튼/요소
const AlertDialogTrigger = AlertDialogPrimitive.Trigger

// AlertDialogPortal: 모달이 body에 렌더링되도록 포탈 처리
const AlertDialogPortal = AlertDialogPrimitive.Portal

/**
 * AlertDialogOverlay
 * - 모달이 열릴 때 화면 전체를 덮는 반투명 검정 배경
 * - 열림/닫힘에 따라 fade-in/out 애니메이션 적용
 */
const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

/**
 * AlertDialogContent
 * - 모달의 실제 내용(중앙 박스)
 * - AlertDialogPortal/AlertDialogOverlay와 함께 사용됨
 * - 열림/닫힘, 확대/축소, 슬라이드 등 다양한 애니메이션 적용
 * - sm:rounded-lg 등 반응형 디자인
 */
const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

/**
 * AlertDialogHeader
 * - 모달 상단 영역(타이틀/설명 포함)
 * - flex 레이아웃, 반응형 텍스트 정렬
 */
const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

/**
 * AlertDialogFooter
 * - 모달 하단 버튼 영역
 * - 모바일: 버튼 세로 정렬, 데스크탑: 가로 정렬/우측 정렬
 */
const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

/**
 * AlertDialogTitle
 * - 모달의 제목 텍스트(굵고 큼)
 */
const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

/**
 * AlertDialogDescription
 * - 모달의 부가 설명 텍스트(작고 흐린 색)
 */
const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

/**
 * AlertDialogAction
 * - 확인/동의 등 긍정적 액션 버튼
 * - buttonVariants()로 스타일 적용
 */
const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

/**
 * AlertDialogCancel
 * - 취소/닫기 등 부정적 액션 버튼
 * - buttonVariants({ variant: "outline" })로 스타일 적용
 * - 모바일에서는 위, 데스크탑에서는 오른쪽에 배치
 */
const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

// 모든 하위 컴포넌트 export
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
