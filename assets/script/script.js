// Create API const
const APIKey = "7eec630e32e425a54546a905cc476a3a";
// Create var for current day card
var cardHeader = $("#cardHead");
var cardDate = $("#updateTime");
var cityName = $("#city");
var tempCity = $("#temp");
var humidCity = $("#humid");
var windCity = $("#wind");
var uvDisplay = $("#uvText");
// Create var for saved city buttons
var btns = $("#cityBtns");
//create var for new row in forecasts
var newRow = $("<div>").attr("class", "forecast");
//Local Storage saved
var savedCities = [];
var currentCity;

function initialize() {
    // Get previous Cities from local storage
    savedCities = JSON.parse(localStorage.getItem("weathercities"));

    // Display last searches
    if (savedCities !== null) {
        // Retrieve the last city
        currentCity = savedCities[savedCities.length - 1];
        // Display previous cities
        if (savedCities) {
            $("#prevCities").empty();
    
            for (var i = 0; i < savedCities.length; i++) {
                var locationBtn = $("<button>").attr("id", "locationBtn").text(savedCities[i]);
                if (savedCities[i] == currentCity) {
                    locationBtn.attr("class", "list-group-item list-group-item-action");
                }
                else {
                    locationBtn.attr("class", "list-group-item list-group-item-action");
                }
                btns.prepend(locationBtn);
            }
            $("#prevCities").append(btns);
        }
        getCurrent(currentCity);
    }
    else {
        getCurrent("Charlotte");
    }
}

function setLocal() {
    savedCities.splice(savedCities.indexOf(city), 1);
    localStorage.setItem("weathercities", JSON.stringify(savedCities));
    initialize();
}

function saveCity(location) {
    if (savedCities === null) {
        savedCities = [location];
    }
    else if (savedCities.indexOf(location) === -1) {
        savedCities.push(location);
    }
    // Save the array to local storage
    localStorage.setItem("weathercities", JSON.stringify(savedCities));
}

function getCurrent(city) {
    var queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey + "&units=imperial";
    $.ajax({
        url: queryUrl,
        method: "GET"
    }).then(function(response){
        console.log(response);
        
        // Location add to card header
        var currCardHead = response.name;
        cardHeader.text(currCardHead);

        // Last update display
        var currDate = moment(response.dt, "X").format("LLLL");
        cardDate.text(currDate);

        //City name
        cityName.text(response.name);
        // Temperature display
        tempCity.text(response.main.temp);
        // Humidity
        humidCity.text(response.main.humidity);
        // Wind Speed
        windCity.text(response.wind.speed);

        // get icons for weather conditions
        var iconURL = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";

        var imgDiv = $("<img>").attr("src", iconURL).attr("class", "card-img");
        $("#weatherImg").append(imgDiv);

        //UV Index
        var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + response.coord.lat + "&lon=" + response.coord.lat;
        $.ajax({
            url: uvURL,
            method: "GET"
        }).then(function (uvresponse){
            console.log(uvresponse);
            var uvindex = uvresponse.value;
            var uvColor;
            if (uvindex <= 3) {
                uvColor = "green";
            }
            else if (uvindex >= 3 || uvindex <= 6) {
                uvColor = "yellow";
            }
            else if (uvindex >= 6 || uvindex <= 8) {
                uvColor = "orange";
            }
            else if (uvindex >= 8 || uvindex <= 10) {
                uvColor = "red";
            }
            else {
                uvColor = "violet";
            }
            uvDisplay.attr("class", "uvindex").attr("style", ("background-color:" + uvColor)).text(uvindex);

        });
        getForecast(response.id);

    });
}

// Retrieve the forecast
function getForecast(city) {
    // Retrieve the 5 Day Forecast using the API
    var queryUrl = "https://api.openweathermap.org/data/2.5/forecast?id=" + city + "&appid=" + APIKey + "&units=imperial";
    $.ajax({
        url: queryUrl,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        // Make a container div for the forecast cards
        
        $("#forecastDay").append(newRow);

        // Loop through the response array for the forecasts
        for (var i = 5; i < response.list.length; i += 8) {

            var newCard = $("<div>").attr("class", "card text-white bg-primary col-md one-fifth");
            newRow.append(newCard);

            var forecastDate = moment(response.list[i].dt, "X").format("dddd, MMMM Do YYYY");
            var cardHead = $("<div>").attr("class", "card-header");
            var headH5 = $("<h5>").text(forecastDate);
            newCard.append(cardHead);
            cardHead.append(headH5);

            var cardImg = $("<img>").attr("class", "card-img-top").attr("src", "https://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + "@2x.png");
            newCard.append(cardImg);

            var bodyDiv = $("<div>").attr("class", "card-body");
            newCard.append(bodyDiv);

            bodyDiv.append($("<p>").attr("class", "card-text").html("Temp: " + response.list[i].main.temp + " &#8457;"));
            bodyDiv.append($("<p>").attr("class", "card-text").text("Humidity: " + response.list[i].main.humidity + "%"));            
        }
    });
}

$("#searchBtn").on("click", function() {
    // Retrieve the input value
    var location = $("#searchCity").val().trim();
    // If the location var has something
    if (location !== "") {
        // Clear the forecast
        $("#currentCityWeather").empty();
        currentCity = location;
        saveCity(location);
        // Clear the search field
        $("#searchCity").val("");
        // Retrieve the new forecast
        getCurrent(location);
    }
});

$("#locationBtn").on("click", function() {
    $("#currentCityWeather").empty();
    currentCity = $(this).text();
    initialize();
    getCurrent(currentCity);
});

$(document).ready(function() {
    initialize();
})
