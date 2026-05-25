// src/utils/auth.ts
export const handleLogout = async () => {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      window.location.href = "/login";
    } else {
      console.error("Logout failed");
    }
  } catch (err) {
    console.error("Logout error:", err);
  }
};
