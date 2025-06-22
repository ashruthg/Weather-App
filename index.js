const apiKey = 'ac925d5c75ac4e56a720eeec6e15e35f';
const weatherbitAPIKey = '90c637b8d151450687355bdb822cf790'
//Navbar Items
const inputEl = document.getElementById('searchInput');
const searchBtnEl = document.getElementById('searchButton');

// Weather Image Container Items
const searchWeatherImageCont = document.getElementById('searchImageContainer');
const notFoundImageCont = document.getElementById('notFoundImageContainer');

//weather Content Container
const weatherContentContainer = document.querySelector('.weather-content-container');

//Current Weather Details Container Items
const cityNameEl = document.querySelector('.city-name');
const dateEl = document.querySelector('#date');
const timeEl = document.querySelector('#time');
const weatherImageEl = document.getElementById('weatherConditionImg');
const weatherConditionEl = document.getElementById('weatherCondition');
const tempEl = document.querySelector('.temperature');
//weather Parameters Items
const humidityEl = document.getElementById('humidityValue');
const pressureEl = document.getElementById('pressureValue');
const uvIndexEl = document.getElementById('uvValue');
const aqiEl = document.getElementById('aqiValue');

//Temperature Items
const feelsLikeEl = document.getElementById('feelsLikeValue');
const minTempEl = document.getElementById('minTemp');
const maxTempEl = document.getElementById('maxTemp');

//Sunrise and Sunset
const sunriseTimeEl = document.getElementById('sunriseTime');
const sunsetTimeEl = document.getElementById('sunsetTime')

//Wind Details Elements
const windSpeedEl = document.getElementById('windSpeed');
const windDirectionEl = document.getElementById('windDirection');
const windGustEl = document.getElementById('windGust');

//Forecast Elements
const day1ImageEl = document.getElementById('dayOneImg');
const day1DayEl = document.getElementById('dayOneDay');
const day1TempEl = document.getElementById('dayOneTemp');
const day1MinTempEl = document.getElementById('dayOneMin');
const day1MaxTempEl = document.getElementById('dayOneMax');

const day2ImageEl = document.getElementById('dayTwoImg');
const day2DayEl = document.getElementById('dayTwoDay');
const day2TempEl = document.getElementById('dayTwoTemp');
const day2MinTempEl = document.getElementById('dayTwoMin');
const day2MaxTempEl = document.getElementById('dayTwoMax');

const day3ImageEl = document.getElementById('dayThreeImg');
const day3DayEl = document.getElementById('dayThreeDay');
const day3TempEl = document.getElementById('dayThreeTemp');
const day3MinTempEl = document.getElementById('dayThreeMin');
const day3MaxTempEl = document.getElementById('dayThreeMax');

const day4ImageEl = document.getElementById('dayFourImg');
const day4DayEl = document.getElementById('dayFourDay');
const day4TempEl = document.getElementById('dayFourTemp');
const day4MinTempEl = document.getElementById('dayFourMin');
const day4MaxTempEl = document.getElementById('dayFourMax');

function showErrorImage(){
    notFoundImageCont.style.display = 'block';
    weatherContentContainer.style.display = 'none';
    searchWeatherImageCont.style.display = 'none';
}

searchBtnEl.addEventListener('click', async () => {
    
    try {
        console.log('button clicked');
        const city = inputEl.value.trim();
        console.log(city);

        const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        const weatherResponse = await fetch(weatherApiUrl);
        console.log('Weather Response ➡️ ', weatherResponse);

        if (weatherResponse.ok) {
            const rawJson = await weatherResponse.json();
            console.log('Weather JSON ➡️ ', rawJson);
            // Destructuring required fields from weather api data
            const cityName = rawJson.name;
            const { description: condition, icon: imageIcon } = rawJson.weather[0];
            console.log('Image Icon Code: ',imageIcon);
            const iconUrl = `https://openweathermap.org/img/wn/${imageIcon}@2x.png`;
            let { temp, feels_like, temp_min, temp_max, humidity, pressure } = rawJson.main;
            feels_like = Math.round(feels_like);
            temp = Math.round(temp) + '°C';
            temp_min = Math.round(temp_min);
            temp_max = Math.round(temp_max);
            const { lat, lon } = rawJson.coord;
            const { deg, gust, speed } = rawJson.wind;
            const { sunrise: sunrise_unix, sunset: sunset_unix } = rawJson.sys;
            const sunrise_time = new Date(sunrise_unix * 1000).toLocaleString('en-US',{
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            const sunset_time = new Date(sunset_unix * 1000).toLocaleString('en-US',{
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            const date = new Date();

            const dateOptions = {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            };

            const timeOptions = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            };

            const currentFormattedDate = date.toLocaleDateString('en-GB', dateOptions); //21 June 2025 Format
            const currentFormattedTime = date.toLocaleTimeString('en-US', timeOptions) // 15:45 Format

            try {
                // Forecast & AQI (pollution) API URLs
                const pollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
                const weatherbitForecastUrl = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${weatherbitAPIKey}&days=5`;

                // Run both API calls in parallel
                const [pollutionResponse, forecastResponse] = await Promise.all([
                    fetch(pollutionUrl),
                    fetch(weatherbitForecastUrl)
                ]);

                if (!pollutionResponse.ok || !forecastResponse.ok) {
                    console.error('One of the responses failed.');
                    // showErrorImage();
                    return;
                }

                const [pollutionData, forecastData] = await Promise.all([
                    pollutionResponse.json(),
                    forecastResponse.json()
                ]);

                console.log('Forecast Data ➡️', forecastData);
                console.log('Air Pollution Data ➡️', pollutionData);

                //At this point, ALL 3 responses are successful.
                const {aqi} = pollutionData.list[0].main; //Destructure AQI from Pollution Data
                console.log('aqi is', aqi);
                console.log('forecast data obj is ', forecastData);

                const currentdayUV = forecastData.data[0].uv; //UV Index of the current day

                function getDay(dateStr) {
                    const date = new Date(dateStr); // create a date object
                    return date.toLocaleDateString('en-US', { weekday: 'short' }); // returns 'Sun', 'Mon', etc.
                }
                
                //Forecast Data of the following 4 days

                //Day 1 Forecast
                const day1ImageIcon = forecastData.data[1].weather.icon;
                const day1ImageUrl = `https://www.weatherbit.io/static/img/icons/${day1ImageIcon}.png`;
                const day1Date = forecastData.data[1].valid_date;
                const day1Day = getDay(day1Date);
                const day1Temp = Math.round(forecastData.data[1].temp)+'°C';
                const day1MinTemp = Math.round(forecastData.data[1].min_temp);
                const day1MaxTemp = Math.round(forecastData.data[1].max_temp);
                
                console.log('day 1 day is ', day1Day);
                console.log('day 1 Temp is ', day1Temp);
                console.log('day 1 min temp is ', day1MinTemp);
                console.log('day 1 max temp is ', day1MaxTemp);

                //Day 2 Forecast
                const day2ImageIcon = forecastData.data[2].weather.icon;
                const day2ImageUrl = `https://www.weatherbit.io/static/img/icons/${day2ImageIcon}.png`;
                const day2Date = forecastData.data[2].valid_date;
                const day2Day = getDay(day2Date);
                const day2Temp = Math.round(forecastData.data[2].temp)+'°C';
                const day2MinTemp = Math.round(forecastData.data[2].min_temp);
                const day2MaxTemp = Math.round(forecastData.data[2].max_temp);
                
                console.log('day 2 day is ', day2Day);
                console.log('day 2 Temp is ', day2Temp);
                console.log('day 2 min temp is ', day2MinTemp);
                console.log('day 2 max temp is ', day2MaxTemp);

                //Day 3 Forecast
                const day3ImageIcon = forecastData.data[3].weather.icon;
                const day3ImageUrl = `https://www.weatherbit.io/static/img/icons/${day3ImageIcon}.png`;
                const day3Date = forecastData.data[3].valid_date;
                const day3Day = getDay(day3Date);
                const day3Temp = Math.round(forecastData.data[3].temp)+'°C';
                const day3MinTemp = Math.round(forecastData.data[3].min_temp);
                const day3MaxTemp = Math.round(forecastData.data[3].max_temp);
                
                console.log('day 3 day is ', day3Day);
                console.log('day 3 Temp is ', day3Temp);
                console.log('day 3 min temp is ', day3MinTemp);
                console.log('day 3 max temp is ', day3MaxTemp);

                //Day 4 Forecast
                const day4ImageIcon = forecastData.data[4].weather.icon;
                const day4ImageUrl = `https://www.weatherbit.io/static/img/icons/${day4ImageIcon}.png`;
                const day4Date = forecastData.data[4].valid_date;
                const day4Day = getDay(day4Date);
                const day4Temp = Math.round(forecastData.data[4].temp)+'°C';
                const day4MinTemp = Math.round(forecastData.data[4].min_temp);
                const day4MaxTemp = Math.round(forecastData.data[4].max_temp);
                
                console.log('day 4 day is ', day4Day);
                console.log('day 4 Temp is ', day4Temp);
                console.log('day 4 min temp is ', day4MinTemp);
                console.log('day 4 max temp is ', day4MaxTemp);

                //Update Values
                cityNameEl.textContent = cityName;
                dateEl.textContent = currentFormattedDate;
                timeEl.textContent = currentFormattedTime;
                weatherImageEl.src = iconUrl;
                weatherConditionEl.textContent = condition;
                tempEl.textContent = temp;

                //Update weather Parameters Items
                humidityEl.textContent = humidity;
                pressureEl.textContent = pressure;
                uvIndexEl.textContent = currentdayUV;
                aqiEl.textContent = aqi;

                //Update Temperature Elements Values
                feelsLikeEl.textContent = feels_like;
                minTempEl.textContent = temp_min;
                maxTempEl.textContent = temp_max;

                //Update Sunrise and Sunset Element Values
                sunriseTimeEl.textContent = sunrise_time;
                sunsetTimeEl.textContent = sunset_time;

                //Update Wind Details Elements Values
                windSpeedEl.textContent = speed;
                windDirectionEl.textContent = deg;
                windGustEl.textContent = gust;

                //Update Forecast Elements Values
                day1ImageEl.src = day1ImageUrl;
                day1DayEl.textContent = day1Day;
                day1TempEl.textContent = day1Temp;
                day1MinTempEl.textContent = day1MinTemp;
                day1MaxTempEl.textContent = day1MaxTemp;

                day2ImageEl.src = day2ImageUrl;
                day2DayEl.textContent = day2Day;
                day2TempEl.textContent = day2Temp;
                day2MinTempEl.textContent = day2MinTemp;
                day2MaxTempEl.textContent = day2MaxTemp;

                day3ImageEl.src = day3ImageUrl;
                day3DayEl.textContent = day3Day;
                day3TempEl.textContent = day3Temp;
                day3MinTempEl.textContent = day3MinTemp;
                day3MaxTempEl.textContent = day3MaxTemp;

                day4ImageEl.src = day4ImageUrl;
                day4DayEl.textContent = day4Day;
                day4TempEl.textContent = day4Temp;
                day4MinTempEl.textContent = day4MinTemp;
                day4MaxTempEl.textContent = day4MaxTemp;

                searchWeatherImageCont.style.display = 'none';
                notFoundImageCont.style.display = 'none';
                weatherContentContainer.style.display = 'flex';
            } catch (innerErr) {
                console.error('Inner Error ➡️', innerErr);
                showErrorImage();
            }

        } else if (weatherResponse.status === 404) {
            console.warn('City not found');
            showErrorImage();
        } else {
            console.error('Weather API error');
            showErrorImage();
        }

    } catch (error) {
        console.error('Outer Error ➡️', error);
        showErrorImage();
    } finally {
        inputEl.value = '';
        console.log('finally executed');
    }
});

inputEl.addEventListener("keydown", (event) => {
    if(event.key=="Enter"){
        searchBtnEl.click()
    }
});