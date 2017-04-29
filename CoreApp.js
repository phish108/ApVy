const CoreApp = {
    views: {},
    addView(viewClass) {
        if (typeof viewClass === "function"){
            this.views[viewClass.name] = viewClass;
        }
    }
};
