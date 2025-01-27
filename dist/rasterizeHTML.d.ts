/*! rasterizeHTML.js - v1.3.0 - 2018-03-18
* http://www.github.com/cburgmer/rasterizeHTML.js
* Copyright (c) 2018 Christoph Burgmer; Licensed MIT */

export as namespace rasterizeHTML;

/** Describes a resource that failed to load during drawing. */
export interface Resource {
    /**
     * The type of the resource. Resource types include:
     * - image: an <img href=""> or <input type="image" src="">
     * - stylesheet: a <link rel="stylesheet" href=""> or @import url("")
     * - backgroundImage: a background-image: url("")
     * - fontFace: a @font-face { src: url("") }
     * - script: a <script src=""> scriptExecution a script execution error
     *   message (no url specified)
     */
    resourceType: 'image' | 'stylesheet' | 'backgroundImage' | 'fontFace' | 'script';

    /** The URL of the resource. */
    url: string;

    /** A human readable message. */
    msg: string;
}

/**
 * Render results object passed to the success function of the promise returned
 * from any of the draw functions.
 */
export interface RenderResult {

    /**
     * The resulting image rendered to the canvas. If content overflows the
     * specified viewport (defined by the width and height parameters or the
     * canvas element's size) the image will have greater dimensions.
     */
    image: HTMLImageElement;

    /** The internal SVG representation of the rendered content. */
    svg: SVGElement;

    /** A list of resources that failed to load. */
    errors: Resource[];
}

/**
 * An error description passed to the error function of the promise returned
 * from any of the draw functions.
 */
export interface Error {
    /**
     * Describes the error. Can be, amongst others:
     * - "Unable to load page" if the URL passed to drawURL could not be loaded,
     * - "Error rendering page" general error if the whole document failed to
     *   render,
     * - "Invalid source" if the source has invalid syntax (and more specifically
     *   cannot be converted into the intermediate XHTML format needed to render
     *   the HTML).
     */
    message: string;

    /**
     * The optional field originalError provides the underlying error, with more
     * details.
     */
    originalError?: any;
}

export function drawElement(element: Document, selectorFn: (doc: Document) => HTMLElement): Promise<RenderResult>;

/**
 * Draw an element of the document.
 * @example
 * ```
 * rasterizeHTML.drawElement(document, (doc) => doc.getElementById("#someId"))
 *     .then(function success(renderResult: RenderResult) {
 *         ...
 *     }, function error(e: Error) {
 *         ...
 *     })
 * ```
 * 
 * @param document a Document object from the element will be drawn
 * @param selectorFn a function get retrieve the specified element from the document
 * @return a promise that is fulfilled once the content is rendered or rejected
 *    if drawing the provided item failed.
 */
 export function drawElement(document: Document, selectorFn: (doc: Document) => HTMLElement): Promise<RenderResult>;

