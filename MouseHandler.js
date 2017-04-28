
window.MouseHandler = class MouseHandler {
    registerEvents() {
        if (this.target &&
            this.target.dataset &&
            this.target.dataset.mouse) {

            let events = this.target.dataset.mouse.split(" ");

            for (let i = 0; i < events.length; i++) {
                console.log("register " + events[i]);
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
        // ensure that we are not running
        if (this.target.classList.contains('active')) {
            if (event.target) {
                let attrRole = event.target.getAttribute("role")
                if (attrRole) {
                    let roles = event.target.getAttribute("role").split(" ");
                    if (roles.includes(event.type)) {
                        if (event.target.dataset &&
                            event.target.dataset.operator &&
                            typeof this[event.target.dataset.operator] === "function") {

                            // we have a special event operator
                            this[event.target.dataset.operator](event.target.getAttribute("href"));
                        }
                        else {
                            this[event.type](event);
                        }
                    }
                }
                else {
                    this[event.type](event);
                }
            }
            else {
                this[event.type](event);
            }
        }
    }
}
