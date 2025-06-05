/**
 * useToast 커스텀 훅 및 toast 상태 관리 모듈
 * -------------------------------------------------------------
 * 주요 동작 요약:
 * - 전역적으로 사용할 수 있는 토스트(Toast) 알림 시스템입니다.
 * - React Context/Provider 없이도 어디서나 import해서 사용 가능합니다.
 * - toast() 함수로 알림 표시, useToast() 훅으로 상태/제어 함수 접근 가능합니다.
 * - 최대 1개의 알림만 동시 표시되며, 지정 시간(TOAST_REMOVE_DELAY) 후 자동 사라집니다.
 * - ADD/UPDATE/DISMISS/REMOVE 액션으로 상태 관리하며, 메모리 상태/리스너/setTimeout 활용합니다.
 *
 * 상세 설명:
 * - ToasterToast 타입: ToastProps 확장 + id/title/description/action 필드
 * - actionTypes: 4가지 액션 타입 정의(추가/수정/닫기/제거)
 * - reducer: 상태 변경 처리(불변성 유지), DISMISS 시 자동 제거 큐에 추가
 * - toastTimeouts: 각 토스트의 setTimeout 참조 저장(자동 제거 관리)
 * - listeners: 상태 변경 시 모든 구독 컴포넌트에 알림
 * - memoryState: 실제 상태 저장 변수
 * - dispatch: 액션 처리 후 모든 리스너에 상태 변경 알림
 */
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

// 동시에 표시할 수 있는 토스트 개수(1개)
const TOAST_LIMIT = 1
// 토스트가 사라지기까지의 시간(ms)
const TOAST_REMOVE_DELAY = 1000000

// 알림 객체 타입 정의
type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

// 액션 타입 상수
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

// 고유 ID 생성용 카운터
let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

// 액션 타입 정의
type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

// 상태 타입 정의
interface State {
  toasts: ToasterToast[]
}

// 토스트별로 setTimeout 객체를 저장하는 맵
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// 토스트를 제거 대기 큐에 추가(지정 시간 후 REMOVE_TOAST 액션 발생)
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

// 상태 변경 reducer 함수(불변성 유지)
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      // 새 토스트를 맨 앞에 추가, 최대 TOAST_LIMIT개만 유지
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      // id가 같은 토스트를 새 내용으로 교체
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - 실제로는 reducer 밖에서 처리하는 게 권장되지만 단순화를 위해 여기서 처리
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      // 해당 토스트(또는 전체) open: false로 변경(사라지는 애니메이션 유도)
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      // 해당 토스트만 완전히 제거
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// 전역 리스너 배열(상태 변경 시 모든 리스너 호출)
const listeners: Array<(state: State) => void> = []

// 실제 상태를 저장하는 메모리 변수
let memoryState: State = { toasts: [] }

// 액션을 받아 상태를 변경하고, 모든 리스너에 알림
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// toast() 함수로 알림을 띄울 때 사용할 타입
type Toast = Omit<ToasterToast, "id">

/**
 * toast()
 * - 새로운 토스트 알림을 띄우는 함수
 * - id를 자동 생성, open: true로 추가
 * - update, dismiss 메서드도 함께 반환
 */
function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

/**
 * useToast 훅
 * - 현재 토스트 상태와 toast(), dismiss() 함수를 반환
 * - 상태 변경 시 자동으로 리렌더링
 */
function useToast() {
  // 상태를 리스너로 구독
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
