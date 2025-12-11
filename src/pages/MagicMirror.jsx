import { useState, useEffect } from 'react'
import aiService from '../services/ai'

function MagicMirror() {
    const [wardrobe, setWardrobe] = useState([])
    const [occasion, setOccasion] = useState('Casual Day Out')
    const [outfit, setOutfit] = useState(null)
    const [loading, setLoading] = useState(false)
    const [animationStep, setAnimationStep] = useState(0)

    useEffect(() => {
        const items = JSON.parse(localStorage.getItem('wardrobe_items') || '[]')
        setWardrobe(items)
    }, [])

    const handleGenerate = async () => {
        if (wardrobe.length < 3) {
            alert("You need at least 3 items in your wardrobe to create an outfit!")
            return
        }

        setLoading(true)
        setOutfit(null)
        setAnimationStep(1) // Start animation

        try {
            const result = await aiService.generateOutfit(wardrobe, occasion)

            // Artificial delay to make it feel magical and let animation play
            setTimeout(() => {
                setOutfit(result)
                setLoading(false)
            }, 2000)

        } catch (error) {
            console.error(error)
            alert("Failed to generate outfit. Please try again.")
            setLoading(false)
        }
    }

    const getOutfitItems = () => {
        if (!outfit || !outfit.selectedItemIds) return []
        return wardrobe.filter(item => outfit.selectedItemIds.includes(item.id))
    }

    return (
        <div style={{ padding: 'var(--space-4)', paddingBottom: '80px', maxWidth: '600px', margin: '0 auto' }}>
            <div className="glass-card animate-slide-up" style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '2rem',
                    background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: 'var(--space-2)'
                }}>
                    Magic Mirror 🪄
                </h2>
                <p style={{ color: 'var(--color-neutral-400)' }}>
                    AI Stylist for your Digital Wardrobe
                </p>
            </div>

            {/* Occasion Selector */}
            <div className="glass-card animate-slide-up" style={{ animationDelay: '0.1s', marginBottom: 'var(--space-6)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>
                    What's the Occasion?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                    {['Casual Day Out', 'Date Night', 'Office / Work', 'Vacation / Beach', 'Party / Event', 'Gym / Active'].map(opt => (
                        <button
                            key={opt}
                            className={`btn ${occasion === opt ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setOccasion(opt)}
                            style={{ fontSize: 'var(--text-sm)' }}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: 'var(--space-4)', padding: 'var(--space-3)' }}
                    onClick={handleGenerate}
                    disabled={loading}
                >
                    {loading ? '✨ Casting Spell...' : 'Generate Outfit'}
                </button>
            </div>

            {/* Loading Animation */}
            {loading && (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    <div className="analyzing-spinner animate-spin" style={{ margin: '0 auto' }}></div>
                    <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-primary)' }}>
                        Checking {wardrobe.length} items...
                    </p>
                </div>
            )}

            {/* Outfit Reveal */}
            {outfit && (
                <div className="glass-card animate-scale-in" style={{ border: '2px solid var(--color-primary)' }}>
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>{outfit.outfitName}</h3>
                        <p style={{ fontStyle: 'italic', color: 'var(--color-neutral-300)' }}>"{outfit.reasoning}"</p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                        gap: 'var(--space-2)'
                    }}>
                        {getOutfitItems().map(item => (
                            <div key={item.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                <img
                                    src={item.image}
                                    alt={item.type}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0, left: 0, right: 0,
                                    background: 'rgba(0,0,0,0.6)',
                                    fontSize: '10px',
                                    padding: '4px',
                                    textAlign: 'center'
                                }}>
                                    {item.color} {item.type}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {wardrobe.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: 'var(--space-8)', opacity: 0.7 }}>
                    <p>Your wardrobe is empty!</p>
                    <p>Go to the 📷 Camera to verify items first.</p>
                </div>
            )}
        </div>
    )
}

export default MagicMirror
