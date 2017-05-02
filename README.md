# ApVy

A JavaScript MVC Framework with learnability and rapid prototyping in mind.

## Overview

ApVy is a simple MVC framework designed for students to learn functional
UX design and get started quickly. It also allows safe rapid prototyping without
having to implement any code.

ApVy removes a bunch of prerequisites to learn before one can become active.

-   Event Callbacks
-   Class Inheritance
-   Package Management
-   Module Encapsulation
-   Layout

ApVy has no framework dependencies and does not mess with standard objects.
Therefore, it works nicely with other frameworks such as jQuery, Bootstrap,
or D3. Because ApVy does not use any CSS classes, layouting should work with
your favorite CSS layouting framework. Actually, ApVy does not make any
assumptions about the UX experience.

ApVy is written in ES6 and runs on ES6-compliant browsers out of the box.
These include Chrome 50+, Safari 10+, Firefox 50+, iOS Safari 10+,
Chrome for Android 50+, Edge 14+.

Older Browsers may work with the [Proxy Object polyfill](https://github.com/GoogleChrome/proxy-polyfill)
and [Babel](https://babeljs.io/).

#Features

### Getting Started

ApVy starts from HTML, so understanding HTML basics is a requirement.

ApVy structures an UI into views (Vy) that are connected via an app controller
(the Ap). A view is a section of the UI that works as a functional unit.

All ApVy views are of [ARIA groups](). The data-view informs ApVy, which
view handler is responsible for this part of the UI.

The following, very basic UI consists of two views "start" and
"scroller".

```HTML
<body>
    <div role="group" data-view="start">
        hello
    </div>

    <div role="group" data-view="scroller" hidden>
        world
    </div>

    <!-- always last -->
    <script src="DelegateProxy.js" type="text/javascript"></script>
    <script src="ApVy.js" type="text/javascript"></script>
<body>
```

Both div-elements define a view. ApVy automatically generates an id for the
view, if it is missing. While this is not good style, it keeps your UI simple.

The start-view is immediately visible, while the scroller-view is hidden via
the HTML5 attribute hidden. You can setup you UI in ways that several views are
visible from the beginning. ApVy has no internal state handling about views
other than the UI.

This example does not allow to change between the two views because neither of
them listens to any UI events.

ApVy automatically catches UI events and passes it to the appropriate view.
In order to do so, each view tag has to inform, which events it wishes to
handle.

The ```data-event``` attribute tells ApVy, which UI events should be recorded.
Think of the ```data-event``` attribute as a ```class``` attribute for UI
events.

Events can be registered on any tag inside a ```data-view``` element. Most of
the time registering the events directly on the view element will do just fine.

The following extension of the initial example registers the click event on
both views.

```HTML
<body>
    <div role="group" data-view="start" data-event="click">
        hello
    </div>

    <div role="group" data-view="scroller" data-event="click" hidden>
        world
    </div>

    <!-- always last -->
    <script src="DelegateProxy.js" type="text/javascript"></script>
    <script src="ApVy.js" type="text/javascript"></script>
<body>
```

Now the views can register all click events. Let's make something useful and
add a button to both views that allows us to navigate between them.

```HTML
<body>
    <div role="group" data-view="start" data-event="click">
        hello
        <div role="button" data-bind="changeTo" href="#scroller">
            Switch
        </div>
    </div>

    <div role="group" data-view="scroller" data-event="click" hidden>
        world
        <div role="button" data-bind="changeTo" href="#start">
            Switch
        </div>
    </div>

    <!-- always last -->
    <script src="DelegateProxy.js" type="text/javascript"></script>
    <script src="ApVy.js" type="text/javascript"></script>
<body>
```

The ```data-bind``` attribute on the button **binds** a method of the view
class to the button. The ```data-bind``` attribute tells Vy, which view
operation to handle. Vy comes with a bunch of predefined methods, the two
of biggest interest for rapid prototyping might be ```changeTo```, ```openView```,
and ```close```. ```changeTo``` closes the active view (the one that
handles the event) and opens a the view that is specified in the href
field. ```openView``` is almost like ```changeTo``` but it keeps the active
view open. The ```href``` attribute uses the id selector syntax just like one
would use with links to hope around the same UI. ```close``` just closes the
active view and does not consider any attributes on a clicked button.

In the example the ```changeTo``` method is bound to the button and the href
attribute points to the opposite view. So clicking on the buttons switches
between the views, while all other clicks do nothing.

### data-toggle Support

Bootstrap 4 introduces the data-toggle element to [ARIA tabs]().
ApVy supports the data-toggle syntax: It closes an active element in the view
and opens the referred element in the UI.

The following example illustrates the toggle feature:

```HTML
<div role="group" data-view="toggler" data-event="click" hidden>
    <div>
        <span role="tab" data-toggle="tab" href="#first">first</span> |
        <span role="tab" data-toggle="tab" href="#second">second</span> |
        <span role="tab" data-toggle="tab" href="#third">third</span>
    </div>
    <div id="first" role="tab-panel">
        This is the first content
    </div>
    <div id="second" role="tab-panel" hidden>
        This is the second content
    </div>
    <div id="third" role="tab-panel" hidden>
        This is the third content
    </div>
</div>
```

Clicking on the different span elements with the tab-role will toggle the
visibility of the corresponding tab-panels. This function is built into Vy, so
no coding is required.

### Logic delegation instead of inheritance

Among the harder things to understand with frameworks are class dependencies
and code extension. The problem with traditional class hierarchies, is that
programmers must not forget to call any original logic when they override class
functions.

ApVy works around that problem through operation delegation. Operation
delegation delegates more specialized logic to more specialized components.
ApVy does that via the data-view attributes. It allows to attach specialized
view logic to a view without overwriting the original logic or having to worry
to call it.

The following example illustrates operation delegation for our scroller view.

```javascript
class scroller {
    close() {
        // scroll the view back to top, so we can start over
        document.getElementById("barScrollContent").scrollTop = 0;
    }
}

ApVy.addView(scroller);
```

In this example a scroller class is created and added to ApVy. Because the
classname appears in the UI's data-view attribute for the scroller UI, ApVy
automatically hooks this class to the UI.

The specialised scroller class implements only some cleanup logic in the close()
function. Due to operation delegation this does not affect the default behavior
of the Vy class. During runtime the close method is called before the default
close() operation of Vy. This releases the developers from having to remember
triggering the default behavior in the super class.

The view classes are not entirely independent in operation delegation. All
delegates for a view have access to the same information. This allows creating
delegate mixins just by adding an additional delegate class to the data-view
attribute. The order of calling the methods of the included delegates is reverse
to their appearance in the data-view attribute. This means that an operation
in the last delegate class is called first and the predefined Vy operations are
called last.

The best thing about operation delegation is that one can define delegation
mixins without having all delegation classes available. ApVy will only
instantiate delegate classes that are hooked in the code. This means that the
code will not break if a class is missing or temporarily broken.

### Sub-view support

Sometimes application views become complex and the logic becomes hardly
readable. ApVy allows organizing functional logic into subviews that can be
activated conditionally.

ApVy supports sub-views by simply adding views inside a view. Generic logic can
be placed in the master view, while the specialized logic lives inside separate
containers. This allows logic encapsulation while keeping the code readable and
maintainable.

If sub-views and their master views are listening to the same UI events, then
the sub-views will shield these events from the master view. A simple example
can be found in the [examples](examples/subviews/)

## How to contribute?

If you like to contribute to the project there a number of ways:

-   [report bugs and issues](https://github.com/phish108/ApVy/issues)
-   write/translate documentation
-   write more and better examples
-   improve the code

If you like to contribute to code and documentation please follow these steps:

1.  start always with creating an issue.
2.  clone the code using your favorite git client.
3.  create a branch for your changes naming the branch "issue#", where # is the
number of the issue you have created.
4.  Make your changes.
5.  Test if all prior examples still work.
6.  Commit your changes (push them if needed).
7.  Create a pull request stating that you fixed the reported issue (using the
issue number).

## License

ApVy is licensed under the MIT License.

For details please read the [LICENSE](LICENSE) file.
