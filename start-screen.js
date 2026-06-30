window.addEventListener("load", () => {

    const overlay = document.getElementById("startOverlay");

    function begin() {

        overlay.remove();

        UI.showTitle(Game.hasSave());

        document.removeEventListener("pointerdown", begin);
        document.removeEventListener("keydown", begin);
    }

    document.addEventListener("pointerdown", begin);
    document.addEventListener("keydown", begin);

});