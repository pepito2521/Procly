const form = document.getElementById("recover-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("recover-email").value;

  const res = await fetch("https://procly.net/auth/recover-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (res.ok) {
    alert("Te enviamos un mail con instrucciones para recuperar tu contraseña.");
    window.location.href = "/app/index.html";
  } else {
    alert("Error: " + data.error);
  }
});
