// ================================================
// Order Details Page
// ================================================

const API_BASE = "http://localhost:5065";

// Get Order ID from URL (example: ?id=123)
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get("id");

if (!orderId) {
    Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "لا يوجد طلب محدد",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#004471"
    }).then(() => {
        window.location.href = "/UserPages/OrdersHistory/myOrders.html";
    });
}

// Status Translation Map
const STATUS_MAP = {
    pending: "قيد الانتظار",
    accepted: "في الطريق",
    done: "مكتمل",
    rejected: "مرفوض"
};

// =========================
// Load Order Data from Backend
// =========================
async function loadOrder() {
    try {
        const res = await fetch(`${API_BASE}/api/Orders/${orderId}`);

        if (!res.ok) {
            throw new Error("Order not found");
        }

        const order = await res.json();
        
        renderOrder(order);   // Fill HTML with data
        initMap(order);       // Initialize map

    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "تعذر تحميل الطلب",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#004471"
        });
    }
}

// =========================
// Render Order Data
// =========================
function renderOrder(order) {

    // Order Header
    document.getElementById("orderNumber").textContent = 
        `طلب رقم #RC-${String(order.id).slice(-4)}`;

    document.getElementById("orderDate").textContent = 
        order.createdAt 
            ? `تاريخ الطلب: ${new Date(order.createdAt).toLocaleString("ar-EG")}` 
            : "تاريخ غير معروف";

    // Status
    document.getElementById("orderStatus").textContent = 
        STATUS_MAP[order.status] || "قيد الانتظار";

    // Service Info
    document.getElementById("serviceTitle").textContent = 
        order.serviceTitle || order.serviceName || "خدمة غير محددة";

    document.getElementById("serviceDescription").textContent = 
        order.description || "لا يوجد وصف للخدمة";

    // Provider Info
    document.getElementById("providerName").textContent = 
        order.providerName || "في انتظار القبول";

    document.getElementById("providerPhone").textContent = 
        order.providerPhone || "—";

    // Car Info
    document.getElementById("carName").textContent = 
        order.carName || "—";

    document.getElementById("plateNumber").textContent = 
        order.plateNumber || "—";

    // Cost Calculation
    const price = parseFloat(order.servicePrice) || 0;
    const tax = price * 0.15;
    const total = price + tax;

    const fmt = (num) => num.toLocaleString("ar-EG", { maximumFractionDigits: 1 }) + " جنيه";

    document.getElementById("costBase").textContent = fmt(price);
    document.getElementById("costExtra").textContent = "0 جنيه";
    document.getElementById("costTax").textContent = fmt(tax);
    document.getElementById("totalPrice").textContent = `الإجمالي: ${fmt(total)}`;
}

// =========================
// Initialize Leaflet Map
// =========================
function initMap(order) {
    const lat = parseFloat(order.userLat);
    const lng = parseFloat(order.userLng);

    const mapContainer = document.getElementById("map");

    if (!lat || !lng) {
        mapContainer.innerHTML = "<div style='padding:40px; text-align:center; color:#666;'>لا يوجد موقع متاح</div>";
        return;
    }

    const map = L.map('map').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker([lat, lng])
        .addTo(map)
        .bindPopup("موقع العميل")
        .openPopup();
}

// =========================
// Start Loading
// =========================
loadOrder();