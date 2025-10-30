// ขอบเขตมหาวิทยาลัยศิลปากร เพชรบุรี
const southWest = L.latLng(13.1025, 99.9415);
const northEast = L.latLng(13.1100, 99.9520);
const universityBounds = L.latLngBounds(southWest, northEast);

// สร้างแผนที่
const map = L.map("map", {
  maxBounds: universityBounds,
  maxBoundsViscosity: 1.0,
  minZoom: 16,
  maxZoom: 18,
}).setView([13.1056, 99.9474], 16);

// พื้นหลัง OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

let routingControl = null;
let userLocation = null;

// ฟังก์ชันเพิ่ม marker พร้อมปุ่มนำทาง
function addMarker(lat, lng) {
  if (!universityBounds.contains([lat, lng])) return;
  const marker = L.marker([lat, lng]).addTo(map);
  marker.bindPopup(`<strong>จุดหมาย</strong><br/><button onclick="navigateTo(${lat}, ${lng})">นำทางไปที่นี่</button>`);
}

// คลิกบนแผนที่เพื่อเพิ่ม marker
map.on("click", e => addMarker(e.latlng.lat, e.latlng.lng));

// ฟังก์ชันหาตำแหน่งผู้ใช้
function getLocation() {
  if (!navigator.geolocation) {
    alert("อุปกรณ์ของคุณไม่รองรับการระบุตำแหน่ง");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      if (!universityBounds.contains([lat, lng])) {
        alert("ตำแหน่งของคุณอยู่นอกมหาวิทยาลัย!");
        return;
      }
      userLocation = [lat, lng];
      L.marker(userLocation, { title: "ตำแหน่งของฉัน" })
        .addTo(map)
        .bindPopup("📍 คุณอยู่ที่นี่")
        .openPopup();
      map.setView(userLocation, 17);
    },
    error => alert("ไม่สามารถหาตำแหน่งได้: " + error.message),
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

// ฟังก์ชันนำทางไปยัง marker
function navigateTo(lat, lng) {
  if (!userLocation) {
    alert("โปรดกดปุ่ม “หาตำแหน่งของฉัน” ก่อน");
    return;
  }
  if (routingControl) map.removeControl(routingControl);

  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(userLocation[0], userLocation[1]),
      L.latLng(lat, lng)
    ],
    routeWhileDragging: false,
    showAlternatives: false,
    lineOptions: { styles: [{ color: 'blue', opacity: 0.7, weight: 5 }] },
    router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
    createMarker: function() { return null; }
  }).addTo(map);
}
