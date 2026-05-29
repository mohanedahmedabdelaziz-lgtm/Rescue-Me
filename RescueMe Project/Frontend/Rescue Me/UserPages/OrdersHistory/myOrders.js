// ================================================
// My Orders Page - Fetch, Display & Manage Orders
// ================================================

const API_BASE = "http://localhost:5065";

// Status Mapping (Text + Color Class)
const STATUS_MAP = {
    pending:  { text: "قيد الانتظار", class: "pending" },
    accepted: { text: "في الطريق",   class: "completed" },
    done:     { text: "مكتمل",       class: "completed" },
    rejected: { text: "مرفوض",       class: "pending" }   // You can change color if needed
};

const ordersContainer = document.getElementById("ordersContainer");
let ordersCache = [];

// =========================
// Load All Orders from Backend
// =========================
async function loadOrders() {
    try {
        const res = await fetch(`${API_BASE}/api/Orders`);

        if (!res.ok) throw new Error("Failed to fetch orders");

        const orders = await res.json();
        
        // Reverse to show newest first
        ordersCache = orders.reverse();
        
        renderOrders(ordersCache);

    } catch (err) {
        console.error("Error loading orders:", err);
        
        ordersContainer.innerHTML = `
            <div style="background:white; padding:50px; border-radius:20px; text-align:center; color:#ef4444; font-size:18px;">
                فشل تحميل الطلبات<br>تأكد من تشغيل السيرفر
            </div>
        `;
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
        await loadOrders(); // Refresh list
    } catch (err) {
        Swal.fire("خطأ", "حدث خطأ أثناء الحذف", "error");
    }
}

// =========================
// Go to Order Details
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
            <div style="background:white; padding:50px; border-radius:20px; text-align:center; color:#666;">
                لا توجد طلبات حالياً
            </div>
        `;
        return;
    }

    ordersContainer.innerHTML = orders.map(order => {
        const status = STATUS_MAP[order.status] || STATUS_MAP.pending;

        return `
            <div class="order-card">
                <div class="order-info">
                    <div class="icon-box">
                        <img src="${order.serviceImage || '/assets/towlogo.png'}" style="width:50px;" alt="">
                    </div>
                    
                    <div class="order-text">
                        <div class="order-id">#RC-${String(order.id).slice(-4)}</div>
                        <h3>${order.serviceTitle || order.serviceName || "خدمة غير محددة"}</h3>
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
                        <strong>
                            ${order.servicePrice 
                                ? (parseFloat(order.servicePrice) * 1.15).toLocaleString("ar-EG") + " جنيه" 
                                : "—"}
                        </strong>
                    </div>
                    <div class="detail">
                        <span>رقم المزود</span>
                        <strong>${order.providerPhone || "—"}</strong>
                    </div>
                    <div class="detail">
                        <span>التاريخ</span>
                        <strong>
                            ${order.createdAt 
                                ? new Date(order.createdAt).toLocaleDateString("ar-EG") 
                                : "—"}
                        </strong>
                    </div>
                </div>

                <div class="order-actions">
                    <button class="btn details-btn" onclick="goToDetails(${order.id})">
                        التفاصيل
                    </button>
                    <button class="btn delete-btn" onclick="deleteOrder(${order.id})">
                        حذف
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

// =========================
// Initialize Page
// =========================
loadOrders();

// Auto refresh every 10 seconds (optional)
setInterval(loadOrders, 10000);