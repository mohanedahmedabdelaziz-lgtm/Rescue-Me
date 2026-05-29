// ============================================================
// Auth Check
// ============================================================
const isLoggedIn = localStorage.getItem("isLoggedIn");
const role = localStorage.getItem("role");
if (!isLoggedIn || role !== "provider") {
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
// Load Provider Data
// ============================================================
const currentProvider = JSON.parse(
    localStorage.getItem("currentProvider") || "{}"
);

const typeLabels = {
    0: "مزود ونش",
    1: "ميكانيكي",
    2: "كهربائي سيارات"
};

document.getElementById("providerName").textContent =
    currentProvider.name || "—";

document.getElementById("providerType").textContent =
    typeLabels[currentProvider.type] ?? "—";

document.getElementById("providerPhone").textContent =
    currentProvider.phone || "—";