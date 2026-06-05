// admin data
const ADMIN_EMAIL = "admin@rescueme.com";
const ADMIN_PASSWORD = "123456";



// Elements
const loginBtn = document.querySelector(".loginbtn");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");

// Login

loginBtn.addEventListener("click", () => {

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {

        Swal.fire({
            icon: "warning",
            title: "تنبيه",
            text: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
            confirmButtonColor: "#004471"
        });

        return;
    }

    if (
        email === ADMIN_EMAIL &&
        password === ADMIN_PASSWORD
    ) {

        localStorage.setItem("isAdminLoggedIn", "true");

        const adminData = {
            name: "Admin",
            email: ADMIN_EMAIL
        };

        localStorage.setItem(
            "currentAdmin",
            JSON.stringify(adminData)
        );

        Swal.fire({
            icon: "success",
            title: "تم تسجيل الدخول بنجاح",
            confirmButtonColor: "#004471"
        }).then(() => {

            window.location.href =
                "/AdminPages/AdminHomePage/AdminHome.html";

        });

    } else {

        Swal.fire({
            icon: "error",
            title: "فشل تسجيل الدخول",
            text: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
            confirmButtonColor: "#004471"
        });

    }
});

// Enter Key Support

document.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {
        loginBtn.click();
    }

});



function logout() {

    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("currentAdmin");

    window.location.href =
        "/AdminPages/AdminLogin/AdminLogin.html";
}