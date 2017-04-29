// our local view class
class Vy {
    constructor(app) {
        this.app    = app;
    }

    change(target) {
        // we don't accidentally change the view
        if (this.active()) {
            this.close();
            this.app.openView(target.getAttribute('href'));
        }
    }

    open() {
        if (!this.active()) {
            this.target.classList.add('active');
        }
    }

    close() {
        if (this.active()) {
            this.target.classList.remove('active');
        }
    }

    active() {
        return (this.target &&
                this.target.classList &&
                this.target.classList.contains('active'));
    }

    eventDeepPath(event) {
        if (event.deepPath) {
            return event.deepPath;
        }
        if (!event.currentTarget) {
            return [event.target];
        }

        let node = event.target;
        let result = [];

        while (!node.isSameNode(event.currentTarget)) {
            result[result.length] = node;
            node = node.parentNode;
        }

        return result;
    }

    eventOperator(event) {
        let targets = this.eventDeepPath(event);

        for (let i = 0; i < targets.length; i++) {
            if (targets[i].dataset &&
                targets[i].dataset.operator) {

                return targets[i];
            }
        }

        return event.currentTarget;
    }

    registerEvents() {
        if (this.target &&
            this.target.dataset &&
            this.target.dataset.events) {

            let events = this.target.dataset.events.split(" ");

            for (let i = 0; i < events.length; i++) {
                if (events[i] === "scroll") {
                    this.target.parentNode.addEventListener(events[i], (e) => this.handleEvent(e));
                }
                else {
                    this.target.addEventListener(events[i], (e) => this.handleEvent(e));
                }
            }
        }
    }

    handleEvent(event) {
        // ensure that we are running
        if (this.active()) {
            let target = this.eventOperator(event);

            if (target &&
                target.dataset.operator &&
                typeof this[target.dataset.operator] === "function") {
                    // we have a special event operator
                    this[target.dataset.operator](target, event);
            }
            else if (typeof this[event.type] === "function"){
                this[event.type](target, event);
            }
        }
    }
}

// out global app class
class Ap {
    constructor() {
        // the core view functions are kept in a signleton.
        this.coreView = new Vy(this);
        this.views = {};

        // find views
        this.selectList('[data-view][role=group]').map((t) => this.registerView(t));
    }

    selectList(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
    }

    registerView(target) {
        if (target.id && CoreApp) {
            let dv = {
                target:target
            };

            let views = target.dataset.view;
            if (views && views.length) {
                views = views.split(" ");
            }

            // check for view classes IN THE ORDER OF APPEARANCE
            for (let i = 0; i < views.length; i++) {
                if (typeof CoreApp.views[views[i]] === "function") {
                    dv = new DelegateProxy(dv, CoreApp.views[views[i]]);
                }
            }

            this.views[`#${target.id}`] = new DelegateProxy(this.coreView, dv);

            // allow all delegates to register their event handlers
            this.views[`#${target.id}`].registerEvents();

            if (!this.active || target.classList.contains('active')) {
                this.active = `#${target.id}`;
            }
        }
    }

    openView(targetid) {
        if (this.views[targetid] && !this.views[targetid].active()) {
            this.views[targetid].open();
        }
    }

    closeView(targetid) {
        if (this.views[targetid] && this.views[targetid].active()) {
            this.views[targetid].close();
        }
    }

    closeAll() {
        this.selectList('[data-view][role=group].active').map((t) => this.closeView(`#${t.id}`));
    }

    refresh() {
        this.selectList('[data-view][role=group].active').map((t) => this.refreshView(`#${t.id}`));
    }

    refreshView(targetid) {
        if (this.views[targetid] && !this.views[targetid].active()) {
            if (typeof this.views[targetid].reset === "function") {
                this.views[targetid].reset();
            }
            if (typeof this.views[targetid].refresh === "function") {
                this.views[targetid].refresh();
            }
        }
    }

    activeViews() {
        return this.selectList('[data-view][role=group].active')).map((t) => `#${t.id}`);
    }
}

// actually, we don't need to expose a variable anywhere, we keep the instance by
// hooking events.
new Ap();
