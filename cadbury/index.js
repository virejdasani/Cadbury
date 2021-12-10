var appVersion = "1.0.0";

// DOM Querying
const cadbury = document.querySelector("#searchbox");
const resultsDiv = document.getElementsByClassName("results")[0];
const browserResults = document.getElementsByClassName("browser__results")[0];
const quickMeanings = document.getElementsByClassName("quick__meanings")[0];
const browserHeader = document.getElementsByClassName("browser_header")[0];
const resultsDivider = document.getElementsByClassName("results_divider")[0];

const contextMenu = document.getElementById("context-menu");
const mainWindow = document.getElementsByClassName("main__window")[0];

// Making the results div disappear
resultsDiv.style.display = "none";

// Check if an update is available
// For app update, if an update is available, the updateAvailable in the RemoteJSON repo will be updated to yes. That will result in the code below being executed
fetch("https://virejdasani.github.io/RemoteJSON/Cadbury/index.html")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    // If update is available, and this version is not the latest one
    if (data.updateAvailable == "yes" && data.latestVersion != appVersion) {
      focusBrowser(data);
    }
  })
  .catch((err) => {
    // console.log(err)
  });

// Checking every time a key is pressed
cadbury.addEventListener("keyup", (e) => {
  var cadburyValue = cadbury.value.toLowerCase();

  // Checking the triggering of the enter key (keyCode = 13)
  if (e.code === "Enter") {
    enterPressed();
  }
  // if the user is offline
  if (!navigator.onLine) {
    // Mapping through the JSON dictionary
    Object.keys(definitions).map((key, index) => {
      // Another free dictionary API: https://api.dictionaryapi.dev/api/v2/entries/en_US/hello

      if (key == cadbury.value) {
        focusDictionary(key, definitions[key]);
      }
    });
    // if user is online
  } else {
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cadbury.value}`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        let dataHeader = data[0]?.meanings[0]?.definitions[0];
        focusDictionary(
          cadburyValue,
          dataHeader?.definition,
          dataHeader?.example,
          [
            dataHeader?.synonyms?.[0],
            dataHeader?.synonyms?.[1],
            dataHeader?.synonyms?.[2],
          ]
        );
        // console.log(data);
      });
  }

  browserResults.innerHTML = `
    <span id="noResults" class="error">No results found for "${cadbury.value}"</span>
    `;

  // This is to not display "No results found" when no results are found
  if (document.getElementById("noResults").innerHTML.includes("No results")) {
    document.getElementById("noResults").style.display = "none";
    hideGlobalResults();
  }

  // Making the results div disappear again
  if (cadbury.value == "") {
    quickMeanings.innerHTML = "";
    browserResults.innerHTML = "";
    resultsDiv.style.display = "none";
  }

  // Checking if the user is online
  if (!navigator.onLine) {
    browserResults.innerHTML = `
        <span class="error">You are not connected to the internet</span>
        `;
  }

  // Checking if "Weather" is in the input
  if (cadbury.value.toLowerCase() == "weather") {
    // Calling the weather function
    getWeather();
  }

  // Checking if "help" is in the input
  if (cadbury.value.toLowerCase() == "help") {
    getHelp();
  }

  // Checking if "News" is in the input
  if (cadbury.value == "news") {
    // Fetching the latest news using the Guardians API
    fetch(
      "https://content.guardianapis.com/search?api-key=605eae97-c0db-48e7-847e-445047971b66"
    )
      .then((res) => {
        return res.json();
      })
      .then(focusBrowser);
  }

  const commandKey = ":";
  // If the command key is pressed
  if (cadbury.value[0] == commandKey) {
    // This gets the first word of the input without the commandKey
    let command = cadbury.value.slice(1);
    let cmd = command.split(" ")[0];
    // This gets the value after the commandKey + command + the space character after the command
    let value = cadbury.value.slice(cmd.length + 2);

    // Pass it into focusCommand
    focusCommand(cmd, value);
  }

  // Possible values of an expression
  let mathCodes = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    0,
    "*",
    "/",
    "-",
    "+",
    "(",
    ")",
    "[",
    "]",
    "%",
  ];

  // Mapping through mathCodes to check for presence
  mathCodes.map((code) => {
    // If values from mathCodes are included
    if (cadbury.value.includes(code)) {
      // console.log("number found");
      try {
        showGlobalResults();
        hideDictionaryResults();
        // Calculating the value
        let expressionAnswer = eval(cadbury.value);
        focusBrowser(expressionAnswer, (numeric = true));
      } catch (err) {
        // console.log("not a number...");
      }
    }
  });
});

function focusDictionary(key, definition, example, synonyms) {
  showDictionaryResults();

  if (cadbury.value.includes(":")) {
    hideDictionaryResults();
  }

  hideGlobalResults();
  if (key == null || definition == null) {
    resultsDiv.style.display = "block";
    quickMeanings.innerHTML = `
        <li>
            <span class="no-def-error">No Results Found For "${cadbury.value}"</span>
        </li>
        `;
    // hideDictionaryResults()
  } else {
    resultsDiv.style.display = "block";
    quickMeanings.innerHTML = `
        <li>
            <span>No Results Found</span>
        </li>
        `;

    // Checking if the example is present
    if (example && synonyms[0] != undefined) {
      quickMeanings.innerHTML = `
            <li>
                <h3 class="term">"${key}"</h3>
                <span class="meaning">${definition}</span>
                <small class="meaning_example"><b>Example</b> - ${example}</small>
                <small class="meaning_example"><b>Synonyms</b> - ${synonyms[0]}, ${synonyms[1]}, ${synonyms[2]}</small>
            </li>
            `;
    } else if (example && synonyms[0] == undefined) {
      quickMeanings.innerHTML = `
            <li>
                <h3 class="term">"${key}"</h3>
                <span class="meaning">${definition}</span>
                <small class="meaning_example">Example - ${example}</small>
            </li>
            `;
    } else {
      quickMeanings.innerHTML = `
            <li>
                <h3 class="term">"${key}"</h3>
                <span class="meaning">${definition}</span>
            </li>
            `;
    }
  }
}

function focusBrowser(data, numeric) {
  if (!navigator.onLine) {
    browserResults.innerHTML = `
        <span class="error">You are not connected to the internet</span>
        `;
  } else {
    if (cadbury.value.toLowerCase() == "weather") {
      showGlobalResults();

      browserResults.innerHTML = `
            <img class="loader" src="./assets/loading_spinner.gif">
            `;

      setTimeout(() => {
        if (!data.success) {
          // browserResults.innerHTML =
          //     `
          // <span class="error">No results found for "${cadbury.value}"</span>
          // `;
          browserResults.style.display = "none";
        } else {
          browserResults.innerHTML = `
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
      showGlobalResults();

      // console.log(data);
      browserResults.innerHTML = `
            <img class="loader" src="./assets/loading_spinner.gif">
            `;

      setTimeout(() => {
        if (!data.response) {
          browserResults.innerHTML = `
                    <span class="error">Couldn't load the news panel</span>
                    `;
        } else {
          let article1 = {
            title: data.response.results[0]?.webTitle,
            link: data.response.results[0]?.webUrl,
            section: data.response.results[0]?.pillarName,
          };
          let article2 = {
            title: data.response.results[3]?.webTitle,
            link: data.response.results[3]?.webUrl,
            section: data.response.results[3]?.pillarName,
          };
          let article3 = {
            title: data.response.results[7]?.webTitle,
            link: data.response.results[7]?.webUrl,
            section: data.response.results[7]?.pillarName,
          };

          browserResults.innerHTML = `
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
      showGlobalResults();
      hideDictionaryResults();

      browserResults.innerHTML = `
        <span class="error eval_err">${cadbury.value} = ${data}</span>
        `;
      // console.log(browserResults);
      resultsDiv.style.display = "block";
      browserResults.style.display = "block";
      focusDictionary(null, null);
    }

    if (data.updateAvailable == "yes" && data.latestVersion != appVersion) {
      showGlobalResults();
      hideDictionaryResults();

      browserResults.innerHTML = `
                <span class="error eval_err">${data.updateText}</span>
                <span class="error eval_err">Download it <a href="${data.updateURL}" target="_blank">Here</a></span>
            `;
      // console.log(browserResults);
      resultsDiv.style.display = "block";
      browserResults.style.display = "block";
      focusDictionary(null, null);
    }
  }
}

function getWeather() {
  fetch("http://ip-api.com/json/")
    .then(function (response) {
      // console.log(response.json)
      return response.json();
    })
    .then(getLocation);
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
    icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`,
  };

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

  fetch(
    `http://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=ecbd8d55ed62141fd514798906526fe0`
  )
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      focusWeather(res, location.country, location.success);
    });
}

// This shows the command in the browserResults
function focusCommand(command, value) {
  showGlobalResults();
  hideDictionaryResults();

  if (command.toLowerCase() == "google" || command.toLowerCase() == "search") {
    browserResults.innerHTML = `
        <span class="error eval_err">Press Enter To Search Google For "${value}"</span>
        `;
    resultsDiv.style.display = "block";
    browserResults.style.display = "block";
    focusDictionary(null, null);
  } else if (
    command.toLowerCase() == "wiki" ||
    command.toLowerCase() == "wikipedia"
  ) {
    browserResults.innerHTML = `
        <span class="error eval_err">Press Enter To Search Wikipedia For "${value}"</span>
        `;
    resultsDiv.style.display = "block";
    browserResults.style.display = "block";
    focusDictionary(null, null);
  } else if (command.toLowerCase() == "amazon") {
    browserResults.innerHTML = `
        <span class="error eval_err">Press Enter To Search Amazon For "${value}"</span>
        `;
    resultsDiv.style.display = "block";
    browserResults.style.display = "block";
    focusDictionary(null, null);
  } else if (command.toLowerCase() == "open") {
    // if (google), then make it (https://google.com)
    if (!cadbury.value.includes("http") && !cadbury.value.includes(".")) {
      url = "https://" + value + ".com";

      browserResults.innerHTML = `
            <span class="error eval_err">Press Enter To Open https://${value} (.com)</span>
            `;
    }
    // if (http(s)://google), then make it (http(s)://google.com)
    else if (cadbury.value.includes("http") && !cadbury.value.includes(".")) {
      url = value + ".com";

      browserResults.innerHTML = `
            <span class="error eval_err">Press Enter To Open ${value} (.com)</span>
            `;
    }
    // if (google.(*)), then make it (https://google.(*))
    else if (!cadbury.value.includes("http") && cadbury.value.includes(".")) {
      url = "https://" + value;

      browserResults.innerHTML = `
            <span class="error eval_err" style="margin-top: 20px;">Press Enter To Open https://${value}</span>
            `;
    }
    // if (https://google.com), then keep it (https://google.com)
    else {
      url = value;

      browserResults.innerHTML = `
            <span class="error eval_err">Press Enter To Open ${value}</span>
            `;
    }

    resultsDiv.style.display = "block";
    browserResults.style.display = "block";
    focusDictionary(null, null);
  } else {
    browserResults.innerHTML = `
    <span class="error eval_err" style="margin-top: 20px;">Popular Commands:</span>
    <div class="helper">
        <li>:google</li>
        <li>:wikipedia</li>
        <li>:amazon</li>
        <li>:open</li>
    </div>
    `;
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
    if (cmd.toLowerCase() == "google" || cmd.toLowerCase() == "search") {
      google(value);
    }
    // If the cmd is wiki or wikipedia, wikipedia the value
    if (cmd.toLowerCase() == "wiki" || cmd.toLowerCase() == "wikipedia") {
      wikipedia(value);
    }
    // If the cmd is amazon , amazon the value
    if (cmd.toLowerCase() == "amazon") {
      amazon(value);
    }
    // If the cmd is open, do the following
    if (cmd.toLowerCase() == "open") {
      let url = "";
      // if (google), then make it (https://google.com)
      if (!value.includes("http") && !value.includes(".")) {
        url = "https://" + value + ".com";
      }
      // if (http(s)://google), then make it (http(s)://google.com)
      else if (value.includes("http") && !value.includes(".")) {
        url = value + ".com";
      }
      // if (google.(*)), then make it (https://google.(*))
      else if (!value.includes("http") && value.includes(".")) {
        url = "https://" + value;
      }
      // if (https://google.com), then keep it (https://google.com)
      else {
        url = value;
      }
      openUrl(url);
    } else {
      // console.log("Not a valid command");
    }
  }
}
// This googles the value in users default browser
function google(value) {
  // This will google the value
  window.open("https://www.google.com/search?q=" + value, "_blank");
}

// This searches on wikipedia
function wikipedia(value) {
  window.open("https://en.wikipedia.org/wiki/" + value, "_blank");
}

// This searches on amazon
function amazon(value) {
  window.open("https://www.amazon.com/s?k=" + value, "_blank");
}

// Open url that is passed in as parameter
function openUrl(url) {
  window.open(url, +"_blank");
}

function getHelp() {
  // TODO - change youtube to something else
  browserResults.innerHTML = `
    <div class="helper">
        <li>Find out what Cadbury is capable of by watching the short video below!</li>
        <li><a href="https://youtube.com" target="_blank">What can Cadbury do?</a></li>
        </br>
        <li>These are some of the things Cadbury can do:</li>
        <span class="helper">Search for word definitions by typing the word</span>
        <span class="helper">Search for the weather by typing "weather"</span>
        <span class="helper">Use ":google" or ":search" to directly search the browser</span>
        <span class="helper">Use ":amazon" to directly search Amazon and ":wiki" for WikiPedia</span>
        <span class="helper">To directly open URLs, type ":open" followed by the URL</span>
        <!-- <span class="helper">To get to know more about Cadbury and its developers, type "Cadbury"</span> -->
    </div>
    `;
  browserResults.style.display = "block";
}

function hideGlobalResults() {
  document.getElementById("globalResults").style.display = "none";
  document.getElementById("globalResultsDivider").style.display = "none";
}

function showGlobalResults() {
  document.getElementById("globalResults").style.display = "block";
  document.getElementById("globalResultsDivider").style.display = "block";
}

function hideDictionaryResults() {
  document.getElementById("globalResultsDivider").style.display = "none";
  document.getElementById("meanings").style.display = "none";
  document.getElementById("dictionaryText").style.display = "none";
}

function showDictionaryResults() {
  document.getElementById("globalResultsDivider").style.display = "block";
  document.getElementById("meanings").style.display = "block";
  document.getElementById("dictionaryText").style.display = "block";
}

mainWindow.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  contextMenu.style.display = "flex";
  contextMenu.style.top = e.y + "px";
  contextMenu.style.left = e.x + "px";
});

mainWindow.addEventListener("click", () => {
  contextMenu.style.display = "none";
});
