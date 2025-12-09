class WeatherService {
    async getCurrentWeather(latitude, longitude) {
        try {
            // OpenMeteo is free and requires no API key
            // Docs: https://open-meteo.com/en/docs
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`

            const response = await fetch(url)
            if (!response.ok) throw new Error('Weather data fetch failed')

            const data = await response.json()
            return this.formatWeatherData(data)
        } catch (error) {
            console.error('Weather Service Error:', error)
            throw error
        }
    }

    async getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported by browser'))
                return
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    })
                },
                (error) => {
                    reject(new Error('Location permission denied'))
                }
            )
        })
    }

    // Convert WMO weather codes to human readable format
    // Codes: https://open-meteo.com/en/docs
    getWeatherDescription(code) {
        // Simple mapping
        if (code === 0) return { label: 'Clear Sky', icon: '☀️', type: 'sunny' }
        if (code >= 1 && code <= 3) return { label: 'Partly Cloudy', icon: '⛅', type: 'cloudy' }
        if (code >= 45 && code <= 48) return { label: 'Foggy', icon: '🌫️', type: 'fog' }
        if (code >= 51 && code <= 67) return { label: 'Rainy', icon: '🌧️', type: 'rain' }
        if (code >= 71 && code <= 77) return { label: 'Snowy', icon: '❄️', type: 'snow' }
        if (code >= 80 && code <= 82) return { label: 'Heavy Rain', icon: '⛈️', type: 'rain' }
        if (code >= 95 && code <= 99) return { label: 'Thunderstrom', icon: '⚡', type: 'storm' }
        return { label: 'Unknown', icon: '❓', type: 'unknown' }
    }

    formatWeatherData(data) {
        const current = data.current
        const daily = data.daily
        const weatherInfo = this.getWeatherDescription(current.weather_code)

        return {
            temp: Math.round(current.temperature_2m),
            condition: weatherInfo.label,
            icon: weatherInfo.icon,
            type: weatherInfo.type, // sunny, rain, etc. used for outcome logic
            humidity: current.relative_humidity_2m,
            high: Math.round(daily.temperature_2m_max[0]),
            low: Math.round(daily.temperature_2m_min[0]),
            unit: '°C'
        }
    }
}

export default new WeatherService()
