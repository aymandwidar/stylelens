import { useState, useEffect } from 'react'
import './Wardrobe.css'
import WeatherWidget from '../components/WeatherWidget'
import aiService from '../services/ai'
import TravelPacker from '../components/TravelPacker'

const ToolsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
)

const PlusIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
)

const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
    </svg>
)

const FilterIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
)

const CameraIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
)

function Wardrobe() {
    const [items, setItems] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [filterOccasion, setFilterOccasion] = useState('all')
    const [showAddModal, setShowAddModal] = useState(false)
    const [showTools, setShowTools] = useState(false)
    const [activeTool, setActiveTool] = useState(null) // 'packer'
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    // Load items from localStorage
    useEffect(() => {
        const savedItems = JSON.parse(localStorage.getItem('wardrobe_items') || '[]')
        setItems(savedItems)
    }, [])

    // Save items to localStorage
    const saveItems = (newItems) => {
        localStorage.setItem('wardrobe_items', JSON.stringify(newItems))
        setItems(newItems)
    }

    const handleAddItem = async (imageData) => {
        setIsAnalyzing(true)
        try {
            await aiService.initPromise
            const classification = await aiService.classifyGarment(imageData)

            const newItem = {
                id: Date.now(),
                image: imageData,
                ...classification,
                occasion: classification.occasion || ['casual'], // Default to casual if not detected
                addedAt: new Date().toISOString()
            }

            const updatedItems = [...items, newItem]
            saveItems(updatedItems)
            setShowAddModal(false)
        } catch (error) {
            console.error('Classification error:', error)
            alert('Failed to classify garment. Please try again.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleCameraCapture = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.capture = 'environment'

        input.onchange = (e) => {
            const file = e.target.files[0]
            if (file) {
                const reader = new FileReader()
                reader.onload = (event) => {
                    handleAddItem(event.target.result)
                }
                reader.readAsDataURL(file)
            }
        }

        input.click()
    }

    const deleteItem = (id) => {
        const updatedItems = items.filter(item => item.id !== id)
        saveItems(updatedItems)
    }

    // Filter items
    const filteredItems = items.filter(item => {
        const matchesSearch = item.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.color?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesFilter = filterType === 'all' || item.type?.toLowerCase() === filterType.toLowerCase()
        const matchesOccasion = filterOccasion === 'all' || item.occasion?.includes(filterOccasion)

        return matchesSearch && matchesFilter && matchesOccasion
    })

    // Get unique types for filter
    const types = ['all', ...new Set(items.map(item => item.type).filter(Boolean))]

    return (
        <div className="wardrobe-page">
            <div className="wardrobe-header">
                <h1>My Wardrobe</h1>
                <WeatherWidget />
                <button
                    className={`btn-icon glass-card ${showTools ? 'active' : ''}`}
                    onClick={() => setShowTools(!showTools)}
                    style={{ position: 'absolute', right: 20, top: 20 }}
                >
                    <ToolsIcon />
                </button>
            </div>

            {/* Tools Section */}
            {showTools && (
                <div className="px-4 mb-4 animate-slide-up">
                    <div className="glass-card p-4">
                        <h3 className="font-bold mb-2">Smart Tools</h3>
                        <div className="flex gap-2">
                            <button
                                className={`btn-secondary ${activeTool === 'packer' ? 'bg-primary' : ''}`}
                                onClick={() => setActiveTool(activeTool === 'packer' ? null : 'packer')}
                            >
                                🗺️ Travel Packer
                            </button>
                        </div>

                        {activeTool === 'packer' && (
                            <div className="mt-4">
                                <TravelPacker />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {items.length > 0 && (
                <div className="wardrobe-controls">
                    <div className="search-bar glass-card">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="filter-chips">
                        {types.map(type => (
                            <button
                                key={type}
                                className={`filter-chip glass-card ${filterType === type ? 'active' : ''}`}
                                onClick={() => setFilterType(type)}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Occasion Filter */}
                    <div className="filter-chips" style={{ marginTop: 'var(--space-2)' }}>
                        {['all', 'casual', 'work', 'formal', 'party', 'sport'].map(occ => (
                            <button
                                key={occ}
                                className={`filter-chip glass-card ${filterOccasion === occ ? 'active' : ''}`}
                                onClick={() => setFilterOccasion(occ)}
                                style={filterOccasion === occ ? { background: 'var(--primary-color)', color: 'white' } : {}}
                            >
                                {occ.charAt(0).toUpperCase() + occ.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            )}


            {
                filteredItems.length > 0 ? (
                    <div className="wardrobe-grid">
                        {filteredItems.map(item => (
                            <div key={item.id} className="wardrobe-item glass-card">
                                <div className="item-image">
                                    <img src={item.image} alt={item.type} />
                                    <button
                                        className="item-delete"
                                        onClick={() => deleteItem(item.id)}
                                        aria-label="Delete item"
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="item-details">
                                    <h3>{item.type}</h3>
                                    <p className="item-color">{item.color}</p>
                                    <div className="item-tags">
                                        {item.pattern && <span className="tag">{item.pattern}</span>}
                                        {item.style && <span className="tag">{item.style}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : items.length > 0 ? (
                    <div className="wardrobe-empty">
                        <p>No items match your search</p>
                    </div>
                ) : (
                    <div className="wardrobe-empty">
                        <div className="empty-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M12 3v18" />
                                <path d="M9 12h2" />
                                <path d="M13 12h2" />
                            </svg>
                        </div>
                        <h3>No items yet</h3>
                        <p>Start building your digital wardrobe by adding your first item</p>
                    </div>
                )
            }

            {/* Floating Add Button */}
            <button
                className="fab btn-primary"
                onClick={handleCameraCapture}
                disabled={isAnalyzing}
                aria-label="Add item"
            >
                {isAnalyzing ? (
                    <div className="fab-spinner animate-spin"></div>
                ) : (
                    <PlusIcon />
                )}
            </button>

            {/* Analyzing Overlay */}
            {
                isAnalyzing && (
                    <div className="analyzing-overlay">
                        <div className="analyzing-spinner animate-spin"></div>
                        <p>Analyzing garment...</p>
                    </div>
                )
            }
        </div >
    )
}

export default Wardrobe
