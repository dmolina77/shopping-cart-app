// Selectores
const cartCount = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items-container");
const cartEmptyMsg = document.getElementById("cart-empty-msg");
const cartTotal = document.getElementById("cart-total");
const btnClearCart = document.getElementById("btn-clear-cart");
const btnCheckout = document.getElementById("btn-checkout");
const toastContainer = document.getElementById("toast-container");

const productsGrid = document.getElementById("products-grid");
const productTemplate = document.getElementById("product-template").content;
const toastTemplate = document.getElementById("toast-template").content;
const cartTemplate = document.getElementById("cart-template").content;

// Estado app
let cart = [];

// Cargar local storage, recuperar cart previo si existe
const savedCart = localStorage.getItem("cart");
cart = savedCart ? JSON.parse(savedCart) : [];

// Guardar local storage
const saveToLocalStorage = () => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

// Agregar al carrito
const addToCart = (product) => {
  const xItem = cart.find((item) => item.id === product.id);
  if (xItem) {
    xItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveToLocalStorage();
  renderCart();
  showToast(product.name);
};

// Remover de carrito
const removeFromCart = (id) => {
  cart = cart.filter((item) => item.id !== id);
  saveToLocalStorage();
  renderCart();
};

// Vaciar carrito
const clearCart = () => {
  cart = [];
  saveToLocalStorage();
  renderCart();
};

// Cargar productos, consumo API
const getProducts = async () => {
  try {
    const res = await fetch("https://dummyjson.com/products");
    const data = await res.json();

    productsGrid.innerHTML = "";

    const fragment = document.createDocumentFragment();

    data.products.forEach((product) => {
      const clone = productTemplate.cloneNode(true);

      const img = clone.querySelector("img");
      const category = clone.querySelector(".text-uppercase");
      const title = clone.querySelector("h3");
      const price = clone.querySelector(".text-warning");
      const button = clone.querySelector(".btn-add-cart");

      img.src = product.thumbnail;
      img.alt = product.title;

      category.textContent = product.category;
      title.textContent = product.title;
      price.textContent = `$${product.price}`;

      button.dataset.id = product.id;
      button.dataset.name = product.title;
      button.dataset.price = product.price;
      button.dataset.img = product.thumbnail;

      fragment.appendChild(clone);
    });

    productsGrid.appendChild(fragment);
  } catch (error) {
    console.error(error);
  }
};

// Renderizar cart
const renderCart = () => {
  // Limpiar renderizados previos eliminando todos los elementos con clase .cart-item
  const xItems = cartItemsContainer.querySelectorAll(".cart-item");
  xItems.forEach((item) => item.remove());

  // Mostrar y ocultar mensaje de carrito vacío
  if (cart.length === 0) {
    cartEmptyMsg.hidden = false;
    cartTotal.textContent = "$0.00";
    cartCount.textContent = "0";
    return;
  }
  cartEmptyMsg.hidden = true;

  const fragment = document.createDocumentFragment();

  // Recorremos el carrito una sola vez de forma limpia
  cart.forEach((item) => {
    const subtotal = (item.price * item.quantity).toFixed(2);
    const clone = cartTemplate.cloneNode(true);

    // Mapear elementos del template clonado
    const cartItemRoot = clone.querySelector(".cart-item");
    const img = clone.querySelector("img");
    const name = clone.querySelector(".cart-item-name");
    const qtyInfo = clone.querySelector(".cart-item-qty");
    const subtotalEl = clone.querySelector(".cart-item-subtotal");
    const btnRemove = clone.querySelector(".btn-remove-item");

    // Rellenar datos
    cartItemRoot.dataset.id = item.id;
    img.src = item.img;
    img.alt = item.name;
    name.textContent = item.name;
    qtyInfo.textContent = `x${item.quantity} · $${item.price} c/u`;
    subtotalEl.textContent = `$${subtotal}`;
    btnRemove.dataset.id = item.id;

    fragment.appendChild(clone);
  });

  // Agregar todo el fragmento al contenedor del carrito en un solo impacto al DOM
  cartItemsContainer.appendChild(fragment);

  // Calcular y mostrar el total general
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = `$${total.toFixed(2)}`;

  // Actualizar el contador del navbar con la suma de cantidades
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
};

// Mostrar toast notification
const showToast = (productName) => {
  const fragment = document.createDocumentFragment();
  const clone = toastTemplate.cloneNode(true);

  const toastBody = clone.querySelector(".toast-body");
  //toastBody.innerHTML = "";
  toastBody.innerHTML += `¡Se agregó <strong>${productName}</strong> al carrito!`;
  const toastElement = clone.querySelector(".toast");

  fragment.appendChild(clone);
  toastContainer.appendChild(fragment);

  // Inicializar y mostrar usando el objeto nativo de Bootstrap
  const bsToast = new bootstrap.Toast(toastElement, { delay: 3000 });
  bsToast.show();

  // Limpieza: Eliminar el elemento del DOM una vez ocultado para no saturar el HTML
  toastElement.addEventListener("hidden.bs.toast", () => {
    toastElement.remove();
  });
};

// Mostrar toast checkout, finalizar compra
const showCheckoutToast = () => {
  const fragment = document.createDocumentFragment();
  const clone = toastTemplate.cloneNode(true);

  const toastElement = clone.querySelector(".toast");
  toastElement.classList.remove("text-bg-dark");
  toastElement.classList.add("text-bg-success");

  const toastBody = clone.querySelector(".toast-body");
  toastBody.innerHTML = `
    <i class="bi bi-bag-check-fill me-2 text-white fs-5"></i> 
    ¡Compra realizada con éxito! Gracias por su preferencia.
  `;

  fragment.appendChild(clone);
  toastContainer.appendChild(fragment);

  const bsToast = new bootstrap.Toast(toastElement, { delay: 4000 });
  bsToast.show();

  toastElement.addEventListener("hidden.bs.toast", () => {
    toastElement.remove();
  });
};

// Evendt delegation catalogo y agregar al carrito
productsGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-add-cart");
  if (!btn) return;
  const product = {
    id: btn.dataset.id,
    name: btn.dataset.name,
    price: parseFloat(btn.dataset.price),
    img: btn.dataset.img,
  };
  addToCart(product);
});

// Event delegation catalogo y eliminar del carrito
cartItemsContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-remove-item");
  if (!btn) return;
  removeFromCart(btn.dataset.id);
});

btnClearCart.addEventListener("click", () => {
  if (cart.length === 0) return;
  clearCart();
});

btnCheckout.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }
  showCheckoutToast();
  const offcanvasEl = document.getElementById("offcanvasCart");
  const openedOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
  if (openedOffcanvas) {
    openedOffcanvas.hide();
  }
  clearCart();
});

document.addEventListener("DOMContentLoaded", () => {
  getProducts();
  renderCart();
});
