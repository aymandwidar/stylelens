import { useState, useEffect } from 'react'
import MagicMorning from '../components/MagicMorning'
import './Wardrobe.css' // Re-use wardrobe styles for now

const HangerIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3a5 5 0 0 0-5 5v2h10V8a5 5 0 0 0-5-5z" />
        <path d="M3 10h18l-2 11H5L3 10z" />
    </svg>
)

const ShareIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
)

const SaveIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
)

function OutfitBuilder() {
    const [wardrobe, setWardrobe] = useState([])
    const [outfit, setOutfit] = useState({ top: null, bottom: null, shoes: null })
    const [activeSlot, setActiveSlot] = useState(null) // 'top', 'bottom', 'shoes'
    const [showPicker, setShowPicker] = useState(false)

    useEffect(() => {
        const savedItems = JSON.parse(localStorage.getItem('wardrobe_items') || '[]')
        setWardrobe(savedItems)
    }, [])

    const handleSlotClick = (slot) => {
        setActiveSlot(slot)
        setShowPicker(true)
    }

    const handleItemSelect = (item) => {
        setOutfit(prev => ({ ...prev, [activeSlot]: item }))
        setShowPicker(false)
        setActiveSlot(null)
    }

    const handleMagicOutfit = (generatedOutfit) => {
        setOutfit({
            top: generatedOutfit.top,
            bottom: generatedOutfit.bottom,
            shoes: generatedOutfit.shoes
        })
        alert(`✨ Magic Outfit Generated for ${generatedOutfit.weatherCtx.condition} weather!`)
    }

    const handleSaveOutfit = () => {
        if (!outfit.top && !outfit.bottom) {
            alert('Add at least a Top or Bottom to save!')
            return
        }

        const savedOutfits = JSON.parse(localStorage.getItem('saved_outfits') || '[]')
        const newOutfit = {
            id: Date.now(),
            items: outfit,
            createdAt: new Date().toISOString()
        }

        localStorage.setItem('saved_outfits', JSON.stringify([...savedOutfits, newOutfit]))
        alert('Outfit saved to your collection! ✨')
    }

    const handleClear = () => {
        setOutfit({ top: null, bottom: null, shoes: null })
    }

    // Filter items for the picker based on active slot
    const getPickerItems = () => {
        if (!activeSlot) return []

        // Simple keyword matching for now
        const keywords = {
            top: ['shirt', 'top', 'blouse', 'sweater', 'jacket', 'coat', 'hoodie', 't-shirt'],
            bottom: ['pants', 'jeans', 'skirt', 'shorts', 'leggings', 'trousers'],
            shoes: ['shoe', 'boot', 'sneaker', 'sandal', 'heel', 'flat']
        }

        return wardrobe.filter(item => {
            const typeLower = item.type?.toLowerCase() || ''
            // If item has no type, include it in all? No, safer to exclude.
            // Or use 'tags' if available. 
            // For now, strict matching on type.
            return keywords[activeSlot].some(k => typeLower.includes(k)) ||
                (activeSlot === 'top' && !keywords.bottom.some(k => typeLower.includes(k)) && !keywords.shoes.some(k => typeLower.includes(k)))
            // Catch-all for tops if logic fails
        })
    }

    return (
        <div className="outfit-builder space-y-6">
            <div className="header glass-card p-4 flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Outfit Builder</h1>
                <div className="flex gap-2">
                    <button onClick={handleClear} className="text-sm text-gray-400">Clear</button>
                    <button onClick={handleSaveOutfit} className="btn-icon">
                        <SaveIcon />
                    </button>
                </div>
            </div>

            {/* Magic Generator */}
            <div className="px-4 mb-4">
                <MagicMorning onOutfitGenerated={handleMagicOutfit} />
            </div>

            {/* Canvas Area */}
            <div className="canvas flex flex-col gap-4 items-center mb-8">
                {/* HEAD / TOP SLOT */}
                <div
                    className={`slot glass-card w-48 h-48 flex items-center justify-center border-2 border-dashed ${outfit.top ? 'border-transparent' : 'border-gray-600'}`}
                    onClick={() => handleSlotClick('top')}
                >
                    {outfit.top ? (
                        <div className="relative w-full h-full">
                            <img src={outfit.top.image} className="w-full h-full object-cover rounded-lg" />
                            <button className="absolute top-1 right-1 bg-black/50 rounded-full p-1" onClick={(e) => {
                                e.stopPropagation()
                                setOutfit(prev => ({ ...prev, top: null }))
                            }}>×</button>
                        </div>
                    ) : (
                        <span className="text-gray-500">Add Top</span>
                    )}
                </div>

                {/* LEGS / BOTTOM SLOT */}
                <div
                    className={`slot glass-card w-48 h-64 flex items-center justify-center border-2 border-dashed ${outfit.bottom ? 'border-transparent' : 'border-gray-600'}`}
                    onClick={() => handleSlotClick('bottom')}
                >
                    {outfit.bottom ? (
                        <div className="relative w-full h-full">
                            <img src={outfit.bottom.image} className="w-full h-full object-cover rounded-lg" />
                            <button className="absolute top-1 right-1 bg-black/50 rounded-full p-1" onClick={(e) => {
                                e.stopPropagation()
                                setOutfit(prev => ({ ...prev, bottom: null }))
                            }}>×</button>
                        </div>
                    ) : (
                        <span className="text-gray-500">Add Bottom</span>
                    )}
                </div>

                {/* FEET / SHOES SLOT */}
                <div
                    className={`slot glass-card w-48 h-32 flex items-center justify-center border-2 border-dashed ${outfit.shoes ? 'border-transparent' : 'border-gray-600'}`}
                    onClick={() => handleSlotClick('shoes')}
                >
                    {outfit.shoes ? (
                        <div className="relative w-full h-full">
                            <img src={outfit.shoes.image} className="w-full h-full object-cover rounded-lg" />
                            <button className="absolute top-1 right-1 bg-black/50 rounded-full p-1" onClick={(e) => {
                                e.stopPropagation()
                                setOutfit(prev => ({ ...prev, shoes: null }))
                            }}>×</button>
                        </div>
                    ) : (
                        <span className="text-gray-500">Add Shoes</span>
                    )}
                </div>
            </div>

            {/* Picker Modal */}
            {showPicker && (
                <div className="fixed inset-0 bg-black/80 z-50 flex flex-col justify-end">
                    <div className="bg-[#1a1a1a] rounded-t-2xl h-[70vh] p-4 overflow-y-auto animate-slide-up">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Select {activeSlot}</h3>
                            <button onClick={() => setShowPicker(false)}>Close</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {getPickerItems().length > 0 ? getPickerItems().map(item => (
                                <div key={item.id} onClick={() => handleItemSelect(item)} className="glass-card p-2 active:scale-95 transition-transform">
                                    <img src={item.image} className="w-full h-32 object-cover rounded-md mb-2" />
                                    <p className="text-xs truncate">{item.color} {item.type}</p>
                                </div>
                            )) : (
                                <p className="col-span-2 text-center text-gray-400 py-10">
                                    No {activeSlot}s found in your wardrobe!
                                    <br /><span className="text-xs">Try adding some more items.</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OutfitBuilder
