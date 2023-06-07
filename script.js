// URL of the GeoJSON feed
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Fetch the JSON data
fetch(url)
  .then(response => response.json())
  .then(data => {
    // Create the map
    const map = L.map('map').setView([0, 0], 2);

    // Create a tile layer (optional)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

    // Define a function to get the color based on depth
    function getColor(depth) {
      const colors = ['#fef0d9', '#fdcc8a', '#fc8d59', '#e34a33', '#b30000', '#7f0000'];
      for (let i = 0; i < colors.length; i++) {
        if (depth < i * 20) {
          return colors[i];
        }
      }
      return colors[colors.length - 1];
    }

    // Iterate over the features and create markers
    data.features.forEach(feature => {
      const coordinates = feature.geometry.coordinates;
      const magnitude = feature.properties.mag;
      const depth = coordinates[2];

      // Define marker options based on magnitude and depth
      const markerOptions = {
        radius: magnitude * 2,
        color: getColor(depth),
        fillColor: getColor(depth),
        fillOpacity: 0.7
      };

      // Create the marker
      const marker = L.circleMarker([coordinates[1], coordinates[0]], markerOptions).addTo(map);

      // Create a popup for additional information
      const popupContent = `
        <h3>${feature.properties.title}</h3>
        <p>Magnitude: ${magnitude}</p>
        <p>Depth: ${depth} km</p>
      `;
      marker.bindPopup(popupContent);
    });

    // Create a legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function(map) {
      const div = L.DomUtil.create('div', 'info legend');
      const grades = [0, 20, 40, 60, 80, 100];
      const labels = [];

      for (let i = 0; i < grades.length; i++) {
        div.innerHTML += `
          <i style="background:${getColor(grades[i] + 1)}"></i>
          ${grades[i]}${grades[i + 1] ? '&ndash;' + grades[i + 1] + ' km' : '+'}<br>
        `;
      }

      return div;
    };
    legend.addTo(map);
  })
  .catch(error => {
    console.log("An error occurred while fetching the earthquake data:", error);
  });
