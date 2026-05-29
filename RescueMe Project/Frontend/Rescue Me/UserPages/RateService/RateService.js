// ================================================
// Rate Service Page
// ================================================

const API_BASE = "http://localhost:5065/api/Orders";

// Get Order ID from localStorage (set after service completion)
const orderId = localStorage.getItem("activeOrderId");

// =========================
// Load Order Data
// =========================
async function loadOrderData() {
    if (!orderId) {
        console.warn("No active order ID found");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/${orderId}`);
        if (!res.ok) throw new Error("Failed to fetch order");

        const order = await res.json();
        renderOrderInfo(order);

    } catch (err) {
        console.error("Error loading order data:", err);
    }
}

function renderOrderInfo(order) {
    // Set service icon based on type
    const icons = {
        0: "/assets/towlogo.png",
        1: "/assets/Mechanical.png",
        2: "/assets/Electrical.png"
    };
    
    document.getElementById("serviceImage").src = 
        icons[order.providerType] || "/assets/towlogo.png";

    document.getElementById("serviceTitle").textContent = 
        order.serviceName || "خدمة غير محددة";

    document.getElementById("providerName").textContent = 
        order.providerName || "—";

    // Calculate total price with tax
    const price = parseFloat(order.servicePrice) || 0;
    const total = price + (price * 0.15);
    
    document.getElementById("servicePrice").textContent = 
        total.toLocaleString("ar-EG", { maximumFractionDigits: 1 });
}

// =========================
// Star Rating System
// =========================
const stars = document.querySelectorAll(".rating i");
let selectedRate = 0;

stars.forEach(star => {
    // Hover effect
    star.addEventListener("mouseover", function () {
        const value = parseInt(this.dataset.value);
        stars.forEach(s => {
            s.style.color = parseInt(s.dataset.value) <= value ? "#fbbf24" : "#ddd";
        });
    });

    // Mouse leave → revert to selected rating
    star.addEventListener("mouseleave", () => {
        stars.forEach(s => {
            s.style.color = parseInt(s.dataset.value) <= selectedRate ? "#fbbf24" : "#ddd";
        });
    });

    // Click to select rating
    star.addEventListener("click", function () {
        selectedRate = parseInt(this.dataset.value);
        stars.forEach(s => {
            s.style.color = parseInt(s.dataset.value) <= selectedRate ? "#fbbf24" : "#ddd";
        });
    });
});

// =========================
// Submit Rating
// =========================
async function submitRate() {
    if (selectedRate === 0) {
        Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "من فضلك اختر تقييم أولاً",
            confirmButtonColor: "#004471"
        });
        return;
    }

    if (!orderId) {
        Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "لا يوجد طلب محدد",
            confirmButtonColor: "#004471"
        });
        return;
    }

    const comment = document.getElementById("commentInput").value.trim();

    try {
        const res = await fetch(
            `${API_BASE}/done/${orderId}?userRate=${selectedRate}&userComment=${encodeURIComponent(comment)}`,
            { method: "PUT" }
        );

        if (!res.ok) throw new Error("Failed to submit rating");

        // Clear active order
        localStorage.removeItem("activeOrderId");

        await Swal.fire({
            title: "شكراً لك!",
            text: "تم استلام تقييمك بنجاح ❤️",
            icon: "success",
            confirmButtonColor: "#004471"
        });

        window.location.href = "../Home/Home.html";

    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "حدث خطأ أثناء إرسال التقييم",
            confirmButtonColor: "#004471"
        });
    }
}

// =========================
// Initialize Page
// =========================
loadOrderData();