const API_BASE = "http://localhost:5065";


const PAGE_SIZE = 5;

let allOrders = [];
let currentPage = 1;



function typeText(providerType) {
  if (providerType === 0) return { text: "سحب مركبة", img: "/assets/towlogo.png" };
  if (providerType === 1) return { text: "ميكانيكي", img: "/assets/mechanical.png" }; // change image if you have
  if (providerType === 2) return { text: "كهربائي", img: "/assets/Electrical.png" }; // change image if you have
  return { text: "غير معروف", img: "/assets/towlogo.png" };
}

function statusArabic(status) {
  const s = (status || "").toLowerCase();
  if (s === "pending") return "قيد الانتظار";
  if (s === "accepted") return "تم القبول";
  if (s === "rejected") return "مرفوض";
  if (s === "done") return "مكتمل";
  return status || "";
}

function stars(rate) {
  const r = Number(rate);
  if (!r || r < 1) return "—";
  return "★★★★★☆☆☆☆☆".slice(5 - r, 10 - r); // simple 5-star display
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  // shows date and time similar to your UI
  return `${d.toLocaleDateString("en-CA")}<br>${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

async function loadOrders() {
  const container = document.getElementById("ordersRows");

  try {
    const res = await fetch(`${API_BASE}/api/orders`);

    if (!res.ok)
      throw new Error("Cannot load orders");

    allOrders = await res.json();

    // ===== Statistics =====

    document.getElementById("totalOrders").textContent =
      allOrders.length;

    const ratedOrders =
      allOrders.filter(o => Number(o.userRate) > 0);

    const avgRating =
      ratedOrders.length
        ? (
          ratedOrders.reduce(
            (sum, o) => sum + Number(o.userRate),
            0
          ) / ratedOrders.length
        ).toFixed(1)
        : "0";

    document.getElementById("avgRating").textContent =
      `${avgRating}/5.0`;

    const totalRevenue =
      allOrders.reduce(
        (sum, o) => sum + Number(o.servicePrice || 0),
        0
      );

    document.getElementById("totalRevenue").textContent =
      `${totalRevenue.toLocaleString()} جنيه`;

    renderPage(1);

  } catch (e) {

    container.innerHTML =
      `<div class="row">
          <div class="td">
            ${e.message}
          </div>
       </div>`;
  }
}

function goDetails(id) {
  window.location.href = `../AdminRequestDetails/AdminRequestDetails.html?id=${id}`;
}


function statusClass(status) {
  const s = (status || "").toLowerCase();

  if (s === "pending") return "status-pending";
  if (s === "accepted") return "status-accepted";
  if (s === "rejected") return "status-rejected";
  if (s === "done") return "status-done";

  return "";
}




function renderPage(page) {

  currentPage = page;

  const container =
    document.getElementById("ordersRows");

  const start =
    (page - 1) * PAGE_SIZE;

  const end =
    start + PAGE_SIZE;

  const orders =
    allOrders.slice(start, end);

  container.innerHTML =
    orders.map(o => {

      const t =
        typeText(o.providerType);

      return `
      <div class="row">

        <div class="td">
          <a href="AdminRequestDetails.html?id=${o.id}">
            #REQ-${o.id}
          </a>
        </div>

        <div class="td">
          ${o.userName ?? ""}
        </div>

        <div class="td">
          ${o.userPhone ?? ""}
        </div>

        <div class="td">
          <span class="service-chip"
                style="padding:8px;">
            <img
              src="${t.img}"
              style="width:20px;margin-left:8px;">
            ${t.text}
          </span>
        </div>

        <div class="td">
          ${o.providerName ?? "—"}
        </div>

        <div class="td">
          ${formatDate(o.createdAt)}
        </div>

        <div class="td">
          <span class="status-pill ${statusClass(o.status)}">
            ${statusArabic(o.status)}
          </span>
        </div>

        <div class="td">
          <span class="rating-stars">
            ${stars(o.userRate)}
          </span>
        </div>

        <div class="td">
          <button
            class="detail-btn"
            onclick="goDetails(${o.id})">
            تفاصيل
          </button>
        </div>

      </div>
      `;
    }).join("");

  renderPagination();
}




function renderPagination() {

  const pages =
    Math.ceil(
      allOrders.length / PAGE_SIZE
    );

  const pagination =
    document.querySelector(".pagination");

  let html = "";

  for (let i = 1; i <= pages; i++) {

    html += `
      <button
        class="page-btn ${i === currentPage ? "active" : ""}"
        onclick="renderPage(${i})">
        ${i}
      </button>
    `;
  }

  pagination.innerHTML = html;

  document.querySelector(
    ".table-footer div:first-child"
  ).textContent =
    `عرض ${
      Math.min(
        currentPage * PAGE_SIZE,
        allOrders.length
      )
    } من أصل ${
      allOrders.length
    } عملية`;
}

document.addEventListener("DOMContentLoaded", loadOrders);