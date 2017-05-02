class masterview {
    // catch the scroll event and display the position in the scroll counter
    open() {
        if (!this.subactive) {
            this.subactive = true;
            this.app.openView("#subview1");
        }
        else {
            this.subactive = false;
            this.app.openView("#subview2");
        }
    }

    // catch the close event
    close() {
        this.app.closeAll(this.target);
    }
}

ApVy.addView(masterview);
