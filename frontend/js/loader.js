export async function cargarLoader() {
    const res = await fetch('/components/loader.html');
    const html = await res.text();
    document.getElementById('loader-placeholder').innerHTML = html;

    window.addEventListener("load", () => {
        const loader = document.getElementById("loader");
        if (loader) {
        loader.classList.add("fade-out");

        setTimeout(() => {
            loader.style.display = "none";
        }, 500);
        }
    });
}