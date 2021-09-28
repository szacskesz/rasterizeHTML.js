var document2svg = (function (util, browser, documentHelper, xmlserializer) {
    "use strict";

    var module = {};

    var svgAttributes = function (size, zoom, onlyElement) {
        var zoomFactor = zoom || 1;

        var attributes;
        if(onlyElement === true) {
            attributes = {
                'width': size.elementWidth,
                'height': size.elementHeight,
                'font-size': size.rootFontSize,
                'viewBox': ""+size.elementLeft+" "+size.elementTop+" "+size.elementWidth+" "+size.elementHeight
            };
        } else {
            attributes = {
                width: size.width,
                height: size.height,
                'font-size': size.rootFontSize
            };
        }

        if (zoomFactor !== 1) {
            attributes.style = 'transform:scale(' + zoomFactor + '); transform-origin: 0 0;';
        }

        return attributes;
    };

    var foreignObjectAttributes = function (size, onlyElement) {
        if(onlyElement === true) {
            return {
                'x': 0,
                'y': 0,
                'width': size.pageWidth,
                'height': size.pageHeight,
            };
        }

        var closestScaledWith, closestScaledHeight,
            offsetX, offsetY;

        closestScaledWith = Math.round(size.viewportWidth);
        closestScaledHeight = Math.round(size.viewportHeight);

        offsetX = -size.left;
        offsetY = -size.top;

        var attributes = {
             'x': offsetX,
             'y': offsetY,
             'width': closestScaledWith,
             'height': closestScaledHeight
        };

        return attributes;
    };

    var workAroundCollapsingMarginsAcrossSVGElementInWebKitLike = function (attributes) {
        var style = attributes.style || '';
        attributes.style = style + 'float: left;';
    };

    var workAroundSafariSometimesNotShowingExternalResources = function (attributes) {
        /* Let's hope that works some magic. The spec says SVGLoad only fires
         * now when all externals are available.
         * http://www.w3.org/TR/SVG/struct.html#ExternalResourcesRequired */
        attributes.externalResourcesRequired = true;
    };

    var workAroundChromeShowingScrollbarsUnderLinuxIfHtmlIsOverflowScroll = function () {
        return '<style scoped="">html::-webkit-scrollbar { display: none; }</style>';
    };

    var serializeAttributes = function (attributes) {
        var keys = Object.keys(attributes);
        if (!keys.length) {
            return '';
        }

        return ' ' + keys.map(function (key) {
            return key + '="' + attributes[key] + '"';
        }).join(' ');
    };

    var convertElementToSvg = function (element, size, zoomFactor, onlyElement) {
        var xhtml = xmlserializer.serializeToString(element);

        browser.validateXHTML(xhtml);

        var foreignObjectAttrs = foreignObjectAttributes(size, onlyElement);
        workAroundCollapsingMarginsAcrossSVGElementInWebKitLike(foreignObjectAttrs);
        workAroundSafariSometimesNotShowingExternalResources(foreignObjectAttrs);

        return (
            '<svg xmlns="http://www.w3.org/2000/svg"' +
                serializeAttributes(svgAttributes(size, zoomFactor, onlyElement)) +
                '>' +
                workAroundChromeShowingScrollbarsUnderLinuxIfHtmlIsOverflowScroll() +
                '<foreignObject' + serializeAttributes(foreignObjectAttrs) + '>' +
                xhtml +
                '</foreignObject>' +
                '</svg>'
        );
    };

    module.getSvgForDocument = function (element, size, zoomFactor, onlyElement) {
        documentHelper.rewriteTagNameSelectorsToLowerCase(element);

        return convertElementToSvg(element, size, zoomFactor, onlyElement);
    };

    module.drawDocumentAsSvg = function (element, options) {
        ['hover', 'active', 'focus', 'target'].forEach(function (action) {
            if (options[action]) {
                documentHelper.fakeUserAction(element, options[action], action);
            }
        });

        return browser.calculateDocumentContentSize(element, options)
            .then(function (size) {
                return module.getSvgForDocument(element, size, options.zoom, options.onlyElement);
            });
    };

    return module;
}(util, browser, documentHelper, xmlserializer));
