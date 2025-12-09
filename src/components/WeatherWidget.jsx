import { useState, useEffect } from 'react'
import weatherService from '../services/weather'

function WeatherWidget({ onWeatherUpdate }) {
    const [weather, setWeather] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadWeather()
    }, [])

    const loadWeather = async () => {
        setLoading(true)
        setError(null)
        try {
            const location = await weatherService.getUserLocation()
            const data = await weatherService.getCurrentWeather(location.latitude, location.longitude)
            setWeather(data)
            if (onWeatherUpdate) onWeatherUpdate(data)
        } catch (err) {
            console.error('Weather load error:', err)
            // Silent error for UI, but could show retry button
            setError('Location access needed for weather')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="weather-widget glass-card loading">
                <div className="spinner-small"></div>
                <span>Loading weather...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="weather-widget glass-card error" onClick={loadWeather} style={{ cursor: 'pointer' }}>
                <span>📍 Tap to enable weather</span>
            </div>
        )
    }

    if (!weather) return null

    return (
        <div className="weather-widget glass-card">
            <div className="weather-main">
                <span className="weather-icon">{weather.icon}</span>
                <span className="weather-temp">{weather.temp}{weather.unit}</span>
            </div>
            <div className="weather-details">
                <span className="weather-condition">{weather.condition}</span>
                <span className="weather-range">H:{weather.high}° L:{weather.low}°</span>
            </div>
        </div>
    )
}

export default WeatherWidget
