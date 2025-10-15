export function initMap(containerId, center = [-6.2, 106.8], zoom = 11) {
  const map = L.map(containerId).setView(center, zoom);

  const street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  const topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenTopoMap"
  });

  L.control.layers({ "Street": street, "Topographic": topo }).addTo(map);

  return map;
}
