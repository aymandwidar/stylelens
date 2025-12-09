import { useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'

function TravelPacker() {
    const [destination, setDestination] = useState('')
    const [duration, setDuration] = useState('3')
    const [packingList, setPackingList] = useState(null)
    const [loading, setLoading] = useState(false)

    const generateList = async () => {
        if (!destination) return

        setLoading(true)
        try {
            const apiKey = localStorage.getItem('gemini_api_key')
            if (!apiKey) throw new Error("No API Key")

            const genAI = new GoogleGenerativeAI(apiKey)
            const model = genAI.getGenerativeModel({ model: localStorage.getItem('gemini_model') || 'gemini-1.5-flash' })

            const wardrobe = JSON.parse(localStorage.getItem('wardrobe_items') || '[]')
            const wardrobeSummary = wardrobe.map(i => `${i.color} ${i.type}`).join(', ')

            const prompt = `I am going to ${destination} for ${duration} days. 
            Based on the likely weather for this location, generate a Packing List using ONLY items from my wardrobe:
            [${wardrobeSummary}]
            
            Also suggest 2-3 specific outfits.
            Format as clear Markdown.`

            const result = await model.generateContent(prompt)
            const response = await result.response
            setPackingList(response.text())

        } catch (error) {
            alert('Failed to generate list: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="travel-packer glass-card p-6">
            <h2 className="text-xl font-bold mb-4">✈️ AI Travel Packer</h2>

            {!packingList ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1">Destination</label>
                        <input
                            type="text"
                            className="w-full bg-black/20 p-2 rounded"
                            value={destination}
                            onChange={e => setDestination(e.target.value)}
                            placeholder="e.g. London, Tokyo"
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Days</label>
                        <input
                            type="number"
                            className="w-full bg-black/20 p-2 rounded"
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                        />
                    </div>
                    <button
                        className="btn-primary w-full"
                        onClick={generateList}
                        disabled={loading || !destination}
                    >
                        {loading ? 'Generating...' : 'Create Packing List'}
                    </button>
                </div>
            ) : (
                <div className="results animate-slide-up">
                    <div className="prose prose-invert prose-sm max-h-60 overflow-y-auto mb-4 bg-black/20 p-4 rounded">
                        <pre className="whitespace-pre-wrap font-sans">{packingList}</pre>
                    </div>
                    <button className="btn-secondary w-full" onClick={() => setPackingList(null)}>
                        Start Over
                    </button>
                </div>
            )}
        </div>
    )
}

export default TravelPacker
