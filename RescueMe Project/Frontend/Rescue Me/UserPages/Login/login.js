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




// ================================================
// Google Login
// ================================================

const GOOGLE_CLIENT_ID = "472546212630-4ksm564n2bre7keqpk4nigev1q7sku0p.apps.googleusercontent.com";

function signInWithGoogle() {

    if (selectedRole === "provider") {
        Swal.fire({
            icon: "warning",
            title: "غير متاح",
            text: "تسجيل دخول مزود الخدمة بواسطة Google غير مدعوم حالياً",
            confirmButtonColor: "#004471"
        });
        return;
    }

    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse
    });

    google.accounts.id.prompt();
}

async function handleGoogleResponse(response) {

    try {

        const base64 = response.credential.split('.')[1];
        const userData = JSON.parse(atob(base64));

        const res = await fetch(
            `http://localhost:5065/api/Auth/signin/google?googleId=${userData.sub}&name=${encodeURIComponent(userData.name)}&email=${encodeURIComponent(userData.email)}`,
            {
                method: "POST"
            }
        );

        if (!res.ok) {
            Swal.fire({
                icon: "error",
                title: "خطأ",
                text: "فشل تسجيل الدخول بواسطة Google",
                confirmButtonColor: "#004471"
            });
            return;
        }

        const serverData = await res.json();

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", "driver");

        localStorage.setItem("currentUser", JSON.stringify({
            id: serverData.id,
            name: serverData.name,
            email: serverData.email,
            phone: serverData.phone || ""
        }));

        Swal.fire({
            icon: "success",
            title: "تم تسجيل الدخول بنجاح",
            confirmButtonColor: "#004471"
        }).then(() => {
            window.location.href = "/UserPages/Home/Home.html";
        });

    } catch (err) {
        console.error(err);

        Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "حدث خطأ أثناء تسجيل الدخول بواسطة Google",
            confirmButtonColor: "#004471"
        });
    }
}
// ============================================================
// Role Selection (Driver / Service Provider)
// ============================================================

const signwithgoogle_btn = document.querySelector(".social-btn");

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
            signwithgoogle_btn.style.display = "none"
        } else {
            inputLabel.textContent = "البريد الإلكتروني أو رقم الجوال";
            emailInput.placeholder = "example@mail.com";
            signwithgoogle_btn.style.display = "block"
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
            type: serverData.type !== undefined ? Number(serverData.type) : 0,
            nationalId: serverData.nationalId ?? serverData.NationalId ?? "—"
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