class scroller {
    // catch the scroll event
    scroll(target, evt) {
        // do something on mouse scroll
        let counter = document.getElementById("barScrollCounter"),
            block   = document.getElementById("barScrollContent");

        counter.textContent = block.scrollTop;
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
