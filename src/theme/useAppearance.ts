import { useContext } from 'react'
import { AppearanceContext, type AppearanceContextValue } from './AppearanceContext'

export const useAppearance = (): AppearanceContextValue => {
  const context = useContext(AppearanceContext)
  if (!context) {
    throw new Error('useAppearance must be used within an <AppearanceProvider>')
  }
  return context
}
