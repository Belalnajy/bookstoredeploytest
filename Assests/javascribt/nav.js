function updateUserDropdown() {
  const checkUserDropdown = setInterval(function () {
    const userDropdownMenu = document.getElementById("userDropdownMenu");

    if (userDropdownMenu) {
      clearInterval(checkUserDropdown); // Stop checking once it's found

      let userSession = sessionStorage.getItem("currentSession"); // Check session dynamically
      userSession = JSON.parse(userSession);
      userDropdownMenu.innerHTML = ""; // Clear the current menu

      if (userSession) {
        // User is logged in
        if (userSession.session.category == "admin") {
          userDropdownMenu.innerHTML = `
          <li><a class="dropdown-item" href="./dash.html">Your Panel</a></li>
          <li><a class="dropdown-item" id="logoutBtn" href="#">Logout</a></li>
        `;
        } else if (userSession.session.category == "sellers") {
          userDropdownMenu.innerHTML = `
          <li><a class="dropdown-item" href="./SellerDashboard.html">Dashboard</a></li>
          <li><a class="dropdown-item" id="logoutBtn" href="#">Logout</a></li>
          <li><a class="dropdown-item" href="./profile.html">Your Account</a></li>

        `;
        } else {
          userDropdownMenu.innerHTML = `
          <li><a class="dropdown-item" href="./profile.html">Your Account</a></li>
          <li><a class="dropdown-item" id="logoutBtn" href="#">Logout</a></li>
        `;
        }

        // Add logout functionality
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", () => {
            sessionStorage.removeItem("currentSession");
            Toast.fire({
              icon: "success",
              title: "Logged out successfully.",
            });
            window.location.href = "./Login&Register.html"; // Redirect to the login page
          });
        }
      } else {
        // User is not logged in
        userDropdownMenu.innerHTML = `
          <li><a class="dropdown-item" href="./Login&Register.html">Sign in | SignUp</a></li>
        `;
      }
    }
  }, 100); // Check every 100ms
}

function cartFunction() {
  console.log("event fired");
  const loggedInUser = getLoggedInUserEmail();
  if (loggedInUser) {
    window.location.href = "./cart.html";
  } else {
    console.log("Login failed");
    Toast.fire({
      icon: "info",
      title: "You need to be logged in to add products to cart.",
    });
  }
}

// Function to retrieve current session email from sessionStorage
function getLoggedInUserEmail() {
  const currentSession = JSON.parse(sessionStorage.getItem("currentSession"));
  return currentSession?.session;
}
function getUsersData() {
  const storedData = localStorage.getItem("signUpData");
  return JSON.parse(storedData);
}
function getProductsData() {
  const storedData = localStorage.getItem("products");
  return JSON.parse(storedData);
}

function updateFavoritesBadge() {
  const currentSession = JSON.parse(sessionStorage.getItem("currentSession"));

  if (currentSession && currentSession.session && currentSession.session.email) {
    const loggedInUserEmail = currentSession.session.email;

    // Get the signUpData object from localStorage
    const signUpData = JSON.parse(localStorage.getItem("signUpData")) || {};

    if (signUpData.customers && signUpData.customers[loggedInUserEmail]) {
      const customer = signUpData.customers[loggedInUserEmail];

      // Get the wishlist count
      const wishlistCount = customer.wishlist ? customer.wishlist.length : 0;

      // Update the badge count on all pages
      $("#heartBadge").text(wishlistCount);
    } else {
      // If the user is not found in signUpData, set badge count to 0
      $("#heartBadge").text(0);
    }
  } else {
    // If no user is logged in, set badge count to 0
    $("#heartBadge").text(0);
  }
}

// Function to update the inbox badge based on the messages in local inbox local storage
function updateInboxBadge() {
  const sessionData = JSON.parse(sessionStorage.getItem("currentSession"));
  const loggedInUser = getLoggedInUserEmail();
  const usersData = getUsersData();
  if (loggedInUser) {
    let category = loggedInUser.category;
    const user = usersData[category][loggedInUser.email];
    let inbox = user.inbox;
    inboxItems = inbox.length;
    $("#inboxBadge").text(inboxItems);

    if (inboxItems > 0 && sessionData) {
      animateBell();
    } else {
      $("#inboxBadge").text(0);
    }
  }
}

// Vibrating animation for the bell icon
function animateBell() {
  const bell = $("#bellicon");

  // Add a shake class from css keyframes
  bell.addClass("shake-animation");

  // interval of shaking
  setTimeout(() => {
    bell.removeClass("shake-animation");
  }, 1000); // 1 sec shaking
}

// Function to update the cart badge based on the items in local storage
function updateCartBadge() {
  const loggedInUser = getLoggedInUserEmail();
  // console.log(loggedInUser);
  // console.log(loggedInUser["category"]);
  if (loggedInUser) {
    // Retrieve the cart from local storage and update the cart badge
    let UsersData = getUsersData();
    // console.log(customerCart);
    let customerCart = UsersData[loggedInUser["category"]][loggedInUser["email"]]["cart"];
    let productsNumber = 0;
    for (product in customerCart) {
      // console.log(customerCart[product]);
      productsNumber += customerCart[product]["quantity"];
    }
    $("#cartBadge").text(productsNumber);
  } else {
    $("#cartBadge").text(0);
  }
}
function productNotAvailableMessage() {
  Toast.fire({
    icon: "info",
    title: "Sorry, this product is currently unavailable.",
  });
}
function outOfStockMessage() {
  Toast.fire({
    icon: "info",
    title: "Sorry, You have exceeded the available stock for this item.",
  });
}

// Function to add product to cart and save in local storage
function addToCart(product_id) {
  const loggedInUser = getLoggedInUserEmail();
  if (loggedInUser && loggedInUser.category == "customers") {
    // Retrieve the cart from local storage and update the cart badge
    let UsersData = getUsersData();
    let customerCart = UsersData[loggedInUser["category"]][loggedInUser["email"]]["cart"];
    let inStock = getProductsData()[product_id]["stock"];
    // console.log(inStock);
    if (inStock == 0) {
      productNotAvailableMessage();
      return;
    }

    let product = { quantity: 1, selected: true };

    // console.log(UsersData);
    if (product_id in customerCart) {
      if (customerCart[product_id]["quantity"] + 1 > inStock) {
        outOfStockMessage();
        return;
      }
      customerCart[product_id]["quantity"]++;
    } else {
      customerCart[product_id] = product;
    }
    localStorage.setItem("signUpData", JSON.stringify(UsersData));
    updateCartBadge(); // Update the cart badge after adding the product

    // Show toast notification for adding product to cart
    Toast.fire({
      icon: "success",
      title: "Item added to cart successfully.",
    });
    if  (loggedInUser.category == "admin" || loggedInUser.category == "sellers"){
      Toast.fire({
        icon: "info",
        title: "You need to login with a customer account  to add products to cart.",
      });
    }
  } else {
    Toast.fire({
      icon: "info",
      title: "You need to login to be able to add products to cart.",
    });}
  //  else {
  //   Toast.fire({
  //     icon: "info",
  //     title: "You need to login to be able to add products to cart.",
  //   });
  // }
}

// Sign-in function
function signInUser(email) {
  const sessionData = {
    session: {
      email: email,
    },
  };
  sessionStorage.setItem("currentSession", JSON.stringify(sessionData));
  updateCartBadge(); // Update the cart badge after sign-in
}

// Sign-out function
function signOutUser() {
  sessionStorage.removeItem("currentSession");
  updateCartBadge(); // Update the cart badge after sign-out
}

// Function to add product to favorite and save in local storage
function addToFavorite(key, buttonfav) {
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

      const productIndex = wishlist.findIndex((id) => id === key);

      if (productIndex === -1) {
        // Add the product to the wishlist
        customer.wishlist.push(key);
        $(buttonfav.children()[0]).removeClass("fa-regular ").addClass("fa-solid text-danger");
        Toast.fire({
          icon: "success",
          title: "Item added to wishlist successfully.",
        });
      } else {
        // Remove the product from the wishlist
        customer.wishlist.splice(productIndex, 1);
        $(buttonfav.children()[0]).removeClass("fa-solid text-danger").addClass("fa-regular");
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
}

//check love button
function checkheartbutton() {
  // console.log("inside checkheart button function");
  const loggedInUser = getLoggedInUserEmail();
  // console.log(loggedInUser);

  if (loggedInUser && loggedInUser.category === "customers") {
    // const loggedInUserEmail = currentSession.session.email;
    const usersData = getUsersData();
    // console.log(usersData);
    // console.log(usersData.customers[loggedInUser.email]);
    const customer = usersData.customers[loggedInUser.email];
    // console.log(customer);
    const wishlist = customer.wishlist; // Fetch the wishlist from the customer data

    // Check if the product is in the wishlist
    // console.log(wishlist);
    wishlist.forEach((productId) => {
      // console.log(`#${productId}`);
      let product = $(`#product_${productId}`);
      favButton = product.find(".add-to-fav");
      $(favButton.children()[0]).removeClass("fa-regular ").addClass("fa-solid text-danger");
      // console.log(product);
    });
  }
  // else {
  //   // If no user is logged in, ensure the button has the default style
  //   BookCard.find(".btn-fav").addClass("btn-outline-secondary").removeClass("btn-danger");
  // }
}

function showInboxPopup() {
  const loggedInUser = getLoggedInUserEmail();
  // console.log(loggedInUser);

  if (loggedInUser && loggedInUser.category === "customers") {
    // const loggedInUserEmail = currentSession.session.email;
    const usersData = getUsersData();
    // console.log(usersData);
    // console.log(usersData.customers[loggedInUser.email]);
    const customer = usersData.customers[loggedInUser.email];
    // console.log(customer);
    // get customer inbox
    let inbox = customer.inbox;
    // console.log(inbox);

    const inboxContainer = $("#inboxMessagesContainer");

    // Clear previous content
    inboxContainer.empty();

    if (inbox.length > 0) {
      // Populate messages
      for (let i = 0; i < inbox.length; i++) {
        message = inbox[i];
        const messageElement = `
        <div class="card mb-2">
          <div class="card-body d-flex align-items-center" >
          <div>
            <h6 class="card-title fw-bold text-decoration-underline">${message.subject}</h6>
            <p class="card-text">${message.message}</p>
            </div>
             <button class="btn btn-primary btn-sm ms-auto mt-auto" onclick="removeMessage(${i})">Remove</button>
             </div>
        </div>
      `;
        inboxContainer.append(messageElement);
      }
    } else {
      // Show "inbox is empty" message
      const emptyMessage = `
      <div class="text-center">
        <i class="fas fa-envelope-open-text fa-3x text-muted mb-3"></i>
        <p class="text-muted">Your inbox is empty or has no new messages.</p>
      </div>
    `;
      inboxContainer.append(emptyMessage);
    }
  }

  // Show the popup
  $("#inboxPopup").modal("show");
}

//function remove message from inbox pop up window
function removeMessage(index) {
  const loggedInUser = getLoggedInUserEmail();
  const usersData = getUsersData();
  const customer = usersData.customers[loggedInUser.email];
  let inbox = customer.inbox;

  // Remove the selected message
  inbox.splice(index, 1);

  // Update the inbox in local storage
  localStorage.setItem("signUpData", JSON.stringify(usersData));

  // Refresh the popup and badge
  showInboxPopup();
  updateInboxBadge();
}

// Function to highlight the active link in the navbarfunction setActiveLink() {
document.addEventListener("DOMContentLoaded", function () {
  const currentUrl = window.location.pathname; // Get the current page URL
  const navLinks = document.querySelectorAll(".nav-link"); // Select all links

  navLinks.forEach((link) => {
    // Check if the link's href matches the current URL
    if (link.getAttribute("href") === currentUrl) {
      link.classList.add("active"); // Add the 'active' class to the matching link
    } else {
      link.classList.remove("active"); // Remove 'active' from others
    }
  });
});

// Call the updateUserDropdown function once the page loads


setActiveLink = function () {
  const pathName = window?.location?.pathname?.toLowerCase();
  if (pathName.includes("home") && pathName) {
    document.getElementById("home-link")?.classList?.add("active");
  } else if (pathName.includes("about") && pathName) {
    document.getElementById("about-link")?.classList?.add("active");
  } else if (pathName.includes("contact") && pathName) {
    document.getElementById("contact-link")?.classList?.add("active");
  }
  else {
      document.getElementById("home-link").classList?.add("active");
  }
};
