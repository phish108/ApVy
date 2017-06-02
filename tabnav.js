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

class tabnav {
    tab(hrefTarget, event = null) {
        let target = hrefTarget.getAttribute("href");
        target = hrefTarget.getAttribute("aria-controls") || target.substr(1);

        if (target && target.length) {
            this.stopEvent(event);

            const parent = this.findParentNode(hrefTarget, {"role": "tablist"});

            // now get all tabs in the tablist and hide their panels
            this.selectSubList(parent, "[role=tab]").map(
                (e) => this.hideTabControl(e)
            );
            
            this.showId(target);
            // add active class to element
            if (!hrefTarget.classList.contains("active")) {
                hrefTarget.classList.add("active");
            }
        }
    }

    hideTabControl(element) {
        let target = element.getAttribute("href") || "";
        target = element.getAttribute("aria-controls") || target.substr(1);

        this.hideId(target);
        // remove active class from element
        if (element.classList.contains("active")) {
            element.classList.remove("active");
        }
    }
}

ApVy.addView(tabnav);
