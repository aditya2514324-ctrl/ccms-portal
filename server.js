require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, '.')));

app.get('/api/weather', async (req, res) => {
    try {
        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey) {
            return res.status(400).json({ error: "Missing WEATHER_API_KEY in .env" });
        }
        
        // Fetch real weather data for a rural Indian location (using Jaipur as an example)
        // You can use geolocation from the frontend to make this dynamic later
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Jaipur,IN&units=metric&appid=${apiKey}`);
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "Failed to fetch from OpenWeatherMap");
        }

        const data = await response.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = 3005;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
