// ============================================================
// EmailJS Configuration - Change these with your own keys
// ============================================================

const EMAILJS_PUBLIC_KEY = "bXrP3lM4iIunC6e-s";   // ← غيّرها
const EMAILJS_SERVICE_ID = "service_kzuzrlg";    // ← غيّرها
const EMAILJS_TEMPLATE_ID = "template_twskv7n";  // ← غيّرها

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// ============================================================
// Form Submission Handler
// ============================================================

document.getElementById("contactForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent page refresh

    // Get form values
    const from_name = document.getElementById("from_name").value.trim();
    const from_email = document.getElementById("from_email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    // Validation
    if (!from_name || !from_email || !subject || !message) {
        Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "من فضلك أدخل كل البيانات",
            confirmButtonColor: "#0f4c75"
        }); return;
    }

    // Disable button and show loading state
    const submitBtn = document.querySelector(".submit-btn");
    submitBtn.disabled = true;
    submitBtn.innerHTML = "<span>جاري الإرسال...</span>";

    try {
        // Send email using EmailJS
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            from_name,
            from_email,
            subject,
            message
        });

        Swal.fire({
            icon: "success",
            title: "تم إرسال رسالتك بنجاح! سنرد عليك قريباً",
            confirmButtonColor: "#0f4c75"
        })
        document.getElementById("contactForm").reset(); // Clear form

    } catch (err) {
        console.error("EmailJS Error:", err);
        Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "حدث خطأ أثناء الإرسال، حاول مرة أخرى",
            confirmButtonColor: "#0f4c75"
        })
    } finally {
        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = "<span>إرسال الرسالة</span><span>➤</span>";
    }
});