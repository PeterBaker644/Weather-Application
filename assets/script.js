geolocator.config({
    language: "en",
    google: {
        version: "3",
        key: "AIzaSyC5-jsDZjmy1yPJYHoBgygH1tCwdSAmurE"
    }
});

window.onload = function () {
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumWait: 10000,     // max wait time for desired accuracy
        maximumAge: 0,          // disable cache
        desiredAccuracy: 30,    // meters
        fallbackToIP: true,     // fallback to IP if Geolocation fails or rejected
        addressLookup: true,    // requires Google API key if true
        timezone: true         // requires Google API key if true
    };
    geolocator.locate(options, function locate(err, location) {
        if (err) {
            updateMain = true;
            return console.log(err);
        }
        console.log(location);
        userCity.city = location.address.city;
        userCity.state = location.address.stateCode;
        userCity.country = location.address.countryCode;
        // will need to change with countries. Do later.
        $("#header-info").prepend(userCity.city + ", " + userCity.state);
        console.log("appended header");
        getCityWeather(userCity.city);
        $("#time").text(moment().format(" h:mma"));
        console.log("added time");
    });
};

 // 1

var userCity = { "city": "", "state": "", "country": ""}
var currentCity = { "city": "", "state": "", "country": "", "longitude": "", "latitude": "" }
var searchedCities = []
var addCity = true;
var updateMain = false;
// put this on a timer


// https://onury.io/geolocator/ <- Use this. And try to get it to work.

function getCityWeather(searchTerm) {
   
    geolocator.geocode(searchTerm, function (err, location) {
        if (err) {
            return console.log(err);
        }
        console.log(err || location);
        currentCity.city = location.address.city;
        if (location.address.countryCode == "US") {
            currentCity.state = location.address.stateCode;
        }
        currentCity.country = location.address.countryCode;
        currentCity.longitude = location.coords.longitude.toFixed(4);
        currentCity.latitude = location.coords.latitude.toFixed(4);
    });
             
    var cityURL = "https://api.openweathermap.org/data/2.5/weather?q=" + searchTerm + "&units=imperial&appid=be3bce43079bfb84af95f638fe28b8ec";

    $.ajax({
        url: cityURL,
        method: "GET",
    }).then(function (response) {
        console.log(response)
        // if (currentCity.country == "US") {

        // }
        // currentCity.name = response.name;
        // currentCity.country = response.sys.country;
        // currentCity.longitude = response.coord.lon;
        // currentCity.latitude = response.coord.lat; 

        weatherCode = response.weather[0].id;
        hourUnix = Number(moment.utc().format('X')); // Get current UTC
        hourOffset = Number(response.timezone); // Get UTC timezone offset
        hour = moment.unix(hourUnix + hourOffset).utc().format("H"); // Calculate UNIX timestamp
        sunrise = moment(response.sys.sunrise, 'X').format("H");
        sunset = moment(response.sys.sunset, 'X').format("H");

        iconClass = getIcon(Number(weatherCode), Number(hour), Number(sunrise), Number(sunset));
        
        if (updateMain) {
            if (currentCity.country !== "US") {
                $("#city-name").text(response.name + ", " + currentCity.country);
            } else {
                $("#city-name").text(response.name + ", " + currentCity.state);
            } 
            $("#wind-speed").html(`${Math.round(response.wind.speed)}<small>mph</small>`);
            $("#humidity").html(`${response.main.humidity}<small>%</small>`);
            $("#temperature").text(Math.round(response.main.temp) + "°");
            $("#i-weather-current").removeClass();
            $("#i-weather-current").addClass(iconClass);
            getForecast();
        } else {
            $("#header-icon").addClass(iconClass);
            $("#header-icon").text(" ")
            console.log("added class to icon");
            updateMain = true;
        }
        
        if (addCity) {
            saveName();
        } else {
            addCity = true;
        }
    });
}

function getForecast() {
    var oneCallURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${currentCity.latitude}&lon=${currentCity.longitude}&exclude=current,hourly&units=imperial&appid=be3bce43079bfb84af95f638fe28b8ec`

    $.ajax({
        url: oneCallURL,
        method: "GET",
    }).then(function (response) {
        console.log(response);
        // Touch this up add color, make function
        $("#uv-index").html(`${Math.round(response.daily[0].uvi)}<small>of 10</small>`);
        var i = 0;
        $(".forecast").each(function () {
            $(this).empty();
            // Add label for each day
            label = $("<p>")
            if (i > 1) {
                day = moment().add((i + 1), 'days').format("dddd");
                label.text(day);
            } else if (i == 1) {
                label.text("Tomorrow")
            } else {
                label.text("Today");
            }
            // label.addClass("lead");
            $(this).append(label);
            // Add an icon
            code = response.daily[i].weather[0].id;
            iconClass = getIcon(Number(code), 12, 0, 24);
            $(this).append($("<i>").addClass(iconClass).addClass("ficons"));
            // Add the Temperature
            temp = Math.round(response.daily[i].temp.day) + "°";
            $(this).append($("<div>").text(temp).addClass("ftext"));
            // Add humidity/percipitation
            humidity = response.daily[i].humidity;
            humidityIcon = $("<i>").addClass("wi wi-humidity");
            humidityText = $("<span>").text(humidity + " ");
            $(this).append($("<div>").append(humidityText, humidityIcon).addClass("small"));
            i++;
        })

    });
}

function getIcon(code, hour, sunrise, sunset) {
    console.log("sunrise is " + sunrise);
    console.log("sunset is " + sunset);
    console.log("hour is " + hour);
    console.log("code is " + code);
    if (hour >= sunrise && hour < sunset) {
        var iconClass = `wi wi-owm-day-${code}`;
    }
    else if (hour >= sunset || hour < sunrise) {
        var iconClass = `wi wi-owm-night-${code}`;
    }
    return (iconClass);
}

function saveName() {
    searchedCities.unshift({...currentCity});
    $("#city-list").empty();
    console.log("should be empty")
    for (val in searchedCities) {
        entry = searchedCities[val];
        // THIS IS TROUBLE
        console.log("log entry:" + entry);
        // needs to be changed if we start using state names
        if (entry.country !== "US") {
            fullName = entry.city + ", " + entry.country;
        } else {
            fullName = entry.city + ", " + entry.state;
        }
        button = $("<button>").text(fullName);
        button.attr("data-city", fullName)
        button.addClass("list-group-item list-group-item-action");
        $("#city-list").append(button);
        if (searchedCities.length >= 9) {
            searchedCities.pop();
        }
    }
}

$("#search-city").on("click", function (event) {
    event.preventDefault();
    getCityWeather($("#city-input").val());
    console.log("Request Attempted")
});

$("#city-list").on("click", function(event) {
    event.preventDefault();
    addCity = false;
    city = event.target.getAttribute("data-city");
    getCityWeather(city);
});

//Country parsing, state parsing, wind direction?, current place from browser