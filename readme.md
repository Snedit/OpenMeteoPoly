

# 🌦️ Weather Polygon Dashboard

A weather analytics dashboard built with Next.js, TypeScript, ShadCN UI, and Leaflet, allowing users to draw polygons on a map, connect them with weather data from the [Open-Meteo API](https://open-meteo.com/), and customize visualization rules.

---

## Features

-  Interactive Map using Leaflet
-  Polygon drawing & selection
-  Real-time and historical weather data
-  Color rules based on weather thresholds
-  Slider to pick time ranges
-  Rate-limited API requests
-  Modern stack (Next.js, Zustand, TypeScript)

---

## 📦 Installation

```bash
git clone https://github.com/Snedit/OpenMeteoPoly.git
cd OpenMeteoPoly
npm install
npm run dev
````

## 🌐 Map Details

* Uses **React-Leaflet** for rendering the interactive map.
* Users can:

  * Draw polygons directly on the map.
  * Select a polygon to configure settings.
  * Associate weather data to the polygon by selecting a data source (e.g., temperature, humidity).
* Each polygon visualizes a color based on real-time or average weather values.

---

## 🎚️ Slider Details

* A timeline/slider is provided to:

  * Pick a specific **hour**.
  * Select a **range of hours** to calculate average values.
* The slider dynamically updates polygon colors based on selected value(s).

---

##  Color Rules

* Each polygon can have multiple **color rules** like:

  ```json
  [
    { "min": 0, "max": 10, "color": "#00bcd4" },
    { "min": 11, "max": 20, "color": "#4caf50" }
  ]
  ```
* These rules map weather values to colors.
* You can add/remove/edit color rules for each polygon from the sidebar.

---

## 📡 Weather API (Open-Meteo)

The app fetches weather data from:

```
https://archive-api.open-meteo.com/v1/archive
```

With parameters:

* `latitude`, `longitude` → From polygon centroid
* `start_date`, `end_date` → Based on slider selection
* `hourly`: `"temperature_2m,relative_humidity_2m"`
* `timezone`: `"auto"`

> ⚠️ The app includes an **in-memory rate limiter** to prevent spamming the API (30 request per unique lat/lng/date combo per minute)

---

## 🧠 State Management

* Uses [Zustand](https://github.com/pmndrs/zustand) for global app state:

  * Polygons
  * Selected polygon
  * Data sources
  * Sidebar state

---

## 🛠 Development Scripts

```bash
npm run dev       # Run in dev mode
npm run build     # Build for production
```

---
## 📜 License

MIT License. Open to contributions!



## 🧑‍💻 Author

Made with ❤️ by [Soham De](https://github.com/Snedit)


