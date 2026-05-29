// ================================================
// Home Page - Login Button Visibility Logic
// ================================================

document.addEventListener("DOMContentLoaded", () => {
    
    const btnLoginHome = document.querySelector('.btnloginhome');
    
    // Get login status from localStorage
    let isLoggedIn = localStorage.getItem("isLoggedIn");

    // If page opened directly (not from login), clear login status
    if (document.referrer === "") {
        localStorage.removeItem("isLoggedIn");
        isLoggedIn = null;
    }

    // Show login button only if user is NOT logged in
    if (!isLoggedIn) {
        btnLoginHome.style.display = "block";
    } else {
        btnLoginHome.style.display = "none";
    }
});