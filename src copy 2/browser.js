var browser = (function (sanedomparsererror, theWindow) {
    "use strict";

    var module = {};

    var createHiddenSandboxedIFrame = function (doc, width, height) {
        var iframe = doc.createElement('iframe');
        iframe.style.width = width + "px";
        iframe.style.height = height + "px";
        // 'display: none' doesn't cut it, as browsers seem to be lazy loading content
        iframe.style.visibility = "hidden";
        iframe.style.position = "absolute";
        iframe.style.top = (-10000 - height) + "px";
        iframe.style.left = (-10000 - width) + "px";
        // make sure content gets exact width independent of box-sizing value
        iframe.style.borderWidth = 0;
        // Don't execute JS, all we need from sandboxing is access to the iframe's document
        iframe.sandbox = 'allow-same-origin';
        // Don't include a scrollbar on Linux
        iframe.scrolling = 'no';
        return iframe;
    };

    var findCorrelatingElement = function (element, documentClone) {
        //TODO
    };

    var elementToFullHtmlDocument = function (element) {
        var tagName = element.tagName.toLowerCase();
        if (tagName === 'html' || tagName === 'body') {
            return element.outerHTML;
        }

        // Simple hack: hide the body from sizing, otherwise browser would apply a 8px margin
        return '<body style="margin: 0;">' + element.outerHTML + '</body>';
    };

    module.calculateElementSizes = function (element, sizes) {
        return new Promise(function (resolve, reject) {
            var iframe = createHiddenSandboxedIFrame(theWindow.document, sizes.pageSizeX, sizes.pageSizeY);
            // We need to add the element to the document so that its content gets loaded
            theWindow.document.getElementsByTagName("body")[0].appendChild(iframe);

            iframe.onload = function () {
                var clonedDoc = iframe.contentDocument;

                try {
                    const clonedElement = findCorrelatingElement(element, clonedDoc);
                    sizes.defaultFontSize = theWindow.getComputedStyle(clonedElement.ownerDocument.documentElement).fontSize;
                    
                    const clonedElementRect = clonedElement.getBoundingClientRect();
                    sizes.elementSizeX = clonedElementRect.width;
                    sizes.elementSizeY = clonedElementRect.height;
                    sizes.elementTopLeftX = clonedElementRect.left;
                    sizes.elementTopLeftY = clonedElementRect.top;

                    resolve(sizes);
                } catch (e) {
                    reject(e);
                } finally {
                    theWindow.document.getElementsByTagName("body")[0].removeChild(iframe);
                }
            };

            // srcdoc doesn't work in PhantomJS yet
            iframe.contentDocument.open();
            iframe.contentDocument.write('<!DOCTYPE html>');
            iframe.contentDocument.write(elementToFullHtmlDocument(element));
            iframe.contentDocument.close();
        });
    };

    var failOnInvalidSource = function (doc) {
        try {
            return sanedomparsererror.failOnParseError(doc);
        } catch (e) {
            throw {
                message: "Invalid source",
                originalError: e
            };
        }
    };

    module.validateXHTML = function (xhtml) {
        var p = new DOMParser(),
            doc = p.parseFromString(xhtml, "application/xml");

        failOnInvalidSource(doc);
    };

    return module;
}(sanedomparsererror, window));
