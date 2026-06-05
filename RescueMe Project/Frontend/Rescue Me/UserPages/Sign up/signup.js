// ================================================
// Signup Page
// ================================================

let selectedRole = "driver";

const roles = document.querySelectorAll(".role");
const submitBtn = document.querySelector('.submit-btn');
const nameInput = document.querySelector('.nameInput');
const emailInput = document.querySelector('.emailInput');
const driverPhoneInput = document.querySelector('.driverPhoneInput'); // ✅ user phone
const passwordInput = document.querySelector('.passwordInput');
const repasswordInput = document.querySelector('.repasswordInput');
const phoneInput = document.querySelector('.phoneInput');       // provider phone
const nationalIdInput = document.querySelector('.nationalIdInput');  // ✅ provider national id
const typeInput = document.querySelector('.typeInput');
const providerFields = document.querySelector('.provider-fields');
const emailGroup = document.querySelector('.email-group');
const driverPhoneGroup = document.querySelector('.driver-phone-group');



const termsCheckbox = document.getElementById('termsCheckbox');


const GOOGLE_CLIENT_ID = "472546212630-4ksm564n2bre7keqpk4nigev1q7sku0p.apps.googleusercontent.com";

function signInWithGoogle() {

    if (selectedRole === "provider") {
        Swal.fire({
            icon: "warning",
            title: "غير متاح",
            text: "تسجيل مزود الخدمة بواسطة Google غير مدعوم حالياً",
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
}


// =========================
// Role Selection
// =========================
const signwithgoogle_btn=document.querySelector(".social-btn");
roles.forEach(role => {
    role.addEventListener("click", function () {
        roles.forEach(r => r.classList.remove("active"));
        this.classList.add("active");
        selectedRole = this.dataset.role;

        if (selectedRole === "provider") {
            providerFields.style.display = "block";
            emailGroup.style.display = "none";
            driverPhoneGroup.style.display = "none";
            signwithgoogle_btn.style.display="none"
        } else {
            providerFields.style.display = "none";
            emailGroup.style.display = "block";
            driverPhoneGroup.style.display = "block";
            signwithgoogle_btn.style.display="block"
        }
    });
});

// =========================
// Submit
// =========================
submitBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // Terms check
    if (!termsCheckbox.checked) {
        Swal.fire({ icon: "warning", title: "الشروط والأحكام", text: "يجب الموافقة على الشروط والأحكام أولاً", confirmButtonText: "حسناً", confirmButtonColor: "#004471" });
        return;
    }

    // Common validation
    if (!nameInput.value || !passwordInput.value || !repasswordInput.value) {
        Swal.fire({ icon: "error", title: "خطأ", text: "من فضلك املأ كل الحقول", confirmButtonText: "حسناً", confirmButtonColor: "#004471" });
        return;
    }

    if (passwordInput.value !== repasswordInput.value) {
        Swal.fire({ icon: "error", title: "خطأ", text: "كلمتا المرور غير متطابقتين", confirmButtonText: "حسناً", confirmButtonColor: "#004471" });
        return;
    }

    if (selectedRole === "driver") {
        if (!emailInput.value) {
            Swal.fire({ icon: "error", title: "خطأ", text: "البريد الإلكتروني مطلوب", confirmButtonText: "حسناً", confirmButtonColor: "#004471" });
            return;
        }
        if (!driverPhoneInput.value) {
            Swal.fire({ icon: "error", title: "خطأ", text: "رقم الهاتف مطلوب", confirmButtonText: "حسناً", confirmButtonColor: "#004471" });
            return;
        }
    }

    if (selectedRole === "provider") {
        if (!phoneInput.value) {
            Swal.fire({ icon: "error", title: "خطأ", text: "رقم الهاتف مطلوب", confirmButtonText: "حسناً", confirmButtonColor: "#004471" });
            return;
        }
        // ✅ National ID validation
        if (!nationalIdInput.value) {
            Swal.fire({ icon: "error", title: "خطأ", text: "بطاقة الرقم مطلوب", confirmButtonText: "حسناً", confirmButtonColor: "#004471" });
            return;
        }
        if (nationalIdInput.value.length !== 14) {
            Swal.fire({ icon: "error", title: "خطأ", text: "رقم البطاقة يجب أن يكون 14 رقماً", confirmButtonText: "حسناً", confirmButtonColor: "#004471" });
            return;
        }
    }

    AddUsertoDatabase();
});

// =========================
// Register
// =========================
async function AddUsertoDatabase() {
    const endpoint = selectedRole === "driver"
        ? "http://localhost:5065/api/Auth/signup/user"
        : "http://localhost:5065/api/Auth/signup/provider";

    const body = selectedRole === "driver"
        ? {
            name: nameInput.value,
            email: emailInput.value,
            phone: driverPhoneInput.value,   // ✅
            password: passwordInput.value
        }
        : {
            name: nameInput.value,
            password: passwordInput.value,
            phone: phoneInput.value,
            nationalId: nationalIdInput.value,  // ✅
            type: parseInt(typeInput?.value || "0")
        };

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            // Save provider locally for mock
            if (selectedRole === "provider") {
                const newProv = {
                    id: Date.now(),
                    name: nameInput.value,
                    phone: phoneInput.value,
                    nationalId: nationalIdInput.value,
                    type: parseInt(typeInput?.value || "0")
                };
                const providers = JSON.parse(localStorage.getItem("_providers") || "[]");
                const filtered = providers.filter(p => p.name !== newProv.name);
                filtered.push(newProv);
                localStorage.setItem("_providers", JSON.stringify(filtered));
            }

            Swal.fire({ title: "تم", text: "تم إنشاء الحساب بنجاح", icon: "success", confirmButtonText: "حسناً", confirmButtonColor: "#004471" })
                .then(() => { window.location.href = "../Login/login.html"; });

        } else {
            const errText = await response.text();
            Swal.fire({ icon: "error", title: "خطأ", text: errText || "حدث خطأ أثناء التسجيل", confirmButtonText: "حسناً", confirmButtonColor: "#004471" });
        }

    } catch (error) {
        console.error(error);
        Swal.fire({ icon: "error", title: "خطأ", text: "تعذر الاتصال بالسيرفر", confirmButtonText: "حسناً", confirmButtonColor: "#004471" });
    }
}
