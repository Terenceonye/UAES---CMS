// const API_BASE_URL = "/api/v1";
// alert("Check auth file");
function redirectToLogin() {
  window.location.href = "/adminlogin"; // Redirect to your login page
}

async function verifyToken() {
  const token = localStorage.getItem("token");

  // If no token, redirect to login immediately
  if (!token) {
    redirectToLogin();
    return;
  }

  // Show spinner while verifying token
  // showLoadingSpinner();

  try {
    const response = await fetch(`/api/auth/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // If the token is invalid or expired, it will throw an error
    if (!response.ok) {
      throw new Error("Token is invalid or expired");
    }

    // Handle server response (optional)
    const data = await response.json();

    console.log("User data:", data);

    // You can add any other logic here to handle the user data if needed
  } catch (error) {
    console.error(error.message);
    showToast(error.message, "danger");
    // Remove the invalid token and redirect to login
    localStorage.removeItem("token");
    redirectToLogin();
  }
}

function logout() {
  // Remove token from localStorage and redirect to login page
  localStorage.removeItem("token");
  window.location.href = "/adminlogin"; // Redirect to login page
}
verifyToken(); // Call the function to verify the token when the script runs
