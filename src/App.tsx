import { useState, useCallback } from 'react'
import type { MomentType } from './types'

import { SunsetBackground } from './components/SunsetBackground'
import { BottomNav } from './components/BottomNav'
import { AIAssistant } from './components/AIAssistant'
import { Toast } from './components/Toast'

import { HomeScreen } from './screens/HomeScreen'
import { CaptureScreen } from './screens/CaptureScreen'
import { RatingScreen } from './screens/RatingScreen'
import { DiaryScreen } from './screens/DiaryScreen'
import { MapScreen } from './screens/MapScreen'
import { DetailScreen } from './screens/DetailScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'

type AppScreen = 'home' | 'capture' | 'rating' | 'diary' | 'map' | 'detail'
type NavTab = 'home' | 'diary' | 'map'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface CaptureState {
  photo: string
  type: MomentType
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('home')
  const [navTab, setNavTab] = useState<NavTab>('home')
  const [captureData, setCaptureData] = useState<CaptureState | null>(null)
  const [selectedMomentId, setSelectedMomentId] = useState<string>('')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('lausai_onboarded') === 'true'
  })

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const handleNavChange = (tab: NavTab) => {
    setNavTab(tab)
    setScreen(tab)
  }

  // ── CAPTURE FLOW ──
  const handleStartCapture = () => {
    setScreen('capture')
  }

  const handlePhotoTaken = (photo: string, type: MomentType) => {
    setCaptureData({ photo, type })
    setScreen('rating')
  }

  const handleMomentSaved = () => {
    setCaptureData(null)
    setRefreshKey(k => k + 1)
    setScreen('home')
    setNavTab('home')
    showToast('Moment desat! ✨', 'success')
  }

  const handleSelectMoment = (id: string) => {
    setSelectedMomentId(id)
    setScreen('detail')
  }

  const handleMomentDeleted = () => {
    setRefreshKey(k => k + 1)
    setScreen(navTab)
    showToast('Moment eliminat', 'info')
  }

  const handleBackFromDetail = () => {
    setScreen(navTab)
  }

  const handleOnboardingDone = () => {
    localStorage.setItem('lausai_onboarded', 'true')
    setOnboarded(true)
  }

  // Which screens show the bottom nav
  const showNav = ['home', 'diary', 'map'].includes(screen)

  return (
    <div className="relative w-full h-full overflow-hidden bg-sunset-night select-none">

      {/* Background always present */}
      <SunsetBackground />

      {/* Onboarding overlay */}
      {!onboarded && (
        <OnboardingScreen onDone={handleOnboardingDone} />
      )}

      {/* Main content */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: showNav ? 'calc(100% - 64px)' : '100%',
          zIndex: 10,
        }}
      >
        {screen === 'home' && (
          <HomeScreen
            onCapture={handleStartCapture}
            onDiary={() => handleNavChange('diary')}
            onMap={() => handleNavChange('map')}
          />
        )}

        {screen === 'capture' && (
          <CaptureScreen
            onPhotoTaken={handlePhotoTaken}
            onBack={() => { setScreen('home'); setNavTab('home') }}
          />
        )}

        {screen === 'rating' && captureData && (
          <RatingScreen
            photo={captureData.photo}
            momentType={captureData.type}
            onSaved={handleMomentSaved}
            onBack={() => setScreen('capture')}
          />
        )}

        {screen === 'diary' && (
          <DiaryScreen
            onSelectMoment={handleSelectMoment}
            refreshKey={refreshKey}
          />
        )}

        {screen === 'map' && (
          <MapScreen
            onSelectMoment={handleSelectMoment}
            refreshKey={refreshKey}
          />
        )}

        {screen === 'detail' && selectedMomentId && (
          <DetailScreen
            momentId={selectedMomentId}
            onBack={handleBackFromDetail}
            onDeleted={handleMomentDeleted}
          />
        )}
      </div>

      {/* Bottom navigation */}
      {showNav && (
        <BottomNav active={navTab} onChange={handleNavChange} />
      )}

      {/* AI Assistant - always visible except during capture */}
      {screen !== 'capture' && <AIAssistant />}

      {/* Toast notifications */}
      {toasts.map(t => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onDone={() => removeToast(t.id)}
        />
      ))}
    </div>
  )
}
