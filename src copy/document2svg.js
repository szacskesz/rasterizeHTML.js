var document2svg = (function (browser, documentHelper, xmlserializer) {
    "use strict";

    var module = {};

    var svgAttributes = function (sizes) {
        return {
            'width': sizes.elementSizeX,
            'height': sizes.elementSizeY,
            'font-size': sizes.defaultFontSize,
            'viewBox': `${sizes.elementTopLeftX} ${sizes.elementTopLeftY} ${sizes.elementSizeX} ${sizes.elementSizeY}`
        };
    };

    var foreignObjectAttributes = function (sizes) {
        return {
            'x': 0,
            'y': 0,
            'width': sizes.pageSizeX,
            'height': sizes.pageSizeY
        };
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

    var convertDocumentToSvg = function (doc, sizes) {
        var xhtml = xmlserializer.serializeToString(doc);

        browser.validateXHTML(xhtml);

        var foreignObjectAttrs = foreignObjectAttributes(sizes);
        workAroundCollapsingMarginsAcrossSVGElementInWebKitLike(foreignObjectAttrs);
        workAroundSafariSometimesNotShowingExternalResources(foreignObjectAttrs);

        return (
            '<svg xmlns="http://www.w3.org/2000/svg"' +
                serializeAttributes(svgAttributes(sizes)) +
                '>' +
                workAroundChromeShowingScrollbarsUnderLinuxIfHtmlIsOverflowScroll() +
                '<foreignObject' + serializeAttributes(foreignObjectAttrs) + '>' +
                xhtml +
                '</foreignObject>' +
                '</svg>'
        );
    };

    module.drawElementAsSvg = function (element, sizes) {
        return browser.calculateElementSizes(element, sizes)
            .then(function (sizes) {
                documentHelper.rewriteTagNameSelectorsToLowerCase(element.ownerDocument);

                return convertDocumentToSvg(element.ownerDocument, sizes);
            });
    };

    return module;
}(browser, documentHelper, xmlserializer));
