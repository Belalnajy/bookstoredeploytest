document.addEventListener("DOMContentLoaded", function () {
  async function loadContent(url, elementId) {
    try {
      const response = await fetch(url);
      const data = await response.text();
      document.getElementById(elementId).innerHTML = data;

      // Ensure the badge is updated after the navigation is loaded
      if (elementId === "mainNavigation") {
        // Call the functions defined in nav.js
        // updateCartBadge();
        // updateFavoritesBadge();
        // setActiveLink();
        // updateUserDropdown();
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
    // $("#global-search").on("keydown", function (e) {
    //   // console.log("I am here");
    //   if (e.key === "Enter") {
    //     let allProducts = getProductsData();
    //     const searchTerm = $(this).val().toLowerCase();

    //     console.log(searchTerm);
    //     // console.log(allProducts);

    //     let filteredProducts = [];
    //     for (let productId in allProducts) {
    //       // console.log(productId);

    //       let product = allProducts[productId];

    //       // console.log(product);

    //       if (product.title.toLowerCase().includes(searchTerm)) {
    //         filteredProducts.push(productId);
    //       }
    //     }

    //     console.log(filteredProducts);

    //     // save filtered products in local storage
    //     localStorage.setItem("forSearch", JSON.stringify(filteredProducts));

    //     // Redirect to the search results page
    //     window.location.href = "./LoadMore.html";
    //   }
    // });
  })();
});
$(document).ready(function () {
  // Function to validate email
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Function to validate username (no numbers allowed)
  function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z\s]+$/;
    return usernameRegex.test(username);
  }

  // Function to validate title (not null or empty)
  function validateTitle(title) {
    return title && title.trim() !== "";
  }

  // Function to validate price (must be a positive number)
  function validatePrice(price) {
    return !isNaN(price) && parseFloat(price) > 0;
  }

  // Function to validate stock (must be a positive integer)
  function validateStock(stock) {
    return !isNaN(stock) && parseInt(stock) >= 0;
  }

  // Function to validate category (not null or empty)
  function validateCategory(category) {
    return category && category.trim() !== "";
  }

  // Function to validate description (not null or empty)
  function validateDescription(description) {
    return description && description.trim() !== "";
  }

  // Function to validate seller email (must be a valid email)
  function validateSellerEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Function to validate image (must be uploaded)
  function validateImage(imageFile) {
    return imageFile !== undefined;
  }

  // Function to get products from local storage
  function getProducts() {
    return JSON.parse(localStorage.getItem("products")) || {};
  }

  // Function to save products to local storage
  function saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  // Function to get users from local storage
  function getUsers() {
    return JSON.parse(localStorage.getItem("signUpData")) || usersData;
  }

  // Function to save users to local storage
  function saveUsers(users) {
    localStorage.setItem("signUpData", JSON.stringify(users));
  }

  // Function to update counts (products, users, orders)
  function updateCounts() {
    const products = getProducts();
    const users = getUsers();

    // Update product count
    const productCount = Object.keys(products).length;
    $(".productCount").text(productCount);

    // Update user count
    const userCount = (users.admin ? Object.keys(users.admin).length : 0) + (users.customers ? Object.keys(users.customers).length : 0) + (users.sellers ? Object.keys(users.sellers).length : 0);
    $(".usersCount").text(userCount);

    // Update order count
    const orders = JSON.parse(localStorage.getItem("orders")) || {};
    const orderCount = Object.keys(orders).length;
    $(".ordersCount").text(orderCount);
  }

  // Function to render the products table
  function renderProductsTable() {
    const products = getProducts();
    $(".productsTable").html(""); // Clear the table
    $.each(products, function (id, product) {
      $(".productsTable").append(`
          <tr data-id="${id}">
            <td>${product.title}</td>
            <td><img src="${product.img_src}" alt="${product.title}" style="width: 100px; height: auto;"></td>
            <td><button class="btn btn-primary editProductBtn">Edit</button></td>
            <td><button class="btn btn-danger deleteProductBtn">Delete</button></td>
          </tr>
        `);
    });

    // Update counts after rendering the products table
    updateCounts();
  }

  // Function to render the users table
  function renderUsersTable() {
    const users = getUsers();
    const admins = users.admin ? Object.keys(users.admin).length : 0;
    const customers = users.customers ? Object.keys(users.customers).length : 0;
    const sellers = users.sellers ? Object.keys(users.sellers).length : 0;

    // Update admin, customer, and seller counts
    $(".admins").text(admins);
    $(".members").text(customers);
    $(".sellers").text(sellers);

    // Clear the table
    $(".usersTable").html("");

    // Render admins
    if (users.admin) {
      $.each(users.admin, function (email, user) {
        $(".usersTable").append(`
            <tr data-email="${email}" data-role="admin">
              <td><input type="text" class="form-control username-input" value="${user.username}"></td>
              <td><input type="email" class="form-control email-input" value="${email}" disabled></td>
              <td>
                <select class="form-control" disabled>
                  <option value="admin" selected>Admin</option>
                </select>
              </td>
              <td>
                <select class="form-control account-status">
                  <option value="Active" ${user.accountstate === "Active" ? "selected" : ""}>Active</option>
                  <option value="Suspended" ${user.accountstate === "Suspended" ? "selected" : ""}>Suspended</option>
                </select>
              </td>
              <td><button class="btn btn-primary updateUserBtn">Update</button></td>
              <td><button class="btn btn-danger deleteUserBtn" disabled>Delete</button></td>
            </tr>
          `);
      });
    }

    // Render customers
    if (users.customers) {
      $.each(users.customers, function (email, user) {
        $(".usersTable").append(`
            <tr data-email="${email}" data-role="customer">
              <td><input type="text" class="form-control username-input" value="${user.username}"></td>
              <td><input type="email" class="form-control email-input" value="${email}"></td>
              <td>
                <select class="form-control">
                  <option value="customer" ${user.role === "customer" ? "selected" : ""}>Customer</option>
                  <option value="seller" ${user.role === "seller" ? "selected" : ""}>Seller</option>
                </select>
              </td>
              <td>
                <select class="form-control account-status">
                  <option value="Active" ${user.accountstate === "Active" ? "selected" : ""}>Active</option>
                  <option value="Suspended" ${user.accountstate === "Suspended" ? "selected" : ""}>Suspended</option>
                </select>
              </td>
              <td><button class="btn btn-primary updateUserBtn">Update</button></td>
              <td><button class="btn btn-danger deleteUserBtn">Delete</button></td>
            </tr>
          `);
      });
    }

    // Render sellers and customers
    if (users.sellers) {
      $.each(users.sellers, function (email, user) {
        $(".usersTable").append(`
            <tr data-email="${email}" data-role="seller">
              <td><input type="text" class="form-control username-input" value="${user.username}"></td>
              <td><input type="email" class="form-control email-input" value="${email}"></td>
              <td>
                <select class="form-control">
                  <option value="customer" ${user.role === "customer" ? "selected" : ""}>Customer</option>
                  <option value="seller" ${user.role === "seller" ? "selected" : ""}>Seller</option>
                </select>
              </td>
              <td>
                <select class="form-control account-status">
                  <option value="Active" ${user.accountstate === "Active" ? "selected" : ""}>Active</option>
                  <option value="Suspended" ${user.accountstate === "Suspended" ? "selected" : ""}>Suspended</option>
                </select>
              </td>
              <td><button class="btn btn-primary updateUserBtn">Update</button></td>
              <td><button class="btn btn-danger deleteUserBtn">Delete</button></td>
            </tr>
          `);
      });
    }

    // Event listener for the Update User button
    $(document).on("click", ".updateUserBtn", function () {
      const row = $(this).closest("tr");
      const oldEmail = row.data("email"); // Get the old email from the row
      const role = row.data("role"); // Get the user's role from the row
      const username = row.find(".username-input").val(); // Get the updated username
      const newEmail = row.find(".email-input").val(); // Get the updated email
      const accountStatus = row.find(".account-status").val(); // Get the updated account status

      // Validate the new email
      if (!validateEmail(newEmail)) {
        Toast.fire({ icon: "error", title: "Invalid email format!" });
        return;
      }

      // Get users from local storage
      const users = getUsers();

      // Check if the new email already exists (except for the current user)
      if (
        (users.admin && users.admin[newEmail] && newEmail !== oldEmail) ||
        (users.customers && users.customers[newEmail] && newEmail !== oldEmail) ||
        (users.sellers && users.sellers[newEmail] && newEmail !== oldEmail)
      ) {
        Toast.fire({ icon: "error", title: "Email already exists!" });
        return;
      }

      // Update the user's details based on their role
      if (role === "admin" && users.admin) {
        if (newEmail !== oldEmail) {
          users.admin[newEmail] = users.admin[oldEmail]; // Move to new email key
          delete users.admin[oldEmail]; // Delete old email key
        }
        users.admin[newEmail].username = username;
        users.admin[newEmail].accountstate = accountStatus;
      } else if (role === "customer" && users.customers) {
        if (newEmail !== oldEmail) {
          users.customers[newEmail] = users.customers[oldEmail]; // Move to new email key
          delete users.customers[oldEmail]; // Delete old email key
        }
        users.customers[newEmail].username = username;
        users.customers[newEmail].accountstate = accountStatus;
      } else if (role === "seller" && users.sellers) {
        if (newEmail !== oldEmail) {
          users.sellers[newEmail] = users.sellers[oldEmail]; // Move to new email key
          delete users.sellers[oldEmail]; // Delete old email key
        }
        users.sellers[newEmail].username = username;
        users.sellers[newEmail].accountstate = accountStatus;
      }

      // Save the updated users object to local storage
      saveUsers(users);

      // Re-render the users table
      renderUsersTable();

      // Show success message
      Toast.fire({
        icon: "success",
        title: "User updated successfully!",
      });
    });
    // Event listener for the Delete User button
    $(document).on("click", ".deleteUserBtn", function () {
      const row = $(this).closest("tr");
      const email = row.data("email"); // Get the user's email from the row
      const role = row.data("role"); // Get the user's role from the row

      // SweetAlert2 confirmation dialog
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#810b0b",
        cancelButtonColor: "gray",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          // Get users from local storage
          const users = getUsers();

          // Delete the user based on their role
          if (role === "admin" && users.admin) {
            delete users.admin[email];
          } else if (role === "customer" && users.customers) {
            delete users.customers[email];
          } else if (role === "seller" && users.sellers) {
            delete users.sellers[email];
          }

          // Save the updated users object to local storage
          saveUsers(users);

          // Re-render the users table
          renderUsersTable();

          // Show success message
          Swal.fire({
            title: "Deleted!",
            text: "The user has been deleted.",
            icon: "success",
            confirmButtonColor: "#810b0b",
          });
        }
      });
    });
    // Update counts after rendering the users table
    updateCounts();
  }

  // Function to clear the Add Product modal form
  function clearAddProductForm() {
    $("#addProductTitleInput").val("");
    $("#addProductPriceInput").val("");
    $("#addProductStockInput").val("");
    $("#addProductCategoryInput").val("");
    $("#addProductDescInput").val("");
    $("#addSellerEmailInput").val("");
    $("#addImageUploadInput").val("");
  }

  // Function to populate the Edit Product modal form
  function populateEditProductForm(product) {
    $("#editProductTitleInput").val(product.title);
    $("#editProductPriceInput").val(product.price);
    $("#editProductStockInput").val(product.stock);
    $("#editProductCategoryInput").val(product.category);
    $("#editProductDescInput").val(product.description);
    $("#editSellerEmailInput").val(product.seller_email);
    // Note: Image upload cannot be pre-populated due to browser security restrictions
  }

  // Add Product Button Click Event
  $("#addProductBtn").on("click", function () {
    // Get form values
    const title = $("#addProductTitleInput").val();
    const price = $("#addProductPriceInput").val();
    const stock = $("#addProductStockInput").val();
    const category = $("#addProductCategoryInput").val();
    const description = $("#addProductDescInput").val();
    const sellerEmail = $("#addSellerEmailInput").val();
    const imageFile = $("#addImageUploadInput").prop("files")[0];

    // Validate all fields
    if (!validateTitle(title)) {
      Toast.fire({ icon: "error", title: "Title cannot be empty!" });
      return;
    }
    if (!validatePrice(price)) {
      Toast.fire({ icon: "error", title: "Price must be a positive number!" });
      return;
    }
    if (!validateStock(stock)) {
      Toast.fire({ icon: "error", title: "Stock must be a positive integer!" });
      return;
    }
    if (!validateCategory(category)) {
      Toast.fire({ icon: "error", title: "Category cannot be empty!" });
      return;
    }
    if (!validateDescription(description)) {
      Toast.fire({ icon: "error", title: "Description cannot be empty!" });
      return;
    }
    if (!validateSellerEmail(sellerEmail)) {
      Toast.fire({ icon: "error", title: "Invalid seller email!" });
      return;
    }
    if (!validateImage(imageFile)) {
      Toast.fire({ icon: "error", title: "Please upload an image!" });
      return;
    }

    // If all validations pass, proceed to add the product
    const reader = new FileReader();
    reader.onload = function (event) {
      const product = {
        id: Date.now(), // Unique ID for the product
        title: title,
        price: parseFloat(price),
        stock: parseInt(stock),
        category: category,
        description: description,
        seller_email: sellerEmail,
        img_src: event.target.result, // Base64-encoded image
        sold: 0,
        Availability: true,
      };

      // Get existing products from local storage
      const products = getProducts();

      // Add the new product to the products object
      products[product.id] = product;

      // Save the updated products object to local storage
      saveProducts(products);

      // Render the updated products table
      renderProductsTable();

      // Clear the form fields and reset the modal
      clearAddProductForm();

      // Close the modal
      $("#addProductModal").modal("hide");

      // Show success message
      Toast.fire({
        icon: "success",
        title: "Product added successfully!",
      });
    };

    // Read the image file as a Base64-encoded string
    reader.readAsDataURL(imageFile);
  });

  // Edit Product Button Click Event
  $(document).on("click", ".editProductBtn", function () {
    const productId = $(this).closest("tr").data("id"); // Get the product ID from the table row
    const products = getProducts();
    const product = products[productId];

    // Populate the Edit Product modal form
    populateEditProductForm(product);

    // Store the product ID in the modal for reference
    $("#editProductModal").data("product-id", productId);

    // Show the Edit Product modal
    $("#editProductModal").modal("show");
  });

  // Update Product Button Click Event
  $(".updateProductBtn").on("click", function () {
    const productId = $("#editProductModal").data("product-id"); // Get the product ID from the modal
    const products = getProducts();
    const product = products[productId];

    // Get form values
    const title = $("#editProductTitleInput").val();
    const price = $("#editProductPriceInput").val();
    const stock = $("#editProductStockInput").val();
    const category = $("#editProductCategoryInput").val();
    const description = $("#editProductDescInput").val();
    const sellerEmail = $("#editSellerEmailInput").val();
    const imageFile = $("#editImageUploadInput").prop("files")[0];

    // Validate all fields
    if (!validateTitle(title)) {
      Toast.fire({ icon: "error", title: "Title cannot be empty!" });
      return;
    }
    if (!validatePrice(price)) {
      Toast.fire({ icon: "error", title: "Price must be a positive number!" });
      return;
    }
    if (!validateStock(stock)) {
      Toast.fire({ icon: "error", title: "Stock must be a positive integer!" });
      return;
    }
    if (!validateCategory(category)) {
      Toast.fire({ icon: "error", title: "Category cannot be empty!" });
      return;
    }
    if (!validateDescription(description)) {
      Toast.fire({ icon: "error", title: "Description cannot be empty!" });
      return;
    }
    if (!validateSellerEmail(sellerEmail)) {
      Toast.fire({ icon: "error", title: "Invalid seller email!" });
      return;
    }

    // Update the product details
    product.title = title;
    product.price = parseFloat(price);
    product.stock = parseInt(stock);
    product.category = category;
    product.description = description;
    product.seller_email = sellerEmail;

    // Handle image update if a new image is uploaded
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = function (event) {
        product.img_src = event.target.result; // Update the image source
        saveProducts(products); // Save the updated products
        renderProductsTable(); // Re-render the table
        $("#editProductModal").modal("hide"); // Close the modal

        // Show success message
        Toast.fire({
          icon: "success",
          title: "Product updated successfully!",
        });
      };
      reader.readAsDataURL(imageFile);
    } else {
      saveProducts(products); // Save the updated products
      renderProductsTable(); // Re-render the table
      $("#editProductModal").modal("hide"); // Close the modal

      // Show success message
      Toast.fire({
        icon: "success",
        title: "Product updated successfully!",
      });
    }
  });

  // Delete Product Button Click Event
  $(document).on("click", ".deleteProductBtn", function () {
    const productId = $(this).closest("tr").data("id"); // Get the product ID from the table row
    const products = getProducts();

    // SweetAlert2 confirmation dialog
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#810b0b ",
      cancelButtonColor: "gray",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        delete products[productId]; // Delete the product
        saveProducts(products); // Save the updated products
        renderProductsTable(); // Re-render the table

        // Show success message
        Toast.fire({
          title: "Deleted!",
          icon: "success",
          confirmButtonColor: "#810b0b ",
        });
      }
    });
  });

  // Function to render the orders table
  function renderOrdersTable() {
    const users = getUsers();
    const orders = [];

    // Loop through all customers and extract their orders
    if (users.customers) {
      Object.values(users.customers).forEach((customer) => {
        if (customer.orders_history && customer.orders_history.length > 0) {
          orders.push(...customer.orders_history);
        }
      });
    }

    // Clear the orders table
    $(".ordersData").html("");

    // Render orders in a table
    if (orders.length > 0) {
      const ordersTable = `
        <table class="table table-striped text-center">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Products</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Action</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            ${orders
              .map(
                (order) => `
              <tr>
                <td>${order.orderId || "N/A"}</td>
                <td>${order.date || "N/A"}</td>
                <td>${order.customerName || "N/A"}</td>
                <td>
                  <ul>
                    ${order.products
                      .map(
                        (product) => `
                      <li>${product.title} (Qty: ${product.quantity})</li>
                    `,
                      )
                      .join("")}
                  </ul>
                </td>
                <td>$${order.totalAmount || "N/A"}</td>
                <td>
                  <select class="form-control order-status" data-order-id="${order.orderId}">
                    <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
                    <option value="Shipped" ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
                    <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
                  </select>
                </td>
                <td>
                  <button class="btn btn-primary updateOrderBtn" data-order-id="${order.orderId}">Update</button>
                </td>
                <td>
                  <button class="btn btn-danger deleteOrderBtn" data-order-id="${order.orderId}">Delete</button>
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      `;
      $(".ordersData").html(ordersTable);
    } else {
      $(".ordersData").html(`
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh;">
          <img src="./Assests/images/noOrders.avif" alt="No Orders" style="max-width: 100%; height: auto;">
          <p style="margin-top: 20px; font-size: 1.2rem; color: #555;">No orders found.</p>
        </div>
      `);
    }

    // Update the orders count
    $(".ordersCount").text(orders.length);
  }

  // Function to update order status
  function updateOrderStatus(orderId, newStatus) {
    const users = getUsers();

    // Loop through all customers to find the order
    Object.values(users.customers).forEach((customer) => {
      if (customer.orders_history) {
        const order = customer.orders_history.find((o) => o.orderId === orderId);
        if (order) {
          order.status = newStatus; // Update the order status
        }
      }
    });

    // Save the updated users data
    saveUsers(users);

    // Re-render the orders table
    renderOrdersTable();

    // Show success message
    Toast.fire({
      icon: "success",
      title: "Order status updated successfully!",
    });
  }

  // Function to delete an order
  function deleteOrder(orderId) {
    const users = getUsers();

    // Loop through all customers to find and delete the order
    Object.values(users.customers).forEach((customer) => {
      if (customer.orders_history) {
        customer.orders_history = customer.orders_history.filter((order) => order.orderId !== orderId);
      }
    });

    // Save the updated users data
    saveUsers(users);

    // Re-render the orders table
    renderOrdersTable();

    // Show success message
    Toast.fire({
      icon: "success",
      title: "Order deleted successfully!",
    });
  }

  // Event listener for the Update Order button
  $(document).on("click", ".updateOrderBtn", function () {
    const orderId = $(this).data("order-id");
    console.log($(this).data("order-id"));
    const newStatus = $(this).closest("tr").find(".order-status").val();
    updateOrderStatus(orderId, newStatus);
  });

  // Event listener for the Order Status dropdown
  $(document).on("change", ".order-status", function () {
    const orderId = $(this).data("order-id");
    const newStatus = $(this).val();
    updateOrderStatus(orderId, newStatus);
  });

  // Event listener for the Delete Order button
  $(document).on("click", ".deleteOrderBtn", function () {
    const orderId = $(this).data("order-id");

    // Confirm deletion
    Swal.fire({
      title: "Are you sure?",
      text: "You will delete this order",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#810b0b ",
      cancelButtonColor: "gray",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteOrder(orderId); // Delete the order
      }
    });
  });

  // Render tables on page load
  renderProductsTable();
  renderUsersTable();
  renderOrdersTable(); // Render orders table
  renderInboxTable(); // Render inbox tables table
});

// Function to get inbox
function getInbox() {
  return JSON.parse(localStorage.getItem("inbox")) || [];
}

// Function to save inbox
function saveInbox(inbox) {
  return new Promise((resolve, reject) => {
    try {
      localStorage.setItem("inbox", JSON.stringify(inbox));
      resolve("Inbox saved successfully");
    } catch (error) {
      reject("Failed to save inbox: " + error.message);
    }
  });
}

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

// Function to render the inbox table
function renderInboxTable() {
  const inbox = getInbox();

  $(".inboxCount").text(inbox.length);

  $(".inboxTable").html(""); // Clear the table
  $.each(inbox, function (index, message) {
    // console.log(message);

    //show the unsolved message only

    // name
    let nameColumn = $("<td valign='middle'>");
    let nameInput = $("<input type='text' disabled >");
    nameInput.addClass("form-control text-center");
    nameInput.val(message.name);
    nameColumn.append(nameInput);
    // nameColumn.addClass("d-flex justify-content-center");

    // mail
    let mailColumn = $("<td valign='middle'>");
    let mailInput = $("<input type='email' disabled >");
    mailInput.addClass("form-control text-center");
    mailInput.val(message.email);
    mailColumn.append(mailInput);
    // nameColumn.addClass("d-flex justify-content-center");

    // subject
    let subjectColumn = $("<td valign='middle'>");
    let subjectInput = $("<input type='text' disabled >");
    subjectInput.addClass("form-control text-center");
    subjectInput.val(message.subject);
    subjectColumn.append(subjectInput);
    // nameColumn.addClass("d-flex justify-content-center");

    //status
    let statusColumn = $("<td valign='middle'>");
    let statusButton = $("<button class = 'btn' ></button>");
    statusButton.addClass("form-control text-center");
    if (message.solved) {
      statusButton.text("Solved");
      statusButton.addClass("bg-success text-white");
    } else {
      statusButton.text("Unsolved");
      statusButton.addClass("bg-danger text-white");
    }
    statusColumn.append(statusButton);
    // statusColumn.addClass("d-flex justify-content-center");

    statusButton.on("click", function () {
      if (!message.solved) {
        message.solved = true;
        statusButton.text("Solved");
        statusButton.removeClass("bg-danger ");
        statusButton.addClass("bg-success ");

        // console.log(inbox);
        saveInbox(inbox)
          .then(() => {
            // console.log(inbox);
            renderInboxTable();
          })
          .catch((error) => {
            console.error(error);
          });

        //update user inbox
        const usersData = getUsersData();
        // console.log(usersData);
        // console.log(usersData.customers);
        let customer = usersData.customers[message.email];
        let solvedMessageForm = {
          subject: message.subject,
          message: "your issue solved successfully!",
          solved: true,
          seen: false,
        };
        if (customer) {
          customer.inbox.push(solvedMessageForm);
          setUsersData(usersData);
        }

        // console.log(customer);
      }
    });

    // message button
    let messageColumn = $("<td>");
    let messageButton = $("<button type='button' class='btn btn-primary messageBtn'>Show message</button>");
    messageButton.data("index", index);
    messageColumn.append(messageButton);

    // add event listeners on messageButton
    messageButton.click(function () {
      Swal.fire({
        title: message.subject,
        icon: "info",
        text: message.message,
        confirmButtonText: "Close",
      });
    });

    // append to row
    let row = $("<tr>");
    row.append(nameColumn, mailColumn, subjectColumn, statusColumn, messageColumn);
    $(".inboxTable").append(row);
  });
}
