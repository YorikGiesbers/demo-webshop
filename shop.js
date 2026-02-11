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
}

function clearBasket() {
  localStorage.removeItem("basket");
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
  
  // Render regular items
  regularItems.forEach((item) => {
    const product = typeof item === "string" ? item : item.product;
    const variant = typeof item === "string" ? "regular" : item.variant;
    const productData = PRODUCTS[product];
    
    if (productData) {
      const li = document.createElement("li");
      const variantData = productData.variants?.find(v => v.id === variant);
      const variantName = variantData ? ` - ${variantData.name}` : "";
      li.innerHTML = `<span class='basket-emoji'>${productData.emoji}</span> <span>${productData.name}${variantName}</span>`;
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

function attachRequestedItemListeners() {
  document.querySelectorAll(".edit-requested-item-btn").forEach((btn) => {
    btn.onclick = function (e) {
      e.preventDefault();
      const id = this.getAttribute("data-id");
      editRequestedItem(id);
    };
  });
  
  document.querySelectorAll(".remove-requested-item-btn").forEach((btn) => {
    btn.onclick = function (e) {
      e.preventDefault();
      const id = this.getAttribute("data-id");
      removeRequestedItem(id);
    };
  });
}

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

function clearError() {
  const errorBox = document.querySelector(".error-message");
  if (errorBox) {
    errorBox.style.display = "none";
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
