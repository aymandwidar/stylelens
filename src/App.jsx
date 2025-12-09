import { useState, useEffect } from 'react'
import './App.css'
import CameraLens from './pages/CameraLens'
import Wardrobe from './pages/Wardrobe'
import StylistChat from './pages/StylistChat'
import Settings from './pages/Settings'
import Onboarding from './pages/Onboarding'
import OutfitBuilder from './pages/OutfitBuilder'
import Analytics from './pages/Analytics'

// SVG Icons as components
const CameraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

const WardrobeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M12 3v18" />
    <path d="M9 12h2" />
    <path d="M13 12h2" />
  </svg>
)

const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m-6 6l-4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m-6-6l-4.2-4.2" />
  </svg>
)

const HangerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a5 5 0 0 0-5 5v2h10V8a5 5 0 0 0-5-5z" />
    <path d="M3 10h18l-2 11H5L3 10z" />
  </svg>
)

const ChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

function App() {
  const [activeTab, setActiveTab] = useState('lens')
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingComplete = localStorage.getItem('onboarding_complete')
    if (!onboardingComplete) {
      setShowOnboarding(true)
    }
  }, [])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'lens':
        return <CameraLens />
      case 'wardrobe':
        return <Wardrobe />
      case 'builder':
        return <OutfitBuilder />
      case 'analytics':
        return <Analytics />
      case 'chat':
        return <StylistChat />
      case 'settings':
        return <Settings />
      default:
        return <CameraLens />
    }
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="app">
      <main className="app-main">
        {renderPage()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav glass-card">
        <button
          className={`nav-item ${activeTab === 'lens' ? 'active' : ''}`}
          onClick={() => setActiveTab('lens')}
          aria-label="Camera Lens"
        >
          <CameraIcon />
          <span>Lens</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'wardrobe' ? 'active' : ''}`}
          onClick={() => setActiveTab('wardrobe')}
          aria-label="Wardrobe"
        >
          <WardrobeIcon />
          <span>Wardrobe</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'builder' ? 'active' : ''}`}
          onClick={() => setActiveTab('builder')}
          aria-label="Builder"
        >
          <HangerIcon />
          <span>Outfits</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
          aria-label="Analytics"
        >
          <ChartIcon />
          <span>Stats</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
          aria-label="Stylist Chat"
        >
          <ChatIcon />
          <span>Chat</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          aria-label="Settings"
        >
          <SettingsIcon />
          <span>Settings</span>
        </button>
      </nav>
    </div>
  )
}

export default App
