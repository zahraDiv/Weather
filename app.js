const search = document.getElementById("search");
const searchBtn = document.getElementById("searchBtn");

const mainWeatherCard = document.getElementById("mainWeatherCard");


// شهر پیش فرض//

loadWeather("Tehran");


// دکمه سرچ//


searchBtn.addEventListener("click", () => {

    const city = search.value.trim();

    if (city === "") {
        return;
    }

    loadWeather(city);

});



// با Enter هم سرچ شود//


search.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        const city = search.value.trim();

        if (city === "") {
            return;
        }

        loadWeather(city);

    }

});


// گرفتن اطلاعات شهر//


function loadWeather(city) {

    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`)
        .then(res => res.json())
        .then(data => {

            if (!data.results) {

                alert("City not found");

                return;
            }


            const location = data.results[0];


            const latitude = location.latitude;

            const longitude = location.longitude;


            // اسم شهر//

            document.getElementById("city").textContent = location.name;


            // کشور//

            const country = document.querySelector("#city") .nextElementSibling;

            country.textContent = location.country;


            // عکس شهر//
            loadCityImage(city, location.country);


            // گرفتن آب و هوای شهر//
            

            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,surface_pressure,visibility,weather_code,is_day&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&past_days=5&forecast_days=5&timezone=auto`)
                .then(res => res.json())
                .then(weather => {

                    showCurrentWeather(weather);

                    showHourlyWeather(weather);

                    showFiveDays(weather);

                    showPastDays(weather);

                });

        })
        .catch(error => {

            console.log(error);

        });

}



// عکس شهر//
// Wikimedia Commons API//



function loadCityImage(city) {

    const imageApi =`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${city}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url&iiurlwidth=1200&format=json&origin=*`;

    fetch(imageApi)
        .then(res => res.json())
        .then(data => {

            let pages = Object.values(data.query.pages);

            if (pages.length === 0) {
                return;
            }

            const image = pages[0].imageinfo[0].thumburl;

            mainWeatherCard.style.backgroundImage =
                `linear-gradient(
                    rgba(25, 45, 45, 0.48),
                    rgba(25, 45, 45, 0.62)
                ), url("${image}")`;

        })
        .catch(error => {

            console.log("City image error:", error);

        });

}



// اطلاعات فعلی//


function showCurrentWeather(weather) {

    const current = weather.current;


    // دما//

    document.getElementById("temp").textContent = Math.round(current.temperature_2m);


    // حس دما//

    document.getElementById("feel").textContent = Math.round(current.apparent_temperature);


    // رطوبت//

    document.getElementById("humidity").textContent = current.relative_humidity_2m + "%";


    // باد//

    document.getElementById("wind").textContent = Math.round(current.wind_speed_10m) + " km/h";


    // فشار //

    document.getElementById("pressure").textContent = Math.round(current.surface_pressure) + " hPa";


    // UV //

    document.getElementById("uv").textContent = weather.daily.uv_index_max[0];


    // وضعیت //

    document.getElementById("status").textContent = getWeatherText(current.weather_code);


    // آیکون //

    const icon = document.getElementById("icon");


    icon.className = "fa-solid " + getWeatherIcon(current.weather_code) + " text-6xl sm:text-7xl text-yellow-300";


    
    // More Details //
  

    const details = document.querySelectorAll(
            "section:first-child > div:nth-child(2) > div"
        );


    // Temperature //

    details[0] .querySelector("span:last-child")
        .textContent = Math.round(current.temperature_2m) + "°C";


    // Feels Like //

    details[1].querySelector("span:last-child")
        .textContent = Math.round(current.apparent_temperature) + "°C";


    // Humidity //

    details[2].querySelector("span:last-child")
        .textContent = current.relative_humidity_2m + "%";


    // Wind Speed //

    details[3].querySelector("span:last-child")
        .textContent = Math.round(current.wind_speed_10m) + " km/h";


    // Wind Direction //

    details[4].querySelector("span:last-child")
        .textContent = getWindDirection(current.wind_direction_10m);


    // Pressure //

    details[5].querySelector("span:last-child")
        .textContent = Math.round(current.surface_pressure) + " hPa";


    // Visibility //

    details[6] .querySelector("span:last-child")
        .textContent = Math.round(current.visibility / 1000) + " km";


    // UV //

    details[7] .querySelector("span:last-child")
        .textContent = weather.daily.uv_index_max[0];

}




// پیش بینی ساعتی //



function showHourlyWeather(weather) {

    const hourly = weather.hourly;


    const section = document.querySelectorAll("main > section")[1];


    const cards = section.querySelectorAll(
            ":scope > div:nth-child(2) > div"
        );


    // زمان فعلی API //

    const currentTime = weather.current.time;


    let startIndex = hourly.time.indexOf(currentTime);


    if (startIndex === -1) {
        startIndex = 0;
    }


    for (let i = 0; i < cards.length; i++) {

        const index = startIndex + i;


        if (index >= hourly.time.length) {
            break;
        }


        const date = new Date(hourly.time[index]);


        const time = date.toLocaleTimeString("en-US", {
                hour: "numeric"
            });


        // ساعت //

        cards[i].querySelector("p:first-child")
            .textContent =i === 0 ? "Now" : time;


        // دما //

        cards[i].querySelector("p:last-child")
            .textContent = Math.round(
                hourly.temperature_2m[index]
            ) + "°";


        // آیکون //

        const icon = cards[i].querySelector("i");


        icon.className = "fa-solid " + getWeatherIcon( hourly.weather_code[index]) + " text-2xl my-2";


        // رنگ آیکون //

        if (
            hourly.weather_code[index] === 0 ||
            hourly.weather_code[index] === 1 ||
            hourly.weather_code[index] === 2
        ) {

            icon.classList.add(
                "text-yellow-300"
            );

        }

    }

}




// پیش بینی 5 روزه //


function showFiveDays(weather) {

    const daily = weather.daily;


    const section = document.querySelectorAll("main > section")[2];


    const forecastBox = section.querySelector(
            "div:first-child"
        );


    const cards = forecastBox.querySelectorAll(
            ":scope > div:nth-child(2) > div"
        );


    // پیدا کردن امروز / /

    const today =  weather.current.time.slice(0, 10);


    const todayIndex = daily.time.indexOf(today);


    for (let i = 0; i < cards.length; i++) {

        const index = todayIndex + i;


        if (index >= daily.time.length) {
            break;
        }


        const card = cards[i];


        const date = new Date(daily.time[index]);


        const dayName = i === 0 ? "Today" : date.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );


        const dateText =
            date.toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    day: "numeric"
                }
            );


        // روز //

        card .querySelector("p:nth-child(1)") .textContent = dayName;


        // تاریخ //

        card.querySelector("p:nth-child(2)") .textContent = dateText;


        // آیکون //

        const icon = card.querySelector("i");


        icon.className = "fa-solid " + getWeatherIcon( daily.weather_code[index] ) + " text-2xl my-2";


        if (
            daily.weather_code[index] === 0 ||
            daily.weather_code[index] === 1 ||
            daily.weather_code[index] === 2
        ) {

            icon.classList.add(
                "text-yellow-300"
            );

        }


        // دمای بالا و پایین //

        card
            .querySelector(
                "p:nth-of-type(3)"
            )
            .textContent =
            Math.round(
                daily.temperature_2m_max[index]
            ) +
            "° / " +
            Math.round(
                daily.temperature_2m_min[index]
            ) +
            "°";


        // وضعیت //

        card
            .querySelector(
                "p:nth-of-type(4)"
            )
            .textContent =
            getWeatherText(
                daily.weather_code[index]
            );

    }

}



// روزهای گذشته //

function showPastDays(weather) {

    const daily = weather.daily;

    const section = document.querySelectorAll("main > section")[2];

    const pastBox = section.querySelector(
        "div:nth-child(2)"
    );

    const rows = pastBox.querySelectorAll(
        ":scope > div"
    );

    // تاریخ امروز //

    const today = weather.current.time.slice(0, 10);

    const todayIndex = daily.time.indexOf(today);

    for (let i = 0; i < 5; i++) {

        const index = todayIndex - 5 + i;

        if (index < 0) {
            continue;
        }

        const date = new Date(daily.time[index]);

        const day = date.toLocaleDateString(
            "en-US",
            {
                weekday: "short",
                month: "short",
                day: "numeric"
            }
        );

        const temperature =
            Math.round(
                daily.temperature_2m_max[index]
            ) +
            "° / " +
            Math.round(
                daily.temperature_2m_min[index]
            ) +
            "°";

        const icon = getWeatherEmoji(
            daily.weather_code[index]
        );

        rows[i + 1].querySelector(
            "span:first-child"
        ).textContent = day;

        rows[i + 1].querySelector(
            "span:last-child"
        ).textContent =
            icon + " " + temperature;
    }
}




// متن وضعیت هوا //


function getWeatherText(code) {

    if (code === 0) {
        return "Clear Sky";
    }

    if (code === 1) {
        return "Mainly Clear";
    }

    
    if (code === 2) {
        return "Partly Cloudy";
    }


    if (code === 3) {
        return "Overcast";
    }


    if (code === 45 || code === 48) {
        return "Fog";
    }


    if (code >= 51 && code <= 57) {
        return "Drizzle";
    }


    if (code >= 61 && code <= 67) {
        return "Rain";
    }


    if (code >= 71 && code <= 77) {
        return "Snow";
    }


    if (code >= 80 && code <= 82) {
        return "Rain Showers";
    }


    if (code >= 95) {
        return "Thunderstorm";
    }


    return "Weather";
}



// آیکون //


function getWeatherIcon(code) {

    if (code === 0) {
        return "fa-sun";
    }


    if (code === 1 || code === 2) {
        return "fa-cloud-sun";
    }


    if (code === 3) {
        return "fa-cloud";
    }


    if (code === 45 || code === 48) {
        return "fa-smog";
    }


    if (code >= 51 && code <= 67) {
        return "fa-cloud-rain";
    }


    if (code >= 71 && code <= 77) {
        return "fa-snowflake";
    }


    if (code >= 80 && code <= 82) {
        return "fa-cloud-showers-heavy";
    }


    if (code >= 95) {
        return "fa-cloud-bolt";
    }


    return "fa-cloud";
}




// جهت باد //

function getWindDirection(degree) {

    const directions = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"
    ];


    const index = Math.round(degree / 45) % 8;


    return directions[index];

}




// ایموجی برای Past Days //


function getWeatherEmoji(code) {

    if (code === 0) {
        return "☀️";
    }


    if (code === 1 || code === 2) {
        return "🌤️";
    }


    if (code === 3) {
        return "☁️";
    }


    if (code >= 51 && code <= 67) {
        return "🌧️";
    }


    if (code >= 71 && code <= 77) {
        return "❄️";
    }


    if (code >= 80 && code <= 82) {
        return "🌦️";
    }


    if (code >= 95) {
        return "⛈️";
    }


    return "🌤️";


}