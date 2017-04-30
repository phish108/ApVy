class scroller {
    // catch the scroll event and display the position in the scroll counter
    scroll(target, evt) {
        document.getElementById("barScrollCounter").textContent = target.scrollTop;
        // or: $("#barScrollCounter").text(target.scrollTop);
    }

    // catch the close event
    close() {
        // scroll the view back to top, so we can start over
        document.getElementById("barScrollContent").scrollTop = 0;
        // reset the counter
        document.getElementById("barScrollCounter").textContent = 0;
    }
}

CoreApp.addView(scroller);
