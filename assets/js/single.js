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
function searchCity(cityName) {
  const apiKey = '4550b4837d28d38686e63a868e91a431';
  getCoordinates(cityName, apiKey).then(coordinates => {
      if (coordinates) {
          getWeatherData(coordinates.lat, coordinates.lon, apiKey).then(weatherData => {
              updateUI(weatherData);
              saveSearchHistory(cityName);
              showSearchHistory();
          }).catch(error => {
              console.error('Failed to fetch weather data:', error);
          });
      }
  }).catch(error => {
      console.error('Coordinates not found for', cityName, error);
  });
}

// Function to fetch coordinates
function getCoordinates(cityName, apiKey) {
  return new Promise((resolve, reject) => {
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
      fetch(url).then(response => response.json()).then(data => {
          if (data && data.length > 0) {
              resolve({ lat: data[0].lat, lon: data[0].lon });
          } else {
              reject('No coordinates found');
          }
      }).catch(error => {
          reject(error);
      });
  });
}

// Function to fetch weather data
function getWeatherData(lat, lon, apiKey) {
  return new Promise((resolve, reject) => {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      fetch(url).then(response => response.json()).then(data => {
          resolve(data);
      }).catch(error => {
          reject(error);
      });
  });
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
      data.list.forEach((forecast, index) => {
          if (index % 8 === 0) { // Assuming data for every 3 hours, select one per day
              forecastDiv.innerHTML += `
                  <div>
                      <p>${new Date(forecast.dt_txt).toDateString()}</p>
                      <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="Weather icon">
                      <p>Temp: ${forecast.main.temp}°C</p>
                      <p>Wind: ${forecast.wind.speed} km/h</p>
                      <p>Humidity: ${forecast.main.humidity}%</p>
                  </div>
              `;
          }
      });
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
      const historyItem = document.createElement('p');
      historyItem.textContent = city;
      historyItem.onclick = function() { searchCity(city); };
      historyDiv.appendChild(historyItem);
  });
}
