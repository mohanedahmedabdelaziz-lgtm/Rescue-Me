// ================================================
// Signup Page - Role Switch + Registration
// ================================================

let selectedRole = "driver";

// DOM Elements
const roles = document.querySelectorAll(".role");
const submitBtn = document.querySelector('.submit-btn');
const nameInput = document.querySelector('.nameInput');
const emailInput = document.querySelector('.emailInput');
const passwordInput = document.querySelector('.passwordInput');
const repasswordInput = document.querySelector('.repasswordInput');
const phoneInput = document.querySelector('.phoneInput');
const typeInput = document.querySelector('.typeInput');
const providerFields = document.querySelector('.provider-fields');
const emailGroup = document.querySelector('.email-group');

// =========================
// Role Selection (Driver / Provider)
// =========================
roles.forEach(role => {
    role.addEventListener("click", function () {
        roles.forEach(r => r.classList.remove("active"));
        this.classList.add("active");
        selectedRole = this.dataset.role;

        if (selectedRole === "provider") {
            providerFields.style.display = "block";
            emailGroup.style.display = "none";
        } else {
            providerFields.style.display = "none";
            emailGroup.style.display = "block";
        }
    });
});

// =========================
// Submit Button Click
// =========================
submitBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // Basic Validation
    if (!nameInput.value || !passwordInput.value || !repasswordInput.value) {
        Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "من فضلك املأ كل الحقول",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#004471"
        });
        return;
    }

    if (passwordInput.value !== repasswordInput.value) {
        Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "كلمتا المرور غير متطابقتين",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#004471"
        });
        return;
    }

    if (selectedRole === "driver" && !emailInput.value) {
        Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "البريد الإلكتروني مطلوب",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#004471"
        });
        return;
    }

    if (selectedRole === "provider" && !phoneInput.value) {
        Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "رقم الهاتف مطلوب",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#004471"
        });
        return;
    }

    AddUsertoDatabase();
});

// =========================
// Register User to Backend
// =========================
async function AddUsertoDatabase() {
    const endpoint = selectedRole === "driver"
        ? "http://localhost:5065/api/Auth/signup/user"
        : "http://localhost:5065/api/Auth/signup/provider";

    const body = selectedRole === "driver"
        ? { 
            name: nameInput.value, 
            email: emailInput.value, 
            password: passwordInput.value 
          }
        : { 
            name: nameInput.value, 
            password: passwordInput.value, 
            phone: phoneInput.value, 
            type: parseInt(typeInput?.value || "0") 
          };

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            // Save provider data locally if needed
            if (selectedRole === "provider") {
                const providerType = parseInt(typeInput?.value || "0");
                const newProv = {
                    id: Date.now(),
                    name: nameInput.value,
                    phone: phoneInput.value,
                    type: providerType
                };

                const providers = JSON.parse(localStorage.getItem("_providers") || "[]");
                const filtered = providers.filter(p => p.name !== newProv.name);
                filtered.push(newProv);
                localStorage.setItem("_providers", JSON.stringify(filtered));
            }

            Swal.fire({
                title: "تم",
                text: "تم إنشاء الحساب بنجاح",
                icon: "success",
                confirmButtonText: "حسناً",
                confirmButtonColor: "#004471"
            }).then(() => {
                window.location.href = "../Login/login.html";
            });

        } else {
            Swal.fire({
                icon: "error",
                title: "خطأ",
                text: "حدث خطأ أثناء التسجيل",
                confirmButtonText: "حسناً",
                confirmButtonColor: "#004471"
            });
        }

    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "تعذر الاتصال بالسيرفر",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#004471"
        });
    }
}