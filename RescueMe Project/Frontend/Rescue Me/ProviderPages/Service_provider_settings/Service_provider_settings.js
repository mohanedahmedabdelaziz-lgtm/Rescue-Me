// ============================================================
// Auth Check
// ============================================================
const isLoggedIn = sessionStorage.getItem("isLoggedIn");
const role = sessionStorage.getItem("role");
if (!isLoggedIn || role !== "provider") {
    window.location.href = "/UserPages/Login/login.html";
}

// ============================================================
// Logout
// ============================================================
document.getElementById("logoutBtn").addEventListener("click", function () {
    sessionStorage.clear();
    window.location.href = "/UserPages/Login/login.html";
});

// ============================================================
// Load Provider Data
// ============================================================
const currentProvider = JSON.parse(
    sessionStorage.getItem("currentProvider") || "{}"
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

document.getElementById("providerNationalId").textContent =
    currentProvider.nationalId || "—";