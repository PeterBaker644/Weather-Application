var currentCity = { name: "", longitude: "", latitude: "" }

function getCityWeather() {
    var city = $("#city-input").val();
    var cityURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=be3bce43079bfb84af95f638fe28b8ec";

    $.ajax({
        url: cityURL,
        method: "GET",
    }).then(function (response) {
        console.log(response)
        currentCity.name = response.name;
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

$("#search-city").on("click", function (event) {
    event.preventDefault();
    getCityWeather();
    console.log("Request Attempted")
});

//Country parsing, state parsing, wind direction?, current place from browser