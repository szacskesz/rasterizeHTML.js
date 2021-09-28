var rasterize = (function (document2svg, svg2image, inlineresources) {
    "use strict";

    var module = {};

    var generalDrawError = function (e) {
        return {
            message: "Error rendering page",
            originalError: e
        };
    };

    var drawSvgAsImg = function (svg) {
        return svg2image.renderSvg(svg)
            .then(function (image) {
                return {
                    image: image,
                    svg: svg
                };
            }, function (e) {
                throw generalDrawError(e);
            });
    };

    var doDraw = function (element, sizes) {
        return document2svg.drawElementAsSvg(element, sizes)
            .then(drawSvgAsImg);
    };

    module.rasterize = function (element, sizes) {
        return inlineresources.inlineReferences(element.ownerDocument, {
            inlineScripts: false
        }).then(function (errors) {
                return doDraw(element, sizes)
                    .then(function (drawResult) {
                        return {
                            image: drawResult.image,
                            svg: drawResult.svg,
                            errors: errors
                        };
                    });
            });
    };

    return module;
}(document2svg, svg2image, inlineresources));
