/**
 * app to pass operation handling to different objects, while
 * encapsulating the operational class(es).
 */
function DelegateProxy(operator, delegate) {
    // the operator MUST be an instance.
    // if it is a function we just leave it.
    // This allows us to have one instance of an operator running in different
    // contexts.
    //
    // if we get a function as delegate we want to instantiate it as an object.
    if (typeof delegate === "function") {
        delegate = new delegate();
    }

    return new Proxy(operator, {
        // our new proxy is a function, so we want to avoid reinstantiation
        // if we run through our delegation proxy class.
        construct: function(o, args, p) {
            return p;
        },

        set: function(o,p,v) {
            if (!o[p]) {
                // all operator properties and functions are read only for the
                // proxy
                delegate[p] = v;
            }
        },

        get: function(o,p) {
            // NOTE: You cannot override the operator functions.
            // This is because delegates are called, whenever the operator
            // has no idea what to do.
            // This creates onion shells of functions that developers cannot
            // change but preceed with additional operations.
            // An operator should be clear on the functions it exposes and
            // what it does.
            if (typeof operator[p] === "function" &&
                typeof delegate[p] === "function") {
                    // arrow operators won't work here because this would
                    // point to the handler object of the proxy
                    return function (...args) {
                        console.log("operation extension");
                        let result = delegate[p].apply(this, args);
                        // handle the result ONLY, if the delegate did not return
                        // anything useful.
                        if (!result || !result.length) {
                            result = operator[p].apply(this, args);
                        }
                        return result;
                    };
            }

            if (operator[p]) {
                return operator[p];
            }

            return delegate[p];
        }
    });
}

// if (module) {
//     module.exports = DelegateProxy;
// }
