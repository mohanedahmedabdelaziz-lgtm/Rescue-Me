// ================================================
// Request Service Page - JavaScript
// ================================================

// ============================
// Initialize Map
// ============================

const map = L.map('egyptMap').setView([30.0444, 31.2357], 6);

// Clear previous location from localStorage
localStorage.removeItem("userLat");
localStorage.removeItem("userLng");

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

let marker;

// ============================
// Map Click - Select Location
// ============================

map.on('click', (e) => {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    if (marker) {
        map.removeLayer(marker);
    }

    marker = L.marker([lat, lng]).addTo(map);

    localStorage.setItem("userLat", lat);
    localStorage.setItem("userLng", lng);

    Swal.fire({
        title: "تم تحديد الموقع!",
        icon: "success",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#004471"
    });
});

// ============================
// GPS Button - Auto Location
// ============================

document.querySelector(".gps-btn").addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        map.setView([lat, lng], 15);

        if (marker) {
            map.removeLayer(marker);
        }

        marker = L.marker([lat, lng]).addTo(map);

        localStorage.setItem("userLat", lat);
        localStorage.setItem("userLng", lng);

        Swal.fire({
            title: "تم تحديد الموقع تلقائياً!",
            icon: "success",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#004471"
        });
    }, () => {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "فشل تحديد الموقع!",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#004471"
        });
    });
});

// ============================
// API Configuration
// ============================

const API_BASE = "http://localhost:5065";

// ============================
// Create New Order Function
// ============================

async function selectService(
    serviceName,
    serviceImage,
    servicePrice,
    serviceTitle,
    providerType
) {
    // Get current logged in user
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

    if (!currentUser) {
        Swal.fire({
            title: "يجب تسجيل الدخول أولاً",
            icon: "question",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#004471"
        });
        return;
    }

    // Get selected location
    const lat = localStorage.getItem("userLat");
    const lng = localStorage.getItem("userLng");

    if (!lat || !lng) {
        Swal.fire({
            title: "من فضلك حدد موقعك على الخريطة أولاً",
            icon: "question",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#004471"
        });
        return;
    }

    const description = document.getElementById("problemDescription")?.value?.trim();
    if (!description) {
        Swal.fire({
            title: "من فضلك اكتب وصفاً للمشكلة",
            icon: "question",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#004471"
        });
        return;
    }

    const carName = document.getElementById("carName")?.value?.trim();
    if (!carName) {
        Swal.fire({
            title: "من فضلك أدخل نوع السيارة",
            icon: "question",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#004471"
        });
        return;
    }

    const plateNumber = document.getElementById("plateNumber")?.value?.trim();

    // Prepare order data
    const orderData = {
        userName: currentUser.name,
        userPhone: currentUser.phone,
        serviceName,
        serviceImage,
        servicePrice: Number(servicePrice),
        serviceTitle,
        providerType: Number(providerType),
        carName: carName,
        plateNumber: plateNumber,
        userLat: Number(lat),
        userLng: Number(lng),
        userAddress: "غير محدد",
        description: description,
        status: "pending",
        createdAt: new Date().toISOString()
    };

    try {
        const response = await fetch(`${API_BASE}/api/Orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(errorText);
            throw new Error("Failed to create order");
        }

        const result = await response.json();

        // Save order ID for next pages
        localStorage.setItem("activeOrderId", result.id);

        // Redirect to status page
        window.location.href = `../RequestStatus/RequestStatus.html?id=${result.id}`;

    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "حصل خطأ أثناء إنشاء الطلب",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#004471"
        });
    }
}