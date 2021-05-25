// DOM Querying
const cadbury = document.querySelector("#searchbox");
const resultsDiv = document.getElementsByClassName("results")[0];
const browserResults = document.getElementsByClassName("browser__results")[0];
const quickMeanings = document.getElementsByClassName("quick__meanings")[0];

// Making the results div disappear
resultsDiv.style.display = "none";

// Checking every time a key is pressed
cadbury.addEventListener("keyup", (e) => {

    var cadburyValue = cadbury.value.toLowerCase()

    // Checking the triggering of the enter key (keyCode = 13)
    if (e.code === "Enter") {
        enterPressed()
    }

    // Mapping through the JSON dictionary
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

    // Focusing on the 'no results found' flash
    browserResults.innerHTML = 
    `
    <span class="error">No results found for "${cadbury.value}"</span>
    `

    // Making the results div disappear again
    if (cadbury.value == "") {
        quickMeanings.innerHTML = "";
        browserResults.innerHTML = "";
        resultsDiv.style.display = "none";
    } 

    // Checking if the user is online
    if (!navigator.onLine) {
        browserResults.innerHTML = 
        `
        <span class="error">You are not connected to the internet</span>
        `
    }
    
    // Checking if "Weather" is in the input
    if (cadbury.value.toLowerCase() == "weather") {
        // Calling the weather function
        getWeather();
    }

    // Checking if "News" is in the input
    if (cadbury.value == "news") {
        // Fetching the latest news using the Guardians API
        fetch("https://content.guardianapis.com/search?api-key=605eae97-c0db-48e7-847e-445047971b66")
        .then(res => {
            return res.json();
        }).then(focusBrowser)
    }

    const commandKey = ":"
    // If the command key is pressed
    if (cadbury.value[0] == commandKey) {
        // This gets the first word of the input without the commandKey
        let command = cadbury.value.slice(1)
        let cmd = command.split(" ")[0]
        // This gets the value after the commandKey + command + the space character after the command
        let value = cadbury.value.slice(cmd.length+2)

        // Pass it into focusCommand
        focusCommand(cmd, value)
    }

    // Possible values of an expression
    let mathCodes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "*", "/", "-", "+", "(", ")", "[", "]", "%"];

    // Mapping through mathCodes to check for presence
    mathCodes.map((code) => {
        // If values from mathCodes are included
        if (cadbury.value.includes(code)) {
            console.log("number found");
            try {
                // Calculating the value
                let expressionAnswer = eval(cadbury.value);
                focusBrowser(expressionAnswer, numeric = true);
            } catch (err) {
                console.log("not a number...");
            }
        }
    });
});

function focusDictionary(key, definition) {
    if (key == null || definition == null) {
        resultsDiv.style.display = "block";
        quickMeanings.innerHTML =
        `
        <li>
            <span class="no-def-error">No Results Found</span>
        </li>
        `
    } else {
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
}

function focusBrowser(data, numeric) {
    if (!navigator.onLine) {
        browserResults.innerHTML = 
        `
        <span class="error">You are not connected to the internet</span>
        `
    } else {
        if (cadbury.value.toLowerCase() == "weather") {
            browserResults.innerHTML =
            `
            <img class="loader" src="./assets/loading_spinner.gif">
            `;

            setTimeout(() => {
                if (!data.success) {
                    browserResults.innerHTML =
                    `
                    <span class="error">No results found for "${cadbury.value}"</span>
                    `;
                } else {
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
                }
            }, 1000);
            
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
                } else {
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
                    <a class="search_result_li" href="${article1.link}" target="_blank">
                        <span>${article1.title} • ${article1.section}</span>
                    </a>
                    <a class="search_result_li" href="${article2.link}" target="_blank">
                        <span>${article2.title} • ${article2.section}</span>
                    </a>
                    <a class="search_result_li" href="${article3.link}" target="_blank">
                        <span>${article3.title} • ${article3.section}</span>
                    </a>
                    `;
                }
            }, 1000);
    }

    if (numeric) {
        browserResults.innerHTML = 
        `
        <span class="error eval_err">${cadbury.value} = ${data}</span>
        `;
        console.log(browserResults);
        resultsDiv.style.display = "block"
        browserResults.style.display = "block"
        focusDictionary(null, null);
    };
}
}

function getWeather() {
    fetch('http://ip-api.com/json/')
    .then(function (response) {
        // console.log(response.json)
        return response.json()
    }).then(getLocation);
}

function focusWeather(data, countryFromAPI, success) {
    // console.log(data);

    let weatherDictionary = {
        success: success,
        country: countryFromAPI,
        city: data.name,
        temperature: `Feels Like ${data.main.temp.toFixed(0) - 273}°C`,
        humidity: data.main.humidity,
        description: data.weather[0].main,
        icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`
    }

    focusBrowser(weatherDictionary);
}

function getLocation(data) {
    // console.log(data);
    
    let location = {
        country: data.country,
        lat: data.lat,
        lon: data.lon,
        success: data.status == "success" ? true : false,
    };

    fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=ecbd8d55ed62141fd514798906526fe0`)
    .then((res) => {
        return res.json();
    }).then((res) => {
        focusWeather(res, location.country, location.success);
    });
}

// This shows the command in the browserResults
function focusCommand(command, value) {
    if (command == "google" || command == "search") {
        browserResults.innerHTML =
            `
        <span class="error eval_err">Search Google For "${value}"</span>
        `;
        resultsDiv.style.display = "block"
        browserResults.style.display = "block"
        focusDictionary(null, null);
    }
    if (command == "wiki" || command == "wikipedia") {
        browserResults.innerHTML =
            `
        <span class="error eval_err">Search Wikipedia For "${value}"</span>
        `;
        resultsDiv.style.display = "block"
        browserResults.style.display = "block"
        focusDictionary(null, null);
    }
    if (command == "amazon") {
        browserResults.innerHTML =
            `
        <span class="error eval_err">Search Wikipedia For "${value}"</span>
        `;
        resultsDiv.style.display = "block"
        browserResults.style.display = "block"
        focusDictionary(null, null);
    }
}

function enterPressed() {
    // Check if there is a command
    if (cadbury.value[0] == ":") {
        // If there is a command, get the respective substrings into cmd and value
        // This gets the first word of the input without the commandKey
        let command = cadbury.value.slice(1);
        let cmd = command.split(" ")[0];
        // This gets the value after the commandKey + command + the space character after the command
        let value = cadbury.value.slice(cmd.length + 2);

        // If the cmd is google or search, google the value
        if (cmd == "google" || cmd == "search") {
            google(value);
        }
        if (cmd == "wiki" || cmd == "wikipedia") {
            wikipedia(value)
        }

    } else {
        console.log("Not a valid command");
    }
}

// This googles the value in users default browser
function google(value) {
    // This will google the value
    window.open("https://www.google.com/search?q="+value, "_blank");
}

// This searches on wikipedia
function wikipedia(value) {
    // This will google the value
    window.open("https://en.wikipedia.org/wiki/"+value, "_blank");
}
