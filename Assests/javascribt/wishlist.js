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

$(document).ready(function () {
  // Function to get favorites for the logged-in user
  function getUserFavorites() {
    const currentSession = JSON.parse(sessionStorage.getItem("currentSession"));
    if (currentSession && currentSession.session && currentSession.session.email) {
      const loggedInUserEmail = currentSession.session.email;
      const signUpData = JSON.parse(localStorage.getItem("signUpData")) || {};

      if (signUpData.customers && signUpData.customers[loggedInUserEmail]) {
        const customer = signUpData.customers[loggedInUserEmail];
        return customer.wishlist || [];
      }
    }
    return [];
  }

  // Save favorites for the logged-in user
  function saveUserFavorites(favorites) {
    const currentSession = JSON.parse(sessionStorage.getItem("currentSession"));
    if (currentSession && currentSession.session && currentSession.session.email) {
      const loggedInUserEmail = currentSession.session.email;
      const signUpData = JSON.parse(localStorage.getItem("signUpData")) || {};

      if (signUpData.customers && signUpData.customers[loggedInUserEmail]) {
        signUpData.customers[loggedInUserEmail].wishlist = favorites;
        localStorage.setItem("signUpData", JSON.stringify(signUpData));
      }
    }
  }

  function getData() {
    const storedData = localStorage.getItem("products");
    return JSON.parse(storedData); // This is the object with keys as IDs
  }

  const allProducts = getData(); // Get all the products
  const allFavorites = getUserFavorites(); // Get the user's wishlist (favorite products)

  // Function to display favorites
  function displayFavorites(favorites, allProducts) {
    const favContainer = $("#fav-conatainer");

    // Add fadeOut animation
    favContainer.fadeOut(300, function () {
      favContainer.empty(); // Clear the container

      if (favorites.length === 0) {
        favContainer.html(`
            <h3 class="text-center text-muted my-5">
                <i class="fas fa-box-open mb-3 fa-10x"></i><br>
                Oops! Seems that your favorites list is empty.<br>
                Why not head back to the store and discover some amazing products to add?
            </h3>
        `);
        favContainer.fadeIn(300);
        return;
    }

      // Display the product cards
      favorites.forEach((productId) => {
        let product = allProducts[productId];
        const productCard = $(`  
          <div class="col-lg-3 col-md-6 col-sm-12 p-4">
            <div class="card h-100 w-100" data-id="${product.title}">
              <div class="img-container">
                <img src="${product.img_src}" alt="${product.title}" class="card-img-top imgmain"/>
                <div class="overlay"></div>
              </div>
              <div class="card-body">
                <h5 class="card-title">${product.title}</h5>
                <p class="card-text">${product.description}</p>
                <p class="card-text price" style="color: green; font-weight: bold;">Price: ${product.price}</p>
                <button class="btn btn-secondary btn-sm my-2 me-2 add-to-cart">
                  <i class="fas fa-cart-plus me-2"></i> Add To Cart
                </button>
                <button class="btn btn-primary btn-sm my-2 remove-fav">
                  <i class="fas fa-trash-alt me-2"></i> Remove From Favorites
                </button>
              </div>
            </div>
          </div>
        `);

        // Handle the "Remove from Favorites" button click
        productCard.find(".remove-fav").on("click", function (e) {
          e.stopPropagation();
          let index = favorites.indexOf(productId);

          favorites.splice(index, 1);
          saveUserFavorites(favorites); // Save updated favorites
          displayFavorites(favorites, allProducts); // Refresh the display
          updateFavoritesBadge();
        });

        productCard.find(".add-to-cart").on("click", function (e) {
          e.stopPropagation();
          addToCart(productId);
        });

        productCard.on("click", ".overlay", function () {
          localStorage.setItem("selectedProduct", JSON.stringify(productId));
          window.location.href = "Product Page.html";
        });

        favContainer.append(productCard); // Add the product card to the container
      });

      favContainer.fadeIn(300); // Add fadeIn animation
    });
  }

  displayFavorites(allFavorites, allProducts); // Display the filtered favorites based on wishlist
});

setActiveLink = function () {
  const pathName = window?.location?.pathname?.toLowerCase();
  if (pathName.includes("home") && pathName) {
    document.getElementById("home-link")?.classList?.add("active");
  } else if (pathName.includes("about") && pathName) {
    document.getElementById("about-link")?.classList?.add("active");
  } else if (pathName.includes("contact") && pathName) {
    document.getElementById("contact-link")?.classList?.add("active");
  } else if (pathName.includes("service") && pathName) {
    document.getElementById("service-link").classList?.add("active");
  } else {
  }
};
