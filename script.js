// =====================================
// SKYCAST WEATHER APP
// WeatherAPI.com Integration
// =====================================

// Your WeatherAPI key
const API_KEY = "08a2aca844e54d17a19201207262310";

const API_URL = "https://api.weatherapi.com/v1/current.json";

// HTML elements
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const message = document.getElementById("message");

const cityName = document.getElementById("cityName");
const locationDetails = document.getElementById("locationDetails");
const localTime = document.getElementById("localTime");

const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const feelsLike = document.getElementById("feelsLike");
const weatherIcon = document.getElementById("weatherIcon");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const uvIndex = document.getElementById("uvIndex");
const visibility = document.getElementById("visibility");

const aqiBadge = document.getElementById("aqiBadge");
const aqiDescription = document.getElementById("aqiDescription");

const pm25 = document.getElementById("pm25");
const pm10 = document.getElementById("pm10");
const ozone = document.getElementById("ozone");
const carbonMonoxide = document.getElementById("carbonMonoxide");


// =====================================
// FETCH WEATHER DATA
// =====================================

async function getWeather(city) {
    const requestedCity = city.trim();

    if (!requestedCity) {
        showMessage("Please enter a city name.");
        return;
    }

    searchButton.disabled = true;
    searchButton.textContent = "Loading...";
    message.textContent = "";

    try {
        const params = new URLSearchParams({
            key: API_KEY,
            q: requestedCity,
            aqi: "yes"
        });

        const response = await fetch(`${API_URL}?${params}`);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error?.message || "Unable to retrieve weather data."
            );
        }

        displayWeather(data);

        // Update the search box to match the result
        cityInput.value = data.location.name;

        message.textContent = "";

    } catch (error) {
        console.error("Weather API error:", error);

        showMessage(
            error.message || "Something went wrong. Please try again."
        );

    } finally {
        searchButton.disabled = false;
        searchButton.innerHTML = 'Search <span>→</span>';
    }
}


// =====================================
// DISPLAY WEATHER
// =====================================

function displayWeather(data) {
    const location = data.location;
    const current = data.current;

    // Location
    cityName.textContent = location.name;

    locationDetails.textContent = [
        location.region,
        location.country
    ].filter(Boolean).join(", ");

    // Local date and time at the searched location
    localTime.textContent = `Local time: ${location.localtime}`;

    // Temperature and conditions
    temperature.textContent = Math.round(current.temp_c);

    condition.textContent = current.condition.text;

    feelsLike.textContent = `${Math.round(current.feelslike_c)}°C`;

    // Weather icon
    weatherIcon.src = current.condition.icon.startsWith("//")
        ? `https:${current.condition.icon}`
        : current.condition.icon;

    weatherIcon.alt = current.condition.text;

    // Weather details
    humidity.textContent = `${current.humidity}%`;

    windSpeed.textContent = `${current.wind_kph} km/h`;

    uvIndex.textContent = current.uv;

    visibility.textContent = `${current.vis_km} km`;

    // Air quality
    displayAirQuality(current.air_quality);
}


// =====================================
// DISPLAY AIR QUALITY
// =====================================

function displayAirQuality(air) {
    if (!air) {
        aqiBadge.textContent = "Unavailable";
        aqiBadge.className = "aqi-badge";

        aqiDescription.textContent =
            "Air quality data is not available for this location.";

        pm25.textContent = "--";
        pm10.textContent = "--";
        ozone.textContent = "--";
        carbonMonoxide.textContent = "--";

        return;
    }

    // Pollutant concentrations
    pm25.textContent = formatNumber(air.pm2_5);
    pm10.textContent = formatNumber(air.pm10);
    ozone.textContent = formatNumber(air.o3);
    carbonMonoxide.textContent = formatNumber(air.co);

    // US EPA Air Quality Index
    const index = air["us-epa-index"];

    const categories = {
        1: {
            label: "Good",
            description:
                "Air quality is generally satisfactory, with little or no risk from air pollution.",
            className: ""
        },

        2: {
            label: "Moderate",
            description:
                "Air quality is acceptable for most people. Sensitive individuals may need extra care.",
            className: "moderate"
        },

        3: {
            label: "Sensitive groups",
            description:
                "Sensitive individuals may experience health effects and should follow local air-quality advice.",
            className: "moderate"
        },

        4: {
            label: "Unhealthy",
            description:
                "Air pollution may affect health. Consider local air-quality guidance.",
            className: "unhealthy"
        },

        5: {
            label: "Very unhealthy",
            description:
                "Health effects may be more likely. Follow local public-health recommendations.",
            className: "unhealthy"
        },

        6: {
            label: "Hazardous",
            description:
                "Air pollution levels are very high. Follow local public-health recommendations.",
            className: "unhealthy"
        }
    };

    const result = categories[index];

    if (!result) {
        aqiBadge.textContent = "Unavailable";
        aqiBadge.className = "aqi-badge";

        aqiDescription.textContent =
            "The air-quality index is unavailable for this location.";

        return;
    }

    aqiBadge.textContent = result.label;
    aqiBadge.className = `aqi-badge ${result.className}`.trim();

    aqiDescription.textContent = result.description;
}


// =====================================
// FORMAT NUMBERS
// =====================================

function formatNumber(value) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
        return "--";
    }

    return Number(value).toFixed(1);
}


// =====================================
// DISPLAY ERROR MESSAGE
// =====================================

function showMessage(text) {
    message.textContent = text;
}


// =====================================
// SEARCH EVENT
// =====================================

searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    getWeather(cityInput.value);
});


// =====================================
// LOAD DEFAULT WEATHER
// =====================================

getWeather("London");