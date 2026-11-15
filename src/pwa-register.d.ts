declare module 'virtual:pwa-register/react' {
  import type { Dispatch, SetStateAction } from 'react'

  export function useRegisterSW(): {
    needRefresh: [boolean, Dispatch<SetStateAction<boolean>>]
    updateServiceWorker: () => Promise<void>
  }
}
