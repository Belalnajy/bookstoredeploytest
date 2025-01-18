// Import products data
import { products } from "./productsdata.js";

window.onload = function () {
  const isLoggedIn = localStorage.getItem("signUpData");
  if (!isLoggedIn) {
    window.location.href = "Login&Register.html";
  } else if (isLoggedIn && !localStorage.getItem("products")) {
    setProductsList(products);
  }
};

function getProductsList() {
  const products = localStorage.getItem("products");
  return JSON.parse(products) || {};
}
function getProductsConverted() {
  return Object.entries(getProductsList()).map(([key, value]) => ({
    id: key,
    ...value,
  }));
}
function setProductsList(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

document.addEventListener("DOMContentLoaded", function () {
  // Load dashboard content
  loadDashboard();
  const products = getProductsConverted();
});
function addSearchListener() {
  const searchBar = document.getElementById("searchBar");
  const productList = document.getElementById("productList");
  const products = getProductsConverted(); // Fetch products from local storage or data source

  if (searchBar && productList) {
    searchBar.addEventListener("input", function (event) {
      const searchTerm = event.target.value.toLowerCase();

      // Filter products based on the search term
      const filteredProducts = products.filter((product) => product.title.toLowerCase().includes(searchTerm));

      // Update the product list in the table
      productList.innerHTML = filteredProducts
        .map(
          (product) => `
                  <tr>
                      <td>${product.id}</td>
                      <td>${product.title}</td>
                      <td><img src="${product.img_src}" alt="${product.title}" width="50" height="50"></td>
                      <td>${product.stock}</td>
                      <td>${product.sold}</td>
                      <td>${product.price}</td>
                      <td>${product.category}</td>
                      <td><button class="delete-btn btn btn-danger" data-index=${product.id}>Delete</button></td>
                      <td><button class="btn btn-primary edit-btn" data-index=${product.id}>Edit</button></td>
                  </tr>
              `,
        )
        .join("");

      attachDeletedEventListener();
      addEditListener();
    });
  } else {
    console.error("SearchBar or productList element not found.");
  }
}

function attachDeletedEventListener() {
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const confirmation = confirm("Are you sure you want to delete");
      if (confirmation == true) {
        const index = this.getAttribute("data-index");
        deleteProduct(index);
      } else {
        return;
      }
    });
  });
}

function addEditListener() {
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const index = this.getAttribute("data-index");
      const productsArr = getProductsConverted();
      const currentProduct = productsArr?.find((product) => index == product.id);

      if (currentProduct) {
        localStorage.setItem("editProductIndex", JSON.stringify(currentProduct));
        loadEditProduct();
      } else {
        console.error("Product not found for editing!");
      }
    });
  });
}
function addProductsListener() {
  document.getElementById("addProduct").addEventListener("click", function () {
    loadAddProduct();
  });
  document.getElementById("addProductLink").addEventListener("click", function () {
    loadAddProduct();
  });

  document.getElementById("dashboardLink").addEventListener("click", function () {
    loadDashboard();
  });
}

function loadDashboard() {
  const contentArea = document.getElementById("contentArea");
  // Get products from localStorage (after setData ensures they are set)
  /*1.{
      1:{a:1},
      2:{a:2}
  }  
  2.[
  ['1',{a:1}],
  ['2',{a:2}],
  ] 
  3.[{id:1,a:1},{id:2,a:2}]   */
  const products = getProductsConverted();
  // Populate product dashboard with data
  contentArea.innerHTML = `
      <h1 class="mb-4">Products Dashboard</h1>
      <input type="text" class="form-control search-bar" placeholder="Search Products by Name..." id="searchBar" >
      <div class="row">
          <div class="col-md-6 col-12 mb-4">
              <div class="card h-100">
                  <div class="card-header">Product Summary</div>
                  <div class="card-body">
                      <p><strong>Total Products In Stock:</strong> <span id="totalProducts">${products.reduce((accumulator, product) => accumulator + +product.stock, 0)}</span></p>
                     
                      <p><strong>Sold Products:</strong> <span id="soldProducts">${products.reduce((accumulator, product) => accumulator + +product.sold, 0)}</span></p>
                  </div>
              </div>
          </div>
           <!-- Sales Analytics -->
              <div class="col-md-6 col-12 mb-4">
                  <div class="card">
                      <div class="card-header">Sales Analytics</div>
                      <div class="card-body">
                          <div class="graph-container">
                              <!-- Sales by Category Pie Chart (Chart.js) -->
                              <div id="salesByCategoryChart" style="width: 250px;height: 250px;"></div>
                          </div>
                      </div>
                  </div>
              </div>
      </div>
      <div class="card">
          <div class="card-header">Manage Products</div>
          <div class="card-body overflow-x-scroll">
       
              <button class="btn primary-btn mb-3 "  id="addProduct">Add Product</button>
               <table class="table table-striped product-table">
                  <thead>
                      <tr>
                           <th>Product ID</th>
            <th>Name</th>
            <th>Product Image</th>
            <th>Stock</th>
            <th>Sold</th>
            <th>Price</th>
            <th>Category</th>
            <th>Delete</th>
            <th>Edit</th>
                      </tr>
                  </thead>
                  <tbody id="productList">
                      ${products
                        .map(
                          (product, index) => `
                          <tr>
                              <td>${product.id}</td>
                              <td>${product.title}</td>
                              <td><img src="${product.img_src}" alt="${product.title}" width="50" height="50"></td>
                              <td>${product.stock}</td>
                              <td>${product.sold}</td>
                              <td>${product.price}</td>
                              <td>${product.category}</td>
                              <td><button class="delete-btn btn bg-dark-subtle " data-index=${product.id}>Delete</button></td>
                              <td><button class="btn bg-secondary text-white edit-btn"  data-index=${product.id}>Edit</button></td>

                          </tr>
                      `,
                        )
                        .join("")}
                  </tbody>
              </table>
             
          </div>
      </div>
  `;

  // Chart Data
  const salesDataObject = products.reduce((accumelator, currentValue) => {
    accumelator[currentValue["category"]] = (accumelator[currentValue["category"]] || 0) + Number(currentValue["sold"]);
    return accumelator;
  }, {});
  const salesData = Object.entries(salesDataObject).map(([key, value]) => ({
    category: key,
    sales: value,
  }));

  // Sales by Category Pie Chart (Chart.js)
  const salesByCategoryCtx = document.createElement("canvas");
  document.getElementById("salesByCategoryChart").appendChild(salesByCategoryCtx);
  var saleschart = new Chart(salesByCategoryCtx, {
    type: "pie",
    data: {
      labels: salesData.map((d) => d.category),
      datasets: [
        {
          data: salesData.map((d) => d.sales),
          backgroundColor: ["#FF5733", "#33FF57", "#3357FF", "#FF00FF", "#00FFFF"],
        },
      ],
    },
  });

  attachDeletedEventListener();
  addProductsListener();
  addEditListener();
  addSearchListener();
}

function deleteProduct(productIndex) {
  const products = getProductsList();
  delete products[productIndex];
  setProductsList(products);
  loadDashboard();
}

document.getElementById("toggle-sidebar-btn").addEventListener("click", function () {
  const sidebar = document.querySelector(".sidebar");
  sidebar.classList.toggle("active");
});

function loadAddProduct() {
  const contentArea = document.getElementById("contentArea");
  $.ajax({
    url: "AddProduct.html",
    success: function (response) {
      contentArea.innerHTML = response;
      $("#productForm").on("submit", function (event) {
        event.preventDefault();

        let valid = true;
        const productName = $("#productName").val().trim();
        const productPrice = $("#productPrice").val().trim();
        const productQuantity = $("#productQuantity").val().trim();
        const productCategory = $("#productCategory").val().trim();
        const productDescription = $("#productDescription").val().trim();
        const productImageFile = $("#productImage")[0].files[0];
        let productImage = null;

        if (!/^[a-zA-Z0-9\s]+$/.test(productName)) {
          Toast.fire({
            icon: "error",
            title: "Product name should only contain letters, numbers, and spaces.",
          });
          valid = false;
        }

        // Validate Product Price (should be a positive number)
        if (parseFloat(productPrice) <= 0 || isNaN(productPrice)) {
          Toast.fire({
            icon: "error",
            title: "Product price must be a positive number.",
          });
          valid = false;
        }

        // Validate Product Quantity (should be a positive integer)
        if (parseInt(productQuantity) <= 0 || isNaN(productQuantity)) {
          Toast.fire({
            icon: "error",
            title: "Product quantity must be a positive integer.",
          });
          valid = false;
        }

        // Validate Product Category (should be selected)
        if (!productCategory) {
          Toast.fire({
            icon: "info",
            title: "Please select a category.",
          });
          valid = false;
        }

        // Validate Description (should have at least 10 alphabetic characters)
        if ((productDescription.match(/[a-zA-Z]/g) || []).length < 10) {
          Toast.fire({
            icon: "info",
            title: "Description must contain at least 10 alphabetic characters.",
          });
          valid = false;
        }

        // Validate Image (should be a valid image file)
        if (!productImageFile || !productImageFile.type.startsWith("image/")) {
          Toast.fire({
            icon: "error",
            title: "Please upload a valid image.",
          });
          valid = false;
        }

        // If all validations pass, check if product exists and save it
        if (valid) {
          const products = getProductsConverted();
          const reader = new FileReader();
          let productImage = null;
          reader.onload = function (e) {
            const productExists = products.some(
              (product) => product.title.toLowerCase() === productName.toLowerCase() || product.description.toLowerCase() === productDescription.toLowerCase() || product.img_src === e.target.result, // Check if image already exists
            );

            if (productExists) {
              Toast.fire({
                icon: "info",
                title: "This product with the same name, description, or image has already been added.",
              });
              return; // Prevent saving the duplicate product
            }
            productImage = e.target.result;
            saveProductinAddProduct(productName, productPrice, productQuantity, productCategory, productDescription, productImage);
          };
          reader.readAsDataURL(productImageFile);
        }
      });
      function saveProductinAddProduct(title, price, stock, category, description, img_src) {
        const sellerEmail = JSON.parse(sessionStorage.getItem("currentSession"))?.session?.email;
        const product = {
          title,
          price,
          stock,
          category,
          description,
          sold: 0,
          seller_email: sellerEmail,
          img_src: img_src, // Base64 image
        };

        const products = JSON.parse(localStorage.getItem("products")) || {};
        let productsCount = Object.keys(products).length;
        products[productsCount + 1] = product;
        localStorage.setItem("products", JSON.stringify(products));
        Toast.fire({
          icon: "success",
          title: "Data added successfully!.",
        });
        $("#productForm")[0].reset();
      }
    },
  });
}
function loadEditProduct() {
  const contentArea = document.getElementById("contentArea");
  $.ajax({
    url: "EditProduct.html",
    success: function (response) {
      contentArea.innerHTML = response;
      // Fill in the form fields
      const productToEdit = JSON.parse(localStorage.getItem("editProductIndex"));
      if (productToEdit) {
        document.getElementById("productName").value = productToEdit.title;
        document.getElementById("productPrice").value = productToEdit.price;
        document.getElementById("productQuantity").value = productToEdit.stock;
        document.getElementById("productCategory").value = productToEdit.category;
        document.getElementById("productDescription").value = productToEdit.description;
      } else {
        Toast.fire({
          icon: "error",
          title: "No product selected for editing!",
        });
      }

      const form = document.getElementById("editProductForm");
      form.onsubmit = function (e) {
        e.preventDefault();

        const productName = document.getElementById("productName").value.trim();
        const productPrice = document.getElementById("productPrice").value.trim();
        const productQuantity = document.getElementById("productQuantity").value.trim();
        const productCategory = document.getElementById("productCategory").value.trim();
        const productDescription = document.getElementById("productDescription").value.trim();
        const productImageInput = document.getElementById("productImage");

        let productImage = null;
        let valid = true;

        // Validate Product Name (only letters, numbers, and spaces)
        if (!/^[a-zA-Z0-9\s]+$/.test(productName)) {
          Toast.fire({
            icon: "error",
            title: "Product name should only contain letters, numbers, and spaces.",
          });
          valid = false;
        }

        // Validate Product Price (should be a positive number)
        if (parseFloat(productPrice) <= 0 || isNaN(productPrice)) {
          Toast.fire({
            icon: "error",
            title: "Product price must be a positive number.",
          });
          valid = false;
        }

        // Validate Product Quantity (should be a positive integer)
        if (parseInt(productQuantity) <= 0 || isNaN(productQuantity)) {
          Toast.fire({
            icon: "error",
            title: "Product quantity must be a positive integer.",
          });
          valid = false;
        }

        // Validate Product Category (should be selected)
        if (!productCategory) {
          Toast.fire({
            icon: "error",
            title: "Please select a category.",
          });
          valid = false;
        }

        // Validate Description (should have at least 10 alphabetic characters)
        if ((productDescription.match(/[a-zA-Z]/g) || []).length < 10) {
          Toast.fire({
            icon: "error",
            title: "Description must contain at least 10 alphabetic characters.",
          });
          valid = false;
        }

        // Validate Image (should be a valid image file if selected)
        if (productImageInput.files.length > 0 && !productImageInput.files[0].type.startsWith("image/")) {
          Toast.fire({
            icon: "error",
            title: "Please upload a valid image.",
          });
          valid = false;
        }

        if (!valid) {
          return; // Stop execution if validation fails
        }

        // Retrieve products and the current product
        let productsObject = getProductsList();

        const products = getProductsConverted();
        const productToEdit = JSON.parse(localStorage.getItem("editProductIndex"));
        // Check if the name, description, or image already exists
        const existingProduct = products.find((p) => (p.name === productName || p.description === productDescription) && p.id !== productToEdit.id);

        if (existingProduct) {
          Toast.fire({
            icon: "error",
            title: "Product with this name or description already exists. Please choose a different one.",
          });
          return;
        }

        // Handle image and update product
        if (productImageInput.files && productImageInput.files[0]) {
          const reader = new FileReader();
          reader.onloadend = function () {
            productImage = reader.result;

            // Check if the image already exists in other products
            const imageExists = products.some((p, index) => p.image === productImage && index !== parseInt(productToEdit.id));

            if (imageExists) {
              Toast.fire({
                icon: "error",
                title: "This product image already exists. Please choose a different image.",
              });
              return;
            }

            const updatedProduct = {
              ...productToEdit,
              title: productName,
              price: productPrice,
              stock: productQuantity,
              category: productCategory,
              description: productDescription,
              img_src: productImage,
            };
            productsObject[productToEdit.id] = updatedProduct;
            localStorage.setItem("products", JSON.stringify(productsObject));

            Toast.fire({
              icon: "success",
              title: "Product updated successfully!",
            });
            window.location.href = "SellerDashboard.html";
          };
          reader.readAsDataURL(productImageInput.files[0]);
        } else {
          const updatedProduct = {
            ...productToEdit,
            title: productName,
            price: productPrice,
            stock: productQuantity,
            category: productCategory,
            description: productDescription,
          };

          productsObject[productToEdit.id] = updatedProduct;
          localStorage.setItem("products", JSON.stringify(productsObject));

          Toast.fire({
            icon: "success",
            title: "Product updated successfully!",
          });
          window.location.href = "SellerDashboard.html";
        }
      };
    },
  });
}

function addProductFromForm() {
  const name = document.getElementById("productName").value;
  const image = document.getElementById("productImage").value;
  const stock = document.getElementById("productStock").value;
  const sold = document.getElementById("productSold").value;
  const price = document.getElementById("productPrice").value;
  const category = document.getElementById("productCategory").value;

  if (!name || !image || !stock || !price || !category) {
    Toast.fire({
      icon: "error",
      title: "Please fill in all required fields.",
    });
    return;
  }

  const product = { name, image, stock, sold, price, category };
  saveProduct(product); // Save the new product
  Toast.fire({
    icon: "success",
    title: "Product added successfully!",
  });
  document.getElementById("addProductForm").reset();
}

function saveProduct(product) {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  products.push(product);
  localStorage.setItem("products", JSON.stringify(products));
}
