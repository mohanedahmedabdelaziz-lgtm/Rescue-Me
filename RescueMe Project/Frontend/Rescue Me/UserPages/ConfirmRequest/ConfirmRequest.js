/* =========================
   CONFIRM REQUEST PAGE SCRIPT
   - Reads location + order data from localStorage
   - Renders Leaflet map + reverse geocoding address
   - Fills service and cost UI
   - Handles "Confirm" button
   ========================= */

/* ---------- 1) Load user location from localStorage ---------- */
// localStorage stores values as strings, so we convert them to numbers.
const lat = parseFloat(localStorage.getItem("userLat"));
const lng = parseFloat(localStorage.getItem("userLng"));

// Use a safe check: lat/lng must be real finite numbers.
const hasValidCoords = Number.isFinite(lat) && Number.isFinite(lng);

if (!hasValidCoords) {
  // If there is no saved location, show a simple message instead of the map.
  document.getElementById("confirmMap").innerHTML =
    "<h3 style='padding:20px'>لا يوجد موقع محدد</h3>";
} else {
  /* ---------- 2) Initialize Leaflet map ---------- */
  const confirmMap = L.map("confirmMap").setView([lat, lng], 15);

  // OpenStreetMap tiles (the map background)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(confirmMap);

  // Marker at user's location
  L.marker([lat, lng]).addTo(confirmMap).bindPopup("موقعك الحالي").openPopup();

  /* ---------- 3) Reverse geocoding (coords -> readable address) ---------- */
  // Nominatim returns a JSON that includes "display_name"
  fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  )
    .then((r) => r.json())
    .then((d) => {
      document.getElementById("confirmAddress").textContent =
        d.display_name || "عنوان غير معروف";
    })
    .catch(() => {
      // If the request fails (no internet, blocked request, etc.)
      document.getElementById("confirmAddress").textContent = "تعذر تحميل العنوان";
    });

  /* ---------- 4) Fix map sizing after render ---------- */
  // Leaflet sometimes needs this when the map is inside a container/grid.
  setTimeout(() => confirmMap.invalidateSize(), 200);
}

/* ---------- 5) Load order info from localStorage ---------- */
// "currentOrder" is expected to be saved from the previous page.
// If not found, we use an empty object so the page doesn't crash.
const order = JSON.parse(localStorage.getItem("currentOrder") || "{}");

/* ---------- 6) Service image ---------- */
const imgEl = document.getElementById("serviceImage");
const src = order.serviceImage || "";

if (src) {
  imgEl.src = src;
  imgEl.style.display = "block";
} else {
  // Hide the image element if there is no source.
  imgEl.style.display = "none";
}

/* ---------- 7) Service title ---------- */
// Support multiple possible keys (serviceTitle or serviceName)
document.getElementById("serviceTitle").textContent =
  order.serviceTitle || order.serviceName || "—";

/* ---------- 8) Car info ---------- */
const carName = order.carName || "—";
const plateNumber = order.plateNumber || "—";
document.getElementById("carInfo").textContent = `مركبة: ${carName} - ${plateNumber}`;

/* ---------- 9) Cost calculation ---------- */
// servicePrice may come as string, so we parse it.
// If missing, we treat it as 0.
const price = parseFloat(order.servicePrice) || 0;
const tax = price * 0.15;
const total = price + tax;

// Format numbers in Arabic locale and append currency text.
const fmt = (n) =>
  n.toLocaleString("ar-EG", { maximumFractionDigits: 1 }) + " جنيه";

document.getElementById("cost-base").textContent = fmt(price);
document.getElementById("cost-tax").textContent = fmt(tax);
document.getElementById("cost-total").textContent = fmt(total);

/* ---------- 10) Confirm button handler ---------- */
// This function is called from HTML onclick="confirmRequest()"
function confirmRequest() {
  // Save status so the next page can display it.
  localStorage.setItem("requestStatus", "في الطريق");
  localStorage.setItem("requestETA", "15 دقيقة");

  // Navigate to request status page.
  window.location.href = "/UserPages/RequestStatus/RequestStatus.html";
}