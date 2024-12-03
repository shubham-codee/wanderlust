maptilersdk.config.apiKey = mapToken;
coordinates = JSON.parse(coordinates);
const map = new maptilersdk.Map({
    container: 'map', // container's id or the HTML element in which the SDK will render the map
    style: maptilersdk.MapStyle.STREETS,
    center: coordinates, // starting position [lng, lat]
    zoom: 15 // starting zoom
});

console.log(title);

const marker = new maptilersdk.Marker({
    color: "red",
})
    .setLngLat(coordinates)
    .setPopup(new maptilersdk.Popup({offset: 25}).setHTML(`<h4>${title}</h4><p>Exact location provided after booking<p>`))
    .addTo(map);