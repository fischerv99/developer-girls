document.addEventListener("DOMContentLoaded", () => {
    const toppings = document.querySelectorAll(".kreation_toppings");
    const totalToppings = toppings.length;

    if (totalToppings > 0) {
        const radius = 150; // Radius des Kreises
        const centerX = 200; // Mittelpunkt X (Container ist 400px breit)
        const centerY = 200; // Mittelpunkt Y (Container ist 400px hoch)

        toppings.forEach((topping, index) => {
            const angle = (index / totalToppings) * 2 * Math.PI; // Winkel für jedes Topping
            const x = centerX + radius * Math.cos(angle) - 40; // Berechnung der X-Position
            const y = centerY + radius * Math.sin(angle) - 40; // Berechnung der Y-Position
            topping.style.position = "absolute"; // Sicherstellen, dass die Toppings korrekt positioniert werden
            topping.style.left = `${x}px`;
            topping.style.top = `${y}px`;
        });
    }
});
