// ============================================================
// Auth Check
// ============================================================
const currentProvider = JSON.parse(sessionStorage.getItem("currentProvider") || "null");
if (!currentProvider) {
    window.location.href = "/UserPages/Login/login.html";
}

document.getElementById("logoutBtn").addEventListener("click", function () {
    sessionStorage.removeItem("currentProvider");
    sessionStorage.removeItem("providerType");
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("role");
    window.location.href = "/UserPages/Login/login.html";
});

const API_BASE = "http://localhost:5065/api/Orders";

// ✅ Helper
function getPaymentLabel(method) {
    const labels = { cash: "💵 كاش", instapay: "📱 InstaPay", wallet: "👛 محفظة إلكترونية", paymob: "💳 Paymob" };
    return labels[method] || "—";
}

async function loadOrderDetails() {
    const orderId = sessionStorage.getItem("viewingOrderId");
    if (!orderId) { showError("لم يتم تحديد طلب"); return; }

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

function renderOrder(order) {
    document.getElementById("clientName").textContent = order.userName || "—";
    document.getElementById("clientPhone").textContent = order.userPhone || "—";
    document.getElementById("clientCarName").textContent = order.carName || "—";
    document.getElementById("clientPlate").textContent = order.plateNumber || "—";

    document.getElementById("problemDescription").textContent =
        order.description || order.serviceName || "—";

    const subEl = document.querySelector(".header-row .sub");
    if (subEl) {
        const date = new Date(order.createdAt);
        const formatted = date.toLocaleDateString("en-EG")
            + " — "
            + date.toLocaleTimeString("en-EG", { hour: "2-digit", minute: "2-digit", hour12: true });
        subEl.textContent = "تم الإنشاء: " + formatted;
    }
    const statusMap = { pending: "قيد الانتظار", accepted: "قيد التنفيذ", done: "مكتمل", rejected: "ملغي" };
    document.querySelector(".status-chip").textContent =
        statusMap[order.status?.toLowerCase()] || order.status;

    // Payment Details
    const price = parseFloat(order.servicePrice) || 0;
    const tax = price * 0.30;
    const total = price + tax;
    const fmt = n => n.toLocaleString("ar-EG", { maximumFractionDigits: 1 }) + " جنيه";
    if (Number(order.providerType) === 0) {
        document.getElementById("costExtraRow").style.display = "block";
    } else {
        document.getElementById("costExtraRow").style.display = "none";
    }

    document.getElementById("payBase").textContent = fmt(price);
    document.getElementById("payExtra").textContent = ". جنيه";
    document.getElementById("costTax").textContent = fmt(tax);
    document.getElementById("payTotal").textContent = fmt(total);

    // ✅ طريقة الدفع الحقيقية من الـ DB
    const payMethodEl = document.getElementById("payMethod");
    if (payMethodEl) {
        payMethodEl.textContent = getPaymentLabel(order.paymentMethod);
    }

    // Rating
    const ratingSection = document.getElementById("ratingSection");
    if (order.userRate && order.userRate > 0) {
        document.getElementById("rateNumber").textContent = order.userRate + ".0";
        document.getElementById("userComment").textContent = order.userComment || "لا يوجد تعليق";
    } else {
        ratingSection.style.display = "none";
    }

    renderMap(order.userLat, order.userLng);
}

function renderMap(lat, lng) {
    if (!lat || !lng) {
        document.getElementById("providerMap").innerHTML = "<h3 style='padding:20px'>لا يوجد موقع محدد</h3>";
        return;
    }

    const providerMap = L.map("providerMap").setView([lat, lng], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
    }).addTo(providerMap);

    L.marker([lat, lng]).addTo(providerMap).bindPopup("موقع العميل").openPopup();
    document.getElementById("clientLat").textContent = "Latitude: " + lat;
    document.getElementById("clientLng").textContent = "Longitude: " + lng;

    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(r => r.json())
        .then(data => {
            document.getElementById("clientAddress").textContent = data.display_name || "عنوان غير معروف";
            document.getElementById("clientCity").textContent =
                data.address?.city || data.address?.town || data.address?.village || "";
        });

    setTimeout(() => providerMap.invalidateSize(), 200);
}

function showError(msg) {
    document.getElementById("clientName").textContent = msg;
}

loadOrderDetails();
