let cart = [];
let total = 0;
let currentUser = null;
let isLoginMode = true;

// DOM elements
const cartSidebar = document.getElementById("cart-sidebar");
const authModal = document.getElementById("auth-modal");
const checkoutModal = document.getElementById("checkout-modal");
const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const totalElement = document.getElementById("total");
const checkoutTotal = document.getElementById("checkout-total");
const userGreeting = document.getElementById("user-greeting");

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  updateCartDisplay();
  formatCardNumber();
  formatExpiry();
});

// Cart functions
function addToCart(name, price) {
  cart.push({ name, price, id: Date.now() });
  total += price;
  updateCartDisplay();
  showToast("Item added to cart!");
}

function removeFromCart(id) {
  const index = cart.findIndex((item) => item.id === id);
  if (index > -1) {
    total -= cart[index].price;
    cart.splice(index, 1);
    updateCartDisplay();
    showToast("Item removed from cart");
  }
}

function updateCartDisplay() {
  // Update cart count
  cartCount.textContent = cart.length;
  cartCount.style.display = cart.length > 0 ? "flex" : "none";

  // Update cart items
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Your cart is empty</p>
        <p style="font-size: 14px; margin-top: 8px;">Add some delicious items to get started!</p>
      </div>
    `;
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item">
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${item.price}</div>
        </div>
        <button onclick="removeFromCart(${item.id})" class="remove-item-btn" aria-label="Remove ${item.name}">
          ×
        </button>
      </div>
    `
      )
      .join("");
  }

  // Update totals
  totalElement.textContent = total;
  checkoutTotal.textContent = total;

  // Update checkout button state
  const checkoutBtn = document.querySelector(".checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.disabled = cart.length === 0;
  }
}

// Cart sidebar functions
function toggleCart() {
  cartSidebar.classList.toggle("open");
}

// Authentication functions
function toggleAuth() {
  if (currentUser) {
    logout();
  } else {
    authModal.classList.add("active");
  }
}

function closeAuth() {
  authModal.classList.remove("active");
}

function switchAuthMode() {
  isLoginMode = !isLoginMode;
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const modalTitle = document.getElementById("modal-title");
  const authSwitchText = document.getElementById("auth-switch-text");

  if (isLoginMode) {
    loginForm.style.display = "block";
    signupForm.style.display = "none";
    modalTitle.textContent = "Welcome Back";
    authSwitchText.innerHTML =
      'Don\'t have an account? <button type="button" class="switch-btn" onclick="switchAuthMode()">Sign up</button>';
  } else {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
    modalTitle.textContent = "Create Account";
    authSwitchText.innerHTML =
      'Already have an account? <button type="button" class="switch-btn" onclick="switchAuthMode()">Sign in</button>';
  }
}

function submitLogin(event) {
  event.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  // Try local storage first
  const user = JSON.parse(localStorage.getItem(email) || "{}");
  if (user.password === password) {
    loginSuccess(user);
    return;
  }

  // Try server authentication
  fetch("http://localhost:3001/login.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        loginSuccess({ name: data.name, email });
      } else {
        showToast("Invalid email or password", "error");
      }
    })
    .catch(() => {
      showToast("Login failed. Please try again.", "error");
    });
}

function submitSignup(event) {
  event.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!name || !email || !password) {
    showToast("Please fill in all fields", "error");
    return;
  }

  // Save to localStorage
  localStorage.setItem(email, JSON.stringify({ name, password }));

  // Try server signup
  fetch("http://localhost:3001/signup.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      showToast(data.message || "Account created successfully!");
      switchAuthMode(); // Switch to login mode
    })
    .catch(() => {
      showToast("Account created locally!");
      switchAuthMode();
    });
}

function loginSuccess(user) {
  currentUser = user;
  userGreeting.textContent = `Welcome, ${user.name}!`;
  document.querySelector(".auth-text").textContent = "Sign Out";
  closeAuth();
  showToast(`Welcome back, ${user.name}!`);
}

function logout() {
  currentUser = null;
  userGreeting.textContent = "";
  document.querySelector(".auth-text").textContent = "Sign In";
  showToast("Signed out successfully");
}

// Checkout functions
function showCheckout() {
  if (cart.length === 0) {
    showToast("Your cart is empty!", "error");
    return;
  }

  if (!currentUser) {
    showToast("Please sign in to continue", "error");
    toggleAuth();
    return;
  }

  checkoutModal.classList.add("active");
}

function closeCheckout() {
  checkoutModal.classList.remove("active");
}

function submitPayment(event) {
  event.preventDefault();
  const name = document.getElementById("card-name").value.trim();
  const number = document
    .getElementById("card-number")
    .value.replace(/\s/g, "");
  const expiry = document.getElementById("expiry").value;
  const cvv = document.getElementById("cvv").value;

  if (!name || !number || !expiry || !cvv) {
    showToast("Please fill in all payment details", "error");
    return;
  }

  if (number.length < 13 || number.length > 19) {
    showToast("Please enter a valid card number", "error");
    return;
  }

  // Simulate payment processing
  const paymentBtn = document.querySelector(".payment-btn");
  paymentBtn.textContent = "Processing...";
  paymentBtn.disabled = true;

  setTimeout(() => {
    showToast("Payment successful! Your food is on the way! 🎉");
    cart = [];
    total = 0;
    updateCartDisplay();
    closeCheckout();
    toggleCart();

    // Reset form
    document.querySelector(".checkout-form").reset();
    paymentBtn.textContent = `Pay ₹${total}`;
    paymentBtn.disabled = false;
  }, 2000);
}

// Input formatting
function formatCardNumber() {
  const cardInput = document.getElementById("card-number");
  if (cardInput) {
    cardInput.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\s/g, "").replace(/[^0-9]/gi, "");
      let formattedValue = value.match(/.{1,4}/g)?.join(" ") || value;
      e.target.value = formattedValue;
    });
  }
}

function formatExpiry() {
  const expiryInput = document.getElementById("expiry");
  if (expiryInput) {
    expiryInput.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length >= 2) {
        value = value.substring(0, 2) + "/" + value.substring(2, 4);
      }
      e.target.value = value;
    });
  }
}

// Toast notifications
function showToast(message, type = "success") {
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  const styles = `
    position: fixed;
    top: 100px;
    right: 24px;
    background: ${type === "success" ? "#10b981" : "#ef4444"};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    font-weight: 500;
    z-index: 2000;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;

  toast.style.cssText = styles;
  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.transform = "translateX(0)";
  }, 100);

  // Remove after delay
  setTimeout(() => {
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Close modals on backdrop click
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal-overlay")) {
    if (e.target.id === "auth-modal") {
      closeAuth();
    } else if (e.target.id === "checkout-modal") {
      closeCheckout();
    }
  }
});

// Close cart on outside click
document.addEventListener("click", function (e) {
  if (
    cartSidebar.classList.contains("open") &&
    !cartSidebar.contains(e.target) &&
    !e.target.classList.contains("cart-toggle") &&
    !e.target.closest(".cart-toggle")
  ) {
    toggleCart();
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    if (authModal.classList.contains("active")) {
      closeAuth();
    }
    if (checkoutModal.classList.contains("active")) {
      closeCheckout();
    }
    if (cartSidebar.classList.contains("open")) {
      toggleCart();
    }
  }
});

// Add remove button styles
const style = document.createElement("style");
style.textContent = `
  .remove-item-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 20px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: var(--transition);
    margin-left: 12px;
  }
  
  .remove-item-btn:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
`;
document.head.appendChild(style);
