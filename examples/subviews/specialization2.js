class specialization2 {
    // catch the scroll event and display the position in the scroll counter
    click() {
        document.getElementById("specialization2Counter").textContent = parseInt(document.getElementById("specialization2Counter").textContent) + 1;
    }
}

ApVyManager.addView(specialization2);
