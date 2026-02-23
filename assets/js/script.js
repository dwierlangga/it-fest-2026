// assets/js/script.js

document.addEventListener("DOMContentLoaded", () => {
    const menuCards = document.querySelectorAll(".menu-card");

    menuCards.forEach((card, index) => {
        // Memberikan efek muncul satu per satu (staggered animation)
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        card.style.transition = `all 0.5s ease ${index * 0.1}s`;

        setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, 100);

        // Suara klik atau efek haptic (opsional/simulasi)
        card.addEventListener("click", function(e) {
            console.log("Navigasi ke: " + this.querySelector("h3").innerText);
        });
    });
});