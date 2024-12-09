// DOM Elements
const searchBtn = document.querySelector(".searchBtn");
const weatherContainer = document.querySelector(".weatherContainer");
const temperature = document.querySelector(".temp");
const humidity = document.querySelector(".humidity");
const wind = document.querySelector(".wind");
const uvi = document.querySelector(".uvi");
const imageDaily = document.querySelector(".imageD");
const searchList = document.querySelector(".searchList");
const forecastSection = document.querySelector(".forecast");
const currentDaySection = document.getElementById("current-day");
const forecastCard = document.querySelector(".forecastCard");


// Local Storage for Search History
let storage = JSON.parse(localStorage.getItem("searchList")) || [];

// Function to update the current weather details
function updateCurrentWeather(data) {
  // Extract the required details
  const { temp, humidity: hum } = data.main;
  const { speed: windSpeed } = data.wind;
  const icon = data.weather[0].icon;
  const iconUrl = "http://openweathermap.org/img/w/"+ icon +".png";
  const cityName = data.name;
  const date = moment(data.dt * 1000).format("DD MMM YYYY");

  // Update the weather container
  weatherContainer.innerHTML = `
    <h2 class="text-2xl font-bold bg-[#da78e7] text-white-600 shadow-lg rounded-lg p-6 text-center mx-4 ">${cityName} - ${date}</h2>
  `;
  temperature.innerHTML = `Temperature: ${temp} °C`;
  humidity.innerHTML = `Humidity: ${hum} %`;
  wind.innerHTML = `Wind: ${windSpeed} km/h`;

  // Add the weather icon
  imageDaily.innerHTML = `<img src="${iconUrl}" alt="Weather Icon" class="mx-auto my-2">`;

  // Save to search history
  saveToHistory(cityName);
}

// Function to fetch UV index and display it
function fetchUvData(lat, lon) {
  const uvApiUrl = `http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=95692f2c0e1a1b5e25327de5d590734c`;
  fetch(uvApiUrl)
    .then((response) => response.json())
    .then((data) => {
      const uvIndex = data.current.uvi;
      let uvClass = "btn btn-success"; // Default to low risk
      console.log(uvClass)

      // Change UV Index class based on risk level
      if (uvIndex > 5) {
        uvClass = "btn btn-danger";
      } else if (uvIndex > 2) {
        uvClass = "btn btn-warning";
      }

  
    });
}

// Function to display the current day's weather
function displayCurrentDay(data) {
    // Get the first weather data for the current day
    const todayData = data.list[0];
    const todayDate = moment(todayData.dt * 1000).format("dddd, DD MMM YYYY");
    const { temp, humidity: hum } = todayData.main;
    const { speed: windSpeed } = todayData.wind;
    const icon = todayData.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/w/${icon}.png`;

  
    // Update the HTML for the current day
    currentDaySection.innerHTML = `
      
      <div class="text-white-600 shadow-lg rounded-lg p-6 text-center w-64">
      <h2 class="font-bold text-xl mb-2">Today's Weather</h2>
      <p class="font-bold text-white-600">${todayDate}</p>
      <img src="${iconUrl}" alt="Current Weather Icon" class="w-16 h-16 mx-auto my-4">
      <h3 class="text-4xl font-bold text-gray-800" >Temp: ${temp} °C</h3>
      <p>Humidity: ${hum} %</p>
      <p>Wind: ${windSpeed} km/h</p>
    `;
  }


// Function to display the 5-day forecast
function updateForecast(data) {
  forecastSection.innerHTML = ""; // Clear previous forecast

  // Loop through forecast data
  for (let i = 8; i < data.list.length; i += 9) {
    const dayData = data.list[i];
    const date = moment(dayData.dt * 1000).format("DD MMM YYYY");
    const { temp, humidity: hum } = dayData.main;
    const { speed: windSpeed } = dayData.wind;
    const icon = dayData.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/w/${icon}.png`;

    // Create a card for each forecast day
    const forecastCard = document.createElement("div");
    forecastCard.classList = " flex flex-col  bg-white shadow-lg rounded-lg  text-center w- ";

    forecastCard.innerHTML = `
      <p class="font-bold">${date}</p>
      <img src="${iconUrl}" alt="Forecast Icon" class="mx-auto my-2">
      <p>Temp: ${temp} °C</p>
      <p>Humidity: ${hum} %</p>
      <p>Wind: ${windSpeed} km/h</p>
    `;

    forecastSection.appendChild(forecastCard);
  }
}

// Function to fetch weather data
function fetchWeatherData() {
  const searchTerm = document.querySelector("#searchTerm").value;

  if (!searchTerm) {
    alert("Please enter a city or ZIP code.");
    return;
  }

  const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + searchTerm + "&appid=95692f2c0e1a1b5e25327de5d590734c&units=metric";
  const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${searchTerm}&appid=dd622459b78841be1f2f087475975477&units=metric`
  ;

  // Fetch current weather data
  fetch(weatherApiUrl)
    .then((response) => response.json())
    .then((data) => {
      updateCurrentWeather(data);

      // Fetch UV index data
      const { lat, lon } = data.coord;
      fetchUvData(lat, lon);
    })
    .catch((err) => {
      console.error("Error fetching weather data:", err);
      alert("Unable to fetch weather data. Please try again.");
    });

  // Fetch 5-day forecast data
  fetch(forecastApiUrl)
    .then((response) => response.json())
    .then((data) => {
        displayCurrentDay(data);
        updateForecast(data);
    })
    .catch((err) => {
      console.error("Error fetching forecast data:", err);
      alert("Unable to fetch forecast data. Please try again.");
    });
}

// Function to save search to local storage and update the history
function saveToHistory(cityName) {
  if (!storage.includes(cityName)) {
    storage.push(cityName);
    if (storage.length > 2) {
      storage.shift(); // Keep only the last 10 searches
    }
    localStorage.setItem("searchList", JSON.stringify(storage));
    updateSearchHistory();
  }
}

// Function to update the search history UI
function updateSearchHistory() {
  searchList.innerHTML = ""; // Clear previous history

  storage.forEach((city) => {
    const historyBtn = document.createElement("button");
    historyBtn.classList = "btn btn-secondary btn-sm";
    historyBtn.textContent = city;
    historyBtn.addEventListener("click", () => {
      document.querySelector("#searchTerm").value = city;
      fetchWeatherData();
    });

    searchList.appendChild(historyBtn);
  });
}

// Event Listeners
searchBtn.addEventListener("click", fetchWeatherData);

// Initialize search history on page load
updateSearchHistory();
