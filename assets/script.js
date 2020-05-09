var currentCity = { "city": "", "state": "", "country": "", "longitude": "", "latitude": "" };
var searchedCities = [];
var saveLocation = false;
var writeHeader = true;

geolocator.config({
    language: "en",
    google: {
        version: "3",
        key: "AIzaSyC5-jsDZjmy1yPJYHoBgygH1tCwdSAmurE"
    }
});

window.onload = function () {
    if (localStorage.getItem("history") !== null) {
        searchedCities = JSON.parse(localStorage.getItem("history"));
        listLocation();
    }
    var options = {
        addressLookup: true,    // requires Google API key if true
    };
    geolocator.locateByIP(options, function locate(err, location) {
        if (err) {
            return console.log(err);
        }
        getCityWeather(location.address.city);
        $("#time").text(moment().format(" h:mma"));
    });
};

function fullName(list) {
    if (list.country !== "US") {
        var fullName = list.city + ", " + list.country;
    } else {
        var fullName = list.city + ", " + list.state;
    }
    return fullName;
}

function getCityWeather(city) {

    geolocator.geocode(city, function (err, location) {
        if (err) {
            return console.log(err);
        }
        currentCity.city = location.address.city;
        if (location.address.countryCode == "US") {
            currentCity.state = location.address.stateCode;
        }
        currentCity.country = location.address.countryCode;
        currentCity.longitude = location.coords.longitude.toFixed(4);
        currentCity.latitude = location.coords.latitude.toFixed(4);

        var cityURL = "https://api.openweathermap.org/data/2.5/weather?q=" + currentCity.city + "&units=imperial&appid=be3bce43079bfb84af95f638fe28b8ec";

        $.ajax({
            url: cityURL,
            method: "GET",
        }).then(function (response) {
            console.log(response)
            
            weatherCode = response.weather[0].id;
            hourUnix = Number(moment.utc().format('X')); // Get current UTC
            hourOffset = Number(response.timezone); // Get UTC timezone offset
            hour = moment.unix(hourUnix + hourOffset).utc().format("H"); // Calculate UNIX timestamp
            sunrise = moment(response.sys.sunrise, 'X').format("H");
            sunset = moment(response.sys.sunset, 'X').format("H");

            iconClass = getIcon(Number(weatherCode), Number(hour), Number(sunrise), Number(sunset));
            
            // if (updateMain) {
                $("#city-name").text(fullName(currentCity));
                $("#wind-speed").html(`${Math.round(response.wind.speed)}<small>mph</small>`);
                $("#humidity").html(`${response.main.humidity}<small>%</small>`);
                $("#temperature").text(Math.round(response.main.temp) + "°");
                $("#i-weather-current").removeClass();
                $("#i-weather-current").addClass(iconClass);
                getForecast();
            // }
            if (writeHeader) {
                $("#header-info").prepend(fullName(currentCity) + " ");
                $("#header-icon").addClass(iconClass);
                $("#header-icon").text(" ")
                console.log("added class to icon");
                writeHeader = false;
            }
        });
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
        if (saveLocation) {
            searchedCities.unshift({...currentCity});
            listLocation();
            saveLocation = false;
        }
    });
}

function getIcon(code, hour, sunrise, sunset) {
    if (hour >= sunrise && hour < sunset) {
        var iconClass = `wi wi-owm-day-${code}`;
    }
    else if (hour >= sunset || hour < sunrise) {
        var iconClass = `wi wi-owm-night-${code}`;
    }
    return (iconClass);
}

function listLocation() {
    localStorage.setItem("history", JSON.stringify(searchedCities));
    $("#city-list").empty();
    for (val in searchedCities) {
        entry = searchedCities[val];
        console.log
        button = $("<button>").text(fullName(entry));
        button.attr("data-city", fullName(entry));
        button.addClass("list-group-item list-group-item-action");
        $("#city-list").append(button);
        if (searchedCities.length >= 9) {
            searchedCities.pop();
        }
    }
}

$("#search-city").on("click", function (event) {
    event.preventDefault();
    saveLocation = true;
    getCityWeather($("#city-input").val());
    $("#city-input").val("");
});

$("#city-list").on("click", function(event) {
    event.preventDefault();
    city = event.target.getAttribute("data-city");
    getCityWeather(city);
});

//Country parsing, state parsing, wind direction?, current place from browser