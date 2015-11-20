/*jslint white: true*/
/*jslint vars: true*/
/*jslint sloppy: true*/
/*jslint devel: true*/
/*jslint plusplus: true*/
/*jslint browser: true */

/*global CoreView, CoreClass*/

(function (a) {

    var cordova = a.cordova;
    var $ = a.$;
    var TmplFactory = a.TemplateFactory;

    function noop() { return; }

    function CoreApplication()   {
        this.views = {};
        this.viewReg = {};
        this.models = {};
        this.modelReg = {};
        this.sourceTrace = [];
        this.viewId = "";
    }

/**
 * @static @method start(controller)
 *
 * This function links CoreApplication to the app's controller logic, so the controller
 * can use all CoreApplication functions and properties as usual.
 *
 * For getting the application going one needs to call
 *
 *    CoreApplication.start(MyController);
 *
 * after all required modules are loaded.
 */
CoreApplication.start = function (controller) {
    function CoreApplicationHelper() {
        CoreApplication.call(this);
        controller.call(this);
    }

    CoreClass.extend(controller, CoreApplication);
    CoreClass.extend(CoreApplicationHelper, controller);

    function initApplication() {
        a.app = new CoreApplicationHelper();
        a.app.bindEvents();
        a.app.ready();
    }

    if (cordova) {
        // init for cordova applications
        document.addEventListener('deviceready', initApplication, false);
    }
    else {
        // init for web applications
        $(document).ready(initApplication);
    }
};

CoreApplication.prototype.setReadOnly = function (name, value) {
    if (!this.hasOwnProperty(name) && !this[name]) {
        var tmpVal = value;
        Object.defineProperty(this, name, {get: function () {return tmpVal;}});
    }
};

CoreApplication.prototype.ready = function () {

    var self = this;

    $(document).bind("UPDATE_DONE", function cbUpdateDone() {
        self.openFirstView();
    });

    this.initTemplates();
    this.initModels();
    this.initViews();

    this.initialize();

    this.updateVersion();
};

CoreApplication.prototype.updateVersion = function () {
    $(document).trigger("UPDATE_DONE");
};

CoreApplication.prototype.registerView = function (fn) {
    var fname = fn.name;
    this.viewReg[fname] = fn;
};

CoreApplication.prototype.registerModel = function (fn){
    var fname = fn.name;
    this.modelReg[fname] = fn;
};

CoreApplication.prototype.initTemplates = function () {
    this.templates = new TmplFactory();
//    if (!this.templates) {
//        console.log('templates failed');
//    }
};

CoreApplication.prototype.initModels = function () {
    var i, ml, meta, rs, models = [];

    // new style
    $('[data-model]').each(function () {
         ml = this.dataset.model;
        if (ml && ml.length) {
            ml.split(" ").forEach(function (mName) {
                if (mName && mName.length && models.indexOf(mName) < 0) {
                    models.push(mName);
                }
            });
        }
    });

    if (!models.length) {
        meta = document.getElementsByTagName('META');
        for (i = 0; i < meta.length; i++) {
            if (meta[i].getAttribute('name') === 'app:models') {
                rs = meta[i].content;
                rs = rs.replace(/\s+/g, '');
                models = rs.split(/\,/);
            }
        }
    }
    this.modelReg = {};
    if (models.length) {
        models.forEach(function(m) {
            if (typeof window[m] === 'function') {
                this.modelReg[m.replace('Model', '').toLowerCase()] = window[m];
            }
        }, this);
    }

    var pn = Object.getOwnPropertyNames(this.modelReg);
    for (i = 0; i < pn.length; i++) {
        this.models[pn[i]] = new this.modelReg[pn[i]](this);
    }
};

CoreApplication.prototype.initViews = function () {
    var self = this;
    $('[data-view]').each(function () {
        var tagid     = this.id,
            className = this.dataset.view;

        self.views[tagid] = new CoreView(self, tagid, className);
    }); // end each()
};

CoreApplication.prototype.isActiveView = function (viewObject) {
    return (this.views[this.viewId] === viewObject);
};

CoreApplication.prototype.changeView = function chView(viewname, eventname, viewdata) {
    var self = this;
    var lastView = this.sourceTrace[this.sourceTrace.length - 1];

    function defer() {
        if (viewname &&
            typeof viewname === 'string' &&
            self.views[viewname] &&
            self.viewId !== viewname) {
            // only change if there really is a change.

            if (viewname === lastView) {
                // implicit rollback
                self.sourceTrace.pop();
            }
            else {
                // not reopen
                self.sourceTrace.push(self.viewId);
            }

            if (self.viewId && self.views[self.viewId]) {
                self.views[self.viewId].close();
            }

            self.viewId = viewname;
            self.views[self.viewId].open(viewdata);
        }
        // won't do any harm
        $(document).unbind(eventname, defer);
    }

    if (!eventname) {
        defer();
    }
    else {
        $(document).bind(eventname, defer);
    }
};

CoreApplication.prototype.reopenView = function (viewData) {
    this.views[this.viewId].close();
    this.views[this.viewId].open(viewData);
};

/**
 * This function implements back button.
 */
CoreApplication.prototype.rollbackView = function () {
    var view = this.previousView();
    // only rollback if there is actually something to rollback;
    if (view && view.length) {
        this.changeView(view);
    }
};

CoreApplication.prototype.openFirstView = function() {
    if (this.viewId && this.viewId.length) {
        this.views[this.viewId].open();
    }
};

/**
 * apps may override this function with their own logic.
 */
CoreApplication.prototype.previousView = function () {
    return this.sourceTrace.pop();
};

CoreApplication.prototype.initialize = noop;
CoreApplication.prototype.bindEvents = noop;

    // register the class to the target object
    if (typeof a.CoreApplication !== 'function') {
        a.CoreApplication = CoreApplication;
    }
}(window));
