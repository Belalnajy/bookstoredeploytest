document.addEventListener("DOMContentLoaded", function () {
  async function loadContent(url, elementId) {
    try {
      const response = await fetch(url);
      const data = await response.text();
      document.getElementById(elementId).innerHTML = data;

      // Ensure the badge is updated after the navigation is loaded
      if (elementId === "mainNavigation") {
        // Call the functions defined in nav.js
        updateCartBadge();
        updateFavoritesBadge();
        setActiveLink();
        updateUserDropdown();
        updateInboxBadge();
      }
    } catch (error) {
      console.error("Error loading content:", error);
    }
  }

  // Load navigation and footer, then initialize search functionality
  (async function () {
    await loadContent("nav.html", "mainNavigation");
    await loadContent("footer.html", "footer");
    // Initialize search functionality after navigation content is loaded
    $("#global-search").on("keydown", function (e) {
      // console.log("I am here");
      if (e.key === "Enter") {
        let allProducts = getProductsData();
        const searchTerm = $(this).val().toLowerCase();

        console.log(searchTerm);
        // console.log(allProducts);

        let filteredProducts = [];
        for (let productId in allProducts) {
          // console.log(productId);

          let product = allProducts[productId];

          // console.log(product);

          if (product.title.toLowerCase().includes(searchTerm)) {
            filteredProducts.push(productId);
          }
        }

        console.log(filteredProducts);

        // save filtered products in local storage
        localStorage.setItem("forSearch", JSON.stringify(filteredProducts));

        // Redirect to the search results page
        window.location.href = "./LoadMore.html";
      }
    });
  })();
});
// Import products data from an external module
import { products } from "./productsdata.js";

// Wait for the DOM to be fully loaded before executing the script
$(document).ready(function () {
  // Initialize data if not already set in localStorage
  if (!localStorage.getItem("products")) {
    setData(); // Set initial product data
  }
  if (!localStorage.getItem("inbox")) {
    setInbox(); // Set initial inbox data
  }

  // Retrieve all products from localStorage
  let allProducts = getData();

  // Display random products and all products on the page
  displayRandomProducts(allProducts);
  displayProducts(allProducts);

  // Select a random product for the banner
  let allProductKeys = Object.keys(allProducts);
  let allProductsLength = allProductKeys.length;
  let product_id = Math.floor(Math.random() * allProductsLength);
  const randomProduct = allProducts[allProductKeys[product_id]];

  // Update the banner with the random product's details
  if (randomProduct) {
    $("#banner > div>img ").prop("src", randomProduct.img_src); // Set banner image
    $("#banner-title").text(`Book of the Month : ${randomProduct.title}`); // Set banner title
    $("#banner-description").text(randomProduct.description); // Set banner description
    randomProduct["product_id"] = allProductKeys[product_id]; // Add product ID to the object to access it in the load more banners
    localStorage.setItem("bannerProduct", JSON.stringify(randomProduct)); // Save banner product to access it in the load more banners
  }

  // Redirect to the product page when the banner button is clicked
  $("#banner-btn").on("click", function () {
    localStorage.setItem("selectedProduct", JSON.stringify(allProductKeys[product_id]));
    window.location.href = "./Product Page.html";
  });

  // Handle category tab clicks
  $("#tabs .nav-link").click(function (e) {
    e.preventDefault(); // Prevent default link behavior
    $("#tabs .nav-link").removeClass("active text-primary"); // Remove active class from all tabs
    $(this).addClass("active text-primary"); // Add active class to the clicked tab
    const category = $(this).data("category"); // Get the selected category
    displayProducts(allProducts, category); // Display products for the selected category
  });
});

/**
 * Initializes the inbox in localStorage if it doesn't exist.
 */
function setInbox() {
  let inbox = []; // Create an empty inbox array
  localStorage.setItem("inbox", JSON.stringify(inbox)); // Save to localStorage
}

/**
 * Displays random products in the specified container.
 * @param {Object} allProducts - All products data.
 */
function displayRandomProducts(allProducts) {
  const randomProducts = getRandomProducts(allProducts); // Get random product IDs
  const container = $(".ran-products > .row"); // Get the container for random products
  container.empty(); // Clear existing content

  // Create and append product cards for each random product
  randomProducts.forEach((productId) => {
    let product = allProducts[productId]; // Get product details
    const productCard = $(`
      <div class="col-md-6 col-lg-3 col-12">
        <div class="card card-style my-3 mx-auto">
          <img style="height: 250px" src="${product.img_src}" class="card-img-top" alt="${product.title}" />
          <div class="card-body text-center">
            <a href="#" class="btn add-to-cart">Add To Cart</a>
          </div>
        </div>
      </div>
    `);

    // Handle "Add to Cart" button click
    productCard.find(".add-to-cart").on("click", function (e) {
      e.stopPropagation(); // Prevent event bubbling
      addToCart(productId); // Add the product to the cart
    });

    // Redirect to the product page when the card is clicked
    productCard.on("click", function () {
      localStorage.setItem("selectedProduct", JSON.stringify(productId));
      window.location.href = "./Product Page.html";
    });

    container.append(productCard); // Append the card to the container
  });
}

/**
 * Generates an array of random product IDs.
 * @param {Object} products - All products data.
 * @returns {string[]} - An array of random product IDs.
 */
function getRandomProducts(products) {
  const randomProducts = []; // Array to store random product IDs
  const productKeys = Object.keys(products); // Get all product keys

  // Select 4 random products
  while (randomProducts.length < 4) {
    const randomIndex = Math.floor(Math.random() * productKeys.length); // Random index
    let randomProductId = productKeys[randomIndex]; // Get random product ID

    // Ensure the product exists and hasn't been added already
    if (products[randomProductId] && !randomProducts.includes(randomProductId)) {
      randomProducts.push(randomProductId); // Add to the array
    }
  }
  return randomProducts;
}

/**
 * Saves the initial product data to localStorage.
 */
function setData() {
  localStorage.setItem("products", JSON.stringify(products)); // Save products data
}

/**
 * Retrieves product data from localStorage.
 * @returns {Object} - The product data.
 */
function getData() {
  const storedData = localStorage.getItem("products"); // Get data from localStorage
  return JSON.parse(storedData); // Parse and return the data
}

/**
 * Displays products in the specified container based on category.
 * @param {Object} products - All products data.
 * @param {string} category - The category to filter by (default: "All").
 */
function displayProducts(products, category = "All") {
  const container = $("#books-Container"); // Get the container for products

  // Fade out the container, update its content, and fade it back in
  container.fadeOut(300, function () {
    container.empty(); // Clear existing content

    // Filter products by category
    const filteredProducts =
      category === "All"
        ? products // Show all products if category is "All"
        : Object.fromEntries(
            // Filter products by category
            Object.entries(products).filter(([key, product]) => product.category === category),
          );

    // Create and append product cards for each filtered product
    Object.keys(filteredProducts).forEach((key) => {
      const product = filteredProducts[key]; // Get product details
      const BookCard = $(`
        <div class="col-lg-3 col-md-6 col-sm-12 p-4">
          <div class="card h-100 w-100" id="product_${key}">
            <div class="img-container">
              <img src="${product.img_src}" alt="${product.title}" class="card-img-top imgmain"/>
              <div class="overlay">
                <button class="btn btn-outline-secondary btn-sm add-to-cart">
                  <i class="fas fs-2 fa-cart-plus mr-2"></i>
                </button>
                <button class="btn btn-outline-secondary btn-sm add-to-fav">
                  <i class="fa-regular fs-2 fa-heart"></i>
                </button>
              </div>
            </div>
            <div class="card-body">
              <h5 class="card-title">${product.title}</h5>
              <p class="card-text">${product.description}</p>
              <p class="card-text price" style="color: green; font-weight: bold;">Price: ${product.price}</p>
            </div>
          </div>
        </div>
      `);

      // Handle "Add to Cart" button click
      BookCard.find(".add-to-cart").on("click", function (e) {
        e.stopPropagation(); // Prevent event bubbling
        addToCart(key); // Add the product to the cart
      });

      // Handle "Add to Favorites" button click
      BookCard.find(".add-to-fav").on("click", function (e) {
        e.stopPropagation(); // Prevent event bubbling
        addToFavorite(key, $(this)); // Add the product to favorites
      });

      // Redirect to the product page when the card is clicked
      BookCard.on("click", function () {
        localStorage.setItem("selectedProduct", JSON.stringify(key));
        window.location.href = "Product Page.html";
      });

      container.append(BookCard); // Append the card to the container
    });

    checkheartbutton(); // Update heart button states
    container.fadeIn(300); // Fade in the container
  });
}
