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
    }

    // Search Browser
    fetch(`http://api.serpstack.com/search?access_key=ca8de4c4392bbc1b28156c16c8f76ef0&query=${cadbury.value}`)
        .then((response) => {
            return response.json();
    }).then(focusBrowser);
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
    console.log(data);
    // let pages = data.query.pages;

    browserResults.innerHTML =
        `
    <img class="loader" src="./assets/loading_spinner.gif">
    `

    setTimeout(() => {
        if (data.success == false) {
            browserResults.innerHTML =
                `
            <span class="error">There was a problem loading browser results</span>
            `
        }
    }, 3000);

    let article1 = {
        imageURL: data.inline_images[0].image_url,
        title: data.organic_results[0].title,
        url: data.organic_results[0].url,
        snippet: data.organic_results[0].snippet,
    };
    let article2 = {
        imageURL: data.inline_images[1].image_url,
        title: data.organic_results[1].title,
        url: data.organic_results[1].url,
        snippet: data.organic_results[1].snippet,
    };
    let article3 = {
        imageURL: data.inline_images[2].image_url,
        title: data.organic_results[2].title,
        url: data.organic_results[2].url,
        snippet: data.organic_results[2].snippet,
    };
    console.log(article1);

    browserResults.innerHTML =
        `
    <li class="search_result_li">
        <div class="search_result_div">
        <h3>${article1.title}</h3>
        <p>${article1.snippet}</p>
        </div>
    </li>
    <li class="search_result_li">
        <div class="search_result_div">
        <h3>${article2.title}</h3>
        <p>${article2.snippet}</p>
        </div>
    </li>
    <li class="search_result_li">
        <div class="search_result_div">
        <h3>${article3.title}</h3>
        <p>${article3.snippet}</p>
        </div>
    </li>
    `
}