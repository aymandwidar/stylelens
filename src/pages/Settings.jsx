import { useState, useEffect } from 'react'
import aiService from '../services/ai'
import './Wardrobe.css'

function Settings() {
    const [geminiKey, setGeminiKey] = useState('')
    const [groqKey, setGroqKey] = useState('')
    const [openrouterKey, setOpenrouterKey] = useState('')

    const [geminiStatus, setGeminiStatus] = useState(null) // null, 'saved', 'testing', 'valid', 'invalid'
    const [groqStatus, setGroqStatus] = useState(null)
    const [openrouterStatus, setOpenrouterStatus] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [demoMode, setDemoMode] = useState(false)

    useEffect(() => {
        // Load saved keys and demo mode setting
        const savedGemini = localStorage.getItem('gemini_api_key')
        const savedGroq = localStorage.getItem('groq_api_key')
        const savedOpenrouter = localStorage.getItem('openrouter_api_key')
        const savedDemoMode = localStorage.getItem('demo_mode') === 'true'

        if (savedGemini) {
            setGeminiKey(savedGemini)
            setGeminiStatus('saved')
        }
        if (savedGroq) {
            setGroqKey(savedGroq)
            setGroqStatus('saved')
        }
        if (savedOpenrouter) {
            setOpenrouterKey(savedOpenrouter)
            setOpenrouterStatus('saved')
        }
        setDemoMode(savedDemoMode)
    }, [])

    const toggleDemoMode = (e) => {
        const isEnabled = e.target.checked
        setDemoMode(isEnabled)
        localStorage.setItem('demo_mode', isEnabled)
        // Force reload to apply changes globally
        setTimeout(() => window.location.reload(), 500)
    }

    const setProviderStatus = (provider, status, error = null) => {
        if (provider === 'gemini') setGeminiStatus(status)
        if (provider === 'groq') setGroqStatus(status)
        if (provider === 'openrouter') setOpenrouterStatus(status)

        if (error) {
            setErrorMessage(`${provider.toUpperCase()} Error: ${error}`)
        } else if (status === 'testing') {
            setErrorMessage(null)
        }
    }

    const handleSave = async (provider, key) => {
        localStorage.setItem(`${provider}_api_key`, key)
        localStorage.removeItem(`${provider}_model`) // Clear cached model to force re-check
        setErrorMessage(null)

        setProviderStatus(provider, 'saved')

        // Auto-hide saved status after 3 seconds
        setTimeout(() => {
            if (provider === 'gemini' && geminiStatus === 'saved') setGeminiStatus(null)
            if (provider === 'groq' && groqStatus === 'saved') setGroqStatus(null)
            if (provider === 'openrouter' && openrouterStatus === 'saved') setOpenrouterStatus(null)
        }, 3000)
    }

    const testKey = async (provider, key) => {
        // Set testing status
        setProviderStatus(provider, 'testing')

        try {
            const success = await aiService.initialize(provider, key)
            if (!success) throw new Error('Initialization failed. Please check your key and connection.')

            // Test with a simple message
            const response = await aiService.chat('Say hello')

            if (response && response.length > 0) {
                setProviderStatus(provider, 'valid')
            } else {
                throw new Error('Empty response from AI')
            }
        } catch (error) {
            console.error(`${provider} test error:`, error)
            const msg = error.message || 'Unknown validation error'
            setProviderStatus(provider, 'invalid', msg)
        }
    }

    const getStatusIcon = (status) => {
        if (status === 'saved') return '💾'
        if (status === 'testing') return '⏳'
        if (status === 'valid') return '✅'
        if (status === 'invalid') return '❌'
        return ''
    }

    const getStatusText = (status) => {
        if (status === 'saved') return 'Saved'
        if (status === 'testing') return 'Testing...'
        if (status === 'valid') return 'Working!'
        if (status === 'invalid') return 'Invalid'
        return ''
    }

    return (
        <div className="settings-page">
            <div className="page-header">
                <h1>Settings</h1>
                <p>Configure your AI providers</p>
                {errorMessage && (
                    <div className="error-banner" style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid var(--color-error)',
                        padding: '10px',
                        borderRadius: '8px',
                        marginTop: '10px',
                        fontSize: '0.9rem',
                        color: '#ff8888'
                    }}>
                        {errorMessage}
                    </div>
                )}
            </div>

            <div className="settings-content">
                {/* Demo Mode Toggle */}
                <div className="glass-card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>Demo Mode</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>Use mock data without API keys</p>
                    </div>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
                        <input
                            type="checkbox"
                            checked={demoMode}
                            onChange={toggleDemoMode}
                            style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span className="slider round" style={{
                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: demoMode ? '#3b82f6' : '#374151',
                            transition: '.4s', borderRadius: '34px'
                        }}>
                            <span style={{
                                position: 'absolute', content: "", height: '20px', width: '20px', left: '4px', bottom: '4px',
                                backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                                transform: demoMode ? 'translateX(22px)' : 'translateX(0)'
                            }}></span>
                        </span>
                    </label>
                </div>

                {/* Gemini */}
                <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                        <h3>Google Gemini</h3>
                        {geminiStatus && (
                            <span style={{ fontSize: 'var(--text-lg)' }}>
                                {getStatusIcon(geminiStatus)} {getStatusText(geminiStatus)}
                            </span>
                        )}
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-400)', marginBottom: 'var(--space-4)' }}>
                        Best for image analysis. Get key from{' '}
                        <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                            Google AI Studio
                        </a>
                    </p>

                    <input
                        type="password"
                        className="input"
                        placeholder="Enter Gemini API key"
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        style={{ marginBottom: 'var(--space-3)' }}
                    />

                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => handleSave('gemini', geminiKey)}
                            disabled={!geminiKey}
                            style={{ flex: 1 }}
                        >
                            Save
                        </button>
                        <button
                            className="btn"
                            onClick={() => testKey('gemini', geminiKey)}
                            disabled={!geminiKey || geminiStatus === 'testing'}
                            style={{ flex: 1 }}
                        >
                            Test
                        </button>
                    </div>
                </div>

                {/* Groq */}
                <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                        <h3>Groq</h3>
                        {groqStatus && (
                            <span style={{ fontSize: 'var(--text-lg)' }}>
                                {getStatusIcon(groqStatus)} {getStatusText(groqStatus)}
                            </span>
                        )}
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-400)', marginBottom: 'var(--space-4)' }}>
                        Ultra-fast chat responses. Get key from{' '}
                        <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">
                            Groq Console
                        </a>
                    </p>

                    <input
                        type="password"
                        className="input"
                        placeholder="Enter Groq API key"
                        value={groqKey}
                        onChange={(e) => setGroqKey(e.target.value)}
                        style={{ marginBottom: 'var(--space-3)' }}
                    />

                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => handleSave('groq', groqKey)}
                            disabled={!groqKey}
                            style={{ flex: 1 }}
                        >
                            Save
                        </button>
                        <button
                            className="btn"
                            onClick={() => testKey('groq', groqKey)}
                            disabled={!groqKey || groqStatus === 'testing'}
                            style={{ flex: 1 }}
                        >
                            Test
                        </button>
                    </div>
                </div>

                {/* OpenRouter */}
                <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                        <h3>OpenRouter</h3>
                        {openrouterStatus && (
                            <span style={{ fontSize: 'var(--text-lg)' }}>
                                {getStatusIcon(openrouterStatus)} {getStatusText(openrouterStatus)}
                            </span>
                        )}
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-400)', marginBottom: 'var(--space-4)' }}>
                        Multiple models available. Get key from{' '}
                        <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">
                            OpenRouter
                        </a>
                    </p>

                    <input
                        type="password"
                        className="input"
                        placeholder="Enter OpenRouter API key"
                        value={openrouterKey}
                        onChange={(e) => setOpenrouterKey(e.target.value)}
                        style={{ marginBottom: 'var(--space-3)' }}
                    />

                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => handleSave('openrouter', openrouterKey)}
                            disabled={!openrouterKey}
                            style={{ flex: 1 }}
                        >
                            Save
                        </button>
                        <button
                            className="btn"
                            onClick={() => testKey('openrouter', openrouterKey)}
                            disabled={!openrouterKey || openrouterStatus === 'testing'}
                            style={{ flex: 1 }}
                        >
                            Test
                        </button>
                    </div>
                </div>

                {/* Provider Selection for Chat */}
                <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
                    <h3 style={{ marginBottom: 'var(--space-4)' }}>Active Provider for Chat</h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-400)', marginBottom: 'var(--space-4)' }}>
                        Select which provider to use for AI chat
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                            className={`filter-chip ${localStorage.getItem('ai_provider') === 'gemini' ? 'active' : ''}`}
                            onClick={async () => {
                                localStorage.setItem('ai_provider', 'gemini')
                                await aiService.initialize('gemini', geminiKey)
                                window.location.reload() // Reload to apply changes
                            }}
                            disabled={!geminiKey || geminiStatus !== 'valid'}
                        >
                            Gemini
                        </button>
                        <button
                            className={`filter-chip ${localStorage.getItem('ai_provider') === 'groq' ? 'active' : ''}`}
                            onClick={async () => {
                                localStorage.setItem('ai_provider', 'groq')
                                await aiService.initialize('groq', groqKey)
                                window.location.reload() // Reload to apply changes
                            }}
                            disabled={!groqKey || groqStatus !== 'valid'}
                        >
                            Groq
                        </button>
                        <button
                            className={`filter-chip ${localStorage.getItem('ai_provider') === 'openrouter' ? 'active' : ''}`}
                            onClick={async () => {
                                localStorage.setItem('ai_provider', 'openrouter')
                                await aiService.initialize('openrouter', openrouterKey)
                                window.location.reload() // Reload to apply changes
                            }}
                            disabled={!openrouterKey || openrouterStatus !== 'valid'}
                        >
                            OpenRouter
                        </button>
                    </div>
                </div>

                {/* About */}
                <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <h3 style={{ margin: 0 }}>About StyleLens</h3>
                        <span className="badge badge-primary">v13 (Hybrid Fix)</span>
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-400)', marginBottom: 'var(--space-4)' }}>
                        AI-powered personal stylist. Auto-switches to Gemini for photos.
                    </p>

                    <button
                        className="btn"
                        style={{
                            width: '100%',
                            borderColor: 'var(--color-error)',
                            color: '#ff8888',
                            background: 'rgba(239, 68, 68, 0.1)'
                        }}
                        onClick={() => {
                            if (confirm('This will clear all your saved outfits, keys, and settings. Are you sure?')) {
                                localStorage.clear()
                                window.location.reload()
                            }
                        }}
                    >
                        ⚠️ Reset App Data
                    </button>
                    <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '8px', textAlign: 'center' }}>
                        Use this if you see "Gemini Only" errors.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Settings
