// Mock color analysis data for demo mode

// Mock color analysis data for demo mode

const mockColorAnalysis = {
    blue: {
        dominantColor: "#1e40af",
        colorName: "Royal Blue",
        undertone: "cool",
        harmonies: {
            complementary: ["#f59e0b", "#fbbf24", "#fcd34d"],
            analogous: ["#3b82f6", "#6366f1", "#8b5cf6"],
            triadic: ["#ef4444", "#10b981", "#1e40af"]
        },
        garmentType: "shirt",
        pattern: "solid",
        styleNotes: "Perfect for professional settings. Pair with neutral grays or warm browns."
    },
    white: {
        dominantColor: "#ffffff",
        colorName: "Pure White",
        undertone: "neutral",
        harmonies: {
            complementary: ["#1e293b", "#334155", "#475569"],
            analogous: ["#f8fafc", "#f1f5f9", "#e2e8f0"],
            triadic: ["#dc2626", "#2563eb", "#16a34a"]
        },
        garmentType: "shirt",
        pattern: "solid",
        styleNotes: "Versatile classic. Works with any color."
    },
    black: {
        dominantColor: "#000000",
        colorName: "Jet Black",
        undertone: "neutral",
        harmonies: {
            complementary: ["#ffffff", "#f5f5f5", "#e5e5e5"],
            analogous: ["#1a1a1a", "#333333", "#4d4d4d"],
            triadic: ["#dc2626", "#3b82f6", "#10b981"]
        },
        garmentType: "dress",
        pattern: "solid",
        styleNotes: "Timeless elegance. Pairs beautifully with metallics."
    },
    red: {
        dominantColor: "#dc2626",
        colorName: "Crimson Red",
        undertone: "warm",
        harmonies: {
            complementary: ["#16a34a", "#22c55e", "#4ade80"],
            analogous: ["#ea580c", "#f97316", "#fb923c"],
            triadic: ["#2563eb", "#eab308", "#dc2626"]
        },
        garmentType: "blouse",
        pattern: "solid",
        styleNotes: "Bold and confident. Balance with neutral bottoms."
    },
    navy: {
        dominantColor: "#1e3a8a",
        colorName: "Navy Blue",
        undertone: "cool",
        harmonies: {
            complementary: ["#ea580c", "#f97316", "#fb923c"],
            analogous: ["#1e40af", "#3b82f6", "#60a5fa"],
            triadic: ["#7c2d12", "#15803d", "#1e3a8a"]
        },
        garmentType: "blazer",
        pattern: "solid",
        styleNotes: "Professional and versatile. Excellent alternative to black."
    },
    brown: {
        dominantColor: "#8b4513",
        colorName: "Saddle Brown",
        undertone: "warm",
        harmonies: {
            complementary: ["#0ea5e9", "#38bdf8", "#7dd3fc"],
            analogous: ["#b45309", "#d97706", "#f59e0b"],
            triadic: ["#15803d", "#4b5563", "#8b4513"]
        },
        garmentType: "jacket",
        pattern: "solid",
        styleNotes: "Rich and earthy. Great for casual or smart-casual looks."
    },
    taupe: {
        dominantColor: "#8f6952",
        colorName: "Taupe",
        undertone: "neutral",
        harmonies: {
            complementary: ["#52788f", "#94a3b8", "#cbd5e1"],
            analogous: ["#8f5252", "#8f6952", "#8f8052"],
            triadic: ["#528f52", "#52528f", "#8f6952"]
        },
        garmentType: "knitwear",
        pattern: "solid",
        styleNotes: "Sophisticated neutral. Pairs well with soft pastels or deep jewel tones."
    },
    tan: {
        dominantColor: "#d2b48c",
        colorName: "Tan",
        undertone: "warm",
        harmonies: {
            complementary: ["#64748b", "#94a3b8", "#cbd5e1"],
            analogous: ["#f59e0b", "#d97706", "#b45309"],
            triadic: ["#0f766e", "#4338ca", "#d2b48c"]
        },
        garmentType: "trousers",
        pattern: "solid",
        styleNotes: "Classic neutral. Essential for a versatile wardrobe."
    },
    cream: {
        dominantColor: "#fffdd0",
        colorName: "Cream",
        undertone: "warm",
        harmonies: {
            complementary: ["#334155", "#475569", "#64748b"],
            analogous: ["#fef3c7", "#fff7ed", "#fffdd0"],
            triadic: ["#991b1b", "#166534", "#1e3a8a"]
        },
        garmentType: "blouse",
        pattern: "solid",
        styleNotes: "Softer than pure white. Adds warmth and elegance."
    },
    green: {
        dominantColor: "#15803d",
        colorName: "Forest Green",
        undertone: "warm",
        harmonies: {
            complementary: ["#dc2626", "#ef4444", "#f87171"],
            analogous: ["#166534", "#15803d", "#16a34a"],
            triadic: ["#7e22ce", "#c2410c", "#15803d"]
        },
        garmentType: "sweater",
        pattern: "solid",
        styleNotes: "Natural and calming. Looks great with denim or khaki."
    },
    olive: {
        dominantColor: "#556b2f",
        colorName: "Olive Green",
        undertone: "warm",
        harmonies: {
            complementary: ["#800020", "#991b1b", "#b91c1c"],
            analogous: ["#36454f", "#556b2f", "#808000"],
            triadic: ["#000080", "#800080", "#556b2f"]
        },
        garmentType: "utility jacket",
        pattern: "solid",
        styleNotes: "Versatile earth tone. Works as a neutral in many outfits."
    },
    pink: {
        dominantColor: "#ec4899",
        colorName: "Hot Pink",
        undertone: "cool",
        harmonies: {
            complementary: ["#22c55e", "#4ade80", "#86efac"],
            analogous: ["#db2777", "#ec4899", "#f472b6"],
            triadic: ["#eab308", "#3b82f6", "#ec4899"]
        },
        garmentType: "top",
        pattern: "solid",
        styleNotes: "Fun and vibrant. Let it be the statement piece."
    },
    burgundy: {
        dominantColor: "#800020",
        colorName: "Burgundy",
        undertone: "cool",
        harmonies: {
            complementary: ["#006400", "#008000", "#228b22"],
            analogous: ["#800080", "#800020", "#A52A2A"],
            triadic: ["#000080", "#FFD700", "#800020"]
        },
        garmentType: "dress",
        pattern: "solid",
        styleNotes: "Deep and rich. Perfect for autumn and winter."
    },
    purple: {
        dominantColor: "#7e22ce",
        colorName: "Royal Purple",
        undertone: "cool",
        harmonies: {
            complementary: ["#eab308", "#facc15", "#fde047"],
            analogous: ["#6b21a8", "#7e22ce", "#9333ea"],
            triadic: ["#ea580c", "#15803d", "#7e22ce"]
        },
        garmentType: "dress",
        pattern: "solid",
        styleNotes: "Luxurious and creative. Pairs well with gold or silver."
    },
    grey: {
        dominantColor: "#9ca3af",
        colorName: "Light Grey",
        undertone: "neutral",
        harmonies: {
            complementary: ["#f1f5f9", "#e2e8f0", "#cbd5e1"],
            analogous: ["#6b7280", "#9ca3af", "#d1d5db"],
            triadic: ["#000000", "#ffffff", "#9ca3af"]
        },
        garmentType: "t-shirt",
        pattern: "solid",
        styleNotes: "Soft and airy. A great alternative to white."
    },
    charcoal: {
        dominantColor: "#374151",
        colorName: "Charcoal Grey",
        undertone: "neutral",
        harmonies: {
            complementary: ["#e5e7eb", "#f3f4f6", "#f9fafb"],
            analogous: ["#1f2937", "#374151", "#4b5563"],
            triadic: ["#ef4444", "#3b82f6", "#10b981"]
        },
        garmentType: "suit",
        pattern: "solid",
        styleNotes: "Formal and sharp. Less harsh than pure black."
    },
    teal: {
        dominantColor: "#0d9488",
        colorName: "Teal",
        undertone: "cool",
        harmonies: {
            complementary: ["#be123c", "#e11d48", "#f43f5e"],
            analogous: ["#0f766e", "#0d9488", "#14b8a6"],
            triadic: ["#7c3aed", "#d97706", "#0d9488"]
        },
        garmentType: "blouse",
        pattern: "solid",
        styleNotes: "Rich and sophisticated. Universally flattering."
    }
}

// Function to calculate color distance
function getColorDistance(hex1, hex2) {
    const r1 = parseInt(hex1.substring(1, 3), 16)
    const g1 = parseInt(hex1.substring(3, 5), 16)
    const b1 = parseInt(hex1.substring(5, 7), 16)

    const r2 = parseInt(hex2.substring(1, 3), 16)
    const g2 = parseInt(hex2.substring(3, 5), 16)
    const b2 = parseInt(hex2.substring(5, 7), 16)

    return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2))
}

// Function to find closest mock color
function findClosestColorProfile(targetHex) {
    let minDistance = Infinity
    let closestProfile = mockColorAnalysis.blue // default

    Object.values(mockColorAnalysis).forEach(profile => {
        const distance = getColorDistance(targetHex, profile.dominantColor)
        if (distance < minDistance) {
            minDistance = distance
            closestProfile = profile
        }
    })

    return closestProfile
}

// Function to get mock analysis based on image/color
export function getMockColorAnalysis(input) {
    // Check if input is a hex code (simple check)
    if (typeof input === 'string' && input.startsWith('#')) {
        return findClosestColorProfile(input)
    }

    // Fallback for image data URL or other input: random is better than crashing, 
    // but typically we should receive a hex now.
    // If it's a long string (data URL), we can't easily extract dominant color without canvas,
    // so we'll just pick a random one for "simulated" auto-analysis if needed.
    const colors = Object.keys(mockColorAnalysis)
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    return mockColorAnalysis[randomColor]
}

export function getMockSkinToneAnalysis() {
    return mockSkinToneAnalysis
}

export function getMockBodyTypeAnalysis() {
    return mockBodyTypeAnalysis
}

export function getMockChatResponse(message) {
    const responses = [
        "Navy blue pairs beautifully with white, camel, burgundy, and gold accents. For a modern look, try it with blush pink or mustard yellow!",
        "Great question! For that color, I'd recommend pairing it with neutral tones like beige, gray, or white for a classic look, or go bold with complementary colors!",
        "Based on your color profile, earth tones and warm hues would look stunning on you. Think rust, olive, terracotta, and golden yellows.",
        "That's a versatile piece! You can dress it up with a blazer and heels, or keep it casual with white sneakers and a denim jacket.",
        "For a cohesive wardrobe, focus on building a capsule with 2-3 neutral colors and add pops of your seasonal palette colors as accents."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
}

export default {
    getMockColorAnalysis,
    getMockSkinToneAnalysis,
    getMockBodyTypeAnalysis,
    getMockChatResponse
}
