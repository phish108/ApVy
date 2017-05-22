/**
 * This file is part of the ApVy Project
 *
 * MIT License
 *
 * Copyright 2017 Christian Glahn (github.com/phish108)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

/**
 * @class Vy
 *
 * Vy holds all basic functions that all views share.
 *
 * Vy is the root view class. Your Ap class will have exaclty one instance of Vy.
 * It is not necessary to extend Vy or to create additional instances of it.
 *
 * The application views will get dynamically hooked as delegates to the
 * central Vy object. Only these delegates will be directly liked to the
 * view target in the user interface.
 *
 * Application views have access to all methods. Vy exposes also two properties:
 * - ```app```: holds a reference to the application object.
 * - ```target```: holds a reference to the DOM element that is the root element
 *   of the view.
 */
class Vy {
    /**
     * opens the present view.
     *
     * All application views know to open themselves on request. Normally all
     * application views are opened via the Ap class instance.
     *
     * Any preparatory work should be boundled in a open() function for the
     * application view. The view delegation ensures that Vy's open() function
     * is called finally.
     */
    open() {
        if (!this.active()) {
            this.target.removeAttribute('hidden');
        }
    }

    /**
     * closes the present view.
     *
     * All application views know to close themselves.
     *
     * Any clean up should be performed in a close() function of the application
     * view. The view delegation ensures that Vy's close() function is
     * called, correctly.
     *
     * If an application view has sub views, this method will call their
     * close() functions after the view disappeared from the view.
     */
    close() {
        if (this.active()) {
            this.target.setAttribute('hidden', 'hidden');

            // close all subviews
            this.app.closeAll(this.target);
        }
    }

    /**
     * returns true if the present view is active/visible in the user interface.
     *
     * @returns boolean
     */
    active() {
        return (this.target &&
                !this.target.hasAttribute('hidden'));
    }

    /**
     * placeholder function for updating the application view.
     *
     * update() is supposed to extend the already existing information with
     * new information provided by the application logic.
     *
     * if update() is called after a reset() call, then it is the same as
     * refreshing a view.
     */
    update() {}

    /**
     * placeholder function that is called before refresh() and after close()
     */
    reset() {}

    /**
     * changes to a different application view and closes the present view.
     *
     * changeTo() accepts a ID-String or a DOMElement. It will close the view
     * that calls changeTo() and opens the requested view if it exists.
     *
     * @param mixed hrefTarget: String or DOMElement
     */
    changeTo(hrefTarget, event = null) {
        // we won't change the view if we are not active
        let target = typeof hrefTarget === "string" ? hrefTarget : hrefTarget.getAttribute("href");

        if (this.active() && target.length) {
            if (event) {
                event.preventDefault();
            }

            this.close();
            this.app.openView(target);
        }
    }

    /**
     * toggles tab/tabpanel components so the provided target becomes visible
     *
     * toggle() closes all subviews and opens the provided subview.
     * toggle() reads the data-toggle value to find out what is there to toggle.
     *
     * toggle uses the data-toggle attribute and expands as bootstrap 4 does.
     * Toggle will always close all tabpanels under this view.
     */
    toggle(hrefTarget, event = null) {

        let target = hrefTarget.getAttribute("aria-controls");

        if (!target && hrefTarget.hasAttribute("href")) {
            target = hrefTarget.getAttribute("href").substr(1);
        }

        if (this.active() &&
            target &&
            target.length) {

            if (event) {
                event.preventDefault();
            }

            let parent = hrefTarget.parentNode;
            while (parent &&
                   !parent.isSameNode(this.target) &&
                   parent.getAttribute("role") !== "tablist") {
                parent = parent.parentNode;
            }

            // now get all tabs in the tablist and hide their panels
            this.selectSubList(parent, "[role=tab]").map(e => this.__hideTabControl(e));
            this.showId(target);
        }
    }

    __hideTabControl(element) {
        let target = element.getAttribute("aria-controls");

        if (!target && element.hasAttribute("href")) {
            target = element.getAttribute("href").substr(1);
        }
        this.hideId(target);
    }

    /**
     * hides all descendents with the provided class
     *
     * hideClass() will expand a whitespace separated list of cssClasses to
     * a CSS selector.
     *
     * Does not accept css selectors
     *
     * @param {Class_String} cssClass
     */
    hideClass(cssClass) {
        if (this.target && cssClass && cssClass.length) {
            let selector = cssClass.split(" ");
            selector.unshift("");
            this.selectSubList(this.target, selector.join(".")).map(e => e.setAttribute("hidden", "hidden"));
        }
    }

    /**
     * hides all descendents with the provided ARIA role
     *
     * @param {Role_String} ariaRole
     */
    hideRole(ariaRole) {
        if (this.target && ariaRole && ariaRole.length) {
            let selector = `[role=${ariaRole}]`;
            this.selectSubList(this.target, selector).map(e => e.setAttribute("hidden", "hidden"));
        }
    }

    /**
     * hides an element with the provided ID
     *
     * @param {Id_String} elementId
     */
    hideId(elementId) {
        if (elementId && elementId.length) {
            let e = document.getElementById(elementId);
            if (e) {
                e.setAttribute("hidden", "hidden");
            }
        }
    }

    /**
     * shows all descendents with the provided class
     *
     * showClass() will expand a whitespace separated list of cssClasses to
     * a CSS selector.
     *
     * Does not accept css selectors!
     *
     * @param {Class_String} cssClass
     */
    showClass(cssClass) {
        if (this.target && cssClass && cssClass.length) {
            let selector = cssClass.split(" ");
            selector.unshift("");
            this.selectSubList(this.target, selector.join(".")).map(e => e.removeAttribute("hidden"));
        }
    }

    /**
     * shows all descendents with the provided ARIA role
     *
     * @param {Role_String} ariaRole
     */
    showRole(ariaRole) {
        if (this.target && ariaRole && ariaRole.length) {
            let selector = `[role=${ariaRole}]`;
            this.selectSubList(this.target, selector).map(e => e.removeAttribute("hidden"));
        }
    }

    /**
     * shows an element with the provided ID
     *
     * @param {Id_String} elementId
     */
    showId(elementId) {
        if (elementId && elementId.length) {
            let e = document.getElementById(elementId);
            if (e) {
                e.removeAttribute("hidden");
            }
        }
    }

    /**
     * opens a different application view, but keeps the present view open.
     *
     * openView() allows an application view to open other views if they exist.
     * Use openView() if interactions can open other views in the user
     * interface, but the present view needs to remain open.
     *
     * openView() comes in handy for working with sub-views/nested views. It
     * allows dynamic opening of visual components as views.
     *
     * @param mixed hrefTarget: String or DOMElement
     */
    openView(hrefTarget) {
        // don't open other views if we are not active
        let target = typeof hrefTarget === "string" ? hrefTarget : hrefTarget.getAttribute("href");
        if (this.active() && target.length) {
            this.app.openView(target);
        }
    }

    /**
     * returns the deepPath of the event. deepPath is an array with all
     * elements through which an event has bubbled.
     *
     * This function masks the deepPath property, because not all browsers
     * support it.
     *
     * @param {Event} event - the event object to resolve.
     * @returns {ArrayOfDOMElement} list of event paht.
     */
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

    /**
     * returns the first element that contains a data-bind attribute
     *
     * Finds the first DOMElement bubbling chain of an event that holds a
     * reference information to a view operation.
     *
     * View operations are linked in the UI via the data-bind attribute.
     * Such attribute may contain one (1) function name of the application
     * view.
     *
     * @param {Event} event - a DOM Event
     * @returns {DOMElement} - the UI object
     */
    findEventOperator(event) {
        let targets = this.eventDeepPath(event);

        let result = targets.find(
            t => (t.dataset && (t.dataset.bind || t.getAttribute("data-bind") ||
                                t.dataset.toggle || t.getAttribute("data-toggle")))
        );

        return result ? result : event.currentTarget;
    }

    /**
     * generic event handler.
     *
     * Vy automatically catches all DOM Events and transposes them to
     * operators of the application views.
     *
     * This event handler is automatically registered to the DOMElement for
     * which an operator has been set. It is a signleton and application views
     * normally do not implement additional logic.
     *
     * handleEvent() will first try to call the defined operator method, and if
     * such operator does not exist it will try to call the event-name method as
     * an operator.
     *
     * If no operator function is defined on the application view the
     * handleEvent() method will gracefully ignore the event.
     *
     * @param {Event} event
     */
    handleEvent(event) {
        // ensure that we are running
        if (this.active()) {
            // finalVy contains the active view delegate during runtime.
            // This is necessary, because this will not point to the last
            // view class we have added, but to the proxy object that has
            // be added initialially. Therefore, we must divert this to
            // finalVy, so our specialised methods will get called, correctly.
            const finalVy = ApVy.views[this.targetid];

            var target = finalVy.findEventOperator(event);
            var operator = target.dataset.bind || target.getAttribute("data-bind");

            if (target.dataset.toggle || target.getAttribute("data-toggle")) {
                operator = "toggle";
            }

            if (target &&
                operator &&
                typeof finalVy[operator] === "function") {

                // we have a special event operator
                finalVy[operator](target, event);
            }
            else if (typeof finalVy[event.type] === "function"){
                finalVy[event.type]((target ? target : finalVy.target), event);
            }
            // end event bubbling here (needed for subviews)
            event.stopPropagation();
        }
    }

    /**
     * registers all DOM Events for an application view
     *
     * During the application initialization this method hooks the handleEvent()
     * method to all DOM Elements of the application view that have
     * data-events attributes defined.
     */
    registerEvents() {
        if (this.target &&
            this.target.dataset &&
            this.target.dataset.event) {

            // first register all Events on self
            let events = this.target.dataset.event.split(" ");
            events.map(
                evt => this.__registerEventOnTarget(this.target, evt)
            );

            // then register element specific events unless there are subviews
            // with subviews ALL sub events MUST be handled by the sub view
            if (!this.selectSubList(this.target, '[data-view][role=group]').length) {
                let eventTargets = this.selectSubList(this.target,'[data-event]');

                eventTargets.map(et => et.dataset.event.split(" ").map(
                    evt => this.__registerEventOnTarget(et, evt)
                ));
            }
        }
    }

    /**
     * uses a CSS selector to find DOM Elements in the current document
     *
     * This method is a convenience function to run CSS selectors on the
     * entire document.
     *
     * This method always returns an Array of DOMElements instead of a NodeList.
     *
     * @param {String} selector
     * @returns {ArrayOfDOMElement}
     */
    selectList(selector) {
        return this.selectSubList(document, selector);
    }

    /**
     * uses a CSS selector to find DOM Elements under the provided parent node
     *
     * This method is a convenience function to run CSS selectors on the
     * provided parent node.
     *
     * This method always returns an Array of DOMElements instead of a NodeList.
     *
     * @param {DOMElement} parent
     * @param {String} selector
     * @returns {ArrayOfDOMElement}
     */
    selectSubList(parent, selector) {
        return Array.prototype.slice.call(parent.querySelectorAll(selector));
    }

    /**
     * registers an event listener to the given target
     *
     * internal function for registerEvents(). Application views can use this
     * method to add separate event listeners using the handleEvent() logic.
     *
     * @param {DOMElement} target - DOM Element to register the listener on
     * @param {String} eventType - event to listen for.
     */
    __registerEventOnTarget(target, eventType) {
        target.addEventListener(eventType, e => this.handleEvent(e));
    }
}

/**
 * @class ApModel
 */
 class ApModel {
     dispatchEvent(eventType, data=null) {
         let opts = {cancelable: true, bubbles: true};
         if (data) {
             opts.detail = data;
         }

         event = new CustomEvent(eventType, opts);
         coreView.selectList('[data-view][role=group]').map(t => {
             t.dispatchEvent(event);
         });
     }
 }

/**
 * @class Ap
 *
 * Ap is the core application controller underpinning the logic of ApVy.
 * It will instanciate all view classes
 *
 * Ap provides very basic functions to control the application flow. For each
 * page there should be only one instance of Ap running.
 *
 * The Ap instance is not publicly exposed but is only present in the form of
 * event hooks.
 */
class Ap {
    /**
     * On instantiation Ap will query for all DOM elements that have the
     * ARIA role "group" and the data-view attribute set.
     *
     * Application views may be structured into several components. These
     * components are named in a space separated list in the data-view
     * attribute.
     *
     * An application view is strictly bound to the DOM Element. Note, that Ap
     * will still hook the application view even if none of the defined view
     * classes are defined. This allows rapid prototyping of MVC apps wihtout
     * writing any code.
     */
    constructor() {
        // find and init models
        this.viewClasses = {};
        this.viewDelegates = {};
        this.modelDelegates = {};
        this.models = {};

        this.loadHandler = () => this.resetApp();

        this.rootModel = new DelegateProxy(new ApModel(), {app: this});

        if (coreView.selectList('[data-view][role=group]').length) {
            // ApVy runs at the end of the page
            this.resetApp();
        }
        else {
            // ApVy runs in the header before the document is loaded
            this.isCordovaApp = !!window.cordova;
            if (this.isCordovaApp) {
                // if running under cordova, we wait for the device drivers
                document.addEventListener("deviceready", this.loadHandler);
            }
            else {
                // in a normal web-browser we wait until the page has loaded
                document.addEventListener("load", this.loadHandler);
            }
        }
    }

    /**
     * reinitializes all views of the app as if the app is having a fresh start.
     * This method can get used at anytime. It does not alter the document state
     * but it will reinstatiate all view delegates. So if views have a
     * persistant state between displays, these states will be lost.
     */
    resetApp() {
        this.models = {};
        // first reset the models;
        this.initModels();
        // find views
        this.views = {};
        // find views
        coreView.selectList('[data-view][role=group]').map(t => this.registerView(t));

        this.appLoaded = true;
        // remove all event listeners, so subsequent load events will not reset
        // the app.
        document.removeEventListener("load", this.loadHandler);
        if (this.isCordovaApp) {
            document.removeEventListener("deviceready", this.loadHandler);
        }
    }

    initModels() {
        Object.keys(this.modelDelegates).map(m => this.models[m] = new DelegateProxy(this.rootModel, this.modelDelegates[m]));
    }

    /**
     * registers an application view to the target DOM Element
     *
     * This method binds an application to a DOM Element. It automatically
     * instanciates and binds all view classes that it finds in the target's
     * data-view attribute.
     *
     * Each view class can provide some specific logic to an app.
     *
     * @param {DOMElement} target
     */
    registerView(target) {

        let vl = target.dataset.view.split(" ");
        let viewid = target.id;
        if (vl) {
            if (!viewid) {
                target.id = viewid = vl[vl.length -1];
            }
            vl.map(v => this.viewClasses[v] = viewid);
        }

        if (viewid) {
            viewid = `#${viewid}`;

            if (!this.views[viewid]) {
                const dv = {
                    target: target,
                    targetid: viewid,
                    app: this
                };

                vl.map(v => {
                    if (this.viewDelegates[v]) {
                        dv = new DelegateProxy(dv, this.viewDelegates[v]);
                    }
                });

                this.views[viewid] = new DelegateProxy(coreView, dv);
                this.views[viewid].registerEvents();
            }
        }
    }

    addModel(modelClass) {
        if (typeof modelClass === "function") {
            if (!this.modelDelegates[modelClass.name]) {
                this.modelDelegates[modelClass.name] = modelClass; // remember for reset

                if (this.appLoaded) {
                    if(!this.models[modelClass.name]) {
                        this.models[modelClass.name] = new DelegateProxy(this.rootModel, modelClass);
                    }
                }
            }
        }
    }

    addView(viewclass) {
        if (typeof viewclass === "function") {
            if (!this.viewDelegates[viewclass.name]) {
                this.viewDelegates[viewclass.name] = viewclass; // remember for reset

                if (this.appLoaded) {
                    let viewid = this.viewClasses[viewclass.name];
                    if (viewid && this.views[viewid]) {
                        this.views[viewid] = new DelegateProxy(this.views[viewid], viewclass);
                    }
                }
            }
        }
    }

    /**
     * activates an application view if it is not already active
     *
     * @param {ID_String} viewid
     */
    openView(viewid) {
        if (this.views[viewid] && !this.views[viewid].active()) {
            this.views[viewid].open();
        }
    }

    /**
     * closes an application view if it is active
     *
     * A close is always followed by a reset call.
     *
     * @param {ID_String} viewid
     */
    closeView(viewid) {
        if (this.views[viewid] && this.views[viewid].active()) {
            this.views[viewid].close();
            if (typeof this.views[viewid].reset === "function") {
                this.views[viewid].reset();
            }
        }
    }

    /**
     * closes all active application view
     *
     * @param {DOMElement} parent - optional parameter for subviews
     */
    closeAll(parent) {
        let viewlist;
        if (parent) {
            viewlist = coreView.selectSubList(parent, '[data-view][role=group]:not([hidden])');
        }
        else {
            viewlist = coreView.selectList('[data-view][role=group]:not([hidden])');
        }

        viewlist.map(t => this.closeView(`#${t.id}`));
    }

    /**
     * asks all active application views to refresh (redraw) their data
     */
    refresh() {
        coreView.selectList('[data-view][role=group]:not([hidden])').map(t => this.refreshView(`#${t.id}`));
    }

    /**
     * asks all active application views to update their data with new
     * information
     */
    update() {
        coreView.selectList('[data-view][role=group]:not([hidden])').map(t => this.updateView(`#${t.id}`));
    }

    /**
     * refreshes an active application view
     *
     * refreshView()
     *
     * A refresh is always performed in two steps:
     *
     * 1. A view reset() call that should clear all dynamic information, and
     * 2. A view refresh() call that will regenerate all dynamic information.
     *
     * @param {ID_String} viewid
     */
    refreshView(viewid) {
        if (this.views[viewid] && !this.views[viewid].active()) {
            if (typeof this.views[viewid].reset === "function") {
                this.views[viewid].reset();
            }
            if (typeof this.views[viewid].update === "function") {
                this.views[viewid].update();
            }
        }
    }

    /**
     * updates an active application view.
     *
     * update() is like refresh, but without resetting.
     *
     * Updates might get used to extend dynamic information without
     * regenerating the entire view.
     * @param {ID_String} viewid
     */
    updateView(viewid) {
        if (this.views[viewid] && !this.views[viewid].active()) {
            if (typeof this.views[viewid].update === "function") {
                this.views[viewid].update();
            }
        }
    }

    /**
     * returns a list of active views
     *
     * @returns {ArrayOfDOMElements}
     */
    activeViews() {
        return coreView.selectList('[data-view][role=group]:not([hidden])').map(t => `#${t.id}`);
    }

    /**
     * returns a list of all views
     *
     * @param {DOMElement} parent - optional for getting subviews
     * @returns {ArrayOfDOMElements}
     */
    allViews(parent) {
        let viewlist;
        if (parent) {
            viewlist = coreView.selectSubList(parent,'[data-view][role=group]');
        }
        else {
            viewlist = coreView.selectList('[data-view][role=group]');
        }
        return viewlist.map(t => `#${t.id}`);
    }

    /**
     * checks whether a view is present and configured
     */
    hasView(viewid, parent) {
        if (this.views[viewid]) {
            if (parent) {
                if(this.allViews(parent).includes(viewid)) {
                    return true;
                }
            }
            else {
                return true;
            }
        }
        return false
    }
}

const coreView = new Vy();
const ApVy = new Ap();
