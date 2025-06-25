const apiKey = "9cb0f65dea4bda3a822d6076f787c2cd"; // Replace with your OpenWeatherMap API key

document.getElementById("searchBtn").addEventListener("click", getWeather);
document.getElementById("geoBtn").addEventListener("click", getWeatherByLocation);
document.getElementById("cityInput").addEventListener("keydown", e => {
  if (e.key === "Enter") getWeather();
});
document.getElementById("darkModeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

function showLoader(show) {
  document.getElementById("loader").classList.toggle("hidden", !show);
}

function showError(message) {
  const errorBox = document.getElementById("errorBox");
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function clearError() {
  document.getElementById("errorBox").classList.add("hidden");
}

function displayWeather(data) {
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  document.getElementById("cityName").textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById("description").textContent = data.weather[0].description;
  document.getElementById("temp").textContent = data.main.temp;
  document.getElementById("feels").textContent = data.main.feels_like;
  document.getElementById("humidity").textContent = data.main.humidity;
  document.getElementById("wind").textContent = (data.wind.speed * 3.6).toFixed(1);

  const iconImg = document.getElementById("weatherIcon");
  iconImg.src = iconUrl;
  iconImg.alt = data.weather[0].description;
  iconImg.classList.remove("hidden");

  document.getElementById("weatherResult").classList.remove("hidden");
}

function displayForecast(data) {
  const cardsContainer = document.getElementById("forecastCards");
  cardsContainer.innerHTML = "";

  const days = {};

  data.list.forEach(entry => {
    const date = new Date(entry.dt_txt);
    const day = date.toDateString();

    if (!days[day] && Object.keys(days).length < 3) {
      days[day] = entry;
    }
  });

  Object.values(days).forEach(entry => {
    const card = document.createElement("div");
    card.className = "forecast-card";

    const icon = entry.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;
    const temp = entry.main.temp;

    card.innerHTML = `
      <p><strong>${new Date(entry.dt_txt).toLocaleDateString('en-US', { weekday: 'short' })}</strong></p>
      <img src="${iconUrl}" alt="icon" width="48" />
      <p>${temp}°C</p>
    `;
    cardsContainer.appendChild(card);
  });

  document.getElementById("forecast").classList.remove("hidden");
}

function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return showError("Please enter a city name.");

  clearError();
  showLoader(true);

  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  Promise.all([
    fetch(currentUrl).then(r => r.json()),
    fetch(forecastUrl).then(r => r.json())
  ])
    .then(([currentData, forecastData]) => {
      showLoader(false);
      if (currentData.cod !== 200) throw new Error(currentData.message);
      displayWeather(currentData);
      displayForecast(forecastData);
    })
    .catch(err => {
      showLoader(false);
      showError(err.message);
    });
}

function getWeatherByLocation() {
  if (!navigator.geolocation) return showError("Geolocation is not supported.");

  clearError();
  showLoader(true);

  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;

    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    Promise.all([
      fetch(currentUrl).then(r => r.json()),
      fetch(forecastUrl).then(r => r.json())
    ])
      .then(([currentData, forecastData]) => {
        showLoader(false);
        if (currentData.cod !== 200) throw new Error(currentData.message);
        displayWeather(currentData);
        displayForecast(forecastData);
      })
      .catch(err => {
        showLoader(false);
        showError("Unable to fetch location weather.");
      });
  }, () => {
    showLoader(false);
    showError("Permission denied for location.");
  });
}
