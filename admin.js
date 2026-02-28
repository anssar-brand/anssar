import {
  db,
  auth,
  collection,
  onSnapshot,
  orderBy,
  query,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "./firebase.js";

const loginSection = document.getElementById("admin-login-section");
const dashboardSection = document.getElementById("admin-dashboard-section");
const loginBtn = document.getElementById("admin-login-btn");
const emailInput = document.getElementById("admin-email");
const passwordInput = document.getElementById("admin-password");
const loginError = document.getElementById("admin-login-error");
const logoutBtn = document.getElementById("admin-logout-btn");
const userEmailSpan = document.getElementById("admin-user-email");
const ordersTbody = document.getElementById("orders-tbody");
const sortSelect = document.getElementById("order-sort");

let ordersCache = [];
let currentSort = "date-desc";

function setLoggedInUI(user) {
  if (user) {
    if (loginSection) loginSection.style.display = "none";
    if (dashboardSection) dashboardSection.style.display = "";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
    if (userEmailSpan) userEmailSpan.textContent = user.email || "";
  } else {
    if (loginSection) loginSection.style.display = "";
    if (dashboardSection) dashboardSection.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (userEmailSpan) userEmailSpan.textContent = "";
  }
}

onAuthStateChanged(auth, (user) => {
  setLoggedInUI(user);
  if (user) {
    subscribeToOrders();
  } else {
    if (ordersTbody) {
      ordersTbody.innerHTML =
        '<tr><td colspan="7" class="orders-empty">Connectez-vous pour voir les commandes.</td></tr>';
    }
  }
});

if (loginBtn) {
  loginBtn.addEventListener("click", function(e) {
    e.preventDefault();
    window.adminDoLogin();
  });
}
window.adminDoLogin = function adminDoLogin() {
  var email = emailInput ? emailInput.value.trim() : "";
  var password = passwordInput ? passwordInput.value.trim() : "";
  if (loginError) {
    loginError.style.display = "none";
    loginError.textContent = "";
  }
  if (!email || !password) {
    if (loginError) {
      loginError.textContent = "Veuillez saisir l'email et le mot de passe.";
      loginError.style.display = "block";
    }
    return;
  }
  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.textContent = "Connexion...";
  }
  signInWithEmailAndPassword(auth, email, password)
    .then(function() {
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = "Se connecter";
      }
    })
    .catch(function(err) {
      console.error(err);
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = "Se connecter";
      }
      if (loginError) {
        loginError.textContent = "Identifiants invalides ou compte inexistant. Vérifiez email/mot de passe.";
        loginError.style.display = "block";
      }
    });
};

var adminLoginForm = document.getElementById("admin-login-form");
if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", function(e) {
    e.preventDefault();
    if (typeof window.adminDoLogin === "function") window.adminDoLogin();
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
  });
}

function subscribeToOrders() {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    ordersCache = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data
      };
    });
    renderOrders();
  });
}

function formatDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderOrders() {
  if (!ordersTbody) return;
  if (!ordersCache.length) {
    ordersTbody.innerHTML =
      '<tr><td colspan="7" class="orders-empty">Aucune commande pour le moment.</td></tr>';
    return;
  }

  let list = [...ordersCache];
  if (currentSort === "date-asc") {
    list.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() || 0;
      const tb = b.createdAt?.toMillis?.() || 0;
      return ta - tb;
    });
  } else if (currentSort === "date-desc") {
    list.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() || 0;
      const tb = b.createdAt?.toMillis?.() || 0;
      return tb - ta;
    });
  } else if (currentSort === "status") {
    list.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
  }

  ordersTbody.innerHTML = list
    .map((order) => {
      const productsText = (order.products || [])
        .map((p) => `${p.name} (${p.price} DH)`)
        .join("<br>");
      const created = formatDate(order.createdAt);
      const status = order.status || "pending";
      const statusClass =
        status === "done"
          ? "status-done"
          : status === "cancelled"
          ? "status-cancelled"
          : "status-pending";

      return `
      <tr>
        <td>${order.id}</td>
        <td>
          <strong>${order.customerName || ""}</strong><br>
          <small>${order.phone || ""}</small><br>
          <small>${order.city || ""}</small>
        </td>
        <td>${productsText}</td>
        <td>${created}</td>
        <td><span class="status-pill ${statusClass}">${status}</span></td>
        <td>${order.total || 0} DH</td>
        <td class="orders-actions">
          <button class="btn-print-label" data-id="${order.id}">Print Label</button>
        </td>
      </tr>
    `;
    })
    .join("");

  ordersTbody.querySelectorAll(".btn-print-label").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const order = ordersCache.find((o) => o.id === id);
      if (order) {
        openPrintLabel(order);
      }
    });
  });
}

if (sortSelect) {
  sortSelect.addEventListener("change", () => {
    currentSort = sortSelect.value;
    renderOrders();
  });
}

// Impression de l'étiquette
const labelRoot = document.getElementById("label-print-root");
const labelOrderId = document.getElementById("label-order-id");
const labelCustomerName = document.getElementById("label-customer-name");
const labelCustomerPhone = document.getElementById("label-customer-phone");
const labelCustomerAddress = document.getElementById("label-customer-address");
const labelCustomerCity = document.getElementById("label-customer-city");
const labelProducts = document.getElementById("label-products");
const labelTotal = document.getElementById("label-total");
const labelBarcode = document.getElementById("label-barcode");

function openPrintLabel(order) {
  if (!labelRoot) return;
  labelOrderId.textContent = order.id;
  labelCustomerName.textContent = order.customerName || "";
  labelCustomerPhone.textContent = order.phone || "";
  labelCustomerAddress.textContent = order.address || "";
  labelCustomerCity.textContent = order.city || "";

  const productsText = (order.products || [])
    .map((p) => `${p.name} (${p.price} DH)`)
    .join(" | ");
  labelProducts.textContent = productsText;
  labelTotal.textContent = `Total: ${order.total || 0} DH`;

  if (window.JsBarcode && labelBarcode) {
    labelBarcode.innerHTML = "";
    window.JsBarcode(labelBarcode, order.id, {
      format: "CODE128",
      width: 2,
      height: 60,
      displayValue: false,
      margin: 0
    });
  }

  labelRoot.style.display = "flex";

  setTimeout(() => {
    window.print();
    setTimeout(() => {
      labelRoot.style.display = "none";
    }, 500);
  }, 100);
}

