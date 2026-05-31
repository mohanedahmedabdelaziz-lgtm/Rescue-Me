document.addEventListener("DOMContentLoaded", () => {
    const btnLoginHome = document.querySelector('.btnloginhome');
    const logoutBtn = document.getElementById("logoutBtn");
    
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("role");

    if (isLoggedIn && role === "driver") {
        if (btnLoginHome) btnLoginHome.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "inline-block";
    } else {
        if (btnLoginHome) btnLoginHome.style.display = "inline-block";
        if (logoutBtn) logoutBtn.style.display = "none";
    }
});