import { useState, useEffect } from 'react'
import '../pages/Wardrobe.css' // Reuse styles

function Analytics() {
    const [stats, setStats] = useState(null)

    useEffect(() => {
        calculateStats()
    }, [])

    const calculateStats = () => {
        const items = JSON.parse(localStorage.getItem('wardrobe_items') || '[]')

        // 1. Total Count
        const total = items.length

        // 2. Category Breakdown
        const categories = {}
        items.forEach(item => {
            // Simplified category grouping
            let cat = 'Other'
            const type = item.type?.toLowerCase() || ''
            if (['shirt', 'top', 'blouse', 't-shirt', 'sweater', 'hoodie'].some(t => type.includes(t))) cat = 'Tops'
            else if (['pants', 'jeans', 'skirt', 'shorts', 'leggings'].some(t => type.includes(t))) cat = 'Bottoms'
            else if (['shoe', 'sneaker', 'boot', 'sandal'].some(t => type.includes(t))) cat = 'Shoes'
            else if (['jacket', 'coat', 'blazer'].some(t => type.includes(t))) cat = 'Outerwear'

            categories[cat] = (categories[cat] || 0) + 1
        })

        // 3. Color Breakdown (Top 5)
        const colors = {}
        items.forEach(item => {
            const color = item.color || 'Unknown'
            colors[color] = (colors[color] || 0) + 1
        })
        const topColors = Object.entries(colors)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)

        // 4. Occasion Breakdown
        const occasions = {}
        items.forEach(item => {
            if (item.occasion && Array.isArray(item.occasion)) {
                item.occasion.forEach(occ => {
                    occasions[occ] = (occasions[occ] || 0) + 1
                })
            }
        })

        setStats({ total, categories, topColors, occasions })
    }

    if (!stats) return <div>Loading Analytics...</div>

    return (
        <div className="p-4 pb-20 space-y-6 animate-fade-in">
            <div className="glass-card p-6 text-center">
                <h2 className="text-4xl font-bold gradient-text">{stats.total}</h2>
                <p className="text-gray-400">Total Items</p>
            </div>

            {/* Categories Chart (Simple Bar) */}
            <div className="glass-card p-4">
                <h3 className="font-bold mb-4">Wardrobe Balance</h3>
                <div className="space-y-3">
                    {Object.entries(stats.categories).map(([cat, count]) => (
                        <div key={cat}>
                            <div className="flex justify-between text-sm mb-1">
                                <span>{cat}</span>
                                <span>{count}</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500"
                                    style={{ width: `${(count / stats.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Colors Chart */}
            <div className="glass-card p-4">
                <h3 className="font-bold mb-4">Top Colors</h3>
                <div className="flex gap-4 justify-center flex-wrap">
                    {stats.topColors.map(([color, count]) => (
                        <div key={color} className="text-center">
                            <div
                                className="w-12 h-12 rounded-full border-2 border-white/20 mb-2 shadow-lg"
                                style={{ backgroundColor: color.toLowerCase().includes('unknown') ? '#333' : color }}
                            ></div>
                            <span className="text-xs">{color}</span>
                        </div>
                    ))}
                    {stats.topColors.length === 0 && <p className="text-gray-500">No color data yet</p>}
                </div>
            </div>

            {/* Occasion Tags */}
            <div className="glass-card p-4">
                <h3 className="font-bold mb-4">Occasions</h3>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(stats.occasions).map(([occ, count]) => (
                        <span key={occ} className="bg-white/10 px-3 py-1 rounded-full text-sm">
                            {occ} ({count})
                        </span>
                    ))}
                    {Object.keys(stats.occasions).length === 0 && <p className="text-gray-500">No occasion tags yet</p>}
                </div>
            </div>
        </div>
    )
}

export default Analytics
