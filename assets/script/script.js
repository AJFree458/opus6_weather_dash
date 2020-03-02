//Local Storage saved
var savedCities = [];
var currentCity;

function initialize() {
    // Get previous Cities from local storage
    savedCities = JSON.parse(localStorage.getItem("weathercities"));
    var lastSearch;
    // Display last searches
    if (savedCities) {
        // Retrieve the last city
        currentCity = savedCities[savedCities.length - 1];
        showPrev();
        getCurrent(currentCity);
    }
    else {
        getCurrent("Charlotte");
    }
}

function showPrev() {
    // Display the previous city searches from local storage
    if (savedCities) {
        $("#prevCities").empty();
        var btns = $("<div>").attr("class", "list-group");
        for (var i = 0; i < savedCities.length; i++) {
            var locBtn = $("<a>").attr("href", "#").attr("id", "loc-btn").text(savedCities[i]);
            if (savedCities[i] == currentCity) {
                locBtn.attr("class", "list-group-item list-group-item-action active");
            }
            else {
                locBtn.attr("class", "list-group-item list-group-item-action");
            }
            btns.prepend(locBtn);
        }
        $("#prevCities").append(btns);
    }
}

function getCurrent(city) {
    var queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=7eec630e32e425a54546a905cc476a3a&units=imperial";
    $.ajax({
        url: queryUrl,
        method: "GET",
        error: function() {
            savedCities.splice(savedCities.indexOf(city), 1);
            localStorage.setItem("weathercities", JSON.stringify(savedCities));
            initialize();
        }
        
    }).then(function(response){
        // console.log(response);
        // Create the card
        var currCard = $("<div>").attr("class", "card bg-light");
        $("#currentCityWeather").append(currCard);

        // Location add to card header
        var currCardHead = $("<div>").attr("class", "card-header").text("Current weather for " + response.name);
        currCard.append(currCardHead);

        var cardRow = $("<div>").attr("class", "row no-gutters");
        currCard.append(cardRow);

        // get icons for weather conditions
        var iconURL = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";

        var imgDiv = $("<div>").attr("class", "col-md-4").append($("<img>").attr("src", iconURL).attr("class", "card-img"));
        cardRow.append(imgDiv);

        var textDiv = $("<div>").attr("class", "col-md-8");
        var cardBody = $("<div>").attr("class", "card-body");
        textDiv.append(cardBody);
        //City name
        cardBody.append($("<h3>").attr("class", "card-title").text(response.name));
        // Last update display
        var currDate = moment(response.dt, "X").format("dddd, MMMM Do YYY, h:mm a");
        cardBody.append($("<p>").attr("class", "card-text").append($("<small>").attr("class", "text-muted").text("Last updated: " + currDate)));
        // Temperature display
        cardBody.append($("<p>").attr("class", "card-text").html("Temperature: " + response.main.temp + " &#8457;"));
        // Humidity
        cardBody.append($("<p>").attr("class", "card-text").html("Humidity: " + response.main.humidity + "%"));
        // Wind Speed
        cardBody.append($("<p>").attr("class", "card-text").html("Wind Speed: " + response.wind.speed + "MPH"));

        //UV Index
        var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=7eec630e32e425a54546a905cc476a3a&lat=" + response.coord.lat + "&lon=" + response.coord.lat;
        $.ajax({
            url: uvURL,
            method: "GET"
        }).then(function (uvresponse){
            var uvindex = uvresponse.value;
            var bgcolor;
            if (uvindex <= 3) {
                bgcolor = "green";
            }
            else if (uvindex >= 3 || uvindex <= 6) {
                bgcolor = "yellow";
            }
            else if (uvindex >= 6 || uvindex <= 8) {
                bgcolor = "orange";
            }
            else {
                bgcolor = "red";
            }
            var uvDisplay = $("<p>").attr("class", "card-text").text("UV Index: ");
            uvDisplay.append($("<span>").attr("class", "uvindex").attr("style", ("background-color:" + bgcolor)).text(uvindex));
            cardBody.append(uvDisplay);

        });
        cardRow.append(textDiv);
        getForecast(response.id);

    });
}

// Retrieve the forecast
function getForecast(city) {
    // Retrieve the 5 Day Forecast using the API
    var queryUrl = "https://api.openweathermap.org/data/2.5/forecast?id=" + city + "&appid=7eec630e32e425a54546a905cc476a3a&units=imperial";
    $.ajax({
        url: queryUrl,
        method: "GET"
    }).then(function (response) {
        // Make a container div for the forecast cards
        var newRow = $("<div>").attr("class", "forecast");
        $("#currentCityWeather").append(newRow);

        // Loop through the response array for the forecasts for 15:00
        for (var i = 0; i < response.list.length; i++) {
            if (response.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                var newCol = $("<div>").attr("class", "one-fifth");
                newRow.append(newCol);

                var newCard = $("<div>").attr("class", "card text-white bg-primary");
                newCol.append(newCard);

                var cardImg = $("<img>").attr("class", "card-img-top").attr("src", "https://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + "@2x.png");
                newCard.append(cardImg);

                var bodyDiv = $("<div>").attr("class", "card-body");
                newCard.append(bodyDiv);

                bodyDiv.append($("<p>").attr("class", "card-text").html("Temp: " + response.list[i].main.temp + " &#8457;"));
                bodyDiv.append($("<p>").attr("class", "card-text").text("Humidity: " + response.list[i].main.humidity + "%"));
            }
        }
    });
}

function clear() {
    //Clear the weather
    $("#currentCityWeather").empty();
}

function saveCity(loc) {
    if (savedCities === null) {
        savedCities = [loc];
    }
    else if (savedCities.indexOf(loc) === -1) {
        savedCities.push(loc);
    }
    // Save the array to local storage
    localStorage.setItem("weathercities", JSON.stringify(savedCities));
    showPrev();
}

$("#searchBtn").on("click", function() {
    // Prevent refresh
    event.preventDefault();
    // Retrieve the input value
    var loc = $("#searchCity").val().trim();
    // If the loc var has something
    if (loc !== "") {
        // Clear the forecast
        clear();
        currentCity = loc;
        saveCity(loc);
        // Clear the search field
        $("#searchCity").val("");
        // Retrieve the new forecast
        getCurrent(loc);
    }
});

$(document).on("click", "#loc-btn", function() {
    clear();
    currentCity = $(this).text();
    showPrev();
    getCurrent(currentCity);
});

initialize();