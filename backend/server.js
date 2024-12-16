const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 5001;
require('dotenv').config();

app.use(cors()); // Allow requests from frontend

// Endpoint to fetch weather data for a given city
app.get('/weather', async (req, res) => {
  const city = req.query.city; // Get city from query string
  
  if (!city) {
    return res.status(400).json({ error: 'City name is required' });
  }

  const apiKey = process.env.apiKey; // Replace with your OpenWeatherMap API key
  console.log("API",apiKey)
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

  try {
    // Fetch weather data from OpenWeatherMap API
    const response = await axios.get(url);
    const weatherData = response.data;

    // Extract necessary data from the response
    const data = {
      temperature: weatherData.main.temp - 273.15, // Convert from Kelvin to Celsius
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed,
      description: weatherData.weather[0].description,
      mainCondition: weatherData.weather[0].main,
      city: weatherData.name,
      country: weatherData.sys.country,
      visibility: weatherData.visibility / 1000, // Convert from meters to kilometers
      coord: weatherData.coord,
      date: weatherData.dt,
    };

    // Send the simplified weather data back to the frontend
    res.json(data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Error fetching weather data' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
