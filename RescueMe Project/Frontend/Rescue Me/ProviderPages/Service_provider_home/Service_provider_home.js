// ================================================
// Service Provider Dashboard - Home Page
// ================================================

const currentProvider = JSON.parse(localStorage.getItem("currentProvider") || "null");
if (!currentProvider) {
    window.location.href = "/UserPages/Login/login.html";
}

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("currentProvider");
    localStorage.removeItem("providerType");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    window.location.href = "/UserPages/Login/login.html";
});

const API_BASE = "http://localhost:5065/api/Orders";
const currentProviderType = Number(localStorage.getItem("providerType") || 0);
const ordersContainer = document.getElementById("ordersContainer");

const map = L.map("egyptMap").setView([30.0444, 31.2357], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
}).addTo(map);

const SERVICE_ICONS = {
    0: "/assets/towlogo.png",
    1: "/assets/Mechanical.png",
    2: "/assets/Electrical.png",
};

// ✅ Helper: ترجمة طريقة الدفع
function getPaymentLabel(method) {
    const labels = { cash: "💵 كاش", instapay: "📱 InstaPay", wallet: "👛 محفظة إلكترونية" };
    return labels[method] || "—";
}

async function loadOrders() {
    try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error("Failed to load orders");

        const orders = await res.json();
        const filteredOrders = orders.filter(order =>
            Number(order.providerType) === Number(currentProviderType) &&
            order.status?.toLowerCase() === "pending"
        );

        document.getElementById("ordersCount").innerText = filteredOrders.length;
        ordersContainer.innerHTML = "";

        map.eachLayer(layer => {
            if (layer instanceof L.Marker) map.removeLayer(layer);
        });

        const markers = [];

        if (filteredOrders.length === 0) {
            ordersContainer.innerHTML = `
                <div style="background:white;padding:20px;border-radius:16px;text-align:center;margin-top:20px;">
                    لا توجد طلبات حالياً
                </div>`;
            return;
        }

        filteredOrders.forEach(order => {
            const serviceIcon = SERVICE_ICONS[order.providerType] || "/assets/towlogo.png";

            // ✅ طريقة الدفع من الـ DB
            const paymentLabel = getPaymentLabel(order.paymentMethod);

            ordersContainer.innerHTML += `
                <article class="order-card">
                    <div class="order-main">
                        <div class="order-title">
                            <img style="width:40px;margin-left:10px;" src="${serviceIcon}" alt="service icon">
                            ${order.serviceTitle || order.serviceName || "خدمة"}
                        </div>
                        <div class="order-sub">
                            <span>العميل: ${order.userName || "عميل"}</span>
                        </div>
                        <div class="price">${order.servicePrice || "—"} جنيه</div>
                    </div>
                    <div class="order-meta">
                        <div class="meta-col">
                            <div class="meta-label">المركبة</div>
                            <div class="meta-value">${order.carName || "—"}</div>
                        </div>
                        <div class="meta-col">
                            <div class="meta-label">رقم اللوحة</div>
                            <div class="meta-value">${order.plateNumber || "—"}</div>
                        </div>
                    </div>
                    <div class="order-sub" style="font-size:12px;color:#6b7280;margin-top:4px;">
                        <span>📍 ${order.userAddress || "الموقع غير محدد"}</span>
                    </div>
                    <div class="order-sub" style="font-size:12px;color:#6b7280;margin-top:4px;">
                        <span>📞 ${order.userPhone || "رقم الهاتف غير محدد"}</span>
                    </div>
                    <!-- ✅ طريقة الدفع -->
                    <div class="order-sub" style="font-size:12px;color:#0f4c75;margin-top:4px;font-weight:600;">
                        <span>طريقة الدفع: ${paymentLabel}</span>
                    </div>
                    <div class="order-actions">
                        <button class="btn-outline" onclick="rejectOrder(${order.id})">رفض</button>
                        <button class="btn-primary" onclick="acceptOrder(${order.id})">قبول الطلب</button>
                    </div>
                </article>`;

            if (order.userLat && order.userLng) {
                const marker = L.marker([order.userLat, order.userLng])
                    .addTo(map)
                    .bindPopup(`
                        <b>${order.userName || "عميل"}</b><br>
                        ${order.serviceTitle || order.serviceName || "خدمة"}<br>
                        ${order.carName || "—"}<br>
                        ${paymentLabel}
                    `);
                markers.push(marker);
            }
        });

        if (markers.length > 0) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.3));
        }

    } catch (err) {
        console.error(err);
        ordersContainer.innerHTML = `
            <div style="background:white;padding:20px;border-radius:16px;text-align:center;margin-top:20px;color:red;">
                فشل تحميل الطلبات
            </div>`;
    }
}

async function acceptOrder(orderId) {
    if (!currentProvider) {
        Swal.fire({ icon:"error", title:"خطأ", text:"بيانات المزود غير موجودة", confirmButtonText:"حسناً", confirmButtonColor:"#004471" });
        return;
    }
    try {
        const url = `${API_BASE}/accept/${orderId}`
            + `?providerId=${currentProvider.id}`
            + `&providerName=${encodeURIComponent(currentProvider.name)}`
            + `&providerPhone=${encodeURIComponent(currentProvider.phone)}`;

        const res = await fetch(url, { method: "PUT" });
        if (!res.ok) throw new Error("Accept failed");

        Swal.fire({ title:"تم", text:"تم قبول الطلب", icon:"success", confirmButtonText:"حسناً", confirmButtonColor:"#004471" });
        loadOrders();
    } catch (err) {
        console.error(err);
        Swal.fire({ icon:"error", title:"خطأ", text:"حدث خطأ أثناء قبول الطلب", confirmButtonText:"حسناً", confirmButtonColor:"#004471" });
    }
}

async function rejectOrder(orderId) {
    try {
        const res = await fetch(`${API_BASE}/reject/${orderId}`, { method: "PUT" });
        if (!res.ok) throw new Error("Reject failed");

        Swal.fire({ icon:"info", title:"تم الرفض", text:"تم رفض الطلب بنجاح", confirmButtonText:"حسناً", confirmButtonColor:"#004471" });
        loadOrders();
    } catch (err) {
        console.error(err);
        Swal.fire({ icon:"error", title:"خطأ", text:"حدث خطأ أثناء الرفض", confirmButtonText:"حسناً", confirmButtonColor:"#004471" });
    }
}

loadOrders();
setInterval(loadOrders, 3000);
