var documentHelper = (function (documentUtil) {
    "use strict";

    var module = {};

    module.rewriteTagNameSelectorsToLowerCase = function (element) {
        documentUtil.lowercaseCssTypeSelectors(element, documentUtil.findHtmlOnlyNodeNames(element));
    };

    return module;
}(documentUtil));
