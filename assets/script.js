var currentCity = { name: "", longitude: "", latitude: "" }

function getCityWeather() {
    var city = $("#city-input").val();
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=be3bce43079bfb84af95f638fe28b8ec";

    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function (response) {
        console.log(response)
        currentCity.name = response.name;
        currentCity.longitude = response.coord.lon;
        currentCity.latitude = response.coord.lat;

        var weatherCode = response.weather[0].id;
        var hourUnix = Number(moment.utc().format('X')); // Get current UTC
        var hourOffset = Number(response.timezone); // Get UTC offset
        var hour = moment.unix(hourUnix + hourOffset).utc().format("H"); // Calculate UNIX time
        const sunrise = moment(response.sys.sunrise, 'X').format("H");
        const sunset = moment(response.sys.sunset, 'X').format("H");

        console.log("sunrise is " + sunrise);
        console.log("sunset is " + sunset);
        console.log("hour is " + hour);

        iconClass = getIcon(weatherCode, hour, sunrise, sunset);

        $("#city-name").text(response.name + "," + response.sys.country);
        $("#wind-speed").text(`Wind: ${response.wind.speed}`);
        $("#humidity").text(`Humidity: ${response.main.humidity}`);
        $("#temperature").text(Math.round(response.main.temp) + "°");
        $("#i-weather-current").addClass(iconClass);
    });
}

function getIcon (code, hour, sunrise, sunset) {
    if (hour >= sunrise && hour < sunset) {
        var iconClass = `wi wi-owm-day-${code}`;
    }
    else if (hour >= sunset || hour < sunrise) {
        var iconClass = `wi wi-owm-night-${code}`;
    }
    return(iconClass);
}

$("#search-city").on("click", function (event) {
    event.preventDefault();
    getCityWeather();
    console.log("Request Attempted")
});