import { useState, useEffect } from "react";
import styles from "./App.module.scss";
import "./App.css";
import { getMeteoByLatLng } from "./Api/Meteo";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import dayjs from "dayjs";

import {
  clothingSuggestionsMen,
  clothingSuggestionsWomen,
} from "./Constant/suggestion";
import { Daily, Meteo } from "./Type/meteo.type";
import ForecastDay from "./Components/ForecastDay/ForecastDay";


function App() {
  const [meteo, setMeteo] = useState<Meteo | null | undefined>(null);
  const [lat, setLat] = useState<number>(0);
  const [lng, setLng] = useState<number>(0);
  const [address, setAddress] = useState<string>("");
  const [weatherType, setWeatherType] = useState<string>("");
  const [daySelected, setDaySelected] = useState<number>(0);
  const [dayName, setDayName] = useState<string>("Aujourd'hui");

  useEffect(() => {
    async function getMeteo() {
      if (lat !== 0 && lng !== 0) {
        const meteoData = await getMeteoByLatLng(lat, lng);
        setMeteo(meteoData);

        if (meteoData && meteoData.current.weather[0].main) {
          setWeatherType(meteoData.current.weather[0].main.toLowerCase());
        }
      }
    }

    getMeteo();
  }, [lat, lng]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleSelect = async (selected: string) => {
    setAddress(selected);

    try {
      const results = await geocodeByAddress(selected);
      const latLng = await getLatLng(results[0]);

      setLat(latLng.lat);
      setLng(latLng.lng);
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
  };

  const handleDaySelect = (index: number) => {
    if (meteo && meteo.daily && meteo.daily[index]) {
      const selectedDay = meteo.daily[index];
      setDaySelected(index);

      if (index === 0) {
        setDayName("Aujourd'hui");
      } else if (index === 1) {
        setDayName("Demain");
      } else {
        setDayName(dayjs(selectedDay.dt * 1000).format("DD/MM/YYYY"));
      }

      setWeatherType(selectedDay.weather[0].main.toLowerCase());

      setMeteo({
        ...meteo,
        current: {
          temp: selectedDay.temp.day,
          weather: selectedDay.weather,
          uvi: selectedDay.uvi,
          humidity: selectedDay.humidity,
          wind_speed: selectedDay.wind_speed,
          sunset: selectedDay.sunset,
          sunrise: selectedDay.sunrise,
          pressure: selectedDay.pressure,
          clouds: selectedDay.clouds,
          dew_point: selectedDay.dew_point,
          dt: selectedDay.dt,
          wind_deg: selectedDay.wind_deg,
        },
      });
    }
  };

  return (
    <div className={styles.app}>
      <div className={styles.background}>
        {weatherType !== "" && (
          <video autoPlay muted src={`${weatherType}.mp4`} loop id="myVideo" />
        )}
      </div>
      <div className={styles.container}>
        <svg className="logo"
viewBox="0 0 256 116" xmlns="http://www.w3.org/2000/svg" width="256" height="116" preserveAspectRatio="xMidYMid"><path fill="#FFF" d="m202.357 49.394-5.311-2.124C172.085 103.434 72.786 69.289 66.81 85.997c-.996 11.286 54.227 2.146 93.706 4.059 12.039.583 18.076 9.671 12.964 24.484l10.069.031c11.615-36.209 48.683-17.73 50.232-29.68-2.545-7.857-42.601 0-31.425-35.497Z"/><path fill="#F4811F" d="M176.332 108.348c1.593-5.31 1.062-10.622-1.593-13.809-2.656-3.187-6.374-5.31-11.154-5.842L71.17 87.634c-.531 0-1.062-.53-1.593-.53-.531-.532-.531-1.063 0-1.594.531-1.062 1.062-1.594 2.124-1.594l92.946-1.062c11.154-.53 22.839-9.56 27.087-20.182l5.312-13.809c0-.532.531-1.063 0-1.594C191.203 20.182 166.772 0 138.091 0 111.535 0 88.697 16.995 80.73 40.896c-5.311-3.718-11.684-5.843-19.12-5.31-12.747 1.061-22.838 11.683-24.432 24.43-.531 3.187 0 6.374.532 9.56C16.996 70.107 0 87.103 0 108.348c0 2.124 0 3.718.531 5.842 0 1.063 1.062 1.594 1.594 1.594h170.489c1.062 0 2.125-.53 2.125-1.594l1.593-5.842Z"/><path fill="#FAAD3F" d="M205.544 48.863h-2.656c-.531 0-1.062.53-1.593 1.062l-3.718 12.747c-1.593 5.31-1.062 10.623 1.594 13.809 2.655 3.187 6.373 5.31 11.153 5.843l19.652 1.062c.53 0 1.062.53 1.593.53.53.532.53 1.063 0 1.594-.531 1.063-1.062 1.594-2.125 1.594l-20.182 1.062c-11.154.53-22.838 9.56-27.087 20.182l-1.063 4.78c-.531.532 0 1.594 1.063 1.594h70.108c1.062 0 1.593-.531 1.593-1.593 1.062-4.25 2.124-9.03 2.124-13.81 0-27.618-22.838-50.456-50.456-50.456"/></svg>
        <div className={styles.meteo}>
          <div className={styles.meteo__header}>
            <PlacesAutocomplete
              value={address}
              onChange={setAddress}
              onSelect={handleSelect}
            >
              {({
                getInputProps,
                suggestions,
                getSuggestionItemProps,
                loading,
              }) => (
                <div>
                  <input
                    {...getInputProps({
                      placeholder: "Rechercher une ville...",
                      className: styles.locationSearchInput,
                    })}
                  />
                  {suggestions.length > 0 && (
                    <div className={styles.autocompleteDropdownContainer}>
                      {loading && <div>Loading...</div>}
                      {suggestions.map((suggestion) => {
                        const className = suggestion.active
                          ? styles.suggestionItemActive
                          : styles.suggestionItem;

                        return (
                          <div
                            {...getSuggestionItemProps(suggestion, {
                              className,
                            })}
                          >
                            {suggestion.description}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </PlacesAutocomplete>
          </div>
          {meteo && meteo.current.weather[0].main && (
            <div className={styles.meteo__body}>
              <p className={styles.meteo__day}>{dayName}</p>
              <p className={styles.meteo__degree}>{meteo.current.temp}°C</p>

              <div className={styles.meteo__grid}>
                <div className={styles.meteo__icon}>
                  <img src="/season.png" width="32" height="32" />
                  {meteo.current.weather[0].description}
                </div>
                <div className={styles.meteo__icon}>
                  <img src="/uv-index.png" width="32" height="32" />
                  {meteo.current.uvi}
                </div>
                <div className={styles.meteo__icon}>
                  <img src="/humidity.png" width="32" height="32" />
                  {meteo.current.humidity}%
                </div>
                <div className={styles.meteo__icon}>
                  <img src="/wind-turbine.png" width="32" height="32" />
                  {meteo.current.wind_speed} km/h
                </div>
                <div className={styles.meteo__icon}>
                  <img src="/sunrise.png" width="32" height="32" />
                  {formatTime(meteo.current.sunrise)} -{" "}
                  {formatTime(meteo.current.sunset)}
                </div>
                <div className={styles.meteo__icon}>
                  <img src="/atmospheric.png" width="32" height="32" />
                  {meteo.current.pressure} hPa
                </div>
              </div>

              <p className={styles.suggestions}>
                {clothingSuggestionsMen[meteo.current.weather[0].main] &&
                  clothingSuggestionsMen[meteo.current.weather[0].main][
                    meteo.current.temp > 30
                      ? "Hot"
                      : meteo.current.temp > 20
                      ? "Warm"
                      : meteo.current.temp > 15
                      ? "Cool"
                      : "Cold"
                  ] &&
                  `Homme : ${
                    clothingSuggestionsMen[meteo.current.weather[0].main][
                      meteo.current.temp > 30
                        ? "Hot"
                        : meteo.current.temp > 20
                        ? "Warm"
                        : meteo.current.temp > 15
                        ? "Cool"
                        : "Cold"
                    ]
                  }`}
                <br />
                <br />
                {clothingSuggestionsWomen[meteo.current.weather[0].main] &&
                  clothingSuggestionsWomen[meteo.current.weather[0].main][
                    meteo.current.temp > 30
                      ? "Hot"
                      : meteo.current.temp > 20
                      ? "Warm"
                      : meteo.current.temp > 15
                      ? "Cool"
                      : "Cold"
                  ] &&
                  `Femme : ${
                    clothingSuggestionsWomen[meteo.current.weather[0].main][
                      meteo.current.temp > 30
                        ? "Hot"
                        : meteo.current.temp > 20
                        ? "Warm"
                        : meteo.current.temp > 15
                        ? "Cool"
                        : "Cold"
                    ]
                  }`}
              </p>
            </div>
          )}
          {meteo && meteo.daily && (
            <div className={styles.meteo__forecast}>
              <h2>Les prochains jours</h2>
              <div className={styles.forecastDays}>
                {meteo.daily.map((dayData: Daily, index: number) => (
                  <ForecastDay
                    key={index}
                    index={index}
                    dayData={dayData}
                    daySelected={daySelected}
                    handleDaySelect={handleDaySelect}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
// created with <3  by Jonathan DIKIZEYIKO
