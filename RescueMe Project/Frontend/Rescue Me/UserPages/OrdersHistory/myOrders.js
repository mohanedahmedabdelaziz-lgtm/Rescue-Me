// ================================================
// My Orders Page - Fixed
// ================================================

const API_BASE = "http://localhost:5065";

// ✅ الـ status map صح
const STATUS_MAP = {
    pending:  { text: "قيد الانتظار", class: "pending"   },
    accepted: { text: "في الطريق",    class: "completed" },
    done:     { text: "مكتمل",        class: "completed" },
    rejected: { text: "مرفوض",        class: "rejected"  }
};

const SERVICE_ICONS = {
    0: "/assets/towlogo.png",
    1: "/assets/Mechanical.png",
    2: "/assets/Electrical.png",
};

const ordersContainer = document.getElementById("ordersContainer");

// ✅ جيب اسم المستخدم الحالي من sessionSorage
function getCurrentUserName() {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");
    return currentUser?.name || null;
}

// =========================
// Load Orders — بطلبات المستخدم الحالي فقط
// =========================
async function loadOrders() {
    const userName = getCurrentUserName();

    if (!userName) {
        ordersContainer.innerHTML = `
            <div style="background:white;padding:50px;border-radius:20px;text-align:center;color:#666;">
                يجب تسجيل الدخول أولاً لعرض طلباتك
            </div>`;
        return;
    }

    try {
        // ✅ استخدم الـ endpoint الجديد
        const res = await fetch(`${API_BASE}/api/Orders/user/${encodeURIComponent(userName)}`);

        if (!res.ok) throw new Error("Failed to fetch orders");

        const orders = await res.json();
        renderOrders(orders);

    } catch (err) {
        console.error("Error loading orders:", err);
        ordersContainer.innerHTML = `
            <div style="background:white;padding:50px;border-radius:20px;text-align:center;color:#ef4444;">
                فشل تحميل الطلبات — تأكد من تشغيل السيرفر
            </div>`;
    }
}

// =========================
// Delete Order
// =========================
async function deleteOrder(orderId) {
    const result = await Swal.fire({
        title: "هل أنت متأكد؟",
        text: "لا يمكن التراجع عن حذف الطلب",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0d3b66",
        cancelButtonColor: "#d33",
        confirmButtonText: "نعم، احذف",
        cancelButtonText: "إلغاء"
    });

    if (!result.isConfirmed) return;

    try {
        await fetch(`${API_BASE}/api/Orders/${orderId}`, { method: "DELETE" });
        await loadOrders();
    } catch (err) {
        Swal.fire("خطأ", "حدث خطأ أثناء الحذف", "error");
    }
}

// =========================
// Go to Details
// =========================
function goToDetails(id) {
    window.location.href = `/UserPages/OrderDetails/orderDetails.html?id=${id}`;
}

// =========================
// Render Orders
// =========================
function renderOrders(orders) {
    if (!orders || orders.length === 0) {
        ordersContainer.innerHTML = `
            <div style="background:white;padding:50px;border-radius:20px;text-align:center;color:#666;">
                لا توجد طلبات حالياً
            </div>`;
        return;
    }

    ordersContainer.innerHTML = orders.map(order => {
        // ✅ الـ status صح — بيقرأ من order.status مباشرة
        const statusKey  = order.status?.toLowerCase() || "pending";
        const status     = STATUS_MAP[statusKey] || STATUS_MAP.pending;
        const serviceIcon = SERVICE_ICONS[order.providerType] || "/assets/towlogo.png";

        const price = parseFloat(order.servicePrice) || 0;
        const total = (price * 1.30).toLocaleString("ar-EG", { maximumFractionDigits: 1 });

        return `
            <div class="order-card">
                <div class="order-info">
                    <div class="order-title">
                        <img style="width:40px;margin-left:10px;" src="${serviceIcon}" alt="service icon">
                        ${order.serviceTitle || order.serviceName || "خدمة"}
                    </div>
                    <div class="order-text">
                        <div class="order-id">#RC-${String(order.id).slice(-4)}</div>
                        <h3>${order.serviceTitle || order.serviceName || "خدمة غير محددة"}</h3>
                        <!-- ✅ الحالة صح -->
                        <span class="status ${status.class}">${status.text}</span>
                    </div>
                </div>

                <div class="order-details">
                    <div class="detail">
                        <span>المزود</span>
                        <strong>${order.providerName || "في انتظار القبول"}</strong>
                    </div>
                    <div class="detail">
                        <span>لوحة السيارة</span>
                        <strong>${order.plateNumber || "—"}</strong>
                    </div>
                    <div class="detail">
                        <span>التكلفة</span>
                        <strong>${price > 0 ? total + " جنيه" : "—"}</strong>
                    </div>
                    <div class="detail">
                        <span>رقم المزود</span>
                        <strong>${order.providerPhone || "—"}</strong>
                    </div>
                    <div class="detail">
                        <span>التاريخ</span>
                        <strong>${order.createdAt ? new Date(order.createdAt).toLocaleDateString("ar-EG") : "—"}</strong>
                    </div>
                </div>

                <div class="order-actions">
                    <button class="btn details-btn" onclick="goToDetails(${order.id})">التفاصيل</button>
                    <button class="btn delete-btn" onclick="deleteOrder(${order.id})">حذف</button>
                </div>
            </div>`;
    }).join("");
}

// =========================
// Initialize
// =========================
loadOrders();
setInterval(loadOrders, 10000);
