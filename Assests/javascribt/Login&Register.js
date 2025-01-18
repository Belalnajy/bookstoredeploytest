import { usersData } from "./accounts.js";

// Initialize localStorage with usersData if not already set
const signUpObject = JSON.parse(localStorage.getItem("signUpData")) ?? usersData;

if (!localStorage.getItem("signUpData")) {
  localStorage.setItem("signUpData", JSON.stringify(signUpObject));
}
$(document).ready(function () {
  $("#signUpForm").css("display", "none");
  $("#loginForm").css("display", "flex");
  const $emailField = $("#email");
  const $emailError = $("#emailError");
  const $phoneField = $("#phone");
  const $phoneError = $("#phoneError");
  const $passwordField = $("#password");
  const $confirmPasswordField = $("#confirmPassword");
  const $passwordLengthError = $("#passwordLengthError");
  const $passwordStrengthError = $("#passwordStrengthError");
  const $confirmPasswordError = $("#confirmPasswordError");
  const $usernameField = $("#username");
  const $usernameError = $("#usernameError");
  const $signUpButton = $("#signUpButton");
  const $signUpError = $("#signUpError");
  const passwordLengthRegex = /.{8,}/;
  const passwordStrengthRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
  const phoneRegex = /^(011|012|010|015)\d{8}$/;
  const emailValue = $emailField.val().trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+(?<!\.)@gmail\.com$/;
  const invalidCharsRegex = /[!#$%^&*(),?":{}|<>]$/;
  const usernameRegex = /^[a-zA-Z\s_-]+$/; // Allow letters, spaces, dashes, and underscores
  const invalidStartEndMiddleRegex = /^(?![^\w\s_-]|.*[^\w\s_-]$).*$/; // Disallow special characters at start, middle, or end

  let typingTimer;
  const doneTypingInterval = 300; // Set a typing delay time

  // validation functions
  //email validation function
  function validateEmail() {
    if (!emailRegex.test(emailValue)) {
      $emailError.text("Invalid Email (e.g., starts with a letter and ends with @gmail.com)");
      $emailField.css("border-bottom-color", "red");
      $emailError.show();
    } else if (invalidCharsRegex.test(emailValue.split("@")[0])) {
      $emailError.text("Email cannot end with special characters before '@gmail.com'");
      $emailField.css("border-bottom-color", "red");
      $emailError.show();
    } else {
      $emailError.hide();
      $emailField.css("border-bottom-color", "green");
    }
  }
  $emailField.on("input", function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(validateEmail, doneTypingInterval);
  });
  $emailField.on("blue", function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(validateEmail, doneTypingInterval);
  });
  // Phone Validation

  function validatePhone() {
    const phoneValue = $phoneField.val();
    if (emailRegex.test(phoneValue)) {
      $phoneError.text("Phone number cannot be an email address.").show();
      $phoneField.css("border-bottom-color", "red");
    } else if (!phoneRegex.test(phoneValue)) {
      $phoneError.text("Invalid Phone Number").show();
      $phoneField.css("border-bottom-color", "red");
    } else {
      $phoneError.hide();
      $phoneField.css("border-bottom-color", "green");
    }
  }
  $phoneField.on("input", function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(validatePhone, doneTypingInterval);
  });

  // Password Validation

  function validatePassword() {
    const passwordValue = $passwordField.val();
    if (!passwordValue.match(passwordLengthRegex)) {
      $passwordLengthError.show();
      $passwordStrengthError.hide();
      $passwordField.css("border-bottom-color", "red");
    } else if (!passwordValue.match(passwordStrengthRegex)) {
      $passwordStrengthError.show();
      $passwordLengthError.hide();
      $passwordField.css("border-bottom-color", "red");
    } else {
      $passwordLengthError.hide();
      $passwordStrengthError.hide();
      $passwordField.css("border-bottom-color", "green");
    }
  }

  $passwordField.on("input", function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(validatePassword, doneTypingInterval);
  });
  // validate confirm password
  function validateConfirmPassword() {
    const confirmPasswordValue = $confirmPasswordField.val();

    if (confirmPasswordValue !== $passwordField.val()) {
      $confirmPasswordError.show();
      $confirmPasswordField.css("border-bottom-color", "red");
    } else {
      $confirmPasswordError.hide();
      $confirmPasswordField.css("border-bottom-color", "green");
    }
  }
  $confirmPasswordField.on("input", function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(validateConfirmPassword, doneTypingInterval);
  });

  // Username Validation

  function validateUsername() {
    const usernameValue = $usernameField.val().trim();
    if (!usernameValue.match(usernameRegex)) {
      $usernameError.text("Username can only contain letters, spaces, underscores, or dashes.");
      $usernameField.css("border-bottom-color", "red");
      $usernameError.show();
    } else if (!invalidStartEndMiddleRegex.test(usernameValue)) {
      $usernameError.text("Special characters are not allowed at the start, middle, or end.");
      $usernameField.css("border-bottom-color", "red");
      $usernameError.show();
    } else if (localStorage.getItem(usernameValue)) {
      $usernameError.text("This Username Has Been Taken Before");
      $usernameField.css("border-bottom-color", "red");
      $usernameError.show();
    } else {
      $usernameError.hide();
      $usernameField.css("border-bottom-color", "green");
    }
  }

  $usernameField.on("input", function () {
    let username = $usernameField.val().trim();

    // Clear error message whenever the user types
    $usernameError.hide();
    $usernameField.css("border-bottom-color", "green");

    // Remove invalid characters like '@', spaces, dashes, and underscores before generating the email
    username = username.replace(/[^a-zA-Z]/g, "").toLowerCase(); // Only allow alphabets

    // Create the email by appending "@gmail.com"
    const email = username + "@gmail.com";

    // Update the email field with the generated email
    if (username) {
      $emailField.val(email);
    } else {
      $emailField.val("");
    }

    // Revalidate the username to ensure any changes update the error message
    validateUsername();
  });

  // Hash Password
  function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
  }

  // Sign Up Button Event

  $signUpButton.on("click", function (event) {
    event.preventDefault(); // Prevent default behavior (page reload)
    // Collect values
    const username = $usernameField.val().trim();
    const email = $emailField.val().trim();
    const phone = $phoneField.val().trim();
    const password = $passwordField.val().trim();
    const confirmPassword = $confirmPasswordField.val().trim();

    // Validation checks
    if (!username || !email || !phone || !password || !confirmPassword) {
      //   $signUpError.text("Please fill in all fields.").show();
      Toast.fire({
        icon: "info",
        title: "All Fields Are Required",
      });
      return; // Stop further execution
    }

    // Retrieve the current signUpObject from localStorage
    const signUpObject = JSON.parse(localStorage.getItem("signUpData")) ?? {
      customers: {},
    };

    // Check if username or email already exists in the customers object
    const isUsernameTaken = Object.values(signUpObject.customers).some((user) => user.username === username);
    const isEmailTaken = Object.values(signUpObject.customers).some((user) => user.email === email);

    if (isUsernameTaken) {
      $usernameError.text("This Username Has Been Taken Before").show();
      return;
    }

    if (isEmailTaken) {
      $emailError.text("This Email Is Already Registered").show();
      return;
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Create a new user object
    const newUser = {
      username,
      email,
      phone,
      password: hashedPassword,
      role: "customer",
      address: "",
      imgsrc: "",
      cart: {},
      wishlist: [],
      orders_history: [],
      inbox: [],
    };

    // Add the new user to the customers object
    signUpObject.customers[email] = newUser;

    // Save the updated object back to localStorage
    localStorage.setItem("signUpData", JSON.stringify(signUpObject));

    Toast.fire({
      icon: "success",
      title: "Sign Up Successful! You can now sign in.",
    });

    // Reset form fields
    $usernameField.val("");
    $emailField.val("");
    $phoneField.val("");
    $passwordField.val("");
    $confirmPasswordField.val("");
    return;
  });

  //signInButton
  const signInButton = $("#signInButton");
  const signInError = $("#signInError");
  const signinEmailField = $('#loginForm input[type="email"]');
  const signinPasswordField = $('#loginForm input[type="password"]');

  signInButton.on("click", function (event) {
    event.preventDefault(); // Prevent default behavior (page reload)

    const email = signinEmailField.val().trim();
    const password = signinPasswordField.val().trim();

    signInError.hide();

    if (!email || !password) {
      Toast.fire({
        icon: "info",
        title: "Please fill in both email and password.",
      });
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._-]{2,}@gmail\.com$/;
    if (!emailRegex.test(email)) {
      Toast.fire({
        icon: "info",
        title: "Please enter a valid email address with at least 2 characters before '@gmail.com'.",
      });
      return;
    }
    // Fetch data from localStorage
    const signUpData = JSON.parse(localStorage.getItem("signUpData")) || {};
    const { admin, customers, sellers } = signUpData;

    // Loop through all users in localStorage
    let foundUser = null;
    let category = "";
    let role = "";

    // Check for user in each role
    if (admin && admin[email]) {
      foundUser = admin[email];
      role = "admin";
      category = "admin";
    } else if (customers && customers[email]) {
      foundUser = customers[email];
      role = "customer";
      category = "customers";
    } else if (sellers && sellers[email]) {
      foundUser = sellers[email];
      role = "seller";
      category = "sellers";
    }

    // User not found
    if (!foundUser) {
      Toast.fire({
        icon: "warning",
        title: "This email is not registered. Please sign up first.",
      });
      return;
    }

    // Compare entered password with the stored password
    if (foundUser.password !== hashPassword(password)) {
      Toast.fire({
        icon: "error",
        title: "Email or Password is incorrect. Please try again.",
      });
      return;
    }

    const loginObject = {
      session: {
        email: email,
        category: category,
      },
    };
    sessionStorage.setItem("currentSession", JSON.stringify(loginObject));

    if (role === "admin") {
      window.location.href = "dash.html";
    } else if (role === "customer") {
      window.location = "HomePage.html";
    } else if (role === "seller") {
      window.location.href = "SellerDashboard.html";
    } else {
      signInError.text("User role not recognized.");
      signInError.css("display", "block");
    }

    signinEmailField.val("");
    signinPasswordField.val("");
  });

  $("#signUpToggleBtn").click(function () {
    $("#loginForm").fadeOut(700, function () {
      $(this).removeClass("active");
      $("#signUpForm").fadeIn(1000).addClass("active");
      $("#signUpForm").css("display", "flex");
    });
  });

  $("#signInToggleBtn").click(function () {
    $("#signUpForm").fadeOut(700, function () {
      $(this).removeClass("active");
      $("#loginForm").fadeIn(1000).addClass("active");
    });
  });
});
