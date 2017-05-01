// our local view class
class Vy {
    constructor(app) {
        this.app    = app;
    }

    changeTo(hrefTarget) {
        // we won't change the view if we are not active
        let target = typeof hrefTarget === "string" ? href : hrefTarget.getAttribute("href");
        if (this.active() && target.length) {
            this.close();
            this.app.openView(target);
        }
    }

    openView(hrefTarget) {
        // don't open other views if we are not active
        let target = typeof hrefTarget === "string" ? href : hrefTarget.getAttribute("href");
        if (this.active() && target.length) {
            this.app.openView(target);
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

            // close all subviews
            let subViews = this.selectSubList(this.target, '[data-view][role=group].active').map((t) => `#${t.id}`);
            subViews.map((view) => this.app.closeView(view));
        }
    }

    active() {
        return (this.target &&
                this.target.classList &&
                this.target.classList.contains('active'));
    }

    eventDeepPath(event) {
        if (event.deepPath) { // new w3 draft
            return event.deepPath;
        }
        if (event.path) {     // chrome specific
            return event.path;
        }
        if (!event.currentTarget) { // no bubble
            return [event.target];
        }

        let node = event.target;
        let result = [];

        // find all elements that this event has bubbled through
        while (node && !node.isSameNode(event.currentTarget)) {
            result[result.length] = node;
            node = node.parentNode;
        }

        // add the currentTarget to the list
        result[result.length] = event.currentTarget;

        return result;
    }

    findEventOperator(event) {
        let targets = this.eventDeepPath(event);

        let result = targets.find(
            (t) => (t.dataset && (t.dataset.operator || t.getAttribute("data-operator")))
        );

        return result ? result : event.currentTarget;
    }

    handleEvent(event) {
        // ensure that we are running
        if (this.active()) {
            var target = this.findEventOperator(event);
            var operator = target.dataset.operator || target.getAttribute("data-operator");

            if (target &&
                operator &&
                typeof this[operator] === "function") {

                // we have a special event operator
                this[target.dataset.operator](target, event);
            }
            else if (typeof this[event.type] === "function"){
                this[event.type]((target ? target : this.target), event);
            }
        }
    }

    registerEvents() {
        if (this.target &&
            this.target.dataset &&
            this.target.dataset.events) {

            // first register all Events on self
            let events = this.target.dataset.events.split(" ");
            events.map(
                (evt) => this.__registerEventOnTarget(this.target, evt)
            );

            // then register element specific events unless there are subviews
            // with subviews ALL sub events MUST be handled by the sub view
            if (!this.selectSubList(this.target, '[data-view][role=group]').length) {
                let eventTargets = this.selectSubList(this.target,'[data-events]');

                eventTargets.map((et) => et.dataset.events.split(" ").map(
                    (evt) => this.__registerEventOnTarget(et, evt)
                ));
            }
        }
    }

    selectList(selector) {
        return this.selectSubList(document, selector);
    }

    selectSubList(parent, selector) {
        return Array.prototype.slice.call(parent.querySelectorAll(selector));
    }

    __registerEventOnTarget(target, eventType) {
        target.addEventListener(eventType, (e) => this.handleEvent(e));
    }
}

// out global app class
class Ap {
    constructor() {
        // the core view functions are kept in a signleton.
        this.coreView = new Vy(this);
        this.views = {};

        // find views
        this.coreView.selectList('[data-view][role=group]').map((t) => this.registerView(t));
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
        this.coreView.selectList('[data-view][role=group].active').map((t) => this.closeView(`#${t.id}`));
    }

    refresh() {
        this.coreView.selectList('[data-view][role=group].active').map((t) => this.refreshView(`#${t.id}`));
    }

    update() {
        this.coreView.selectList('[data-view][role=group].active').map((t) => this.updateView(`#${t.id}`));
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

    // update is like refresh, but without resetting.
    updateView(targetid) {
        if (this.views[targetid] && !this.views[targetid].active()) {
            if (typeof this.views[targetid].update === "function") {
                this.views[targetid].update();
            }
        }
    }

    activeViews() {
        return this.coreView.selectList('[data-view][role=group].active').map((t) => `#${t.id}`);
    }
}

// actually, we don't need to expose a variable anywhere, we keep the instance by
// hooking events.
new Ap();
