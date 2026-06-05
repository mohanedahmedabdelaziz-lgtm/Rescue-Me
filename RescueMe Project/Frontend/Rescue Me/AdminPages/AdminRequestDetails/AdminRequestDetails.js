const API_BASE = "http://localhost:5065";

function getId() {
  return new URLSearchParams(window.location.search).get("id");
}

function typeText(providerType) {
  if (providerType === 0) return { text: "(Tow Truck) ونش سحب", img: "/assets/towlogo.png" };
  if (providerType === 1) return { text: "ميكانيكي", img: "/assets/mechanical.png" };
  if (providerType === 2) return { text: "كهربائي", img: "/assets/electrical.png" };
  return { text: "غير معروف", img: "/assets/towlogo.png" };
}

function statusArabic(status) {
  const s = (status || "").toLowerCase();
  if (s === "pending") return "قيد الانتظار";
  if (s === "accepted") return "تم القبول";
  if (s === "rejected") return "مرفوض";
  if (s === "done") return "تم الإكمال";
  return status || "";
}

function stars(rate) {
  const r = Number(rate);
  if (!r || r < 1) return "—";
  return "★".repeat(r) + "☆".repeat(5 - r);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? "";
}

async function loadDetails() {
  const id = getId();
  if (!id) {
    alert("Missing id. Open like: AdminRequestDetails.html?id=1");
    return;
  }

  const res = await fetch(`${API_BASE}/api/orders/${id}`);
  if (!res.ok) {
    alert("Order not found");
    return;
  }

  const o = await res.json();

  setText("d_orderNo", `#REQ-${o.id}`);
  const statusEl = document.getElementById("d_statusText");
  if (statusEl) {
    statusEl.textContent = statusArabic(o.status);
    statusEl.className = `status-text ${statusClass(o.status)}`;
  }
  setText("d_servicePrice", o.servicePrice);
  setText("d_createdAt", o.createdAt ? new Date(o.createdAt).toLocaleString() : "");

  const t = typeText(o.providerType);
  const serviceTypeEl = document.getElementById("d_serviceType");
  if (serviceTypeEl) {
    serviceTypeEl.innerHTML = `<img style="width:30px;margin-left:8px" src="${t.img}" alt=""> ${t.text}`;
  }

  setText("d_address", o.userAddress ?? "—");

  setText("d_userName", o.userName ?? "—");
  setText("d_carName", o.carName ?? "—");
  setText("d_userPhone", o.userPhone ?? "—");
  setText("d_description", o.description ?? "—");

  setText("d_providerName", o.providerName ?? "—");
  setText("d_providerPhone", o.providerPhone ?? "—");
  const providerTypeEl = document.getElementById("d_providertype");
  if (providerTypeEl) {
    providerTypeEl.innerHTML = `
    <img style="width:30px;margin-left:8px" src="${t.img}" alt="">
    ${t.text}
  `;
  }



  setText("d_rateStars", stars(o.userRate));
  setText("d_comment", o.userComment ? `"${o.userComment}"` : "لا يوجد تعليق");
}


function statusClass(status) {
  const s = (status || "").toLowerCase();

  if (s === "pending") return "status-pending";
  if (s === "accepted") return "status-accepted";
  if (s === "rejected") return "status-rejected";
  if (s === "done") return "status-done";

  return "";
}

document.addEventListener("DOMContentLoaded", loadDetails);