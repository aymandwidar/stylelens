import { useState } from 'react'
import weatherService from '../services/weather'

function MagicMorning({ onOutfitGenerated }) {
    const [loading, setLoading] = useState(false)

    const generateOutfit = async () => {
        setLoading(true)
        try {
            // 1. Get current weather
            const location = await weatherService.getUserLocation()
            const weather = await weatherService.getCurrentWeather(location.latitude, location.longitude)

            // 2. Get wardrobe
            const items = JSON.parse(localStorage.getItem('wardrobe_items') || '[]')

            if (items.length < 2) {
                alert("You need more clothes! Add closer to 5 items to use Magic Morning.")
                setLoading(false)
                return
            }

            // 3. Filter by Weather (Simple Logic)
            let suitableItems = items
            if (weather.temp > 25) {
                // Hot: Avoid coats, heavy jackets, wool
                suitableItems = items.filter(i => !['coat', 'jacket', 'hoodie'].some(type => i.type?.toLowerCase().includes(type)))
            } else if (weather.temp < 10) {
                // Cold: Prefer coats, long pants
                suitableItems = items // Keep everything available for layering
            }

            // 4. Pick a Top
            const tops = suitableItems.filter(i => ['shirt', 'top', 'blouse', 't-shirt', 'sweater', 'hoodie'].some(t => i.type?.toLowerCase().includes(t)))
            const randomTop = tops[Math.floor(Math.random() * tops.length)]

            if (!randomTop) {
                alert("No suitable tops found for this weather!")
                setLoading(false)
                return
            }

            // 5. Pick a Bottom (Try simple color matching if we had color logic, for now random compatible)
            const bottoms = suitableItems.filter(i => ['pants', 'jeans', 'skirt', 'shorts', 'leggings'].some(t => i.type?.toLowerCase().includes(t)))

            // Filter out shorts if cold
            const validBottoms = weather.temp < 15
                ? bottoms.filter(b => !b.type?.toLowerCase().includes('shorts') && !b.type?.toLowerCase().includes('skirt'))
                : bottoms

            const randomBottom = validBottoms[Math.floor(Math.random() * validBottoms.length)]

            // 6. Pick Shoes
            const shoes = suitableItems.filter(i => ['shoe', 'sneaker', 'boot', 'sandal'].some(t => i.type?.toLowerCase().includes(t)))
            const randomShoes = shoes[Math.floor(Math.random() * shoes.length)]

            // Return Outfit
            onOutfitGenerated({
                top: randomTop,
                bottom: randomBottom,
                shoes: randomShoes,
                weatherCtx: weather
            })

        } catch (error) {
            console.error(error)
            alert("Could not generate outfit. Check location permissions.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            className="btn-primary w-full py-4 text-lg font-bold shadow-lg animate-pulse"
            onClick={generateOutfit}
            disabled={loading}
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}
        >
            {loading ? '🔮 Casting Spell...' : '✨ Magic Morning Generator'}
        </button>
    )
}

export default MagicMorning
