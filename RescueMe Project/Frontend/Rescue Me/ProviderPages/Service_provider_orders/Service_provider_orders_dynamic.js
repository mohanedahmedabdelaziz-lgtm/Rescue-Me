// ============================================================
// Auth Check
// ============================================================
const isLoggedIn = localStorage.getItem("isLoggedIn");
const role = localStorage.getItem("role");
// if (!isLoggedIn || role !== "provider") {
//     window.location.href = "/UserPages/Login/login.html";
// }

const currentProvider = JSON.parse(localStorage.getItem("currentProvider"));
if (!currentProvider) {
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
// Config
// ============================================================
const API_BASE = "http://localhost:5065/api/Orders";
const currentProviderType = parseInt(localStorage.getItem("providerType") ?? "0");

const STATUS_MAP = {
    pending: { label: "قيد الانتظار", cls: "status-pending" },
    accepted: { label: "قيد التنفيذ", cls: "status-pending" },
    done: { label: "مكتمل", cls: "status-done" },
    rejected: { label: "ملغي", cls: "status-cancel" },
};

const SERVICE_ICONS = {
    0: "/assets/towlogo.png",
    1: "/assets/Mechanical.png",
    2: "/assets/Electrical.png",
};

// ============================================================
// State
// ============================================================
let allOrders = [];
let currentPage = 1;
const PAGE_SIZE = 5;
let searchQuery = "";

// ============================================================
// Load Orders from API
// ============================================================
async function loadOrders() {
    try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error("Failed to fetch orders");

        const orders = await res.json();

        // Filter orders by current provider type
        allOrders = orders.filter(o =>
            Number(o.providerType) === Number(currentProviderType)
        );

        renderStats(allOrders);
        renderTable(allOrders);

    } catch (err) {
        console.error(err);
        document.getElementById("ordersTableBody").innerHTML = `
            <div style="padding:24px;text-align:center;color:red;">
                فشل تحميل الطلبات — تأكد من تشغيل السيرفر
            </div>`;
    }
}

// ============================================================
// Render Stats Cards
// ============================================================
function renderStats(orders) {
    // Count completed orders
    const done = orders.filter(o => o.status === "done").length;

    // Calculate total earnings
    const earnings =  orders.filter(o => o.status === "done").length;

    document.getElementById("stat-completed").textContent = done;
    document.getElementById("stat-earnings").textContent =
        earnings.toLocaleString("ar-EG") + " جنيه";

    // Calculate average rating from rated orders
    const ratedOrders = orders.filter(o => o.userRate && o.userRate > 0);
    const avgRating = ratedOrders.length
        ? ratedOrders.reduce((sum, o) => sum + Number(o.userRate), 0) / ratedOrders.length
        : 0;

    document.getElementById("stat-rating").textContent =
        avgRating ? avgRating.toFixed(1) : "—";
}

// ============================================================
// Render Orders Table
// ============================================================
function renderTable(orders) {
    const tbody = document.getElementById("ordersTableBody");

    // Filter orders based on search query
    const filtered = orders.filter(o => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            String(o.id).includes(q) ||
            (o.serviceName || "").toLowerCase().includes(q) ||
            (o.status || "").toLowerCase().includes(q)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = 1;

    const paginated = filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    if (paginated.length === 0) {
        tbody.innerHTML = `
            <div style="padding:24px;text-align:center;color:#888;">
                لا توجد طلبات
            </div>`;
        return;
    }

    tbody.innerHTML = paginated.map(order => {
        const statusInfo = STATUS_MAP[order.status?.toLowerCase()]
            || { label: order.status, cls: "status-pending" };

        const icon = SERVICE_ICONS[order.providerType] || "";
        const date = new Date(order.createdAt).toLocaleDateString("ar-EG");
        const title = order.serviceName || "خدمة";
        const price = order.servicePrice || "—";
        const orderId = "#RC-" + String(order.id).padStart(4, "0");

        return `
        <div class="row">
            <div class="td">${orderId}</div>
            <div class="td">
                ${icon ? `<img style="width:32px;margin-left:8px;vertical-align:middle;" src="${icon}">` : ""}
                ${title}
            </div>
            <div class="td">${date}</div>
            <div class="td">
                <span class="status-pill ${statusInfo.cls}">
                    ${statusInfo.label}
                </span>
            </div>
            <div class="td">${price} جنيه</div>
            <div class="td d-flex gap-2">
                <a href="/ProviderPages/Service_provider_orderDetails/Service_provider_orderDetails.html"
                   onclick="localStorage.setItem('viewingOrderId', '${order.id}')">
                    التفاصيل
                </a>
                <button class="btn btn-sm btn-danger"
                        onclick="deleteOrder(${order.id})">
                    حذف
                </button>
            </div>
        </div>`;
    }).join("");

    renderPagination(totalPages);
}

// ============================================================
// Render Pagination Controls
// ============================================================
function renderPagination(totalPages) {
    const pag = document.getElementById("pagination");

    let html = `<button class="page-btn" onclick="changePage(${currentPage - 1})"
                    ${currentPage === 1 ? "disabled" : ""}>&lt;</button>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? "active" : ""}"
                    onclick="changePage(${i})">${i}</button>`;
    }

    html += `<button class="page-btn" onclick="changePage(${currentPage + 1})"
                ${currentPage === totalPages ? "disabled" : ""}>&gt;</button>`;

    pag.innerHTML = html;
}

function changePage(p) {
    const totalPages = Math.max(1, Math.ceil(allOrders.length / PAGE_SIZE));
    if (p < 1 || p > totalPages) return;
    currentPage = p;
    renderTable(allOrders);
}

// ============================================================
// Delete Order from API
// ============================================================
async function deleteOrder(orderId) {
    const result = await Swal.fire({
        title: "هل أنت متأكد من حذف هذا الطلب؟",
        text: "لا يمكن التراجع بعد الحذف",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0d3b66",
        cancelButtonColor: "#d33",
        confirmButtonText: "نعم، احذف",
        cancelButtonText: "إلغاء"
    });

    // User cancelled the action
    if (!result.isConfirmed) return;

    try {
        const res = await fetch(`${API_BASE}/${orderId}`, {
            method: "DELETE"
        });

        if (!res.ok) throw new Error("Delete failed");

        await Swal.fire({
            title: "تم الحذف!",
            text: "تم حذف الطلب بنجاح",
            icon: "success",
            confirmButtonColor: "#0d3b66"
        });

        loadOrders();

    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "حدث خطأ أثناء الحذف",
            confirmButtonColor: "#004471"
        });
    }
}

// ============================================================
// Search Handler
// ============================================================
document.querySelector(".search-box").addEventListener("input", function () {
    searchQuery = this.value.trim();
    currentPage = 1;
    renderTable(allOrders);
});

// ============================================================
// Start — Load orders and auto-refresh every 5 seconds
// ============================================================
loadOrders();
setInterval(loadOrders, 5000);