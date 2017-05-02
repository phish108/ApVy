class specialization1 {
    // catch the scroll event and display the position in the scroll counter
    click() {
        document.getElementById("specialization1Counter").textContent = parseInt(document.getElementById("specialization1Counter").textContent) + 1;
    }
}

ApVyManager.addView(specialization1);
