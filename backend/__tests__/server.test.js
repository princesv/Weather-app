const request = require('supertest');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const app = require('../src/app'); // Adjust the path to your app file

describe('GET /weather', () => {
  const mock = new MockAdapter(axios);
  const apiKey = 'test-api-key'; // Replace with your test API key
  const city = 'London';
  const mockWeatherData = {
    main: {
      temp: 280.32, // Kelvin
      humidity: 81,
    },
    weather: [
      {
        description: 'light rain',
        main: 'Rain',
      },
    ],
    wind: {
      speed: 4.1,
    },
    sys: {
      country: 'GB',
    },
    visibility: 10000, // Meters
    coord: {
      lon: -0.1257,
      lat: 51.5085,
    },
    dt: 1672531200,
    name: city,
  };

  beforeAll(() => {
    process.env.apiKey = apiKey;
  });

  afterEach(() => {
    mock.reset();
  });

  it('should return weather data for a valid city', async () => {
    // Mock the API response
    mock
      .onGet(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
      .reply(200, mockWeatherData);

    const response = await request(app).get(`/weather?city=${city}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      temperature: 7.17, // Converted to Celsius
      humidity: 81,
      windSpeed: 4.1,
      description: 'light rain',
      mainCondition: 'Rain',
      city: 'London',
      country: 'GB',
      visibility: 10, // Converted to kilometers
      coord: { lon: -0.1257, lat: 51.5085 },
      date: 1672531200,
    });
  });

  it('should return an error if the city is not provided', async () => {
    const response = await request(app).get('/weather');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'City name is required' });
  });

  it('should return an error if the API call fails', async () => {
    // Mock a failed API response
    mock
      .onGet(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
      .reply(500);

    const response = await request(app).get(`/weather?city=${city}`);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error fetching weather data' });
  });
});
