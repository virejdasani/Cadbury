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

    browserResults.innerHTML = 
    `
    <span class="error">No borwser results found for "${cadbury.value}"</span>
    `

    if (cadbury.value == "") {
        quickMeanings.innerHTML = "";
        browserResults.innerHTML = "";
        resultsDiv.style.display = "none";
    } 

    if (!navigator.onLine) {
        browserResults.innerHTML = 
        `
        <span class="error">You are not connected to the internet</span>
        `
    }
    
    if (cadbury.value == "weather" || cadbury.value == "WEATHER" || cadbury.value == "Weather" || cadbury.value == "wEATHER") {
        getWeather();
    }

    if (cadbury.value == "news") {
        fetch("https://content.guardianapis.com/search?api-key=605eae97-c0db-48e7-847e-445047971b66")
        .then(res => {
            return res.json();
        }).then(focusBrowser)
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
    if (!navigator.onLine) {
        browserResults.innerHTML = 
        `
        <span class="error">You are not connected to the internet</span>
        `
    } else {
        if (cadbury.value == "weather") {
            navigator.geolocation.getCurrentPosition(function(position) {
                console.log(position.coords.latitude, position.coords.longitude);
            }, (err) => {
                console.log(err);
            });

            browserResults.innerHTML =
            `
            <img class="loader" src="./assets/loading_spinner.gif">
            `;

            setTimeout(() => {
                if (!data) {
                    browserResults.innerHTML =
                    `
                    <span class="error">No results found for "${cadbury.value}"</span>
                    `;
                }
            }, 3000);

            browserResults.innerHTML = 
            `
            <div class="weather_results">
                <img src="${data?.icon}" class="weather_icon">
                <div class="weather_info">
                    <h2>${data?.city}, ${data?.country}</h2>
                    <h3>${data?.temperature}</h3>
                    <h3>${data?.description}</h3>
                </div>
            </div>
            `;
        } else if (cadbury.value == "news") {

            console.log(data);
            browserResults.innerHTML =
            `
            <img class="loader" src="./assets/loading_spinner.gif">
            `;

            setTimeout(() => {
                if (!data.response) {
                    browserResults.innerHTML =
                    `
                    <span class="error">Couldn't load the news panel</span>
                    `;
                }
            }, 3000);

            let article1 = {
                title: data.response.results[0]?.webTitle,
                link: data.response.results[0]?.webUrl,
                section: data.response.results[0]?.pillarName,
            }
            let article2 = {
                title: data.response.results[3]?.webTitle,
                link: data.response.results[3]?.webUrl,
                section: data.response.results[3]?.pillarName,
            }
            let article3 = {
                title: data.response.results[7]?.webTitle,
                link: data.response.results[7]?.webUrl,
                section: data.response.results[7]?.pillarName,
            }
        
            browserResults.innerHTML = 
            `
            <a class="search_result_li" href="${article1.link}">
                <span>${article1.title} • ${article1.section}</span>
            </a>
            <a class="search_result_li" href="${article2.link}">
                <span>${article2.title} • ${article2.section}</span>
            </a>
            <a class="search_result_li" href="${article3.link}">
                <span>${article3.title} • ${article3.section}</span>
            </a>
            `;

            cadbury.addEventListener("keypress", (e) => {
                if (e.keyCode == 40) {
                    console.log('ttatatata');
                }
            })
        }
    }
}

function getWeather() {

    // navigator.geolocation.getCurrentPosition((pos) => {
    //     console.log(pos.coords.latitude);
    //     console.log(pos.coords.longitude);
    // }, (err) => {
    //     console.log(err);
    // });

    fetch(`http://api.openweathermap.org/data/2.5/weather?lat=46.6863&lon=7.8632&appid=ecbd8d55ed62141fd514798906526fe0`)
    .then((res) => {
        return res.json();
    }).then(focusWeather);
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