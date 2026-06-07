// ================================================
// Request Status / Tracking Page
// ================================================

const COMPANY_PAYMENT_NUMBER = "01119463672";

const providerTypeLabels = { 0: "مزود ونش", 1: "ميكانيكي", 2: "كهربائي سيارات" };
const statusMap = { pending: "قيد الانتظار", accepted: "في الطريق", done: "مكتمل", rejected: "ملغي" };

const params = new URLSearchParams(window.location.search);
const orderId = params.get("id");
const API_BASE = "http://localhost:5065/api/Orders";

let mapInitialized = false;
let trackingMap = null;

// =========================
// Load Order
// =========================
async function loadOrder() {
    try {
        const res = await fetch(`${API_BASE}/${orderId}`);
        if (!res.ok) throw new Error("Order not found");
        const order = await res.json();

        renderOrderData(order);
        renderTimeline(order.status);

        const price = parseFloat(order.servicePrice) || 0;
        const total = price + (price * 0.30);
        document.getElementById("totalPrice").textContent =
            total.toLocaleString("ar-EG", { maximumFractionDigits: 1 }) + " جنيه";

        if (!mapInitialized && order.userLat && order.userLng) {
            initMap(order);
            mapInitialized = true;
        }
        if (order.userLat && order.userLng) loadAddress(order.userLat, order.userLng);

    } catch (err) { console.error(err); }
}

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
    document.getElementById("carName").textContent = data.carName || "—";
    document.getElementById("plateNumber").textContent = data.plateNumber || "—";
    document.getElementById("orderNumber").textContent =
        data.id ? "#RC-" + String(data.id).slice(-4) : "—";
    document.getElementById("requestStatus").textContent =
        statusMap[data.status] || "قيد الانتظار";

    const paymentSection = document.getElementById("paymentSection");
    if (paymentSection) {
        if (data.status === "accepted" || data.status === "done") {
            paymentSection.style.display = "block";
            restorePaymentMethod(orderId);
        } else {
            paymentSection.style.display = "none";
        }
    }

    const doneBtn = document.getElementById("doneBtn");
    if (doneBtn) {
        doneBtn.style.display = data.status === "accepted" ? "block" : "none";
    }

    const rejectedMsg = document.getElementById("rejectedMsg");
    if (rejectedMsg) {
        rejectedMsg.style.display = data.status === "rejected" ? "block" : "none";
    }
}



// =========================
// Timeline
// =========================
function renderTimeline(status) {
    const confirmed = document.getElementById("step-confirmed");
    const onway = document.getElementById("step-onway");
    const done = document.getElementById("step-done");
    const line1 = document.getElementById("line-1");
    const line2 = document.getElementById("line-2");

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
// Address
// =========================
let addressLoaded = false;
async function loadAddress(lat, lng) {
    if (addressLoaded) return;
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        document.getElementById("userAddress").textContent = data.display_name || "عنوان غير معروف";
        addressLoaded = true;
    } catch {
        document.getElementById("userAddress").textContent = "تعذر تحميل العنوان";
    }
}

// =========================
// Map
// =========================
function initMap(order) {
    const lat = parseFloat(order.userLat);
    const lng = parseFloat(order.userLng);
    if (!lat || !lng) return;

    trackingMap = L.map('trackingMap').setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(trackingMap);
    L.marker([lat, lng]).addTo(trackingMap).bindPopup("موقع العميل").openPopup();
}


function setPaymentUI(method) {
    document.querySelectorAll(".payment-option").forEach(el => el.classList.remove("selected"));
    const opt = document.getElementById("opt-" + method);
    if (opt) opt.classList.add("selected");

    const infoBox = document.getElementById("paymentInfoBox");
    const confirmBtn = document.getElementById("confirmPayBtn");
    const confirmedBadge = document.getElementById("paymentConfirmedBadge");

    if (method === "instapay" || method === "wallet") {
        const label = method === "instapay" ? "ادفع على InstaPay رقم المنقذ" : "ادفع على المحفظة رقم المنقذ";
        document.getElementById("paymentInfoLabel").textContent = label;
        infoBox.classList.add("show");
        confirmBtn.classList.add("show");
    } else {
        infoBox.classList.remove("show");
        confirmBtn.classList.remove("show");
    }

    confirmedBadge.classList.remove("show");
}

async function selectPayment(method) {
    setPaymentUI(method);

    if (method === "paymob") {
        await openPaymobPayment();
        return;
    }

    savePaymentMethod(method);
    updatePaymentMethodOnServer(method);
}

async function updatePaymentMethodOnServer(method) {
    if (!orderId) return;
    try {
        await fetch(`${API_BASE}/payment/${orderId}?paymentMethod=${method}`, {
            method: "PUT"
        });
    } catch (err) {
        console.error("فشل رفع طريقة الدفع:", err);
    }
}

function confirmPayment() {
    document.getElementById("confirmPayBtn").classList.remove("show");
    document.getElementById("paymentConfirmedBadge").classList.add("show");

    const key = "paymentConfirmed_" + orderId;
    sessionStorage.setItem(key, "true");

    Swal.fire({
        icon: "success",
        title: "تم تأكيد الدفع",
        text: "سيتم إشعار المزود بعملية الدفع",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#004471"
    });
}

function savePaymentMethod(method) {
    const key = "paymentMethod_" + orderId;
    sessionStorage.setItem(key, method);
}

function restorePaymentMethod(id) {
    const method = sessionStorage.getItem("paymentMethod_" + id);
    const confirmed = sessionStorage.getItem("paymentConfirmed_" + id);

    if (method) {

        const radio = document.querySelector(`input[name="payMethod"][value="${method}"]`);
        if (radio) radio.checked = true;

        setPaymentUI(method);

        if (confirmed === "true" && method !== "paymob") {
            document.getElementById("confirmPayBtn").classList.remove("show");
            document.getElementById("paymentConfirmedBadge").classList.add("show");
        }
    }
}

async function openPaymobPayment() {
    try {
        const res = await fetch(`${API_BASE}/paymob/${orderId}`);
        if (!res.ok) throw new Error("Server error");
        
        const data = await res.json();
        
        if (data.paymentUrl) {
            window.open(data.paymentUrl, "_blank");
            savePaymentMethod("paymob");
            updatePaymentMethodOnServer("paymob");
        } else {
            throw new Error("No payment URL");
        }
    } catch (err) {
        console.error(err);
        alert("حدث خطأ في الاتصال ببوابة الدفع");
    }
}

// =========================
// Start
// =========================
loadOrder();
setInterval(loadOrder, 3000);