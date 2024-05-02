// Adding event listener for clicking the search icon
document.getElementById('searchIcon').addEventListener('click', function() {
  const cityName = document.getElementById('cityInput').value;
  if (cityName) {
    searchCity(cityName);
    document.getElementById('cityInput').value = ''; // Clear the input after the search
  }
});

// Handling the "Enter" keypress within the input field
document.getElementById('cityInput').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    const cityName = event.target.value;
    if (cityName) {
      searchCity(cityName);
      event.target.value = ''; // Clear the input after the search
    }
  }
});

// Function to handle city search
async function searchCity(cityName) {
  const apiKey = '4550b4837d28d38686e63a868e91a431'; // Use your valid API key
  const coordinates = await getCoordinates(cityName, apiKey);
  if (!coordinates) {
    console.error('Coordinates not found for', cityName);
    return;
  }
  const weatherData = await getWeatherData(coordinates.lat, coordinates.lon, apiKey);
  updateUI(weatherData);
  saveSearchHistory(cityName);
  showSearchHistory();
}

// Function to fetch coordinates
async function getCoordinates(cityName, apiKey) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!data || data.length === 0) {
    console.error('No coordinates found for city:', cityName);
    return null; // Return null to handle this case gracefully
  }
  return { lat: data[0].lat, lon: data[0].lon };
}

// Function to fetch weather data
async function getWeatherData(lat, lon, apiKey) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const response = await fetch(url);
  return response.json();
}

// Function to update the UI with fetched data
function updateUI(data) {
  const currentWeatherDiv = document.getElementById('currentWeather');
  const forecastDiv = document.getElementById('forecast');
  currentWeatherDiv.innerHTML = '';
  forecastDiv.innerHTML = '';
  if (data.list && data.list.length > 0) {
    const { main, weather, wind } = data.list[0];
    currentWeatherDiv.innerHTML = `
        <h2>Current Weather</h2>
        <p>Temperature: ${main.temp}°C</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Wind Speed: ${wind.speed} km/h</p>
        <img src="https://openweathermap.org/img/wn/${weather[0].icon}.png" alt="Weather icon">
    `;
    forecastDiv.innerHTML = '<h2>5-Day Forecast</h2>';
    for (let i = 0; i < data.list.length; i += 8) {
      const forecast = data.list[i];
      forecastDiv.innerHTML += `
          <div>
              <p>Date: ${new Date(forecast.dt_txt).toDateString()}</p>
              <p>Temp: ${forecast.main.temp}°C</p>
              <p>Wind: ${forecast.wind.speed} km/h</p>
              <p>Humidity: ${forecast.main.humidity}%</p>
              <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="Weather icon">
          </div>
      `;
    }
  }
}

// Function to save the search history in localStorage
function saveSearchHistory(cityName) {
  let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
  if (!history.includes(cityName)) {
    history.push(cityName);
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }
}

// Function to display the search history
function showSearchHistory() {
  const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
  const historyDiv = document.getElementById('searchHistory');
  historyDiv.innerHTML = '';
  history.forEach(city => {
    historyDiv.innerHTML += `<p onclick="searchCity('${city}')">${city}</p>`;
  });
}
