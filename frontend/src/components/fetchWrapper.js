export async function apiFetch(url, options = {}) {
  const res = await fetch(url, options);

  if (res.status === 401) {
    localStorage.removeItem("userId");
    window.location.href = "/login";
    return;
  }

  return res;
}
