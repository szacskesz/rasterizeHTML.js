var rasterizeHTML = (function (rasterize) {
    "use strict";

    var module = {};

    module.drawElement = function (element) {
        var rect = element.ownerDocument.documentElement.getBoundingClientRect();
        
        var sizes = {
            pageSizeX: rect.width * 2,
            pageSizeY: rect.height * 2
        };

        return rasterize.rasterize(element, sizes);
    };

    return module;
}(rasterize));
