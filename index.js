const apiKey = 'ac925d5c75ac4e56a720eeec6e15e35f';

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
                const openWeatherForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
                const openWeatherUVUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&units=metric&appid=${apiKey}`;


                // Run both API calls in parallel
                const [pollutionResponse, forecastResponse] = await Promise.all([
                    fetch(pollutionUrl),
                    fetch(openWeatherForecastUrl),
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
                console.log('forecast data obj is ➡️', forecastData);


                const forecastDataList = forecastData.list;

                const todayDate = new Date();
                const formattedToday = todayDate.toISOString().split('T')[0];

                const fourDayforecastData = [];

                for (let i = 1; i < 5; i++) {
                    let date = '';
                    let icons = [];
                    let temps = [];
                    let minTemps = [];
                    let maxTemps = [];

                    forecastDataList.forEach(item => {
                        // Create a new Date object for the ith day
                        let otherDate = new Date(todayDate);
                        otherDate.setDate(todayDate.getDate() + i);
                        let formattedOtherDate = otherDate.toISOString().split('T')[0];

                        let itemDate = item.dt_txt.split(' ')[0];

                        if (formattedOtherDate === itemDate) {
                            date = itemDate;
                            icons.push(item.weather[0].icon);
                            temps.push(item.main.temp);
                            minTemps.push(item.main.temp_min);
                            maxTemps.push(item.main.temp_max);
                        }
                    });

                    // average of array
                    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

                    // to pick most frequent icon
                    const mostFrequentIcon = icons.sort((a, b) =>
                        icons.filter(v => v === a).length - icons.filter(v => v === b).length
                    ).pop();

                    const dayDetails = { //this is the object of each ith day details
                        date,
                        icon: mostFrequentIcon || '',
                        temp: temps.length ? Math.round(avg(temps)) : '',
                        min_temp: minTemps.length ? Math.round(avg(minTemps)) : '',
                        max_temp: maxTemps.length ? Math.round(avg(maxTemps)) : ''
                    };

                    fourDayforecastData.push(dayDetails);
                }

                // const currentdayUV = forecastData.data[0].uv; //UV Index of the current day

                function getDay(dateStr) {
                    const date = new Date(dateStr); // create a date object
                    return date.toLocaleDateString('en-US', { weekday: 'short' }); // returns 'Sun', 'Mon', etc.
                }
                
                //Forecast Data of the following 4 days

                //Day 1 Forecast
                const day1ImageIcon = fourDayforecastData[0].icon;
                const day1ImageUrl = `https://openweathermap.org/img/wn/${day1ImageIcon}@2x.png`;
                const day1Date = fourDayforecastData[0].date;
                const day1Day = getDay(day1Date);
                const day1Temp = Math.round(fourDayforecastData[0].temp)+'°C';
                const day1MinTemp = Math.round(fourDayforecastData[0].min_temp);
                const day1MaxTemp = Math.round(fourDayforecastData[0].max_temp);
                
                console.log('day 1 day is ', day1Day);
                console.log('day 1 Temp is ', day1Temp);
                console.log('day 1 min temp is ', day1MinTemp);
                console.log('day 1 max temp is ', day1MaxTemp);

                //Day 2 Forecast
                const day2ImageIcon = fourDayforecastData[1].icon;
                const day2ImageUrl = `https://openweathermap.org/img/wn/${day2ImageIcon}@2x.png`;
                const day2Date = fourDayforecastData[1].date;
                const day2Day = getDay(day2Date);
                const day2Temp = Math.round(fourDayforecastData[1].temp)+'°C';
                const day2MinTemp = Math.round(fourDayforecastData[1].min_temp);
                const day2MaxTemp = Math.round(fourDayforecastData[1].max_temp);

                
                console.log('day 2 day is ', day2Day);
                console.log('day 2 Temp is ', day2Temp);
                console.log('day 2 min temp is ', day2MinTemp);
                console.log('day 2 max temp is ', day2MaxTemp);

                //Day 3 Forecast
                const day3ImageIcon = fourDayforecastData[2].icon;
                const day3ImageUrl = `https://openweathermap.org/img/wn/${day3ImageIcon}@2x.png`;
                const day3Date = fourDayforecastData[2].date;
                const day3Day = getDay(day3Date);
                const day3Temp = Math.round(fourDayforecastData[2].temp)+'°C';
                const day3MinTemp = Math.round(fourDayforecastData[2].min_temp);
                const day3MaxTemp = Math.round(fourDayforecastData[2].max_temp);

                
                console.log('day 3 day is ', day3Day);
                console.log('day 3 Temp is ', day3Temp);
                console.log('day 3 min temp is ', day3MinTemp);
                console.log('day 3 max temp is ', day3MaxTemp);

                //Day 4 Forecast
                const day4ImageIcon = fourDayforecastData[3].icon;
                const day4ImageUrl = `https://openweathermap.org/img/wn/${day4ImageIcon}@2x.png`;
                const day4Date = fourDayforecastData[3].date;
                const day4Day = getDay(day4Date);
                const day4Temp = Math.round(fourDayforecastData[3].temp)+'°C';
                const day4MinTemp = Math.round(fourDayforecastData[3].min_temp);
                const day4MaxTemp = Math.round(fourDayforecastData[3].max_temp);

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
                // uvIndexEl.textContent = currentdayUV;
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