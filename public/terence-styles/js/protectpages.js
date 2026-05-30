(async function protectPage() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // 1. No token? Redirect to login
  if (!token) {
    localStorage.removeItem("user");
    window.location.href = "/adminlogin?redirected=true";
    return;
  }

  // 3. Token verification with backend (optional but recommended)
  try {
    const res = await fetch("/api/auth/verify", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Invalid token");
    }

    const data = await res.json();

    // You could refresh token or user data here if needed
    // localStorage.setItem("user", JSON.stringify(data.user));
  } catch (err) {
    console.error("Auth error:", err.message);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "adminlogin?expired=true";
  }
})();

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/adminlogin?logout=true";
}
