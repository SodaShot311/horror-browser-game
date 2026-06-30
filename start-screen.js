window.addEventListener("load", () => {

    const overlay = document.getElementById("startOverlay");

    function begin() {

        // Hide the overlay
        overlay.classList.add("fade-out");

        // Wait for the animation
        setTimeout(() => {
            overlay.remove();

            // Show the title menu
            UI.showTitle(Boolean(Save.load()));

        }, 500);

        document.removeEventListener("pointerdown", begin);
        document.removeEventListener("keydown", begin);
    }

    document.addEventListener("pointerdown", begin);
    document.addEventListener("keydown", begin);

});