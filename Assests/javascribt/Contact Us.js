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
  inbox = getInbox();

  // Check if the category is 'customers' and fill the email field with the stored email
  const sessionData = JSON.parse(sessionStorage.getItem("currentSession"));
  if (sessionData && sessionData.session.category === "customers") {
    const email = sessionData.session.email;
    if (email) {
      // Set the email in the input field and make it readonly
      $("#email").val(email);
      $("#email").prop("readonly", true); // Make the email field read-only
    }
  }

 $("#formcontact").on("submit", function (event) {
    event.preventDefault(); // prevent the default not to refresh the page to show the message toast after submit

    let isValid = true;

    const nameinput = $("#name").val().trim();
    const emailinput = $("#email").val().trim();
    const subjectinput = $("#subject").val().trim();
    const messageinput = $("#message").val().trim();

    // Validate name
    if (!/^[a-zA-Z\s]{3,}$/.test(nameinput)) {
      isValid = false;
      $("#errorname").removeClass("d-none");
    } else {
      $("#errorname").addClass("d-none");
    }

    // Validate email address
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]{2,}\.[a-zA-Z]{2,}$/.test(emailinput)) {
      isValid = false;
      $("#erroremail").removeClass("d-none");
    } else {
      $("#erroremail").addClass("d-none");
    }

    // If all validations pass
    if (isValid && sessionData) {
      // Save data to local storage
      const contactData = {
        name: nameinput,
        email: emailinput,
        subject: subjectinput,
        message: messageinput,
        solved: false,
      };
      inbox.push(contactData);
      console.log(inbox);
      localStorage.setItem("inbox", JSON.stringify(inbox));

      // clear the form
      if (sessionData.session.category === "customers") {
        $("#formcontact")[0].reset();
        $("#email").val(sessionData.session.email);
      }
      else{
      $("#formcontact")[0].reset();
      }
      // show message toast
      $("#successtoast").toast("show");

      updateInboxBadge();
    }else{

      $("#formcontact")[0].reset();

      // show message toast

      $("#failedtoast").toast("show");

      

    }
    
  });
});

function getInbox() {
  const inbox = localStorage.getItem("inbox");
  return JSON.parse(inbox);
}
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
    document.getElementById("home-link").classList?.add("active");
  }
};
