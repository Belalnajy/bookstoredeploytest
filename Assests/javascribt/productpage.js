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
  // Retrieve the selected product ID from localStorage
  const selectedProduct = JSON.parse(localStorage.getItem("selectedProduct"));

  // Retrieve all products from localStorage
  const products = JSON.parse(localStorage.getItem("products"));

  // Find the selected product using its ID
  const productId = selectedProduct;
  const product = products?.[productId]; // Access the product using its ID

  // Display the product details on the page
  if (product) {
    $("#main-image").attr("src", product.img_src);
    $("#product-title").text(product.title);
    $("#product-category").text(product.category);
    $("#product-availability").text(product.stock > 0 ? "In stock" : "Out of stock");
    $("#product-price").text("Price: " + product.price);
    $("#product-description").text(product.description);
  } else {
    alert("No product data found. Please go back and select a product.");
  }

  // Update the cart badge when the page loads
  updateCartBadge();

  $(document).on("click", ".addtocart", function () {
    const quantity = parseInt($(".quantity-input").val(), 10);
    for (let i = 0; i < quantity; i++) {
      addToCart(productId);
    }
  });

  $(document).on("click", ".addtofav", function () {
    const loggedInUser = getLoggedInUserEmail();

    if (loggedInUser) {
      if (loggedInUser.category == "customers") {
        // const loggedInUserEmail = currentSession.session.email;
        const usersData = getUsersData();
        // console.log(usersData);
        // console.log(usersData.customers[loggedInUser.email]);
        const customer = usersData.customers[loggedInUser.email];
        // console.log(customer);
        const wishlist = customer.wishlist; // Fetch the wishlist from the customer data

        const productIndex = wishlist.findIndex((id) => id === productId);

        if (productIndex === -1) {
          // Add the product to the wishlist
          customer.wishlist.push(productId);
          Toast.fire({
            icon: "success",
            title: "Item added to wishlist successfully.",
          });
        } else {
          // Remove the product from the wishlist
          customer.wishlist.splice(productIndex, 1);
          Toast.fire({
            icon: "warning",
            title: "Item removed from wishlist successfully.",
          });
        }
        // Save updated data to localStorage
        localStorage.setItem("signUpData", JSON.stringify(usersData));
        updateFavoritesBadge();
      } else if (loggedInUser.category == "admin" || loggedInUser.category == "sellers") {
        Toast.fire({
          icon: "info",
          title: "You need to log in with a customer account to add products to wishlist.",
        });
      }
    } else {
      Toast.fire({
        icon: "info",
        title: "You need to log in to add products to wishlist.",
      });
    }
  });
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
