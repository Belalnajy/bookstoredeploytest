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
$(function () {
  usersData = getUsersData();
  loggedInUser = getLoggedInUserEmail();
  emptyCartWrapper = $("#emptyCartWrapper");
  cartItemsWrapper = $("#cartItemsWrapper");
  if (loggedInUser && loggedInUser.category == "customers") {
    customerCart = usersData[loggedInUser["category"]][loggedInUser["email"]]["cart"];
    // console.log(customerCart);
    let cartLength = Object.keys(customerCart).length;
    // console.log(cartLength);

    if (cartLength == 0) {
      emptyCartImage = $("<img />");
      emptyCartImage.prop("src", "./Assests/images/empty-cart.png");
      emptyCartImage.addClass("w-50");
      emptyCartImage.appendTo(emptyCartWrapper);
      h5 = $("<h5>");
      h5.text("Your Online Bookstore Cart is empty");
      h5.addClass("fw-bold display-6");
      h5.appendTo(emptyCartWrapper);
      p = $("<p>");
      p.html("Looks like you have not added anything to your cart.</br> Go ahead & explore top categories");
      p.addClass("text-body-tertiary text-center fs-4");
      p.appendTo(emptyCartWrapper);
      shopNowButton = $("<button>");
      shopNowButton.text("Shop Now");
      shopNowButton.addClass("btn btn-primary mt-3 fs-5");
      shopNowButton.on("click", function () {
        window.location.href = "./HomePage.html";
      });
      shopNowButton.appendTo(emptyCartWrapper);
      emptyCartWrapper.removeClass("d-none");
      cartItemsWrapper.addClass("d-none");
    } else {
      subtotal = 0;
      shipping = 10;
      for (productId in customerCart) {
        let product = getProductsData()[productId];
        // console.log(product);
        subtotal += product.price * customerCart[productId]["quantity"];
        cartItem = $(`
              <div class="row" id="${productId}">
                <div class="col-sm-12">
                  <div class="row border-bottom pb-3 pt-5">
                    <div class="d-flex justify-content-center align-items-md-center align-items-start col-md-1 col-2 px-0">
                      <input type="checkbox" class="form-check-input" name="cartItem" checked  data-id = "${productId}" />
                    </div>
                    <div class="col-md-6 col-8 px-0">
                      <div class="card border border-0">
                        <div class="row g-0">
                          <div class="col-4">
                            <img src="${product.img_src}" class="img-fluid productimg card-img-top border border-2 border-secondary" alt="${product.title}" />
                          </div>
                          <div class="col-8">
                            <div class="card-body pt-0">
                              <h5 class="card-title">${product.title}</h5>
                              <p class="card-text">${product.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-1 col-2 px-0 d-flex justify-content-center align-items-center">
                      <p class="m-0 fs-5">$${product.price}</p>
                    </div>
                    <div class="col-md-3 col-6 px-0 d-flex mt-3 justify-content-center align-items-center">
                      <div id="inputGroupWrapper" class="d-flex justify-content-center">
                        <div class="input-group d-flex justify-content-center">
                          <button  class="btn p-2 minus" data-id = "${productId}">
                            <i class="fa-solid fa-minus fw-bolder text-info"></i>
                            <i class="fa-solid fa-trash-can fw-bolder text-info d-none"></i>
                          </button>
                          <div id="quantity" class="counter d-flex justify-content-center align-items-center">${customerCart[productId]["quantity"]}</div>
                          <button class="btn p-2 plus" data-id = "${productId}">
                            <i class="fa-solid fa-plus fw-bolder text-info"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-1 col-6 px-0 d-flex mt-3 justify-content-center align-items-center">
                      <button class="btn btn-primary delete" data-id = "${productId}">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
        `);

        if (customerCart[productId]["quantity"] == 1) {
          $(cartItem.find(".minus").children()[0]).addClass("d-none");
          $(cartItem.find(".minus").children()[1]).removeClass("d-none");
        }
        if (!customerCart[productId]["selected"]) {
          cartItem.find(".form-check-input").prop("checked", false);
        }
        //select event
        cartItem.find(".form-check-input").click(function (e) {
          e.stopPropagation(); // Prevent event bubbling
          let product_id = $(this).data("id");
          if (customerCart[product_id]["selected"]) {
            customerCart[product_id]["selected"] = false;
            calculatingSubtotal(customerCart, shipping, $("#subtotal"), $("#total"));
          } else {
            customerCart[product_id]["selected"] = true;
            calculatingSubtotal(customerCart, shipping, $("#subtotal"), $("#total"));
          }
          setUsersData(usersData);

          // setUsersData(usersData);
          // console.log(product_id);
          // console.log("select event");
        });
        // decrease product event
        cartItem.find(".minus").click(function (e) {
          e.stopPropagation(); // Prevent event bubbling
          let product_id = $(this).data("id");
          let cart = $("#" + product_id + "");
          if (customerCart[product_id]["quantity"] == 1) {
            cart.addClass("d-none");
            // console.log(product_id);
            delete customerCart[product_id];

            calculatingSubtotal(customerCart, shipping, $("#subtotal"), $("#total"));
            if (Object.keys(customerCart).length == 0) {
              emptyCartWrapper.removeClass("d-none");
              cartItemsWrapper.addClass("d-none");
              window.location.reload();
            }
          } else {
            // console.log("inside else");
            // console.log(customerCart[product_id]["quantity"]);
            customerCart[product_id]["quantity"]--;
            calculatingSubtotal(customerCart, shipping, $("#subtotal"), $("#total"));
            // console.log(customerCart[product_id]["quantity"]);
            if (customerCart[product_id]["quantity"] == 1) {
              console.log("inside if which is inside else");
              $(cart.find(".minus").children()[0]).addClass("d-none");
              $(cart.find(".minus").children()[1]).removeClass("d-none");
            }
            cart.find("#quantity").text(customerCart[product_id]["quantity"]);
          }
          setUsersData(usersData)
            .then(() => updateCartBadge())
            .catch((error) => console.log(error));
          // console.log("minus event");
        });
        //encrease product event
        cartItem.find(".plus").click(function (e) {
          e.stopPropagation(); // Prevent event bubbling
          let product_id = $(this).data("id");
          let cart = $("#" + product_id + "");
          let inStock = getProductsData()[product_id]["stock"];
          if (customerCart[product_id]["quantity"] == inStock) {
            outOfStockMessage();
          } else {
            if (customerCart[product_id]["quantity"] == 1) {
              // console.log("inside if which is inside else");
              $(cart.find(".minus").children()[1]).addClass("d-none");
              $(cart.find(".minus").children()[0]).removeClass("d-none");
            }
            customerCart[product_id]["quantity"]++;
            calculatingSubtotal(customerCart, shipping, $("#subtotal"), $("#total"));
            // console.log(customerCart[product_id]["quantity"]);
            cart.find("#quantity").text(customerCart[product_id]["quantity"]);
          }
          setUsersData(usersData)
            .then(() => updateCartBadge())
            .catch((error) => console.log(error));

          // console.log("plus event");
        });
        //delete product event
        cartItem.find(".delete").click(function (e) {
          e.stopPropagation(); // Prevent event bubbling

          let product_id = $(this).data("id");
          $("#" + product_id + "").addClass("d-none");
          delete customerCart[product_id];
          setUsersData(usersData)
            .then(() => updateCartBadge())
            .catch((error) => console.log(error));
          calculatingSubtotal(customerCart, shipping, $("#subtotal"), $("#total"));
          if (Object.keys(customerCart).length == 0) {
            emptyCartWrapper.removeClass("d-none");
            cartItemsWrapper.addClass("d-none");
            window.location.reload();
          }
          // console.log("delete event");
        });
        cartItemsWrapper.append(cartItem);
      }
      let checkout = $(`
        <div id="checkout-container" class="container-fluid mt-4">
          <div class="row justify-content-md-end">
            <div class="col-lg-4 col-md-6 col-sm-12">
              <table class="table table-borderless">
                <tbody>
                  <tr>
                    <td>Subtotal</td>
                    <td id="subtotal" class="text-end">$</td>
                  </tr>
                  <tr>
                    <td>Shipping</td>
                    <td id="shipping-checkout" class="text-end">$</td>
                  </tr>
                  <tr>
                    <td>Total</td>
                    <td id="total" class="text-end">$</td>
                  </tr>
                </tbody>
              </table>
              <!-- Button trigger modal -->
              <div class="d-grid gap-2">
                <button class="btn btn-primary" type="button" id="check-out-button" data-bs-toggle="modal" data-bs-target="#collectingInfo">Check out</button>
              </div>
            </div>
          </div>
        </div>
        `);
      cartItemsWrapper.append(checkout);
      calculatingSubtotal(customerCart, shipping, $("#subtotal"), $("#total"));
      if (cartItemsWrapper.hasClass("d-none")) {
        cartItemsWrapper.removeClass("d-none");
        emptyCartWrapper.addClass("d-none");
      }
    }
    $(".payment").on("click", function () {
      let checkbox = $($(this).children()[1]);
      if (!checkbox.prop("checked")) {
        let checboxes = $(".payment");
        for (let i = 0; i < checboxes.length; i++) {
          let checboxesItem = $($(checboxes[i]).children()[1]);
          if (checboxesItem.prop("checked")) {
            checboxesItem.prop("checked", false);
          }
        }
        checkbox.prop("checked", true);
      } else {
        checkbox.prop("checked", false);
      }
    });

    $("#Paypal-payment").on("click", function () {
      if ($("#paypal-email").hasClass("d-none")) {
        $("#paypal-email").removeClass("d-none");
      } else {
        $("#paypal-email").addClass("d-none");
      }
    });
    $("#Cach-payment").on("click", function () {
      if (!$("#paypal-email").hasClass("d-none")) {
        $("#paypal-email").addClass("d-none");
      }
    });

    $("#check-out-button").on("click", function () {
      let customerData = usersData[loggedInUser["category"]][loggedInUser["email"]];
      // console.log(customerData);
      $("#user-name").val(customerData["username"]);
      $("#user-email").val(customerData["email"]);
      $("#user-address").val(customerData["address"]);
      $("#user-phone").val(customerData["phone"]);
    });

    $("#check-out-button").on("click", function () {
      let customerData = usersData[loggedInUser["category"]][loggedInUser["email"]];
      $("#user-name").val(customerData["username"]);
      $("#user-email").val(customerData["email"]);
      $("#user-address").val(customerData["address"]);
      $("#user-phone").val(customerData["phone"]);
    });

    $("#go-to-payment").on("click", function (event) {
      let address = $("#user-address").val().trim();
      let phone = $("#user-phone").val().trim();
      let paypalEmail = $("#paypal-email").val().trim();
      let isPaypalChecked = $("#paypal").prop("checked");
      let isonCashChecked = $("#cach").prop("checked");
      let errors = [];

      // Phone validation
      if (!/^(011|012|010|015)\d{8}$/.test(phone)) {
        errors.push("- Please enter a valid phone number.");
      }

      // Address validation
      if (address === "") {
        errors.push("- Delivery address cannot be empty.");
      }

      // PayPal email validation (if PayPal is selected)
      if (isPaypalChecked && !/^[a-zA-Z0-9._%+-]+(?<!\.)@gmail\.com$/.test(paypalEmail)) {
        errors.push("- Please enter a valid PayPal email address.");
      }

      if (!isPaypalChecked && !isonCashChecked) {
        {
          errors.push("- You have to check the way of payment");
        }
      }
      // data-bs-toggle="modal" data-bs-target="#summaryAndConfirm"

      if (errors.length > 0) {
        Toast.fire({
          icon: "error",
          title: "Validation Errors",
          html: errors.join("<br>"),
          confirmButtonText: "Okay",
        });
      } else {
        // Reopen the modal after closing the error message
        $("#go-to-payment").attr("data-bs-toggle", "modal");
        $("#go-to-payment").attr("data-bs-target", "#summaryAndConfirm");

        $("#customer-info-modal").modal("show"); // Replace with the actual modal ID
      }

      let customerData = usersData[loggedInUser["category"]][loggedInUser["email"]];
      customerData["address"] = address;
      setUsersData(usersData);

      // Order summary
      const today = new Date();
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      const year = today.getFullYear();
      const month = months[today.getMonth()];
      const day = today.getDate();
      const formattedDate = `${day} ${month} ${year}`;
      // console.log(formattedDate);
      $($("#date").children()[1]).text(formattedDate);
      // Get hours and minutes
      let hours = today.getHours();
      const minutes = today.getMinutes();

      // Determine AM or PM
      const amOrPm = hours >= 12 ? "PM" : "AM";

      // Convert 24-hour format to 12-hour format
      hours = hours % 12 || 12; // Convert "0" to "12" for midnight

      // Format minutes to always be two digits
      const formattedMinutes = minutes.toString().padStart(2, "0");

      // Combine into desired format
      const time = `${hours}:${formattedMinutes} ${amOrPm}`;

      // console.log(time); // e.g., "5:05 PM"
      $($("#time").children()[1]).text(time);

      // Calculate delivery day
      const deliveryDate = new Date(today);
      deliveryDate.setDate(today.getDate() + 2); // Add 2 days to today
      const deliveryDay = deliveryDate.getDate();
      const deliveryMonth = months[deliveryDate.getMonth()];
      const deliveryYear = deliveryDate.getFullYear();

      // products & quantities
      let products = getProductsData();
      let productsSummaryWrapper = $("#products-summary-wrapper");
      productsSummaryWrapper.empty();
      let soldProducts = [];
      for (let productId in customerCart) {
        product = products[productId];
        // console.log(customerCart);
        if (customerCart[productId]["selected"]) {
          productDetails = {
            productId: productId,
            category: product.category,
            title: product.title,
            price: product.price,
            quantity: customerCart[productId]["quantity"],
            description: product.description,
            img_src: product.img_src,
          };
          soldProducts.push(productDetails);
          let productSummary = $(`
                            <ul class="list-unstyled text-body-tertiary d-flex justify-content-between">
                              <li>${product.title}</li>
                              <li>${customerCart[productId]["quantity"]}</li>
                            </ul>
          `);
          productsSummaryWrapper.append(productSummary);
        }
      }
      $("#summary-shipping").text(shipping);
      calculatingSubtotal(customerCart, shipping, $("#summary-subtotal"), $("#summary-total"));
      //function to generate ID for product
      function generateOrderId() {
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        return `ORD-${timestamp}-${randomNum}`; // Combine timestamp and random number
      }

      //confirm that the order
      $("#confirm").on("click", function () {
        const orderId = generateOrderId(); // Generate a unique order ID
        const order_details = {
          orderId: orderId, // Use the generated order ID
          date: formattedDate,
          time: time,
          products: soldProducts,
          totalAmount: subtotal + shipping,
          customerName: customerData.username, // Add customer name
        };

        // Add the order to the customer's order history
        customerData["orders_history"].push(order_details);

        for (productId in customerCart) {
          if (customerCart[productId]["selected"]) delete customerCart[productId];
        }
        setUsersData(usersData);
        updateProducts(soldProducts);
        Swal.fire({
          title: "Great!",
          text: "Thank you for your payment! Your products will be with you soon. We hope you enjoy your purchase!",
          icon: "success",
        }).then(() => {
          window.location.reload(); // Reload the window after the dialog is closed
        });
        Swal.fire({
          icon: "success",
          title: "Order Confirmed",
          text: "Thank you for your order. We will process it shortly!",
          confirmButtonText: "Okay",
        });
      });
    });
  } else {
    emptyCartImage = $("<img />");
    emptyCartImage.prop("src", "./Assests/images/empty-cart.png");
    emptyCartImage.addClass("w-50");
    emptyCartImage.appendTo(emptyCartWrapper);
    h5 = $("<h5>");
    h5.text("Your Online Bookstore Cart is empty");
    h5.addClass("fw-bold display-6");
    h5.appendTo(emptyCartWrapper);
    p = $("<p>");
    p.html("Looks like you need to log in to access your cart.</br> Please log in and explore top categories.");
    p.addClass("text-body-tertiary text-center fs-4");
    p.appendTo(emptyCartWrapper);
    shopNowButton = $("<button>");
    shopNowButton.text("Login Now");
    shopNowButton.addClass("btn btn-primary mt-3 fs-5");
    shopNowButton.on("click", function () {
      window.location.href = "./Login&Register.html";
    });
    shopNowButton.appendTo(emptyCartWrapper);
    emptyCartWrapper.removeClass("d-none");
    cartItemsWrapper.addClass("d-none");
  }
});
function getUsersData() {
  const storedData = localStorage.getItem("signUpData");
  return JSON.parse(storedData);
}
function setUsersData(data) {
  // console.log("inside setUsersData");
  return new Promise((resolve, reject) => {
    try {
      localStorage.setItem("signUpData", JSON.stringify(data));
      resolve("data saved successfully!");
    } catch (error) {
      reject("Error saving data: " + error.message);
    }
  });
}

function getLoggedInUserEmail() {
  const currentSession = JSON.parse(sessionStorage.getItem("currentSession"));
  return currentSession?.session;
}
function getProductsData() {
  const storedData = localStorage.getItem("products");
  return JSON.parse(storedData);
}

function updateProducts(soldProducts) {
  const products = getProductsData();
  soldProducts.forEach((product) => {
    let productId = product.productId;
    console.log(productId);
    // console.log("before", products[productId].stock, products[productId].sold);
    products[productId].stock -= product.quantity;
    products[productId].sold += product.quantity;
    // console.log("after", products[productId].stock, products[productId].sold);
  });
  localStorage.setItem("products", JSON.stringify(products));
  // console.log("updated products:", products);
}

function calculatingSubtotal(customerCart, shipping, subtotal_container, total_container) {
  let subtotal = 0;
  let numberOfSelectedItems = 0;
  checkoutContainer = $("#checkout-container");
  // console.log("CustomerCart:", customerCart);
  for (let productId in customerCart) {
    let product = getProductsData()[productId];
    if (customerCart[productId].selected) {
      // console.log("inside if");
      numberOfSelectedItems++;
      subtotal += product.price * customerCart[productId]["quantity"];
    }
  }
  if (numberOfSelectedItems == 0) {
    checkoutContainer.addClass("d-none");
  } else {
    checkoutContainer.removeClass("d-none");
    subtotal_container.fadeOut(30).text(`$${subtotal}`).fadeIn(30);
    $("#shipping-checkout").text(`$${shipping}`);
    total_container
      .fadeOut(30)
      .text(`$${subtotal + shipping}`)
      .fadeIn(30);
  }
}
function outOfStockMessage() {
  Toast.fire({
    icon: "info",
    title: "Sorry, You have exceeded the available stock for this item.",
  });
}
