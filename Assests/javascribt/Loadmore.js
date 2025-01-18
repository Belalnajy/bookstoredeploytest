lastChoosenCategory = null;
let currentPage = 1; // Start at the first page
const itemsPerPage = 6; // Number of products per page

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

        // console.log(searchTerm);
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

        // console.log(filteredProducts);

        // save filtered products in local storage
        localStorage.setItem("forSearch", JSON.stringify(filteredProducts));

        // Redirect to the search results page
        window.location.href = "./LoadMore.html";
      }
    });
  })();
});

$(function () {
  //create an array of objects that contains each category name and its quantity
  // get all products
  let allProducts = getBooksData();

  //banner
  let randomProducts = localStorage.getItem("bannerProduct");
  randomProducts = JSON.parse(randomProducts);
  let productId = randomProducts["product_id"];
  // console.log(randomProducts);

  //updating banner photo,title and description
  if (randomProducts) {
    $("#banner > div>img ").prop("src", randomProducts.img_src); // updating image
    $("#banner-title").text(`Book of the Month : ${randomProducts.title}`); // updating title
    $("#banner-description").text(`${randomProducts.description}`);
  }
  $("#banner-btn").on("click", function () {
    localStorage.setItem("selectedProduct", JSON.stringify(productId));
    window.location.href = "./Product Page.html";
  });

  //check if this page was loaded for search results or not
  let searchResults = localStorage.getItem("forSearch");
  searchResults = JSON.parse(searchResults);

  let noResultWrapperGlobal = $("#noResultWrapperGlobal");
  let booksWrapper = $("#booksWrapper");

  if (searchResults) {
    if (searchResults.length > 0) {
      noResultWrapperGlobal.addClass("d-none");
      booksWrapper.removeClass("d-none");

      // console.log("Search results page was loaded");
      // console.log(searchResults);

      // get all products from the search results
      let allSearchResults = {};
      searchResults.forEach((productId) => {
        allSearchResults[productId] = allProducts[productId];
      });
      // console.log(allSearchResults);

      // update storeProductCategory
      storeProductCategory(allSearchResults);

      // update the search results page with the search results
      initializePagination(allProducts, searchResults);

      let productsCategories = getProductCategory();
      // console.log(productsCategories);
      //display number of products in the categories-container div
      const container = $("#categories-container");
      fillBookCategory(container, allSearchResults, productsCategories);
    } else {
      // length of search results is greater than zero

      booksWrapper.addClass("d-none");
      noResultWrapperGlobal.removeClass("d-none");
    }
    // reset the search term and remove the search results from local storage
    localStorage.removeItem("forSearch");
  } else {
    // array that contains keys of all products
    filteredProducts = Object.keys(allProducts);
    initializePagination(allProducts, filteredProducts);
    // console.log(allProducts);
    storeProductCategory(allProducts);
    let productsCategories = getProductCategory();
    // console.log(productsCategories);
    //display number of products in the categories-container div
    const container = $("#categories-container");
    fillBookCategory(container, allProducts, productsCategories);
  }
  $("#sort").on("click", function () {
    sortWay = $(this).val();
    // console.log(sortWay);

    getDisplayedProducts()
      .then((displayedProducts) => {
        // console.log("Retrieved displayed products:", displayedProducts);
        // displayedProducts = displayedProducts.map((id) => allProducts[id]);
        // console.log(displayedProducts);
        switch (sortWay) {
          case "name":
            displayedProducts.sort((a, b) => {
              if (allProducts[a].title < allProducts[b].title) return -1;
              if (allProducts[a].title > allProducts[b].title) return 1;
              return 0;
            });
            // console.log(displayedProducts);
            break;
          case "ascending":
            displayedProducts.sort((a, b) => allProducts[a].price - allProducts[b].price);
            // console.log(displayedProducts);
            break;
          case "descending":
            displayedProducts.sort((a, b) => allProducts[b].price - allProducts[a].price);
            // console.log(displayedProducts);
            break;
          default:
            break;
        }
        // update the displayed products
        refreshProducts(allProducts, displayedProducts);
      })
      .catch((error) => {
        console.error(error);
        // Handle the error case (e.g., display a message to the user)
      });
  });
  $("#apply").on("click", function () {
    slider = $("#slider-range");
    min = slider.slider("values", 0);
    max = slider.slider("values", 1);
    // console.log(min, max);

    //update displayed products
    updateFilteredProducts(min, max);
  });
});
function getUserFromSession() {
  const user = JSON.parse(sessionStorage.getItem("currentSession"));
  return user;
}
function getBooksData() {
  const storedData = localStorage.getItem("products");
  // console.log("Retrieved data from localStorage:", storedData);
  return JSON.parse(storedData);
}
function storeProductCategory(products) {
  //convert all products to array
  let allProductsArray = Object.entries(products);
  // console.log(allProductsArray);
  //create the object that will contain all products categories
  let productsCategories = {};
  // save the quantity of all products
  productsCategories.all = [];
  //looping through all products
  allProductsArray.forEach(([key, value]) => {
    const productKey = key;
    const productDetails = value;
    // console.log(productKey);
    // console.log(productDetails);
    //get product category
    const productCategory = productDetails.category;
    // console.log(productCategory);
    // console.log(productsCategories[productCategory]);
    if (typeof productsCategories[productCategory] === "undefined") {
      // console.log("inside the if statement");
      productsCategories[productCategory] = [];
    }
    // console.log(productsCategories[productCategory]);

    productsCategories[productCategory].push(productKey);
    productsCategories.all.push(productKey);
  });
  // Save to local storage
  localStorage.setItem("productsCategories", JSON.stringify(productsCategories));
}
function getProductCategory() {
  const storedData = localStorage.getItem("productsCategories");
  // console.log("Retrieved data from localStorage:", storedData);
  return JSON.parse(storedData);
}

function fillBookCategory(container, allProducts, productsCategories) {
  container.fadeOut(300, function () {
    container.empty();

    for (let key in productsCategories) {
      // console.log(key, productsCategories[key]);
      length = productsCategories[key].length;

      // console.log(length);
      let categoryLi = $("<li>");
      categoryLi.text(key.charAt(0).toUpperCase() + key.slice(1));
      let quantityLi = $("<li>");
      quantityLi.text(productsCategories[key].length);
      let ulContainer = $("<ul>");
      ulContainer.addClass("list-unstyled counter d-flex justify-content-between fs-5");
      if (key == "all") {
        $("#items-counter").text(length);
        lastChoosenCategory = ulContainer;
        ulContainer.addClass("text-primary fs-4");
      }
      ulContainer.append(categoryLi);
      ulContainer.append(quantityLi);
      ulContainer.on("click", function () {
        // console.log($(this).text());
        if (lastChoosenCategory) {
          lastChoosenCategory.removeClass("text-primary fs-4");
          lastChoosenCategory = $(this);
          lastChoosenCategory.addClass("text-primary fs-4");
          $("#items-counter").text(lastChoosenCategory.children()[1].innerText);
          // console.log("inside fill book category");
          refreshProducts(allProducts, productsCategories[$(lastChoosenCategory.children()[0]).text().toLowerCase()]).catch((error) => {
            console.error("Error processing products:", error);
          });
        }
      });
      container.append(ulContainer);
    }
    // console.log("inside fill book category initailize");

    refreshProducts(allProducts, productsCategories[$(lastChoosenCategory.children()[0]).text().toLowerCase()]).catch((error) => {
      console.error("Error processing products:", error);
    });
  });
  container.fadeIn(300);
}

function updateDisplayedProducts(products, filteredProducts) {
  return new Promise((resolve, reject) => {
    let productsContainer = $("#products-container");
    displayedProducts = [];
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    // Calculate start and end indices for the current page
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;

    // Get products for the current page
    const paginatedProducts = filteredProducts.slice(startIdx, endIdx);

    // Fade out and process products
    productsContainer.fadeOut(300, function () {
      try {
        productsContainer.empty();
        paginatedProducts.forEach((productId) => {
          let product = products[productId];

          if (minPrice > product.price) {
            minPrice = product.price;
          }
          if (maxPrice < product.price) {
            maxPrice = product.price;
          }

          // Create the card UI elements (as in the original code)
          let img = $("<img />").prop("src", product.img_src).prop("alt", product.title).addClass("card-img-top img-fluid");
          let cartButton = $("<button>").addClass("btn cart btn-outline-secondary btn-lg").append($("<i>").addClass("fas fs-2 fa-cart-plus"));
          let favButton = $("<button>").addClass("btn add-to-fav btn-outline-secondary btn-lg").append($("<i>").addClass("fa-regular fs-2 fa-heart"));
          cartButton.on("click", function (e) {
            e.stopPropagation(); // Prevent event bubbling
            addToCart(productId);
          });
          favButton.on("click", function (e) {
            e.stopPropagation(); // Prevent event bubbling
            addToFavorite(productId, $(this));
          });
          let overlay = $("<div>").addClass("overlay").append(cartButton).append(favButton);
          let imgContainer = $("<div>").addClass("img-container").append(img).append(overlay);
          let productTitle = $("<h5>").addClass("card-title").text(product.title);
          let productDescription = $("<p>").addClass("card-text description").text(product.description);
          let productPrice = $("<p>")
            .addClass("card-text text-success fw-bold")
            .text("price: $" + product.price);
          let cardBody = $("<div>").addClass("card-body").append(productTitle).append(productDescription).append(productPrice);
          let card = $(`<div id="product_${productId}">`).addClass("card").append(imgContainer).append(cardBody);
          let container = $("<div>").addClass("col-lg-4 col-md-6 col-sm-12 p-0v").append(card);
          // Attach event handlers

          card.on("click", function () {
            localStorage.setItem("selectedProduct", JSON.stringify(productId));
            window.location.href = "Product Page.html";
          });
          productsContainer.append(container);
        });
        generatePagination(products, filteredProducts);
        updateSlider(minPrice, maxPrice);
        checkheartbutton();
        productsContainer.fadeIn(300);

        filteredProducts.forEach((productId) => {
          displayedProducts.push(productId);
        });
        // console.log(displayedProducts);
        // Resolve the Promise with displayed products
        resolve(displayedProducts);
      } catch (error) {
        // Reject the Promise in case of errors
        reject(error);
      }
    });
  });
}

// Function to generate pagination buttons
function generatePagination(allProducts, filteredProducts) {
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginationContainer = $("#pagination-controls"); // Use your actual pagination container ID
  paginationContainer.empty();

  for (let i = 1; i <= totalPages; i++) {
    const pageItem = $("<li>")
      .addClass("page-item")
      .toggleClass("active", i === currentPage); // Highlight the current page

    const pageLink = $("<a>")
      .addClass("px-md-5 page-link")
      .text(i)
      .attr("href", "#")
      .on("click", function (e) {
        e.preventDefault(); // Prevent default anchor behavior
        currentPage = i; // Update the current page
        refreshProducts(allProducts, filteredProducts); // Refresh products for the selected page
      });

    if (i === currentPage) {
      pageLink.css("background-color", "#be9900").addClass("text-white");
    }

    pageItem.append(pageLink);
    paginationContainer.append(pageItem);
  }
}

// Function to refresh products and update pagination
function refreshProducts(allProducts, filteredProducts) {
  return new Promise((resolve, reject) => {
    updateDisplayedProducts(allProducts, filteredProducts)
      .then((displayedProducts) => {
        try {
          // check if there are any available products to display
          let noResultWrapperLocal = $("#noResultWrapperLocal");
          let productsContainerWrapper = $("#products-container-wrapper");
          // update the displayed products if there are results
          if (displayedProducts.length > 0) {
            productsContainerWrapper.removeClass("d-none");
            noResultWrapperLocal.addClass("d-none");
          } else {
            // no results
            productsContainerWrapper.removeClass("d-none");
            noResultWrapperLocal.removeClass("d-none");
          }

          // console.log("from refreshProducts", displayedProducts);
          generatePagination(allProducts, filteredProducts);

          // Save to local storage
          localStorage.setItem("displayedProducts", JSON.stringify(displayedProducts));
          // console.log("displayedProducts saved to localStorage", displayedProducts);

          resolve(displayedProducts); // Resolve with displayedProducts
        } catch (error) {
          reject(error); // Reject if generatePagination throws an error
        }
      })
      .catch((error) => {
        console.error("Error updating products:", error);
        reject(error); // Reject the promise with the caught error
      });
  });
}

// Call this function after applying filters or on page load
function initializePagination(allProducts, filteredProducts) {
  currentPage = 1; // Reset to the first page on new data
  refreshProducts(allProducts, filteredProducts);
}

function getDisplayedProducts() {
  return new Promise((resolve, reject) => {
    try {
      const storedProducts = localStorage.getItem("displayedProducts");
      if (storedProducts) {
        const displayedProducts = JSON.parse(storedProducts);
        resolve(displayedProducts); // Successfully retrieved and parsed
      } else {
        reject("No displayed products found in localStorage."); // Handle missing data
      }
    } catch (error) {
      reject(`Error retrieving displayed products: ${error.message}`); // Handle parse or other errors
    }
  });
}

function updateSlider(minPrice, maxPrice) {
  $("#slider-range").slider({
    range: true,
    min: 0,
    max: maxPrice,
    values: [0, maxPrice],
    slide: function (event, ui) {
      $("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
      const min = ui.values[0];
      const max = ui.values[1];
      const totalRange = $("#slider-range").slider("option", "max");
      // console.log(min, max, totalRange);
      // Calculate percentages for gradient
      const leftPercentage = (min / totalRange) * 100;
      const rightPercentage = (max / totalRange) * 100;

      // Update range background color
      $("#slider-range .ui-slider-range").css({
        left: leftPercentage + "%",
        width: rightPercentage - leftPercentage + "%",
        "background-color": "#810b0b", // Highlight color
      });
      // console.log(leftPercentage);
      // Apply gradient background
      $("#slider-range").css({
        background: `linear-gradient(to right, white ${leftPercentage}%, #810b0b ${leftPercentage}%, #810b0b ${rightPercentage}%, white ${rightPercentage}%)`,
      });
    },
  });

  // Set initial state
  const initialMin = $("#slider-range").slider("values", 0);
  const initialMax = $("#slider-range").slider("values", 1);
  const totalRange = $("#slider-range").slider("option", "max");
  const leftPercentage = (initialMin / totalRange) * 100;
  const rightPercentage = (initialMax / totalRange) * 100;

  $("#slider-range").css({
    background: `linear-gradient(to right, white ${leftPercentage}%, #810b0b ${leftPercentage}%, #810b0b ${rightPercentage}%, white ${rightPercentage}%)`,
  });

  $("#amount").val("$" + $("#slider-range").slider("values", 0) + " - $" + $("#slider-range").slider("values", 1));
}

function updateFilteredProducts(min, max) {
  getDisplayedProducts()
    .then((displayedProducts) => {
      // console.log("Retrieved displayed products:", displayedProducts);
      // displayedProducts = displayedProducts.map((id) => allProducts[id]);
      let allProducts = getBooksData();
      // console.log(displayedProducts);
      for (let i = 0; i < displayedProducts.length; i++) {
        num = Number(displayedProducts[i]);
        // console.log(num);
        productPrice = allProducts[num]["price"];
        // console.log(productPrice);
        if (productPrice < min || productPrice > max) {
          displayedProducts.splice(i, 1);
          i--; // Adjust the index to account for the removed item
        }
      }
      // console.log(displayedProducts);

      refreshProducts(allProducts, displayedProducts)
        .then((displayedProducts) => {
          // Save to local storage
          localStorage.setItem("displayedProducts", JSON.stringify(displayedProducts));
          // console.log("Displayed products saved to localStorage:", displayedProducts);
        })
        .catch((error) => {
          console.error("Error processing products:", error);
        });
    })
    .catch((error) => {
      console.error(error);
      // Handle the error case (e.g., display a message to the user)
    });
}
