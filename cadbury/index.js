const cadbury = document.querySelector("#searchbox");
const resultsDiv = document.getElementsByClassName("results")[0];
const browserResults = document.getElementsByClassName("browser__results")[0];
const quickMeanings = document.getElementsByClassName("quick__meanings")[0];

resultsDiv.style.display = "none";

cadbury.addEventListener("keyup", (e) => {
    Object.keys(definitions).map((key, index) => {
        // Either use if includes 
        // if (key.includes(cadbury.value)) {
        //     focusDictionary(key, definitions[key])
        // }

        // Another free dictionary API: https://api.dictionaryapi.dev/api/v2/entries/en_US/hello

        // Or use if === value
        if (key == cadbury.value) {
            focusDictionary(key, definitions[key])
        }
    });

    if (cadbury.value == "" || cadbury.length == 1) {
        quickMeanings.innerHTML = "";
        browserResults.innerHTML = "";
        resultsDiv.style.display = "none";
    } else if (cadbury.value == "weather" || cadbury.value == "WEATHER" || cadbury.value == "Weather" || cadbury.value == "wEATHER") {
        getWeather();
    } else {
        browserResults.innerHTML = 
        `
        <span class="error">No broswer results found for the term "${cadbury.value}"</span>
        `
    }
});

function focusDictionary(key, definition) {
    resultsDiv.style.display = "block";
    quickMeanings.innerHTML =
        `
        <li>
            <span>No Results Found</span>
        </li>
        `
    // let term = data[0].word;
    // console.log(data);
    // let meaning = data[0].meanings[0].definitions[0].definition;
    // resultsDiv.style.display = "block";
    quickMeanings.innerHTML =
        `
        <li>
            <h3 class="term">"${key}"</h3>
            <span class="meaning">${definition}</span>
        </li>
        `;
}

function focusBrowser(data) {
    browserResults.innerHTML =
    `
    <img class="loader" src="./assets/loading_spinner.gif">
    `;

    setTimeout(() => {
        if (!data) {
            browserResults.innerHTML =
            `
            <span class="error">There was a problem loading browser results</span>
            `;
        }
    }, 3000);

    browserResults.innerHTML = 
    `
    <div class="weather_results">
        <img src="${data.icon}" class="weather_icon">
        <div class="weather_info">
            <h2>${data.city}, ${data.country}</h2>
            <h3>${data.temperature}</h3>
            <h3>${data.description}</h3>
        </div>
    </div>
    `
}

function getWeather() {
    if (navigator.onLine) {
        fetch(`http://api.openweathermap.org/data/2.5/weather?lat=46.6863&lon=7.8632&appid=ecbd8d55ed62141fd514798906526fe0`)
        .then((res) => {
            return res.json();
        }).then(focusWeather);
    } else {
        browserResults.innerHTML =
        `
        <span class="error">You are not connected to the internet</span>
        `
    }
}

function focusWeather(data) {
    let main = data.main;
    let weather = data.weather;

    let weatherDictionary = {
        country: data.sys.country,
        city: data.name,
        temperature: `Feels Like ${main.temp.toFixed(0) - 273}°C`,
        humidity: main.humidity,
        description: weather[0].main,
        icon: `http://openweathermap.org/img/wn/${weather[0].icon}@4x.png`
    }

    focusBrowser(weatherDictionary);
}