// ================================================
// Login Page - Role Switch + Authentication
// ================================================

let selectedRole = "driver";

// DOM Elements
const roles = document.querySelectorAll(".role");
const loginBtn = document.querySelector('.loginbtn');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const inputLabel = document.querySelector('.input-label');

// Backend URL
const BACKEND = "http://localhost:5065";

// ============================================================
// Role Selection (Driver / Service Provider)
// ============================================================

roles.forEach(role => {
    role.addEventListener("click", function () {
        // Remove active class from all roles
        roles.forEach(r => r.classList.remove("active"));
        
        // Activate clicked role
        this.classList.add("active");
        
        selectedRole = this.dataset.role;

        // Change placeholder and label based on role
        if (selectedRole === "provider") {
            inputLabel.textContent = "اسم المستخدم";
            emailInput.placeholder = "أدخل اسم المستخدم";
        } else {
            inputLabel.textContent = "البريد الإلكتروني أو رقم الجوال";
            emailInput.placeholder = "example@mail.com";
        }

        emailInput.value = ""; // Clear input
    });
});

// ============================================================
// Login Button Click
// ============================================================

loginBtn.addEventListener('click', () => {
    const value = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!value || !password) {
        Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "من فضلك أدخل كل البيانات",
            confirmButtonColor: "#0f4c75"
        });
        return;
    }

    login({ value, password, role: selectedRole });
});

// ============================================================
// Main Login Function
// ============================================================

async function login(user) {
    try {
        const endpoint = user.role === "driver"
            ? `${BACKEND}/api/Auth/signin/user?email=${encodeURIComponent(user.value)}&password=${encodeURIComponent(user.password)}`
            : `${BACKEND}/api/Auth/signin/provider?name=${encodeURIComponent(user.value)}&password=${encodeURIComponent(user.password)}`;

        const response = await fetch(endpoint);
        const text = await response.text();

        if (!response.ok) {
            Swal.fire({
                icon: "error",
                title: "فشل تسجيل الدخول",
                text: "بيانات غير صحيحة",
                confirmButtonColor: "#0f4c75"
            });
            return;
        }

        let serverData;
        try {
            serverData = JSON.parse(text);
        } catch {
            Swal.fire({
                icon: "error",
                title: "خطأ",
                text: "استجابة السيرفر غير صحيحة",
                confirmButtonColor: "#0f4c75"
            });
            return;
        }

        saveLoginState(user, serverData);

    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: "error",
            title: "خطأ في الاتصال",
            text: "تأكد من تشغيل السيرفر",
            confirmButtonColor: "#0f4c75"
        });
    }
}

// ============================================================
// Save Login Data & Redirect
// ============================================================

function saveLoginState(user, serverData) {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("role", user.role);

    if (user.role === "driver") {
        const currentUser = {
            id: serverData.id || Date.now(),
            name: serverData.name || user.value,
            email: serverData.email || "",
            phone: serverData.phone || ""
        };
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } 
    else { // Provider
        const currentProvider = {
            id: serverData.id,
            name: serverData.name || user.value,
            phone: serverData.phone || "—",
            type: serverData.type !== undefined ? Number(serverData.type) : 0
        };
        localStorage.setItem("currentProvider", JSON.stringify(currentProvider));
        localStorage.setItem("providerType", String(currentProvider.type));
    }

    // Success Message + Redirect
    Swal.fire({
        icon: "success",
        title: "تم تسجيل الدخول بنجاح",
        confirmButtonColor: "#0f4c75"
    }).then(() => {
        window.location.href = user.role === "provider"
            ? "/ProviderPages/Service_provider_home/Service_provider_home.html"
            : "/UserPages/Home/Home.html";
    });
}