/**
 * 커스텀 Accordion(아코디언) 컴포넌트
 * -------------------------------------------------------------
 * - Radix UI의 Accordion 컴포넌트를 감싸서 Tailwind CSS 스타일과 일관된 API로 제공합니다.
 * - Accordion, AccordionItem, AccordionTrigger, AccordionContent 네 가지 컴포넌트로 구성됩니다.
 * - AccordionTrigger에 ChevronDown 아이콘이 붙으며, 열림/닫힘에 따라 회전 애니메이션이 적용됩니다.
 * - AccordionContent는 열림/닫힘에 따라 부드러운 애니메이션과 패딩이 적용됩니다.
 * - cn() 유틸로 사용자 정의 className을 병합할 수 있습니다.
 * - forwardRef를 사용해 ref 전달이 가능합니다(접근성 및 제어 목적).
 */

import * as React from "react"
// Radix UI의 Accordion 컴포넌트(기본 동작 제공)
import * as AccordionPrimitive from "@radix-ui/react-accordion"
// 열림/닫힘 표시용 아이콘
import { ChevronDown } from "lucide-react"
// className 병합 유틸리티
import { cn } from "@/lib/utils"

// Accordion: Radix의 Root 컴포넌트를 그대로 export
const Accordion = AccordionPrimitive.Root

/**
 * AccordionItem
 * - 아코디언의 한 섹션(열 수 있는 단위)
 * - 하단에 border-b(아래 테두리) 스타일 적용
 * - className으로 추가 스타일 지정 가능
 */
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

/**
 * AccordionTrigger
 * - 아코디언의 제목(클릭하면 열림/닫힘)
 * - flex 레이아웃, hover 시 밑줄, 폰트 굵게
 * - 열렸을 때 ChevronDown 아이콘이 180도 회전(애니메이션)
 */
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      {/* 열림/닫힘 상태에 따라 회전하는 아이콘 */}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

/**
 * AccordionContent
 * - 아코디언이 열렸을 때 보여지는 내용 영역
 * - 열림/닫힘에 따라 애니메이션, 패딩 적용
 * - className으로 추가 스타일 지정 가능
 */
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

// 네 가지 컴포넌트 export
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
