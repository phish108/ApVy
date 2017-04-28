
// our local view class
class Vy {
    constructor(app, target) {
        this.target = target;
        this.app    = app;
    }

    change(target) {
        this.app.changeView(target);
    }

    open() {
        this.target.classList.add('active');
    }

    close() {
        this.target.classList.remove('active');
    }
}

// out global app class
class Ap {
    constructor() {
        this.views = {};
        this.findViews();
    }

    findViews() {
        Array.prototype.slice.call(document.querySelectorAll('[role~=view]')).map((t) => this.registerView(t));
        // $('[role~=view]').map((e,t) => this.registerView(t));
    }

    registerView(target) {
        if (target.id) {
            let vv = new Vy(this, target);
            let dv = {};

            let attr = target.getAttribute("role");
            if (attr.length) {
                attr = attr.split(" ");
            }

            // check for view classes IN THE ORDER OF APPEARANCE
            for (let i = 0; i < attr.length; i++) {
                console.log("'" + attr[i] + "' " + typeof window[attr[i]]);

                if (attr[i] != "view" && typeof window[attr[i]] === "function") {
                    dv = new DelegateProxy(dv, window[attr[i]]);
                }
            }

            this.views[`#${target.id}`] = new DelegateProxy(vv, dv);

            // allow all delegates to register their event handlers
            this.views[`#${target.id}`].registerEvents();

            if (!this.active || target.classList.contains('active')) {
                this.active = `#${target.id}`;
            }
        }
    }

    changeView(targetid) {
        if (this.views[targetid]) {
            this.views[this.active].close();
            this.active = targetid;
            this.views[this.active].open();
        }
    }
}

const app = new Ap();
