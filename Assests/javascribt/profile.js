document.addEventListener("DOMContentLoaded", function () {
  async function loadContent(url, elementId) {
    try {
      const response = await fetch(url);
      const data = await response.text();
      document.getElementById(elementId).innerHTML = data;

      if (elementId === "mainNavigation") {
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

  (async function () {
    await loadContent("nav.html", "mainNavigation");
    await loadContent("footer.html", "footer");
    $("#global-search").on("keydown", function (e) {
      if (e.key === "Enter") {
        let allProducts = getProductsData();
        const searchTerm = $(this).val().toLowerCase();

        console.log(searchTerm);

        let filteredProducts = [];
        for (let productId in allProducts) {
          let product = allProducts[productId];

          if (product.title.toLowerCase().includes(searchTerm)) {
            filteredProducts.push(productId);
          }
        }

        console.log(filteredProducts);

        localStorage.setItem("forSearch", JSON.stringify(filteredProducts));

        window.location.href = "./LoadMore.html";
      }
    });
  })();
});

async function getCurrentUsername() {
  const sessionData = JSON.parse(sessionStorage.getItem("currentSession"));
  if (!sessionData || !sessionData.session || !sessionData.session.email) {
    return "";
  }

  const currentEmail = sessionData.session.email;
  const signUpData = JSON.parse(localStorage.getItem("signUpData"));

  if (!signUpData || (!signUpData.customers && !signUpData.sellers)) {
    return "";
  }

  if (signUpData.customers && signUpData.customers[currentEmail]) {
    return signUpData.customers[currentEmail].username;
  } else if (signUpData.sellers && signUpData.sellers[currentEmail]) {
    return signUpData.sellers[currentEmail].username;
  }

  return "";
}

function isUsernameTaken(username) {
  const signUpData = JSON.parse(localStorage.getItem("signUpData"));

  if (signUpData.customers) {
    for (const email in signUpData.customers) {
      if (signUpData.customers[email].username === username) {
        return true;
      }
    }
  } else if (signUpData.sellers) {
    for (const email in signUpData.sellers) {
      if (signUpData.sellers[email].username === username) {
        return true;
      }
    }
  }

  return false;
}

function isEmailTaken(email) {
  const signUpData = JSON.parse(localStorage.getItem("signUpData"));
  return (signUpData.customers && signUpData.customers[email] !== undefined) || (signUpData.sellers && signUpData.sellers[email] !== undefined);
}

function validateUsername(username) {
  const regex = /^[a-zA-Z\s]{3,15}$/;
  return regex.test(username);
}
function validateEmail(email) {
  const regex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@gmail\.com$/;
  if (!regex.test(email)) {
    return {
      valid: false,
      message: "Invalid Email (e.g., user@gmail.com)",
    };
  }
  return {
    valid: true,
    message: "Valid email",
  };
}

function validatePassword(password) {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const hashedBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(password));
  return Array.from(new Uint8Array(hashedBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
document.addEventListener("DOMContentLoaded", function () {
  autofillProfileData();

  const saveButton = document.getElementById("save-button");
  if (saveButton) {
    saveButton.addEventListener("click", function () {
      saveChanges();
    });
  }

  function autofillProfileData() {
    const usernameField = document.querySelector('[name="username"]');
    const emailField = document.querySelector('[name="email"]');
    const currentPasswordField = document.querySelector('[name="current-password"]');

    if (!usernameField || !emailField || !currentPasswordField) {
      console.error("One or more form fields are missing.");
      return;
    }

    const sessionData = JSON.parse(sessionStorage.getItem("currentSession"));

    if (!sessionData || !sessionData.session || !sessionData.session.email) {
      console.error("No session data found.");
      return;
    }

    const currentEmail = sessionData.session.email;

    const signUpData = JSON.parse(localStorage.getItem("signUpData"));

    let userData;
    if (signUpData.customers[currentEmail]) {
      userData = signUpData.customers[currentEmail];
    } else if (signUpData.sellers[currentEmail]) {
      userData = signUpData.sellers[currentEmail];
    } else {
      console.error("User data not found.");
      return;
    }
    usernameField.value = userData.username || "";
    emailField.value = userData.email || "";
    currentPasswordField.value = "";
  }

  async function saveChanges() {
    const username = document.querySelector('[name="username"]').value.trim();
    const email = document.querySelector('[name="email"]').value.trim();
    const currentPassword = document.querySelector('[name="current-password"]').value.trim();
    const newPassword = document.querySelector('[name="new-password"]').value.trim();
    const repeatPassword = document.querySelector('[name="repeat-password"]').value.trim();

    console.log({
      username,
      email,
      currentPassword,
      newPassword,
      repeatPassword,
    });

    if (!validateUsername(username)) {
      alert("Invalid username. It must only contain letters, and no special characters or numbers.");
      return;
    }

    const sessionData = JSON.parse(sessionStorage.getItem("currentSession"));
    if (!sessionData || !sessionData.session || !sessionData.session.email) {
      console.error("No session data found.");
      return;
    }

    const currentEmail = sessionData.session.email;

    if (username !== "" && username !== (await getCurrentUsername()) && isUsernameTaken(username)) {
      alert("Username already exists.");
      return;
    }

    if (email !== currentEmail) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        alert(emailValidation.message);
        return;
      }
      if (isEmailTaken(email)) {
        alert("This email is already taken. Please choose another email.");
        return;
      }
    }

    if (newPassword || repeatPassword) {
      if (!validatePassword(newPassword)) {
        alert("Password must be at least 8 characters long and contain at least one letter, one digit, and one special character.");
        return;
      }
      if (newPassword && newPassword !== repeatPassword) {
        alert("New password and repeat password must match!");
        return;
      }
    }

    const signUpData = JSON.parse(localStorage.getItem("signUpData"));
    if (!signUpData || (!signUpData.customers && !signUpData.sellers) || !(signUpData.customers[currentEmail] || signUpData.sellers[currentEmail])) {
      console.error("User data not found in localStorage.");
      return;
    }

    let userData;
    if (signUpData.customers && signUpData.customers[currentEmail]) {
      userData = signUpData.customers[currentEmail];
    } else if (signUpData.sellers && signUpData.sellers[currentEmail]) {
      userData = signUpData.sellers[currentEmail];
    } else {
      console.error("User data not found.");
      return;
    }

    const hashedCurrentPassword = await hashPassword(currentPassword);

    if (hashedCurrentPassword !== userData.password) {
      console.error("Incorrect current password.");
      alert("The current password is incorrect!");
      return;
    }

    let updated = false;

    if (username && username !== userData.username) {
      userData.username = username;
      updated = true;
    }
    if (email && email !== currentEmail && email !== userData.email) {
      userData.email = email;
      updated = true;
    }
    if (newPassword && newPassword !== userData.password) {
      userData.password = await hashPassword(newPassword);
      updated = true;
    }

    if (updated) {
      if (email !== currentEmail && isEmailTaken(email)) {
        alert("This email is already taken. Please choose another email.");
        return;
      }

      if (email !== currentEmail) {
        if (signUpData.customers[currentEmail]) {
          signUpData.customers[email] = { ...userData };
          delete signUpData.customers[currentEmail];
        } else if (signUpData.sellers[currentEmail]) {
          signUpData.sellers[email] = { ...userData };
          delete signUpData.sellers[currentEmail];
        }
      } else {
        if (signUpData.customers[currentEmail]) {
          signUpData.customers[currentEmail] = { ...userData };
        } else if (signUpData.sellers[currentEmail]) {
          signUpData.sellers[currentEmail] = { ...userData };
        }
      }

      console.log("Saving updated signUpData to localStorage:", signUpData);
      localStorage.setItem("signUpData", JSON.stringify(signUpData));

      if (email !== currentEmail) {
        sessionData.session.email = email;
        sessionStorage.setItem("currentSession", JSON.stringify(sessionData));
        console.log("Session updated:", sessionData);
      }

      alert("Profile updated successfully!");
    } else {
      console.log("No changes detected, nothing saved.");
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const profilePicture = document.querySelector(".tab-content img");
  const fileInput = document.querySelector(".account-settings-fileinput");
  const resetButton = document.querySelector(".btn-default");
  const avatarURL = "./Assests/images/profileimage.png";

  if (!profilePicture) {
    console.error("Profile picture element not found.");
    return;
  }

  const sessionData = JSON.parse(sessionStorage.getItem("currentSession"));
  const currentEmail = sessionData ? sessionData.session.email : null;

  if (!currentEmail) {
    console.error("No current email found in session.");
    return;
  }

  const signUpData = JSON.parse(localStorage.getItem("signUpData"));
  if (signUpData && ((signUpData.customers && signUpData.customers[currentEmail]) || (signUpData.sellers && signUpData.sellers[currentEmail]))) {
    let userData;

    if (signUpData.customers && signUpData.customers[currentEmail]) {
      userData = signUpData.customers[currentEmail];
    } else if (signUpData.sellers && signUpData.sellers[currentEmail]) {
      userData = signUpData.sellers[currentEmail];
    }

    const savedImageSrc = userData.userProfileImage || avatarURL;
    profilePicture.src = savedImageSrc;
  } else {
    profilePicture.src = avatarURL;
  }

  function validateImage(file) {
    const allowedExtensions = ["image/jpeg", "image/png", "image/gif"];
    const maxFileSize = 800 * 1024;

    if (!allowedExtensions.includes(file.type)) {
      alert("Allowed file types: JPG, PNG, GIF.");
      return false;
    }
    if (file.size > maxFileSize) {
      alert("File size exceeds 800 KB.");
      return false;
    }
    return true;
  }

  fileInput.addEventListener("change", function () {
    const file = this.files[0];

    if (file && validateImage(file)) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const base64Image = e.target.result;
        profilePicture.src = base64Image;

        if (signUpData && (signUpData.customers || signUpData.sellers)) {
          if (signUpData.customers && signUpData.customers[currentEmail]) {
            signUpData.customers[currentEmail].userProfileImage = base64Image;
          } else if (signUpData.sellers && signUpData.sellers[currentEmail]) {
            signUpData.sellers[currentEmail].userProfileImage = base64Image;
          }

          localStorage.setItem("signUpData", JSON.stringify(signUpData));
        }
      };
      reader.readAsDataURL(file);
    } else {
      fileInput.value = "";
    }
  });

  resetButton.addEventListener("click", function () {
    profilePicture.src = avatarURL;

    if (signUpData && (signUpData.customers || signUpData.sellers)) {
      if (signUpData.customers && signUpData.customers[currentEmail]) {
        signUpData.customers[currentEmail].userProfileImage = "";
      } else if (signUpData.sellers && signUpData.sellers[currentEmail]) {
        signUpData.sellers[currentEmail].userProfileImage = "";
      }

      localStorage.setItem("signUpData", JSON.stringify(signUpData));
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
