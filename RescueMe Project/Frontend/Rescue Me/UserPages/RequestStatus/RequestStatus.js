// ================================================
// Request Status / Tracking Page
// ================================================

const providerTypeLabels = {
    0: "مزود ونش",
    1: "ميكانيكي",
    2: "كهربائي سيارات"
};

const statusMap = {
    pending: "قيد الانتظار",
    accepted: "في الطريق",
    done: "مكتمل",
    rejected: "ملغي"
};

// Get Order ID from URL
const params = new URLSearchParams(window.location.search);
const orderId = params.get("id");
const API_BASE = "http://localhost:5065/api/Orders";

let mapInitialized = false;
let trackingMap = null;

// =========================
// Load Order Data
// =========================
async function loadOrder() {
    try {
        const res = await fetch(`${API_BASE}/${orderId}`);
        if (!res.ok) throw new Error("Order not found");

        const order = await res.json();

        renderOrderData(order);
        renderTimeline(order.status);

        // Calculate and show total price
        const price = parseFloat(order.servicePrice) || 0;
        const total = price + (price * 0.15);
        document.getElementById("totalPrice").textContent = 
            total.toLocaleString("ar-EG", { maximumFractionDigits: 1 }) + " جنيه";

        // Initialize map only once
        if (!mapInitialized && order.userLat && order.userLng) {
            initMap(order);
            mapInitialized = true;
        }

        // Load address if coordinates exist
        if (order.userLat && order.userLng) {
            loadAddress(order.userLat, order.userLng);
        }

    } catch (err) {
        console.error(err);
    }
}

// =========================
// Render Order Information
// =========================
function renderOrderData(data) {
    const hasProvider = data.providerName && data.providerName !== "null";

    document.getElementById("providerName").textContent = 
        hasProvider ? data.providerName : "في انتظار المزود...";

    document.getElementById("providerJob").textContent = 
        hasProvider ? (providerTypeLabels[data.providerType] || "مزود خدمة") : "";

    document.getElementById("providerPhone").textContent = 
        hasProvider ? (data.providerPhone || "—") : "في انتظار القبول...";

    document.getElementById("serviceName").textContent = 
        data.serviceTitle || data.serviceName || "—";

    document.getElementById("carName").textContent = 
        data.carName || "—";

    document.getElementById("plateNumber").textContent = 
        data.plateNumber || "—";

    document.getElementById("orderNumber").textContent = 
        data.id ? "#RC-" + String(data.id).slice(-4) : "—";

    // Status Badge
    const statusEl = document.getElementById("requestStatus");
    statusEl.textContent = statusMap[data.status] || "قيد الانتظار";
}

// =========================
// Render Timeline
// =========================
function renderTimeline(status) {
    const confirmed = document.getElementById("step-confirmed");
    const onway = document.getElementById("step-onway");
    const done = document.getElementById("step-done");
    const line1 = document.getElementById("line-1");
    const line2 = document.getElementById("line-2");

    // Reset all
    [confirmed, onway, done].forEach(el => el.classList.remove("done", "current", "upcoming"));
    [line1, line2].forEach(el => el.classList.remove("active"));

    if (status === "pending") {
        confirmed.classList.add("done");
        onway.classList.add("upcoming");
        done.classList.add("upcoming");
        line1.classList.add("active");

    } else if (status === "accepted") {
        confirmed.classList.add("done");
        onway.classList.add("current");
        done.classList.add("upcoming");
        line1.classList.add("active");

    } else if (status === "done") {
        confirmed.classList.add("done");
        onway.classList.add("done");
        done.classList.add("done");
        line1.classList.add("active");
        line2.classList.add("active");
    }
}

// =========================
// Load Address from Coordinates
// =========================
let addressLoaded = false;

async function loadAddress(lat, lng) {
    if (addressLoaded) return;

    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();
        document.getElementById("userAddress").textContent = data.display_name || "عنوان غير معروف";
        addressLoaded = true;
    } catch {
        document.getElementById("userAddress").textContent = "تعذر تحميل العنوان";
    }
}

// =========================
// Initialize Map
// =========================
function initMap(order) {
    const lat = parseFloat(order.userLat);
    const lng = parseFloat(order.userLng);

    if (!lat || !lng) return;

    trackingMap = L.map('trackingMap').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(trackingMap);

    L.marker([lat, lng]).addTo(trackingMap)
        .bindPopup("موقع العميل")
        .openPopup();
}

// =========================
// Start Tracking
// =========================
loadOrder();
setInterval(loadOrder, 3000);   // Auto refresh every 3 seconds