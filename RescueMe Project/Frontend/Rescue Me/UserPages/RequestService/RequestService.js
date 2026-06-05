// ================================================
// Request Service Page - JavaScript
// ================================================

const map = L.map('egyptMap').setView([30.0444, 31.2357], 6);

sessionStorage.removeItem("userLat");
sessionStorage.removeItem("userLng");

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

let marker;

// ============================
// Map Click
// ============================
map.on('click', async (e) => {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map);

    sessionStorage.setItem("userLat", lat);
    sessionStorage.setItem("userLng", lng);

    await updateAddress(lat, lng);

    Swal.fire({
        title: "تم تحديد الموقع!",
        icon: "success",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#004471"
    });
});

// ============================
// GPS Button
// ============================
document.querySelector(".gps-btn").addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        map.setView([lat, lng], 15);

        if (marker) map.removeLayer(marker);
        marker = L.marker([lat, lng]).addTo(map);

        sessionStorage.setItem("userLat", lat);
        sessionStorage.setItem("userLng", lng);

        await updateAddress(lat, lng);

        Swal.fire({
            title: "تم تحديد الموقع تلقائياً!",
            icon: "success",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#004471"
        });

    }, () => {
        Swal.fire({
            icon: "error",
            title: "فشل تحديد الموقع!",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#004471"
        });
    });
});

const API_BASE = "http://localhost:5065";

// ============================
// Get Address from Coordinates
// ============================
async function getAddressFromCoords(lat, lng) {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );

        const data = await res.json();

        return data.display_name || "عنوان غير معروف";
    } catch (error) {
        console.error(error);
        return "عنوان غير معروف";
    }
}

// ============================
// Update Address UI
// ============================
async function updateAddress(lat, lng) {
    const address = await getAddressFromCoords(lat, lng);

    console.log("Address:", address); // للتجربة

    const addressElement = document.getElementById("selectedAddress");

    if (addressElement) {
        addressElement.textContent = `📍 ${address}`;
    }
}

// ============================
// Create Order
// ============================
async function selectService(serviceName, serviceImage, servicePrice, serviceTitle, providerType) {

    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");
    if (!currentUser) {
        Swal.fire({ title: "يجب تسجيل الدخول أولاً", icon: "question", confirmButtonText: "حسناً", confirmButtonColor: "#004471" });
        return;
    }

    const lat = sessionStorage.getItem("userLat");
    const lng = sessionStorage.getItem("userLng");
    if (!lat || !lng) {
        Swal.fire({ title: "من فضلك حدد موقعك على الخريطة أولاً", icon: "question", confirmButtonText: "حسناً", confirmButtonColor: "#004471" });
        return;
    }

    const description = document.getElementById("problemDescription")?.value?.trim();
    if (!description) {
        Swal.fire({ title: "من فضلك اكتب وصفاً للمشكلة", icon: "question", confirmButtonText: "حسناً", confirmButtonColor: "#004471" });
        return;
    }

    const carName = document.getElementById("carName")?.value?.trim();
    if (!carName) {
        Swal.fire({ title: "من فضلك أدخل نوع السيارة", icon: "question", confirmButtonText: "حسناً", confirmButtonColor: "#004471" });
        return;
    }

    const plateNumber = document.getElementById("plateNumber")?.value?.trim();

    // ✅ Get real address before creating the order
    const userAddress = await getAddressFromCoords(lat, lng);

    const orderData = {
        userName: currentUser.name,
        userPhone: currentUser.phone,
        serviceName,
        serviceImage,
        servicePrice: Number(servicePrice),
        serviceTitle,
        providerType: Number(providerType),
        carName,
        plateNumber,
        userLat: Number(lat),
        userLng: Number(lng),
        userAddress,           // ✅ real address saved here
        description,
        status: "pending",
        createdAt: new Date().toISOString()
    };

    try {
        const response = await fetch(`${API_BASE}/api/Orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) throw new Error("Failed to create order");

        const result = await response.json();

        sessionStorage.setItem("activeOrderId", result.id);
        window.location.href = `../RequestStatus/RequestStatus.html?id=${result.id}`;

    } catch (err) {
        console.error(err);
        Swal.fire({ icon: "error", title: "خطأ", text: "حصل خطأ أثناء إنشاء الطلب", confirmButtonText: "حسناً", confirmButtonColor: "#004471" });
    }
}