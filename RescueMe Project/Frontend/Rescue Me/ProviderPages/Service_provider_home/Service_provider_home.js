// ================================================
// Service Provider Dashboard - Home Page
// ================================================

// ==================== AUTHENTICATION CHECK ====================
const currentProvider = JSON.parse(
    localStorage.getItem("currentProvider") || "null"
);

if (!currentProvider) {
    window.location.href = "/UserPages/Login/login.html";
}

// ==================== LOGOUT FUNCTION ====================
document.getElementById("logoutBtn").addEventListener("click", () => {

    // Remove only auth-related data
    localStorage.removeItem("currentProvider");
    localStorage.removeItem("providerType");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");

    window.location.href = "/UserPages/Login/login.html";
});

// ==================== API CONFIGURATION ====================
const API_BASE = "http://localhost:5065/api/Orders";

// ==================== PROVIDER DATA ====================
// Tow = 0, Mechanical = 1, Electrical = 2
const currentProviderType = Number(
    localStorage.getItem("providerType") || 0
);

const ordersContainer = document.getElementById("ordersContainer");

// ==================== INITIALIZE MAP ====================
const map = L.map("egyptMap").setView([30.0444, 31.2357], 6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
}).addTo(map);

// ==================== SERVICE ICONS ====================
const SERVICE_ICONS = {
    0: "/assets/towlogo.png",
    1: "/assets/Mechanical.png",
    2: "/assets/Electrical.png",
};

// ==================== LOAD PENDING ORDERS ====================
async function loadOrders() {

    try {

        const res = await fetch(API_BASE);

        if (!res.ok) {
            throw new Error("Failed to load orders");
        }

        const orders = await res.json();

        // Filter by provider type + pending status
        const filteredOrders = orders.filter(order =>
            Number(order.providerType) === Number(currentProviderType) &&
            order.status?.toLowerCase() === "pending"
        );

        // Update counter
        document.getElementById("ordersCount").innerText =
            filteredOrders.length;

        ordersContainer.innerHTML = "";

        // No orders
        if (filteredOrders.length === 0) {

            ordersContainer.innerHTML = `
                <div style="
                    background:white;
                    padding:20px;
                    border-radius:16px;
                    text-align:center;
                    margin-top:20px;
                ">
                    لا توجد طلبات حالياً
                </div>
            `;

            return;
        }

        // Render orders
        filteredOrders.forEach(order => {

            const serviceIcon =
                SERVICE_ICONS[order.providerType]
                || "/assets/towlogo.png";

            ordersContainer.innerHTML += `
                <article class="order-card">

                    <div class="order-main">

                        <div class="order-title">

                            <img
                                style="width:40px;margin-left:10px;"
                                src="${serviceIcon}"
                                alt="service icon"
                            >

                            ${order.serviceTitle || order.serviceName || "خدمة"}

                        </div>

                        <div class="order-sub">
                            <span>
                                العميل: ${order.userName || "عميل"}
                            </span>
                        </div>

                        <div class="price">
                            ${order.servicePrice || "—"} جنيه
                        </div>

                    </div>

                    <div class="order-meta">

                        <div class="meta-col">
                            <div class="meta-label">المركبة</div>
                            <div class="meta-value">
                                ${order.carName || "—"}
                            </div>
                        </div>

                        <div class="meta-col">
                            <div class="meta-label">رقم اللوحة</div>
                            <div class="meta-value">
                                ${order.plateNumber || "—"}
                            </div>
                        </div>

                    </div>

                    <div class="order-actions">

                        <button
                            class="btn-outline"
                            onclick="rejectOrder(${order.id})"
                        >
                            رفض
                        </button>

                        <button
                            class="btn-primary"
                            onclick="acceptOrder(${order.id})"
                        >
                            قبول الطلب
                        </button>

                    </div>

                </article>
            `;
        });

    }
    catch (err) {

        console.error(err);

        ordersContainer.innerHTML = `
            <div style="
                background:white;
                padding:20px;
                border-radius:16px;
                text-align:center;
                margin-top:20px;
                color:red;
            ">
                فشل تحميل الطلبات
            </div>
        `;
    }
}

// ==================== ACCEPT ORDER ====================
async function acceptOrder(orderId) {

    if (!currentProvider) {

        Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "بيانات المزود غير موجودة",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#004471"
        });

        return;
    }

    try {

        const url =
            `${API_BASE}/accept/${orderId}`
            + `?providerId=${currentProvider.id}`
            + `&providerName=${encodeURIComponent(currentProvider.name)}`
            + `&providerPhone=${encodeURIComponent(currentProvider.phone)}`;

        const res = await fetch(url, {
            method: "PUT"
        });

        if (!res.ok) {
            throw new Error("Accept failed");
        }

        Swal.fire({
            title: "تم",
            text: "تم قبول الطلب",
            icon: "success",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#004471"
        });

        loadOrders();

    }
    catch (err) {

        console.error(err);

        Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "حدث خطأ أثناء قبول الطلب",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#004471"
        });
    }
}

// ==================== REJECT ORDER ====================
async function rejectOrder(orderId) {

    try {

        const res = await fetch(
            `${API_BASE}/reject/${orderId}`,
            {
                method: "PUT"
            }
        );

        if (!res.ok) {
            throw new Error("Reject failed");
        }

        Swal.fire({
            icon: "info",
            title: "تم الرفض",
            text: "تم رفض الطلب بنجاح",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#004471"
        });

        loadOrders();

    }
    catch (err) {

        console.error(err);

        Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "حدث خطأ أثناء الرفض",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#004471"
        });
    }
}

// ==================== INITIALIZE PAGE ====================
loadOrders();

// Auto refresh every 3 seconds
setInterval(loadOrders, 3000);