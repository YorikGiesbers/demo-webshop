const PRODUCTS = {
  apple: { 
    name: "Apple", 
    emoji: "🍏",
    variants: [
      { id: "regular", name: "Regular" },
      { id: "caramel", name: "Caramel Coated" },
      { id: "candy", name: "Candy Coated" },
      { id: "chocolate", name: "Chocolate Dipped" }
    ]
  },
  banana: { 
    name: "Banana", 
    emoji: "🍌",
    variants: [
      { id: "regular", name: "Regular" },
      { id: "chocolate", name: "Chocolate Covered" },
      { id: "nutella", name: "Nutella Filled" },
      { id: "frozen", name: "Frozen" }
    ]
  },
  lemon: { 
    name: "Lemon", 
    emoji: "🍋",
    variants: [
      { id: "regular", name: "Regular" },
      { id: "candied", name: "Candied" },
      { id: "glazed", name: "Honey Glazed" },
      { id: "preserved", name: "Preserved" }
    ]
  },
  strawberry: { 
    name: "Strawberry", 
    emoji: "🍓",
    variants: [
      { id: "regular", name: "Regular" },
      { id: "stick", name: "On a Stick" },
      { id: "chocolate", name: "Chocolate Covered" },
      { id: "whipped", name: "With Whipped Cream" }
    ]
  },
  grapes: { 
    name: "Grapes", 
    emoji: "🍇",
    variants: [
      { id: "regular", name: "Regular" },
      { id: "seedless", name: "Seedless" },
      { id: "frozen", name: "Frozen" },
      { id: "juice", name: "Juice Ready" }
    ]
  },
};

function getBasket() {
  try {
    const basket = localStorage.getItem("basket");
    if (!basket) return [];
    const parsed = JSON.parse(basket);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Error parsing basket from localStorage:", error);
    return [];
  }
}

/**
 * Adds a product to the basket with optional variant selection
 * @param {string} product - Product ID
 * @param {string} [variant="regular"] - Product variant ID
 */
function addToBasket(product, variant = "regular") {
  const basket = getBasket();
  
  // Store product with variant information
  const basketItem = {
    product: product,
    variant: variant
  };
  
  basket.push(basketItem);
  localStorage.setItem("basket", JSON.stringify(basket));
  clearError();
  showSuccess("Item added to basket!");
}

/**
 * Saves the current order to localStorage with timestamp
 * @param {Array} basket - The basket items to save
 */
function saveOrder(basket) {
  const order = {
    items: basket,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString()
  };
  localStorage.setItem("lastOrder", JSON.stringify(order));
}

/**
 * Retrieves the last completed order from localStorage
 * @returns {Object|null} The last order object or null if no order exists
 */
function getLastOrder() {
  try {
    const order = localStorage.getItem("lastOrder");
    if (!order) return null;
    return JSON.parse(order);
  } catch (error) {
    console.error("Error retrieving last order:", error);
    return null;
  }
}

/**
 * Clears all items from the basket after saving them as an order
 */
function clearBasket() {
  const basket = getBasket();
  if (basket.length > 0) {
    saveOrder(basket);
  }
  localStorage.removeItem("basket");
  clearError();
}

/**
 * Displays the last completed order summary on the checkout page
 * @param {string} containerId - ID of the container to display the order in
 */
function displayOrderSummary(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const order = getLastOrder();
  if (!order) return;
  
  const regularItems = [];
  const requestedItems = [];
  
  // Separate regular and requested items
  order.items.forEach((item) => {
    if (typeof item === "object" && item.type === "custom") {
      requestedItems.push(item);
    } else {
      regularItems.push(item);
    }
  });
  
  // Group regular items by product and variant, counting quantities
  const groupedItems = {};
  regularItems.forEach((item) => {
    const product = typeof item === "string" ? item : item.product;
    const variant = typeof item === "string" ? "regular" : item.variant;
    const key = product + ":" + variant;
    
    if (!groupedItems[key]) {
      groupedItems[key] = {
        product: product,
        variant: variant,
        quantity: 0
      };
    }
    groupedItems[key].quantity++;
  });
  
  // Build order summary HTML
  let summaryHTML = '<div class="order-summary">\n';
  summaryHTML += '<h2>Order Summary</h2>\n';
  summaryHTML += '<p class="order-date">Ordered on ' + order.date + ' at ' + order.time + '</p>\n';
  summaryHTML += '<ul class="order-items">\n';
  
  // Add grouped regular items
  Object.values(groupedItems).forEach((itemGroup) => {
    const productData = PRODUCTS[itemGroup.product];
    if (productData) {
      const variantData = productData.variants?.find(v => v.id === itemGroup.variant);
      const variantName = variantData ? " - " + variantData.name : "";
      const quantityLabel = itemGroup.quantity > 1 ? itemGroup.quantity + "x " : "";
      summaryHTML += '<li><span class="order-item-emoji">' + productData.emoji + '</span> <span class="order-item-quantity">' + quantityLabel + '</span>' + productData.name + variantName + '</li>\n';
    }
  });
  
  // Add requested items section if any
  if (requestedItems.length > 0) {
    summaryHTML += '<li class="order-requested-header"><strong>Requested Items</strong></li>\n';
    requestedItems.forEach((item) => {
      summaryHTML += '<li class="order-requested-item"><span class="order-item-emoji">📝</span> ' + item.name + '</li>\n';
    });
  }
  
  summaryHTML += '</ul>\n';
  summaryHTML += '<div class="order-actions">\n';
  summaryHTML += '<a href="index.html" class="continue-shopping-btn">Continue Shopping</a>\n';
  summaryHTML += '</div>\n';
  summaryHTML += '</div>\n';
  
  container.innerHTML = summaryHTML;
}

/**
 * Shows a success message to the user
 * @param {string} message - Success message to display
 */
function showSuccess(message) {
  let successBox = document.querySelector(".success-message");
  if (!successBox) {
    successBox = document.createElement("div");
    successBox.className = "success-message";
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.insertBefore(successBox, mainContent.firstChild);
    } else {
      document.body.insertBefore(successBox, document.body.firstChild);
    }
  }
  successBox.textContent = message;
  successBox.style.display = "block";
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    successBox.style.display = "none";
  }, 3000);
}

function renderBasket() {
  const basket = getBasket();
  const basketList = document.getElementById("basketList");
  const cartButtonsRow = document.querySelector(".cart-buttons-row");
  if (!basketList) return;
  basketList.innerHTML = "";
  if (basket.length === 0) {
    basketList.innerHTML = "<li>No products in basket.</li>";
    if (cartButtonsRow) cartButtonsRow.style.display = "none";
    return;
  }
  
  // Separate regular and requested items
  const regularItems = [];
  const requestedItems = [];
  
  basket.forEach((item) => {
    if (typeof item === "object" && item.type === "custom") {
      requestedItems.push(item);
    } else {
      regularItems.push(item);
    }
  });
  
  // Group regular items by product and variant, counting quantities
  const groupedItems = {};
  regularItems.forEach((item) => {
    const product = typeof item === "string" ? item : item.product;
    const variant = typeof item === "string" ? "regular" : item.variant;
    const key = `${product}:${variant}`;
    
    if (!groupedItems[key]) {
      groupedItems[key] = {
        product: product,
        variant: variant,
        quantity: 0
      };
    }
    groupedItems[key].quantity++;
  });
  
  // Render grouped regular items with quantities
  Object.values(groupedItems).forEach((itemGroup) => {
    const productData = PRODUCTS[itemGroup.product];
    
    if (productData) {
      const li = document.createElement("li");
      const variantData = productData.variants?.find(v => v.id === itemGroup.variant);
      const variantName = variantData ? ` - ${variantData.name}` : "";
      const quantityLabel = itemGroup.quantity > 1 ? `${itemGroup.quantity}x ` : "";
      li.innerHTML = `<span class='basket-emoji'>${productData.emoji}</span> <span class='basket-item-quantity'>${quantityLabel}</span><span>${productData.name}${variantName}</span>`;
      basketList.appendChild(li);
    }
  });
  
  // Render requested items section
  if (requestedItems.length > 0) {
    const requestedSection = document.createElement("li");
    requestedSection.className = "requested-section-header";
    requestedSection.innerHTML = "<strong>Requested Items</strong>";
    basketList.appendChild(requestedSection);
    
    requestedItems.forEach((item) => {
      const li = document.createElement("li");
      li.className = "requested-item";
      li.innerHTML = `
        <div class="requested-item-content">
          <div class="requested-item-main">
            <span class="requested-emoji">📝</span>
            <div class="requested-item-info">
              <strong>${item.name}</strong>
              <p class="requested-item-desc">${item.description}</p>
              ${item.link ? `<p class="requested-item-link"><a href="${item.link}" target="_blank" rel="noopener noreferrer">View reference</a></p>` : ""}
            </div>
          </div>
          <span class="required-badge">Request</span>
        </div>
        <div class="requested-item-actions">
          <button class="edit-requested-item-btn" data-id="${item.id}" aria-label="Edit ${item.name}">Edit</button>
          <button class="remove-requested-item-btn" data-id="${item.id}" aria-label="Remove ${item.name}">Remove</button>
        </div>
      `;
      basketList.appendChild(li);
    });
  }
  
  if (cartButtonsRow) cartButtonsRow.style.display = "flex";
  
  // Attach event listeners for edit and remove buttons
  attachRequestedItemListeners();
}

/**
 * Attach event listeners to requested item buttons using event delegation
 */
function attachRequestedItemListeners() {
  const basketList = document.getElementById("basketList");
  if (!basketList) return;
  
  // Use event delegation for better performance
  basketList.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-requested-item-btn")) {
      e.preventDefault();
      const id = e.target.getAttribute("data-id");
      editRequestedItem(id);
    } else if (e.target.classList.contains("remove-requested-item-btn")) {
      e.preventDefault();
      const id = e.target.getAttribute("data-id");
      removeRequestedItem(id);
    }
  });
}

/**
 * Shows an error message to the user
 * @param {string} message - Error message to display
 */
function showError(message) {
  let errorBox = document.querySelector(".error-message");
  if (!errorBox) {
    errorBox = document.createElement("div");
    errorBox.className = "error-message";
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.insertBefore(errorBox, mainContent.firstChild);
    } else {
      document.body.insertBefore(errorBox, document.body.firstChild);
    }
  }
  errorBox.textContent = message;
  errorBox.style.display = "block";
}

/**
 * Clears any displayed error messages
 */
function clearError() {
  const errorBox = document.querySelector(".error-message");
  if (errorBox) {
    errorBox.style.display = "none";
  }
  const successBox = document.querySelector(".success-message");
  if (successBox) {
    successBox.style.display = "none";
  }
}

function openProductRequestModal() {
  const modal = document.getElementById("productRequestModal");
  if (modal) {
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
  }
}

function closeProductRequestModal() {
  const modal = document.getElementById("productRequestModal");
  if (modal) {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    const form = document.getElementById("productRequestForm");
    if (form) form.reset();
  }
}

function generateUniqueId() {
  return "custom-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
}

function addCustomProductToBasket(name, description, link) {
  const basket = getBasket();
  const customProduct = {
    type: "custom",
    id: generateUniqueId(),
    name: name,
    description: description,
    link: link || ""
  };
  basket.push(customProduct);
  localStorage.setItem("basket", JSON.stringify(basket));
  renderBasketIndicator();
  clearError();
}

function editRequestedItem(id) {
  const basket = getBasket();
  const item = basket.find((p) => typeof p === "object" && p.type === "custom" && p.id === id);
  if (!item) return;
  
  const name = prompt("Product Name:", item.name);
  if (name === null) return;
  
  const description = prompt("Description:", item.description);
  if (description === null) return;
  
  const link = prompt("Reference Link (leave blank for none):", item.link);
  if (link === null) return;
  
  item.name = name;
  item.description = description;
  item.link = link;
  localStorage.setItem("basket", JSON.stringify(basket));
  renderBasket();
}

function removeRequestedItem(id) {
  const basket = getBasket();
  const index = basket.findIndex((p) => typeof p === "object" && p.type === "custom" && p.id === id);
  if (index > -1) {
    basket.splice(index, 1);
    localStorage.setItem("basket", JSON.stringify(basket));
    renderBasket();
    renderBasketIndicator();
  }
}

function renderBasketIndicator() {
  const basket = getBasket();
  let indicator = document.querySelector(".basket-indicator");
  if (!indicator) {
    const basketLink = document.querySelector(".basket-link");
    if (!basketLink) return;
    indicator = document.createElement("span");
    indicator.className = "basket-indicator";
    basketLink.appendChild(indicator);
  }
  if (basket.length > 0) {
    indicator.textContent = basket.length;
    indicator.style.display = "flex";
  } else {
    indicator.style.display = "none";
  }
}

// Call this on page load and after basket changes
if (document.readyState !== "loading") {
  renderBasketIndicator();
} else {
  document.addEventListener("DOMContentLoaded", renderBasketIndicator);
}

// Patch basket functions to update indicator
const origAddToBasket = window.addToBasket;
window.addToBasket = function (product, variant) {
  origAddToBasket(product, variant);
  renderBasketIndicator();
};
const origClearBasket = window.clearBasket;
window.clearBasket = function () {
  origClearBasket();
  renderBasketIndicator();
};
