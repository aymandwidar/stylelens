import { GoogleGenerativeAI } from '@google/generative-ai'

// StyleLens AI Service v18 (Smart Fallback Edition)
// Multi-provider AI service supporting Gemini, Groq, and OpenRouter

class AIService {
    constructor() {
        this.provider = null
        this.client = null
        this.visionClient = null
        // Fallback models to try if the primary hits 429 Quota Exceeded
        this.fallbackModels = [
            'gemini-1.5-flash-8b',    // Cheaper/Faster
            'gemini-1.5-flash',       // Standard
            'gemini-1.5-pro',         // Higher tier
            'gemini-pro',             // Legacy stable
            'gemini-1.0-pro'          // Legacy
        ]
        this.initPromise = this.initializeFromStorage()
    }

    getModels(provider) {
        if (provider === 'gemini') {
            return [
                { id: 'auto', name: 'Auto-Detect (Recommended)' },
                { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (New)' },
                { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
                { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Exp' },
                { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
                { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
                { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B' }
            ]
        }
        if (provider === 'groq') {
            return [
                { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Recommended)' },
                { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B' },
                { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Fast)' },
                { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7b' },
                { id: 'gemma2-9b-it', name: 'Gemma 2 9B' }
            ]
        }
        return []
    }

    async initializeFromStorage() {
        const provider = localStorage.getItem('ai_provider') || 'gemini'
        const apiKey = localStorage.getItem(`${provider}_api_key`)

        if (apiKey) {
            // Pass null for model to use saved preference inside initialize
            await this.initialize(provider, apiKey)
        }
    }

    async initialize(provider, apiKey, modelId = null) {
        try {
            this.provider = provider
            this.client = null // Clear previous client to prevent zombie state

            // Re-instantiate the base GoogleGenerativeAI instance if needed for fallbacks
            if (provider === 'gemini' || !this.genAI) {
                // Static import used
                this.genAI = new GoogleGenerativeAI(apiKey)
            }

            switch (provider) {
                case 'gemini':
                    await this.initializeGemini(apiKey, modelId)
                    break
                case 'groq':
                    this.initializeGroq(apiKey, modelId)
                    break
                case 'openrouter':
                    this.initializeOpenRouter(apiKey)
                    break
                default:
                    throw new Error('Unknown provider')
            }

            console.log(`✅ AI initialized with provider: ${provider}`)
            return true
        } catch (error) {
            console.error('Failed to initialize AI:', error)
            return false
        }
    }

    async initializeGemini(apiKey, explicitModel = null) {
        let validModel = explicitModel

        // If no explicit model override, check storage or auto-detect
        if (!validModel || validModel === 'auto') {
            const savedModel = localStorage.getItem('gemini_model')
            if (savedModel && savedModel !== 'auto') {
                validModel = savedModel
            } else {
                validModel = await this.findWorkingGeminiModel(this.genAI)
            }
        }

        console.log(`Using Gemini Model: ${validModel}`)
        this.client = this.genAI.getGenerativeModel({ model: validModel })
        this.visionClient = this.genAI.getGenerativeModel({ model: validModel })

        // Save for persistence (only if not 'auto')
        if (validModel) localStorage.setItem('gemini_model', validModel)
    }

    async findWorkingGeminiModel(genAI) {
        // Initial probe list (Priority: High Quota -> Low Quota)
        const candidates = [
            'gemini-2.5-flash',
            'gemini-2.5-flash-lite',
            'gemini-1.5-flash',
            'gemini-1.5-flash-8b',
            'gemini-1.5-pro',
            'gemini-2.0-flash-exp'
        ]

        const errors = []

        for (const modelName of candidates) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName })
                // Simple test generation
                await model.generateContent('Hi')
                console.log(`✅ Found working Gemini model: ${modelName}`)
                return modelName
            } catch (e) {
                console.warn(`Model ${modelName} failed: `, e.message)
                errors.push(`${modelName}: ${e.message.split('[')[0]}`)
                continue
            }
        }

        // If specific probe failed, default to 'gemini-1.5-flash' and let the retry logic handle it later
        console.warn('All probe models failed, defaulting to gemini-1.5-flash')
        return 'gemini-1.5-flash'
    }

    initializeGroq(apiKey, explicitModel = null) {
        let model = explicitModel || localStorage.getItem('groq_model') || 'llama-3.3-70b-versatile'
        if (model === 'auto') model = 'llama-3.3-70b-versatile'

        this.client = {
            apiKey,
            baseURL: 'https://api.groq.com/openai/v1',
            model: model
        }
        localStorage.setItem('groq_model', model)
    }

    initializeOpenRouter(apiKey) {
        this.client = {
            apiKey,
            baseURL: 'https://openrouter.ai/api/v1',
            // Use a list of reliable free models to try
            model: 'meta-llama/llama-3-8b-instruct:free'
        }
    }

    isInitialized() {
        return this.client !== null
    }

    // --- SMART RETRY HELPER ---
    async executeWithRetry(operationName, primaryClient, args) {
        // Try with the primary client first
        try {
            return await primaryClient.generateContent(args)
        } catch (error) {
            // Check for Quota Exceeded (429) ONLY
            if (error.message && error.message.includes('429')) {
                console.warn(`⚠️ 429 Quota Exceeded on primary model. Attempting fallbacks...`)

                // If we have a genAI instance (Gemini), try other models
                if (this.genAI) {
                    for (const modelName of this.fallbackModels) {
                        try {
                            console.log(`🔄 Retrying with fallback model: ${modelName}`)
                            const fallbackModel = this.genAI.getGenerativeModel({ model: modelName })
                            const result = await fallbackModel.generateContent(args)
                            console.log(`✅ Success with fallback: ${modelName}`)
                            return result // Return immediately on success
                        } catch (fallbackError) {
                            console.warn(`❌ Fallback ${modelName} failed: ${fallbackError.message}`)
                            // Continue to next model
                        }
                    }
                }
                throw new Error('⚠️ All AI models are busy (Quota Exceeded). Please try again in a minute.')
            }

            // Re-throw other errors (like 400 Bad Request, network error)
            throw error
        }
    }

    async chat(message, context = {}) {
        await this.initPromise

        if (!this.isInitialized()) {
            throw new Error('AI not initialized. Please add your API key in Settings.')
        }

        try {
            switch (this.provider) {
                case 'gemini':
                    return await this.chatGemini(message, context)
                case 'groq':
                case 'openrouter':
                    return await this.chatOpenAI(message, context)
                default:
                    throw new Error('Unknown provider')
            }
        } catch (error) {
            console.error('AI chat error:', error)
            throw new Error(`Chat failed: ${error.message || 'Unknown error'}`)
        }
    }

    async chatGemini(message, context) {
        let prompt = `You are a professional fashion stylist. Answer this question: ${message}. Keep your answer concise, under 3 sentences.`

        // Context Awareness (B-01 Fix)
        if (context && context.userProfile) {
            const { skinTone, bodyType } = context.userProfile
            // Safe check: handle both object (new) and string (legacy) formats
            if (skinTone) {
                const toneVal = typeof skinTone === 'object' ? `${skinTone.seasonalPalette} (${skinTone.undertone})` : skinTone
                prompt += `\n\nUser Context - Skin Tone: ${toneVal}`
            }
            if (bodyType) {
                const bodyVal = typeof bodyType === 'object' ? bodyType.bodyShape : bodyType
                prompt += `\nUser Context - Body Type: ${bodyVal}`
            }
        }

        // Use Smart Retry
        const result = await this.executeWithRetry('chat', this.client, prompt)
        const response = await result.response
        return response.text()
    }

    async chatOpenAI(message, context) {
        const headers = {
            'Authorization': `Bearer ${this.client.apiKey}`,
            'Content-Type': 'application/json'
        }

        if (this.provider === 'openrouter') {
            // OpenRouter requires these headers for rankings
            // Use origin instead of full href to avoid potential privacy blocking in Safari
            headers['HTTP-Referer'] = window.location.origin
            headers['X-Title'] = 'StyleLens'
        }

        // B-01 Fix: Add Timeout to prevent hanging (stay at 30s)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)

        // Add Context to System Prompt for standard LLMs
        let systemPrompt = 'You are a professional fashion stylist providing color and styling advice. Keep your answers concise, under 3 sentences.'
        if (context && context.userProfile) {
            const { skinTone, bodyType } = context.userProfile

            if (skinTone) {
                const toneVal = typeof skinTone === 'object' ? skinTone.seasonalPalette : skinTone
                systemPrompt += ` The user has a ${toneVal} skin palette.`
            }
            if (bodyType) {
                const bodyVal = typeof bodyType === 'object' ? bodyType.bodyShape : bodyType
                systemPrompt += ` The user has a ${bodyVal} body type.`
            }
        }

        try {
            const response = await fetch(`${this.client.baseURL}/chat/completions`, {
                method: 'POST',
                headers,
                // Remove 'credentials: omit' - let browser handle default (same-origin)
                // This is often safer for PWA/Mobile Safari quirks
                mode: 'cors',
                signal: controller.signal,
                body: JSON.stringify({
                    model: this.client.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: message }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            })
            clearTimeout(timeoutId)

            if (!response.ok) {
                const errorText = await response.text()
                let errorMessage = 'API request failed'
                try {
                    const error = JSON.parse(errorText)
                    errorMessage = error.error?.message || error.message || errorMessage
                } catch (e) { errorMessage = errorText || errorMessage }
                throw new Error(errorMessage)
            }

            const data = await response.json()
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid response from API')
            }
            return data.choices[0].message.content
        } catch (error) {
            clearTimeout(timeoutId)
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please check your internet connection.')
            }
            throw error
        }
    }

    async analyzeImage(imageDataUrl, prompt) {
        // Hybrid Mode Logic
        if (!this.visionClient) {
            console.log('Vision client not ready, attempting to initialize Gemini for vision...')
            const geminiKey = localStorage.getItem('gemini_api_key')

            if (geminiKey) {
                // Ensure we have the base genAI instance
                if (!this.genAI) this.genAI = new GoogleGenerativeAI(geminiKey)
                await this.initializeGemini(geminiKey)
            } else {
                throw new Error('Image analysis requires Google Gemini. Please add a Gemini API Key in Settings.')
            }
        }

        if (!this.visionClient) {
            throw new Error('Failed to initialize Gemini for vision tasks.')
        }

        try {
            const base64Data = imageDataUrl.split(',')[1]
            const mimeType = imageDataUrl.split(';')[0].split(':')[1]

            const imageParts = [
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                }
            ]

            // Use Smart Retry for Vision
            const result = await this.executeWithRetry('vision', this.visionClient, imageParts)

            const response = await result.response
            const text = response.text()

            // JSON Parsing Logic (Unchanged)
            let jsonText = text.trim()
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
            } else if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/```\n?/g, '')
            }

            let parsedResult = {}
            try {
                parsedResult = JSON.parse(jsonText)
            } catch (e) {
                console.warn('Failed to parse JSON directly, attempting relaxed parsing', e)
                parsedResult = {
                    dominantColor: '#000000',
                    colorName: 'Unknown',
                    garmentType: 'Unknown',
                    styleNotes: 'Could not analyze details.',
                    harmonies: []
                }
            }

            if (!parsedResult.harmonies || !Array.isArray(parsedResult.harmonies)) {
                parsedResult.harmonies = []
            }

            return parsedResult
        } catch (error) {
            console.error('Image analysis error:', error)

            // If Smart Retry failed effectively (all models exhausted)
            if (error.message?.includes('429') || error.message?.includes('Quota')) {
                throw new Error('⚠️ API busy. Using color math fallback...')
            }

            throw new Error(`Failed to analyze image: ${error.message}`)
        }
    }

    // Algorithmic Fallback (Unchanged)
    calculateHarmonies(hexColor) {
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
        }
        const rgbToHsl = (r, g, b) => {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            if (max === min) h = s = 0;
            else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return [h, s, l];
        }
        const hslToHex = (h, s, l) => {
            let r, g, b;
            if (s === 0) r = g = b = l;
            else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                }
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            const toHex = x => {
                const hex = Math.round(x * 255).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            };
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }
        const [h, s, l] = rgbToHsl(hexToRgb(hexColor).r, hexToRgb(hexColor).g, hexToRgb(hexColor).b);
        const shift = (deg) => hslToHex((h + deg / 360) % 1, s, l);

        // Monochromatic: Same Hue, different lightness
        const mono = (lShift) => hslToHex(h, s, Math.max(0, Math.min(1, l + lShift)));

        return [
            { type: "Monochromatic (Subtle)", colors: [mono(0.2), mono(-0.2), mono(0.4)] },
            { type: "Analogous (Harmonious)", colors: [shift(30), shift(60), shift(-30)] },
            { type: "Complementary (Bold)", colors: [shift(180), mono(0.3)] },
            { type: "Split Complementary", colors: [shift(150), shift(210)] },
            { type: "Triadic (Vibrant)", colors: [shift(120), shift(240)] }
        ];
    }

    async analyzeGarmentColor(imageDataUrl, targetedColor = null) {
        // E-01 Speed Optimization:
        // We prioritize Math (instant) over Vision AI (slow).

        let dominantColor = targetedColor || '#000000'

        // 1. Calculate Harmonies Instantly (Client-Side Math)
        const harmonies = this.calculateHarmonies(dominantColor)

        // 2. Prepare result structure
        const result = {
            dominantColor: dominantColor,
            colorName: "Analyzing...", // Placeholder
            garmentType: "Clothing Item", // Generic since we skip Vision
            styleNotes: "Loading style advice...",
            harmonies: harmonies,
            pattern: "Solid" // Default
        }

        // 3. fetch Text Description asynchronously (E-02 Hybrid)
        // We use 'chat' (Text LLM) instead of 'vision' because it's 10x faster.
        const prompt = `I am styling a piece of clothing with this exact HEX color: ${dominantColor}.
        Please provide a response in valid JSON format with these fields:
        {
            "colorName": "Creative name for this color",
            "styleNotes": "One brief, fashion-forward sentence on how to style this color."
        }
        Do not include markdown formatting, just the raw JSON.`

        try {
            // We use 'executeWithRetry' implicitly via chat() but we need raw JSON.
            // Let's call chat() and parse.
            const textResponse = await this.chat(prompt)

            // Clean and parse (Robust Mode)
            // Extract the first JSON object found in the text, ignoring conversational wrappers
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/)
            const jsonStr = jsonMatch ? jsonMatch[0] : textResponse

            const aiData = JSON.parse(jsonStr)

            if (aiData.colorName) result.colorName = aiData.colorName
            if (aiData.styleNotes) result.styleNotes = aiData.styleNotes

        } catch (error) {
            console.warn('Text description failed, returning math-only result:', error)
            // Fallback is expected if API fails, but we want to minimize parsing errors
            result.styleNotes = "Matches generated based on color theory."
            result.colorName = "Custom Color" // keep hex
        }

        return result
    }

    async analyzeSkinTone(imageDataUrl) {
        const prompt = `Analyze this person's skin tone for personal color analysis in JSON format:
{
  "undertone": "warm/cool/neutral",
  "seasonalPalette": "Spring/Summer/Autumn/Winter",
  "bestColors": ["color1", "color2", "color3", "color4", "color5"],
  "avoidColors": ["color1", "color2", "color3"],
  "description": "brief description",
  "recommendations": "styling tips"
}`
        return await this.analyzeImage(imageDataUrl, prompt)
    }

    async analyzeBodyType(imageDataUrl) {
        const prompt = `Analyze body shape for clothing recommendations in JSON format:
{
  "bodyShape": "hourglass/rectangle/triangle/inverted triangle/oval",
  "fitGuidelines": ["guideline1", "guideline2", "guideline3"],
  "emphasize": ["feature to emphasize"],
  "balance": ["styling tips"],
  "bestSilhouettes": ["silhouette1", "silhouette2", "silhouette3"]
}`
        return await this.analyzeImage(imageDataUrl, prompt)
    }

    async classifyGarment(imageDataUrl) {
        const prompt = `Classify this clothing item in JSON format:
{
  "type": "shirt/pants/dress/jacket/etc",
  "color": "primary color name",
  "pattern": "solid/striped/floral/plaid/etc",
  "fabric": "cotton/denim/silk/wool/etc",
  "style": "casual/formal/athletic/etc",
  "season": "spring/summer/fall/winter/all-season",
  "occasion": ["casual", "work", "formal"],
  "tags": ["tag1", "tag2", "tag3"]
}`
        return await this.analyzeImage(imageDataUrl, prompt)
    }

    async generateOutfit(wardrobeItems, occasion) {
        // Validation
        if (!wardrobeItems || wardrobeItems.length === 0) {
            throw new Error("Wardrobe is empty. Please add items via the Camera first.")
        }

        // Prepare inventory list for AI (minified to save tokens)
        const inventory = wardrobeItems.map(item => ({
            id: item.id,
            type: item.type,
            color: item.color,
            pattern: item.pattern,
            style: item.style
        }))

        const prompt = `I need an outfit for this occasion: "${occasion}".
        Here is my available wardrobe inventory:
        ${JSON.stringify(inventory)}

        Please select the best combination (Top + Bottom + Shoes/Accessory) or (Dress + Shoes/Accessory).
        Return valid JSON only:
        {
            "outfitName": "Creative name for this look",
            "reasoning": "Why this works for the occasion?",
            "selectedItemIds": [123, 456, 789]
        }`

        try {
            // Use existing chat infrastructure with robust parsing
            const textResponse = await this.chat(prompt)

            const jsonMatch = textResponse.match(/\{[\s\S]*\}/)
            const jsonStr = jsonMatch ? jsonMatch[0] : textResponse
            return JSON.parse(jsonStr)

        } catch (error) {
            console.error("Outfit generation failed:", error)
            // Fallback: Pick 3 random items if AI fails just to show something
            const shuffled = [...wardrobeItems].sort(() => 0.5 - Math.random())
            return {
                outfitName: "Random Shuffle",
                reasoning: "AI was busy, so here is a random mix!",
                selectedItemIds: shuffled.slice(0, 3).map(i => i.id)
            }
        }
    }
}

export default new AIService()
