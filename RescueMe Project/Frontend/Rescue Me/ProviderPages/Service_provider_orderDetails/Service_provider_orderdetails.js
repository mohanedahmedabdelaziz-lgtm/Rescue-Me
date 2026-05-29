// ============================================================
// Auth Check
// ============================================================
const isLoggedIn = localStorage.getItem("isLoggedIn");
const role = localStorage.getItem("role");
if (!isLoggedIn || role !== "provider") {
    window.location.href = "/UserPages/Login/login.html";
}

// ============================================================
// Logout
// ============================================================
document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.clear();
    window.location.href = "/UserPages/Login/login.html";
});

// ============================================================
// API Config
// ============================================================
const API_BASE = "http://localhost:5065/api/Orders";

// ============================================================
// Load Order Details from API
// ============================================================
async function loadOrderDetails() {
    const orderId = localStorage.getItem("viewingOrderId");

    if (!orderId) {
        showError("لم يتم تحديد طلب");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/${orderId}`);
        if (!res.ok) throw new Error("فشل جلب الطلب");

        const order = await res.json();
        renderOrder(order);

    } catch (err) {
        console.error(err);
        showError("فشل تحميل بيانات الطلب");
    }
}

// ============================================================
// Render Order Data
// ============================================================
function renderOrder(order) {

    // Client Info
    document.getElementById("clientName").textContent    = order.userName   || "—";
    document.getElementById("clientPhone").textContent   = order.userPhone  || "—";
    document.getElementById("clientCarName").textContent = order.carName    || "—";
    document.getElementById("clientPlate").textContent   = order.plateNumber || "—";

    // Problem Description
    document.getElementById("problemDescription").textContent =
        order.description || order.serviceName || "—";

    // Order Creation Date
    const subEl = document.querySelector(".header-row .sub");
    if (subEl) subEl.textContent =
        "تم الإنشاء: " + new Date(order.createdAt).toLocaleString("ar-EG");

    // Order Status
    const statusMap = {
        pending:  "قيد الانتظار",
        accepted: "قيد التنفيذ",
        done:     "مكتمل",
        rejected: "ملغي"
    };
    document.querySelector(".status-chip").textContent =
        statusMap[order.status?.toLowerCase()] || order.status;

    // Payment Details
    const price = parseFloat(order.servicePrice) || 0;
    const tax   = price * 0.15;
    const total = price + tax;
    const fmt   = n => n.toLocaleString("ar-EG", { maximumFractionDigits: 1 }) + " جنيه";

    document.getElementById("payBase").textContent  = fmt(price);
    document.getElementById("payExtra").textContent = "0 جنيه";
    document.getElementById("payTax").textContent   = fmt(tax);
    document.getElementById("payTotal").textContent = fmt(total);

    // User Rating Section
    const ratingSection = document.getElementById("ratingSection");
    if (order.userRate && order.userRate > 0) {
        document.getElementById("rateNumber").textContent  = order.userRate + ".0";
        document.getElementById("userComment").textContent = order.userComment || "لا يوجد تعليق";
    } else {
        ratingSection.style.display = "none";
    }

    // Map
    renderMap(order.userLat, order.userLng);
}

// ============================================================
// Render Map with Client Location
// ============================================================
function renderMap(lat, lng) {
    if (!lat || !lng) {
        document.getElementById("providerMap").innerHTML =
            "<h3 style='padding:20px'>لا يوجد موقع محدد</h3>";
        return;
    }

    const providerMap = L.map("providerMap").setView([lat, lng], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
    }).addTo(providerMap);

    L.marker([lat, lng])
        .addTo(providerMap)
        .bindPopup("موقع العميل")
        .openPopup();

    // Show Coordinates
    document.getElementById("clientLat").textContent = "Latitude: "  + lat;
    document.getElementById("clientLng").textContent = "Longitude: " + lng;

    // Fetch Address from Nominatim
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(r => r.json())
        .then(data => {
            document.getElementById("clientAddress").textContent =
                data.display_name || "عنوان غير معروف";
            document.getElementById("clientCity").textContent =
                data.address?.city || data.address?.town || data.address?.village || "";
        });

    setTimeout(() => providerMap.invalidateSize(), 200);
}

// ============================================================
// Show Error Message
// ============================================================
function showError(msg) {
    document.getElementById("clientName").textContent = msg;
}

// ============================================================
// Start
// ============================================================
loadOrderDetails();