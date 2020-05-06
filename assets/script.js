var currentCity = { "name": "", "country": "", "longitude": "", "latitude": "" }
var searchedCities = []
var addCity = true;
// put this on a timer
$("#info-header").append(moment().format(" h:mma"));

// function geolocate() {
//     function success(position) {
//       const userLatitude  = position.coords.latitude;
//       const userLongitude = position.coords.longitude;
//     }
//     function error() {
//       alert('Unable to retrieve your location');
//     } 
//     if(!navigator.geolocation) {
//       alert('Geolocation is not supported by your browser');
//     } else {
//       navigator.geolocation.getCurrentPosition(success, error);
//     }
// }

function getCityWeather(city) {
    var cityURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=be3bce43079bfb84af95f638fe28b8ec";

    $.ajax({
        url: cityURL,
        method: "GET",
    }).then(function (response) {
        console.log(response)
        currentCity.name = response.name;
        currentCity.country = response.sys.country;
        currentCity.longitude = response.coord.lon;
        currentCity.latitude = response.coord.lat;

        var weatherCode = response.weather[0].id;
        var hourUnix = Number(moment.utc().format('X')); // Get current UTC
        var hourOffset = Number(response.timezone); // Get UTC timezone offset
        var hour = moment.unix(hourUnix + hourOffset).utc().format("H"); // Calculate UNIX timestamp
        sunrise = moment(response.sys.sunrise, 'X').format("H");
        sunset = moment(response.sys.sunset, 'X').format("H");

        iconClass = getIcon(Number(weatherCode), Number(hour), Number(sunrise), Number(sunset));

        $("#city-name").text(response.name + ", " + response.sys.country);
        $("#wind-speed").html(`${Math.round(response.wind.speed)}<small>mph</small>`);
        $("#humidity").html(`${response.main.humidity}<small>%</small>`);
        $("#temperature").text(Math.round(response.main.temp) + "°");
        $("#i-weather-current").removeClass();
        $("#i-weather-current").addClass(iconClass);

        getForecast();
        
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
        console.log("log entry:" + entry);
        button = $("<button>").text(entry.name + ", " + entry.country);
        button.addClass("list-group-item list-group-item-action");
        // This line might need to chnge in the future depending on contents
        button.attr("data-city", entry.name);
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