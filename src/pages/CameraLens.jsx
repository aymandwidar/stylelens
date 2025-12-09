import { useState, useRef, useEffect } from 'react'
import aiService from '../services/ai'
import './CameraLens.css'

// SVG Icons
const FlipCameraIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
        <path d="M17 8l-2-2" />
    </svg>
)

const CaptureIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="16" cy="16" r="14" />
    </svg>
)

const MicIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
)

const SparklesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
        <path d="M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75L19 3z" />
    </svg>
)

function CameraLens() {
    const [stream, setStream] = useState(null)
    const [facingMode, setFacingMode] = useState('environment') // 'user' or 'environment'
    const [isCapturing, setIsCapturing] = useState(false)
    const [capturedImage, setCapturedImage] = useState(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [recommendations, setRecommendations] = useState(null)
    const [showRecommendations, setShowRecommendations] = useState(false)
    const [selectedPixel, setSelectedPixel] = useState(null)
    const [error, setError] = useState(null)

    const videoRef = useRef(null)
    const canvasRef = useRef(null)

    // Initialize camera
    useEffect(() => {
        startCamera()
        return () => {
            stopCamera()
        }
    }, [facingMode])

    const startCamera = async () => {
        try {
            setError(null)
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            })

            setStream(mediaStream)
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
            }
        } catch (err) {
            console.error('Camera access error:', err)
            setError('Camera access denied. Please grant camera permissions.')
        }
    }

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
        }
    }

    const flipCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    }

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return

        setIsCapturing(true)
        const video = videoRef.current
        const canvas = canvasRef.current

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0)

        const imageData = canvas.toDataURL('image/jpeg', 0.9)
        setCapturedImage(imageData)

        // Don't auto-analyze, wait for user to click
        setShowRecommendations(false)
        setRecommendations(null)
        setSelectedPixel(null)

        setTimeout(() => setIsCapturing(false), 300)
    }

    const handleImageClick = (e) => {
        if (!capturedImage || !canvasRef.current) return

        const canvas = canvasRef.current
        const rect = e.target.getBoundingClientRect()

        // Calculate click position relative to displayed image
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const x = Math.floor((e.clientX - rect.left) * scaleX)
        const y = Math.floor((e.clientY - rect.top) * scaleY)

        // Get pixel color
        const ctx = canvas.getContext('2d')
        const pixelData = ctx.getImageData(x, y, 1, 1).data
        const hexColor = rgbToHex(pixelData[0], pixelData[1], pixelData[2])

        setSelectedPixel({ x: e.clientX - rect.left, y: e.clientY - rect.top, color: hexColor })

        // Pass both image and location color for best context
        analyzeImage(capturedImage, hexColor)
    }

    const rgbToHex = (r, g, b) => {
        return "#" + [r, g, b].map(x => {
            const hex = x.toString(16)
            return hex.length === 1 ? "0" + hex : hex
        }).join('')
    }

    const analyzeImage = async (imageData, targetedColor = null) => {
        setAnalyzing(true)
        setError(null)

        try {
            // Ensure AI is ready (waits for auto-init from storage)
            await aiService.initPromise

            // If still not initialized, try to force init from storage again just in case
            if (!aiService.isInitialized()) {
                await aiService.initializeFromStorage()
            }

            const result = await aiService.analyzeGarmentColor(imageData, targetedColor)

            setRecommendations(result)
            setShowRecommendations(true)
        } catch (err) {
            console.error('Analysis error:', err)
            setError(err.message || 'Failed to analyze image. Please check your API key in Settings.')
        } finally {
            setAnalyzing(false)
        }
    }

    const resetCapture = () => {
        setCapturedImage(null)
        setRecommendations(null)
    }

    const handleVoiceCommand = () => {
        // TODO: Implement voice recognition
        alert('Voice command feature coming soon!')
    }

    return (
        <div className="camera-lens">
            {/* Camera View */}
            <div className="camera-container">
                {error ? (
                    <div className="camera-error">
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={startCamera}>
                            Retry
                        </button>
                    </div>
                ) : capturedImage ? (
                    <>
                        {/* Show captured image for color picking */}
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            <img
                                src={capturedImage}
                                alt="Captured"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    cursor: 'crosshair'
                                }}
                                onClick={handleImageClick}
                            />

                            {/* Show selected pixel indicator */}
                            {selectedPixel && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: selectedPixel.x - 25,
                                        top: selectedPixel.y - 25,
                                        width: 50,
                                        height: 50,
                                        border: '3px solid white',
                                        borderRadius: '50%',
                                        boxShadow: '0 0 0 2px rgba(0,0,0,0.3)',
                                        pointerEvents: 'none',
                                        animation: 'pulse 1s ease-in-out infinite'
                                    }}
                                />
                            )}

                            {/* Instruction overlay */}
                            {!selectedPixel && (
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    background: 'var(--glass-dark)',
                                    padding: 'var(--space-4) var(--space-6)',
                                    borderRadius: 'var(--radius-lg)',
                                    textAlign: 'center',
                                    pointerEvents: 'none'
                                }}>
                                    <p style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
                                        👆 Tap any color to analyze
                                    </p>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-400)' }}>
                                        Click on the garment to see color matches
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Button to retake */}
                        <div className="camera-controls-top">
                            <button
                                className="btn-icon btn-glass"
                                onClick={resetCapture}
                                aria-label="Retake photo"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="camera-video"
                        />

                        {/* Scanning Circle Overlay */}
                        <div className="scanning-overlay">
                            <div className={`scan-circle ${isCapturing ? 'capturing' : ''} ${analyzing ? 'analyzing' : ''}`}>
                                <div className="scan-ring"></div>
                                <div className="scan-ring-inner"></div>
                            </div>
                        </div>

                        {/* Top Controls */}
                        <div className="camera-controls-top">
                            <button
                                className="btn-icon btn-glass"
                                onClick={flipCamera}
                                aria-label="Flip camera"
                            >
                                <FlipCameraIcon />
                            </button>
                        </div>

                        {/* Bottom Controls */}
                        <div className="camera-controls-bottom">
                            <button
                                className="btn-icon btn-glass"
                                onClick={handleVoiceCommand}
                                aria-label="Voice command"
                            >
                                <MicIcon />
                            </button>

                            <button
                                className="capture-button"
                                onClick={capturePhoto}
                                disabled={analyzing}
                                aria-label="Capture photo"
                            >
                                <CaptureIcon />
                            </button>

                            <button
                                className="btn-icon btn-glass"
                                onClick={() => window.location.href = '#chat'}
                                aria-label="Open chat"
                            >
                                <SparklesIcon />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Recommendations Panel */}
            {showRecommendations && recommendations && (
                <div className="recommendations-panel glass-card animate-slide-up">
                    <div className="recommendations-header">
                        <h3>Color Analysis</h3>
                        <button className="btn-icon" onClick={resetCapture} aria-label="Close">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    <div className="dominant-color">
                        <div
                            className="color-swatch-large"
                            style={{ backgroundColor: recommendations.dominantColor }}
                        ></div>
                        <div>
                            <p className="color-label">Dominant Color</p>
                            <p className="color-name">{recommendations.colorName}</p>
                            <p className="color-hex">{recommendations.dominantColor}</p>
                            {recommendations.garmentType && (
                                <p className="color-label" style={{ marginTop: 'var(--space-2)' }}>
                                    {recommendations.garmentType} • {recommendations.pattern}
                                </p>
                            )}
                        </div>
                    </div>

                    {recommendations.styleNotes && (
                        <div style={{
                            padding: 'var(--space-3)',
                            background: 'var(--glass-light)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--space-4)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-neutral-300)'
                        }}>
                            💡 {recommendations.styleNotes}
                        </div>
                    )}

                    <div className="color-harmonies">
                        {recommendations.harmonies && Array.isArray(recommendations.harmonies) ? (
                            recommendations.harmonies.map((harmony, idx) => (
                                <div key={idx} className="harmony-group">
                                    <p className="harmony-label">{harmony.type}</p>
                                    <div className="color-swatches">
                                        {harmony.colors && harmony.colors.map((color, colorIdx) => (
                                            <div
                                                key={colorIdx}
                                                className="color-swatch"
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--color-neutral-400)', fontSize: 'var(--text-sm)' }}>
                                No color harmonies found.
                            </p>
                        )}
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: 'var(--space-4)' }}
                        onClick={async () => {
                            try {
                                // Get existing wardrobe items
                                const existingItems = JSON.parse(localStorage.getItem('wardrobe_items') || '[]')

                                // Create new item
                                const newItem = {
                                    id: Date.now(),
                                    image: capturedImage,
                                    type: recommendations.garmentType,
                                    color: recommendations.colorName,
                                    pattern: recommendations.pattern,
                                    style: recommendations.styleNotes,
                                    tags: [recommendations.pattern, recommendations.garmentType].filter(Boolean),
                                    addedAt: new Date().toISOString()
                                }

                                // Save to wardrobe
                                const updatedItems = [...existingItems, newItem]
                                localStorage.setItem('wardrobe_items', JSON.stringify(updatedItems))

                                // Reset and show success
                                alert('Item saved to wardrobe!')
                                resetCapture()
                            } catch (error) {
                                console.error('Save error:', error)
                                alert('Failed to save item. Please try again.')
                            }
                        }}
                    >
                        Save to Wardrobe
                    </button>
                </div>
            )}

            {/* Hidden canvas for image capture */}
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

            {/* Loading Overlay */}
            {analyzing && (
                <div className="analyzing-overlay">
                    <div className="analyzing-spinner animate-spin"></div>
                    <p>Analyzing colors...</p>
                </div>
            )}
        </div>
    )
}

export default CameraLens
