const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏" },
  banana: { name: "Banana", emoji: "🍌" },
  lemon: { name: "Lemon", emoji: "🍋" },
  strawberry: { name: "Strawberry", emoji: "🍓" },
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

function addToBasket(product) {
  const basket = getBasket();
  
  // Check for strawberry/banana conflict
  const hasStrawberry = basket.includes("strawberry");
  const hasBanana = basket.includes("banana");
  
  if ((product === "strawberry" && hasBanana) || (product === "banana" && hasStrawberry)) {
    showError("Strawberries and bananas cannot be combined.");
    return;
  }
  
  basket.push(product);
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
  
  basket.forEach((product) => {
    if (typeof product === "object" && product.type === "custom") {
      requestedItems.push(product);
    } else {
      regularItems.push(product);
    }
  });
  
  // Render regular items
  regularItems.forEach((product) => {
    const item = PRODUCTS[product];
    if (item) {
      const li = document.createElement("li");
      li.innerHTML = `<span class='basket-emoji'>${item.emoji}</span> <span>${item.name}</span>`;
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
window.addToBasket = function (product) {
  origAddToBasket(product);
  renderBasketIndicator();
};
const origClearBasket = window.clearBasket;
window.clearBasket = function () {
  origClearBasket();
  renderBasketIndicator();
};
