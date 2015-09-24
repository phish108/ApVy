/*jslint white: true, vars: true, sloppy: true, devel: true, plusplus: true, browser: true, unparam: true*/

// instantiate as following:
//     myClass.prototype = Object.create(CoreView.prototype);
//     myClass.prototype.constuctor = myClass;
//
// call CoreView Constructor (ideally the first thing in your constructor)
//     CoreView.call(this, app, domid);

(function (a) {
    var jester = a.jester;
    var $ = a.$;

    function noop() { return; }

    function findIDEl(el){
        while (el.parentElement) {
            if (el.id && el.id.length) {
                return el.id;
            }
            el = el.parentElement;
        }
        return undefined;
    }

function CoreView(app, domid, delegate) {
    var self = this;

    this.app        = app;
    this.container  = $('#'+ domid);

    // we register only 1 (one) move event to the container!
    // elsewhere the move class is ignored by CoreView!

    // callMyTap is a helper function to ensure that we only use one callback

    function callMyEvent(ev, name, data) {
        if (self.active) {
            var d = self.delegate;
            var id = findIDEl(ev.target);
            if (id && typeof d[name + "_"+id] === 'function') {
                d[name+"_"+id](ev, id, data);
            }
            else if (typeof d[name] === 'function') {
                d[name](ev, id, data);
            }

            d = self.updateDelegate;
            if (d) {
                if (id && typeof d[name+"_"+id] === 'function') {
                    d[name+"_"+id](ev, id, data);
                }
                else if (typeof d[name] === 'function') {
                    d[name](ev, id, data);
                }
            }
        }
    }

    function callMyTap(ev) {
        callMyEvent(ev, "tap");
    }

    this.isVisible = false;
    this.isDynamic = false;
    this.isStatic  = true;

    if(this.container) {
        this.content   = this.container.find('#'+ domid + 'box'); // find content box within the view!
        if (this.content) {
            // find main content template
            this.template = this.app.templates.getTargetTemplate(domid + 'box');
            if (!this.template) {
                this.template = this.app.templates.getTargetTemplate(domid);
            }
            if (!this.template) { // still no template make the container a component so we can reuse all IDs.
                this.template = this.app.templates.makeComponent(this.container[0]);
            }

            this.isStatic = (this.content.hasClass('static') || this.content.find('container').length);
            this.isDynamic = !this.isStatic;
        }

        if (delegate && typeof window[delegate] === 'function') {
            this.initDelegate(window[delegate]);
        }

        var touch = [], mouse = [], keyboard = [];

        if (this.container[0].dataset) {
            var tmpT = this.container[0].dataset.touch;
            var tmpM = this.container[0].dataset.mouse;
            if (!tmpT && this.content[0]) {
                tmpT = this.content[0].dataset.touch;
            }
            if (!tmpM && this.content[0]) {
                tmpM = this.content[0].dataset.mouse;
            }
            if (tmpT) {
                touch = tmpT.split(' ');
            }
            if (tmpM) {
                mouse = tmpM.split(' ');
            }

            if (this.container[0].dataset.keyboard) {
                keyboard = this.container[0].dataset.keyboard.split(' ');
            }
        }

        // find interactive elements
        // .move - register start, move, end
        // .tap   - register tap
        var bMove = false;

        touch.forEach(function (evname) {
            if (evname && evname.length) {
                evname = evname.toLowerCase();
                switch (evname) {
                    case 'move':
                        jester(self.container[0]).start(function (e,t) {
                            callMyEvent(e, 'startMove', {touches: t});
                            bMove = true;
                        });
                        jester(self.container[0]).move(function (e,t) {
                            if (self.active && bMove) {
                                callMyEvent(e, 'duringMove', {touches: t});
                            }
                        });
                        jester(self.container[0]).end(function (e,t) {
                            if (self.active && bMove) {
                                callMyEvent(e, 'endMove', {touches: t});
                                bMove = false;
                            }
                        });
                        break;
                    case 'pinch':
                        jester(self.container[0]).pinchwiden(function (e,t) {
                            callMyEvent(e, 'pinch', {touches: t, direction: 1});
                        });
                        jester(self.container[0]).pinchnarrow(function (e,t) {
                            callMyEvent(e, 'pinch', {touches: t, direction: -1});
                        });
                        break;
                    default:
                        jester(self.container[0]).bind(evname, function (e,t) {
                            if (e.detail && e.detail.hasOwnProperty('direction')) {
                                 callMyEvent(e, evname, {touches: t,
                                                        direction: e.detail.direction ? 1 : -1});
                            }
                            else {
                                callMyEvent(e, evname, {touches: t});
                            }
                        });
                        break;
                }
            }
        });

        mouse.forEach(function(evname) {
            self.container[0].addEventListener(evname, function(ev) {
                callMyEvent(ev, evname);
            },false);
        });
        keyboard.forEach(function(evname) {
            self.container[0].addEventListener(evname, function(ev) {
                callMyEvent(ev, evname);
            },false);
        });

        this.container.find("[data-touch]").each(function() {
            var seTouch = this.dataset.touch.split(' ');

            if (seTouch.indexOf('tap') >= 0) {
                jester(this).tap(callMyTap);
            }
        });
    }
}

Object.defineProperties(CoreView.prototype, {
    'active' : {
        'get': function() {
            if (this.isVisible) {
                return true;
            }
            return (this.app && this.app.isActiveView) ? this.app.isActiveView(this) : false;
        }
    }
});

CoreView.prototype.useDelegate = function (delegateName) {
    if (typeof delegateName === "string" &&
        delegateName.length &&
        this.widgets &&
        this.widgets.hasOwnProperty(delegateName)) {
        this.updateDelegate = this.widgets[delegateName];
    }
};


CoreView.prototype.mapDelegate = function (delegateOrigName, delegateName) {
    if (typeof delegateName === "string" &&
        typeof delegateOrigName === "string" &&
        this.widgets &&
        this.widgets.hasOwnProperty(delegateOrigName) &&
        !this.widgets.hasOwnProperty(delegateName)) {
        this.widgets[delegateName] = this.widgets[delegateOrigName];
    }
};

CoreView.prototype.initDelegate = function (TheDelegate, delegateName, opts) {
    var self = this;

    var delegateProto = TheDelegate.prototype;
    var delegateBase  = {};

    // hook important information into the delegate
    Object.defineProperties(delegateBase, {'app':       {get: function () {return self.app;}},
                                           'container': {get: function () {return self.container;}},
                                           'content':   {get: function () {return self.content;}},
                                           'template':  {get: function () {return self.template;}},
                                           'active':    {get: function () {return self.active;}},
                                           'data':      {get: function () {return self.viewData;}},
                                           'models':    {get: function () {return self.models;}}
                                          });

    if (typeof delegateName === "string" && delegateName.length) {
        // widgets/subviews should know their masterview (READ ONLY)
        Object.defineProperties(delegateBase, {
            'master': {'get': function () { return self.delegate; }}
        });
    }
    else {
        // allow normal view delegates to trigger our functions. Exclude widgets from doing so.
        delegateBase.back         = function () { self.back(); };
        delegateBase.open         = function () { self.open(); };
        delegateBase.close        = function () { self.close(); };
        delegateBase.refresh      = function () { self.refresh(); };
        delegateBase.clear        = function () { self.clear(); };

        delegateBase.useDelegate  = function (dName) {
            self.useDelegate(dName);
        };

        delegateBase.mapDelegate = function (odName,dName) {
            self.mapDelegate(odName,dName);
        };

        delegateBase.delegate     = function (dClass, dName, opts) {
            if (typeof dName === "string" && dName.length) {
                self.initDelegate(dClass, dName, opts);
            }
        };
    }

    delegateBase.update     = noop;
    delegateBase.prepare    = noop;
    delegateBase.cleanup    = noop;

    var models = this.container[0].dataset.model;
    if (models && models.length) {
        models = models.split(' ');
        this.models = {};
        models.forEach(function (mn) {
            if (mn && mn.length) {
                mn = mn.replace('Model', '').toLowerCase();
                if (this.app.models.hasOwnProperty(mn)) {
                    this.models[mn] = this.app.models[mn];
                }
            }
        }, this);
        if (Object.getOwnPropertyNames(this.models).length) {
            var fmn = Object.getOwnPropertyNames(this.models)[0];
            Object.defineProperties(delegateBase, {
                'model': {'get': function () { return self.models[fmn]; }}
            });
        }
    }


    var touch = this.container[0].dataset.touch;
    if (touch) {
        touch = touch.split(" ");
        touch.forEach(function (evname) {
            if (evname && evname.length) {
                delegateBase[evname] = noop;
            }
        });
    }

    // subclass the delegate.
    TheDelegate.prototype = Object.create(delegateBase);

    // roll back the delegate functions (and overload the functions where required)
    Object.getOwnPropertyNames(delegateProto).forEach(function (pname) {
        switch (pname) {
            case "app":
            case "container":
            case "content":
            case "template":
            //case "active":
            case "data":
            case "master":
            case "back":
            case "open":
            case "close":
            case "refresh":
            case "clear":
            case "delegate":
            case "useDelegate":
                // don't override core view internals
                break;
            default:
                Object.defineProperty(TheDelegate.prototype,
                                      pname,
                                      Object.getOwnPropertyDescriptor(delegateProto, pname));
                break;
        }
    });

    if (typeof delegateName === "string" && delegateName.length) {
        if (!(self.widgets.hasOwnProperty(delegateName))) {
            // initialize the same widget name only once
            self.widgets[delegateName] = new TheDelegate(opts || {});
        }
    }
    else {
        self.widgets = {};
        self.delegate = new TheDelegate();
    }
};

CoreView.prototype.back = function () {
    if (this.app && this.app.changeView) {
        this.app.changeView(this.app.sourceView);
    }
};

CoreView.prototype.clear = function () {
    // content might be not a screenbox.
    if (this.content && this.isDynamic) {
        this.content.empty();
    }

    // clear all non static screenboxes, too
    this.container.find('.screenbox').each(function(i, tag) {
        if (!tag.classList.contains('static')) {
            tag.innerHTML = "";
        }
    });
};

/**
 * @public @method refresh()
 *
 * The refresh function encapsulates the clear and the update function.
 *
 * While the actual view's update function is responsible for rendering the
 * content, the refresh function must get used for triggering a screen update.
 */
CoreView.prototype.refresh = function () {
    if (this.active) {
        this.clear();
        if (this.updateDelegate) {
            this.updateDelegate.update();
        }
        // allow the view to still do updates to itself
        if (this.delegate) {
            this.delegate.update();
        }
    }
};

CoreView.prototype.open = function (viewData) {
    this.viewData = viewData || {};

    this.isVisible = true;
    if (this.delegate) {
        this.delegate.prepare();
    }

    if (this.isVisible && this.updateDelegate) {
        this.updateDelegate.prepare();
    }
    // if the delegate decides to switch the view during the preparation
    // this happens when the delegate calls "changeView" during prepare.
    if (this.isVisible) {
        this.refresh();
    }
    // again if changeView is called during refresh(), the view must not be opened
    if (this.isVisible && this.container) {
        this.container.addClass('active');
        // ask the delegate to complete the refresh
        if (this.delegate && this.delegate.activateUI) {
            this.delegate.activateUI();
        }
        if (this.updateDelegate && this.updateDelegate.activateUI) {
            this.updateDelegate.activateUI();
        }
        // ask the updateDelegate the same
    }
};

CoreView.prototype.close = function () {
    this.isVisible = false;
    if (this.container) {
        this.container.removeClass('active');
    }
    if (this.updateDelegate) {
        this.updateDelegate.cleanup();
        this.updateDelegate = null;
    }
    if (this.delegate) {
        this.delegate.cleanup();
    }
};

    if (!(a.hasOwnProperty('CoreView'))) {
        a.CoreView = CoreView;
    }
}(window));
