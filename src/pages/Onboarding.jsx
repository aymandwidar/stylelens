import { useState, useRef } from 'react'
import aiService from '../services/ai'
import './Onboarding.css'

const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

function Onboarding({ onComplete }) {
    const [step, setStep] = useState(1)
    const [skinToneData, setSkinToneData] = useState(null)
    const [bodyTypeData, setBodyTypeData] = useState(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [error, setError] = useState(null)
    const fileInputRef = useRef(null)

    const handleSkinToneAnalysis = async (imageData) => {
        setIsAnalyzing(true)
        setError(null)

        try {
            await aiService.initPromise
            const analysis = await aiService.analyzeSkinTone(imageData)
            setSkinToneData(analysis) // Changed from setSkinTone(analysis) to match existing state setter
            setStep(2) // Changed from nextStep()2) to setStep(2) for syntactic correctness
        } catch (err) {
            console.error('Skin tone analysis error:', err)
            setError(err.message || 'Failed to analyze skin tone. Please try again.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleBodyTypeAnalysis = async (imageData) => {
        setIsAnalyzing(true)
        setError(null)

        try {
            await aiService.initPromise
            const analysis = await aiService.analyzeBodyType(imageData)
            setBodyTypeData(analysis) // Changed from setBodyType(analysis) to match existing state setter
            setStep(3) // Changed from nextStep()3) to setStep(3) for syntactic correctness
        } catch (err) {
            console.error('Body type analysis error:', err)
            setError(err.message || 'Failed to analyze body type. Please try again.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleFileSelect = (e, analysisType) => {
        const file = e.target.files[0]
        console.log('File selected:', file)

        if (!file) {
            console.error('No file selected')
            return
        }

        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file')
            return
        }

        const reader = new FileReader()

        reader.onerror = () => {
            console.error('FileReader error')
            setError('Failed to read image file. Please try again.')
        }

        reader.onload = (event) => {
            console.log('File loaded, data URL length:', event.target.result?.length)
            if (analysisType === 'skinTone') {
                handleSkinToneAnalysis(event.target.result)
            } else {
                handleBodyTypeAnalysis(event.target.result)
            }
        }

        reader.readAsDataURL(file)

        // Reset input so same file can be selected again
        e.target.value = ''
    }

    const handleComplete = () => {
        // Save user profile
        const profile = {
            skinTone: skinToneData,
            bodyType: bodyTypeData,
            completedAt: new Date().toISOString()
        }
        localStorage.setItem('user_profile', JSON.stringify(profile))
        localStorage.setItem('onboarding_complete', 'true')

        if (onComplete) {
            onComplete(profile)
        }
    }

    const handleSkip = () => {
        localStorage.setItem('onboarding_complete', 'true')
        if (onComplete) {
            onComplete(null)
        }
    }

    return (
        <div className="onboarding-container">
            <div className="onboarding-content">
                {/* Progress Indicator */}
                <div className="onboarding-progress">
                    <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'complete' : ''}`}>
                        {step > 1 ? <CheckIcon /> : '1'}
                    </div>
                    <div className="progress-line"></div>
                    <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'complete' : ''}`}>
                        {step > 2 ? <CheckIcon /> : '2'}
                    </div>
                    <div className="progress-line"></div>
                    <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                        3
                    </div>
                </div>

                {/* Step 1: Skin Tone Analysis */}
                {step === 1 && (
                    <div className="onboarding-step animate-fade-in">
                        <div className="step-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="8" r="5" />
                                <path d="M20 21a8 8 0 1 0-16 0" />
                            </svg>
                        </div>
                        <h2>Discover Your Colors</h2>
                        <p>Take a selfie in natural lighting to find your perfect color palette</p>

                        {error && (
                            <div className="onboarding-error">
                                <p>{error}</p>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="user"
                            onChange={(e) => handleFileSelect(e, 'skinTone')}
                            style={{ display: 'none' }}
                        />

                        <button
                            className="btn btn-primary btn-large"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing ? 'Analyzing...' : 'Take Selfie'}
                        </button>

                        <button className="btn-text" onClick={handleSkip}>
                            Skip for now
                        </button>
                    </div>
                )}

                {/* Step 2: Body Type Analysis */}
                {step === 2 && skinToneData && (
                    <div className="onboarding-step animate-fade-in">
                        <div className="step-icon success">
                            <CheckIcon />
                        </div>
                        <h2>Your Color Profile</h2>
                        <div className="analysis-result glass-card">
                            <div className="result-row">
                                <span className="result-label">Undertone</span>
                                <span className="result-value">{skinToneData.undertone}</span>
                            </div>
                            <div className="result-row">
                                <span className="result-label">Season</span>
                                <span className="result-value">{skinToneData.seasonalPalette}</span>
                            </div>
                            <div className="result-colors">
                                <p className="result-label">Best Colors</p>
                                <div className="color-chips">
                                    {skinToneData.bestColors?.slice(0, 5).map((color, idx) => (
                                        <span key={idx} className="color-chip">{color}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <h3 style={{ marginTop: 'var(--space-6)' }}>Find Your Perfect Fit</h3>
                        <p>Take a full-body photo to get personalized style recommendations</p>

                        {error && (
                            <div className="onboarding-error">
                                <p>{error}</p>
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleFileSelect(e, 'bodyType')}
                            style={{ display: 'none' }}
                            id="bodyTypeInput"
                        />

                        <button
                            className="btn btn-primary btn-large"
                            onClick={() => document.getElementById('bodyTypeInput')?.click()}
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing ? 'Analyzing...' : 'Take Photo'}
                        </button>

                        <button className="btn-text" onClick={() => setStep(3)}>
                            Skip this step
                        </button>
                    </div>
                )}

                {/* Step 3: Complete */}
                {step === 3 && (
                    <div className="onboarding-step animate-fade-in">
                        <div className="step-icon success">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                                <path d="M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75L19 3z" />
                            </svg>
                        </div>
                        <h2>You're All Set!</h2>
                        <p>Start building your digital wardrobe and get personalized styling advice</p>

                        {bodyTypeData && (
                            <div className="analysis-result glass-card">
                                <div className="result-row">
                                    <span className="result-label">Body Shape</span>
                                    <span className="result-value">{bodyTypeData.bodyShape}</span>
                                </div>
                                <div className="result-list">
                                    <p className="result-label">Style Tips</p>
                                    {bodyTypeData.fitGuidelines?.slice(0, 3).map((tip, idx) => (
                                        <p key={idx} className="result-tip">• {tip}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            className="btn btn-primary btn-large"
                            onClick={handleComplete}
                        >
                            Get Started
                        </button>
                    </div>
                )}

                {/* Loading Overlay */}
                {isAnalyzing && (
                    <div className="analyzing-overlay">
                        <div className="analyzing-spinner animate-spin"></div>
                        <p>Analyzing your photo...</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Onboarding
