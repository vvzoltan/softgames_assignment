(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("PIXI"));
	else if(typeof define === 'function' && define.amd)
		define("softgames_challenge", ["PIXI"], factory);
	else if(typeof exports === 'object')
		exports["softgames_challenge"] = factory(require("PIXI"));
	else
		root["softgames_challenge"] = factory(root["PIXI"]);
})(self, (__WEBPACK_EXTERNAL_MODULE__836__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 411:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Emitter: () => (/* binding */ Emitter),
/* harmony export */   Particle: () => (/* binding */ Particle),
/* harmony export */   ParticleUtils: () => (/* binding */ ParticleUtils),
/* harmony export */   PropertyList: () => (/* binding */ PropertyList),
/* harmony export */   PropertyNode: () => (/* binding */ PropertyNode),
/* harmony export */   upgradeConfig: () => (/* binding */ upgradeConfig)
/* harmony export */ });
/* harmony import */ var pixi_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(836);
/* harmony import */ var pixi_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(pixi_js__WEBPACK_IMPORTED_MODULE_0__);
/*!
 * @barvynkoa/particle-emitter - v6.0.0
 * Compiled Mon, 27 May 2024 12:15:21 UTC
 *
 * @barvynkoa/particle-emitter is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */


/**
 * A spawn shape that picks a random position along a series of line segments. If those
 * line segments form a polygon, particles will only be placed on the perimeter of that polygon.
 *
 * Example config:
 * ```javascript
 * {
 *      type: 'polygonalChain',
 *      data: [
 *          [{x: 0, y: 0}, {x: 10, y: 10}, {x: 20, y: 0}],
 *          [{x: 0, y, -10}, {x: 10, y: 0}, {x: 20, y: -10}]
 *      ]
 * }
 * ```
 */
class PolygonalChain {
    /**
     * @param data Point data for polygon chains. Either a list of points for a single chain, or a list of chains.
     */
    constructor(data) {
        this.segments = [];
        this.countingLengths = [];
        this.totalLength = 0;
        this.init(data);
    }
    /**
     * @param data Point data for polygon chains. Either a list of points for a single chain, or a list of chains.
     */
    init(data) {
        // if data is not present, set up a segment of length 0
        if (!data || !data.length) {
            this.segments.push({ p1: { x: 0, y: 0 }, p2: { x: 0, y: 0 }, l: 0 });
        }
        else if (Array.isArray(data[0])) {
            // list of segment chains, each defined as a list of points
            for (let i = 0; i < data.length; ++i) {
                // loop through the chain, connecting points
                const chain = data[i];
                let prevPoint = chain[0];
                for (let j = 1; j < chain.length; ++j) {
                    const second = chain[j];
                    this.segments.push({ p1: prevPoint, p2: second, l: 0 });
                    prevPoint = second;
                }
            }
        }
        else {
            let prevPoint = data[0];
            // list of points
            for (let i = 1; i < data.length; ++i) {
                const second = data[i];
                this.segments.push({ p1: prevPoint, p2: second, l: 0 });
                prevPoint = second;
            }
        }
        // now go through our segments to calculate the lengths so that we
        // can set up a nice weighted random distribution
        for (let i = 0; i < this.segments.length; ++i) {
            const { p1, p2 } = this.segments[i];
            const segLength = Math.sqrt(((p2.x - p1.x) * (p2.x - p1.x)) + ((p2.y - p1.y) * (p2.y - p1.y)));
            // save length so we can turn a random number into a 0-1 interpolation value later
            this.segments[i].l = segLength;
            this.totalLength += segLength;
            // keep track of the length so far, counting up
            this.countingLengths.push(this.totalLength);
        }
    }
    /**
     * Gets a random point in the chain.
     * @param out - Particle ?, because was point data
     */
    getRandPos(out) {
        // select a random spot in the length of the chain
        const rand = Math.random() * this.totalLength;
        let chosenSeg;
        let lerp;
        // if only one segment, it wins
        if (this.segments.length === 1) {
            chosenSeg = this.segments[0];
            lerp = rand;
        }
        else {
            // otherwise, go through countingLengths until we have determined
            // which segment we chose
            for (let i = 0; i < this.countingLengths.length; ++i) {
                if (rand < this.countingLengths[i]) {
                    chosenSeg = this.segments[i];
                    // set lerp equal to the length into that segment
                    // (i.e. the remainder after subtracting all the segments before it)
                    lerp = i === 0 ? rand : rand - this.countingLengths[i - 1];
                    break;
                }
            }
        }
        // divide lerp by the segment length, to result in a 0-1 number.
        lerp /= chosenSeg.l || 1;
        const { p1, p2 } = chosenSeg;
        // now calculate the position in the segment that the lerp value represents
        out.x = p1.x + (lerp * (p2.x - p1.x));
        out.y = p1.y + (lerp * (p2.y - p1.y));
    }
}
PolygonalChain.type = 'polygonalChain';
PolygonalChain.editorConfig = null;

/**
 * A SpawnShape that randomly picks locations inside a rectangle.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'rect',
 *     data: {
 *          x: 0,
 *          y: 0,
 *          w: 10,
 *          h: 100
 *     }
 * }
 * ```
 */
class Rectangle {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.w = config.w;
        this.h = config.h;
    }
    getRandPos(particle) {
        // place the particle at a random point in the rectangle
        particle.x = (Math.random() * this.w) + this.x;
        particle.y = (Math.random() * this.h) + this.y;
    }
}
Rectangle.type = 'rect';
Rectangle.editorConfig = null;

/**
 * A single node in a PropertyList.
 */
class PropertyNode {
    /**
     * @param value The value for this node
     * @param time The time for this node, between 0-1
     * @param [ease] Custom ease for this list. Only relevant for the first node.
     */
    constructor(value, time, ease) {
        this.value = value;
        this.time = time;
        this.next = null;
        this.isStepped = false;
        if (ease) {
            this.ease = typeof ease === 'function' ? ease : generateEase(ease);
        }
        else {
            this.ease = null;
        }
    }
    /**
     * Creates a list of property values from a data object {list, isStepped} with a list of objects in
     * the form {value, time}. Alternatively, the data object can be in the deprecated form of
     * {start, end}.
     * @param data The data for the list.
     * @param data.list The array of value and time objects.
     * @param data.isStepped If the list is stepped rather than interpolated.
     * @param data.ease Custom ease for this list.
     * @return The first node in the list
     */
    // eslint-disable-next-line max-len
    static createList(data) {
        if ('list' in data) {
            const array = data.list;
            let node;
            const { value, time } = array[0];
            // eslint-disable-next-line max-len
            const first = node = new PropertyNode(typeof value === 'string' ? hexToRGB(value) : value, time, data.ease);
            // only set up subsequent nodes if there are a bunch or the 2nd one is different from the first
            if (array.length > 2 || (array.length === 2 && array[1].value !== value)) {
                for (let i = 1; i < array.length; ++i) {
                    const { value, time } = array[i];
                    node.next = new PropertyNode(typeof value === 'string' ? hexToRGB(value) : value, time);
                    node = node.next;
                }
            }
            first.isStepped = !!data.isStepped;
            return first;
        }
        // Handle deprecated version here
        const start = new PropertyNode(typeof data.start === 'string' ? hexToRGB(data.start) : data.start, 0);
        // only set up a next value if it is different from the starting value
        if (data.end !== data.start) {
            start.next = new PropertyNode(typeof data.end === 'string' ? hexToRGB(data.end) : data.end, 1);
        }
        return start;
    }
}

/**
 * The method used by behaviors to fetch textures. Defaults to Texture.from.
 */
// get Texture.from(), only supports V5 and V6 with individual packages
// eslint-disable-next-line prefer-const
let GetTextureFromString = pixi_js__WEBPACK_IMPORTED_MODULE_0__.Texture.from;
/**
 * If errors and warnings should be logged within the library.
 */
const verbose = false;
const DEG_TO_RADS = Math.PI / 180;
/**
 * Rotates a point by a given angle.
 * @param angle The angle to rotate by in radians
 * @param p The point to rotate around 0,0.
 */
function rotatePoint(angle, p) {
    if (!angle)
        return;
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    const xnew = (p.x * c) - (p.y * s);
    const ynew = (p.x * s) + (p.y * c);
    p.x = xnew;
    p.y = ynew;
}
/**
 * Combines separate color components (0-255) into a single uint color.
 * @param r The red value of the color
 * @param g The green value of the color
 * @param b The blue value of the color
 * @return The color in the form of 0xRRGGBB
 */
function combineRGBComponents(r, g, b /* , a*/) {
    return /* a << 24 |*/ (r << 16) | (g << 8) | b;
}
/**
 * Returns the length (or magnitude) of this point.
 * @param point The point to measure length
 * @return The length of this point.
 */
function length(point) {
    return Math.sqrt((point.x * point.x) + (point.y * point.y));
}
/**
 * Reduces the point to a length of 1.
 * @param point The point to normalize
 */
function normalize(point) {
    const oneOverLen = 1 / length(point);
    point.x *= oneOverLen;
    point.y *= oneOverLen;
}
/**
 * Multiplies the x and y values of this point by a value.
 * @param point The point to scaleBy
 * @param value The value to scale by.
 */
function scaleBy(point, value) {
    point.x *= value;
    point.y *= value;
}
/**
 * Converts a hex string from "#AARRGGBB", "#RRGGBB", "0xAARRGGBB", "0xRRGGBB",
 * "AARRGGBB", or "RRGGBB" to an object of ints of 0-255, as
 * {r, g, b, (a)}.
 * @param color The input color string.
 * @param output An object to put the output in. If omitted, a new object is created.
 * @return The object with r, g, and b properties, possibly with an a property.
 */
function hexToRGB(color, output) {
    if (!output) {
        output = {};
    }
    if (color.charAt(0) === '#') {
        color = color.substr(1);
    }
    else if (color.indexOf('0x') === 0) {
        color = color.substr(2);
    }
    let alpha;
    if (color.length === 8) {
        alpha = color.substr(0, 2);
        color = color.substr(2);
    }
    output.r = parseInt(color.substr(0, 2), 16); // Red
    output.g = parseInt(color.substr(2, 2), 16); // Green
    output.b = parseInt(color.substr(4, 2), 16); // Blue
    if (alpha) {
        output.a = parseInt(alpha, 16);
    }
    return output;
}
/**
 * Generates a custom ease function, based on the GreenSock custom ease, as demonstrated
 * by the related tool at http://www.greensock.com/customease/.
 * @param segments An array of segments, as created by
 * http://www.greensock.com/customease/.
 * @return A function that calculates the percentage of change at
 *                    a given point in time (0-1 inclusive).
 */
function generateEase(segments) {
    const qty = segments.length;
    const oneOverQty = 1 / qty;
    /*
        * Calculates the percentage of change at a given point in time (0-1 inclusive).
        * @param {Number} time The time of the ease, 0-1 inclusive.
        * @return {Number} The percentage of the change, 0-1 inclusive (unless your
        *                  ease goes outside those bounds).
        */
    // eslint-disable-next-line func-names
    return function (time) {
        const i = (qty * time) | 0; // do a quick floor operation
        const t = (time - (i * oneOverQty)) * qty;
        const s = segments[i] || segments[qty - 1];
        return (s.s + (t * ((2 * (1 - t) * (s.cp - s.s)) + (t * (s.e - s.s)))));
    };
}
/**
 * Gets a blend mode, ensuring that it is valid.
 * @param name The name of the blend mode to get.
 * @return The blend mode as specified in the PIXI.BLEND_MODES enumeration.
 */
function getBlendMode(name) {
    return name || 'normal';
}
/**
 * Converts a list of {value, time} objects starting at time 0 and ending at time 1 into an evenly
 * spaced stepped list of PropertyNodes for color values. This is primarily to handle conversion of
 * linear gradients to fewer colors, allowing for some optimization for Canvas2d fallbacks.
 * @param list The list of data to convert.
 * @param [numSteps=10] The number of steps to use.
 * @return The blend mode as specified in the PIXI.blendModes enumeration.
 */
function createSteppedGradient(list, numSteps = 10) {
    if (typeof numSteps !== 'number' || numSteps <= 0) {
        numSteps = 10;
    }
    const first = new PropertyNode(hexToRGB(list[0].value), list[0].time);
    first.isStepped = true;
    let currentNode = first;
    let current = list[0];
    let nextIndex = 1;
    let next = list[nextIndex];
    for (let i = 1; i < numSteps; ++i) {
        let lerp = i / numSteps;
        // ensure we are on the right segment, if multiple
        while (lerp > next.time) {
            current = next;
            next = list[++nextIndex];
        }
        // convert the lerp value to the segment range
        lerp = (lerp - current.time) / (next.time - current.time);
        const curVal = hexToRGB(current.value);
        const nextVal = hexToRGB(next.value);
        const output = {
            r: ((nextVal.r - curVal.r) * lerp) + curVal.r,
            g: ((nextVal.g - curVal.g) * lerp) + curVal.g,
            b: ((nextVal.b - curVal.b) * lerp) + curVal.b,
        };
        currentNode.next = new PropertyNode(output, i / numSteps);
        currentNode = currentNode.next;
    }
    // we don't need to have a PropertyNode for time of 1, because in a stepped version at that point
    // the particle has died of old age
    return first;
}

var ParticleUtils = {
    __proto__: null,
    DEG_TO_RADS: DEG_TO_RADS,
    GetTextureFromString: GetTextureFromString,
    combineRGBComponents: combineRGBComponents,
    createSteppedGradient: createSteppedGradient,
    generateEase: generateEase,
    getBlendMode: getBlendMode,
    hexToRGB: hexToRGB,
    length: length,
    normalize: normalize,
    rotatePoint: rotatePoint,
    scaleBy: scaleBy,
    verbose: verbose
};

/**
 * A class for spawning particles in a circle or ring.
 * Can optionally apply rotation to particles so that they are aimed away from the center of the circle.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'torus',
 *     data: {
 *          radius: 30,
 *          x: 0,
 *          y: 0,
 *          innerRadius: 10,
 *          rotation: true
 *     }
 * }
 * ```
 */
class Torus {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.radius = config.radius;
        this.innerRadius = config.innerRadius || 0;
        this.rotation = !!config.affectRotation;
    }
    getRandPos(particle) {
        // place the particle at a random radius in the ring
        if (this.innerRadius !== this.radius) {
            particle.x = (Math.random() * (this.radius - this.innerRadius)) + this.innerRadius;
        }
        else {
            particle.x = this.radius;
        }
        particle.y = 0;
        // rotate the point to a random angle in the circle
        const angle = Math.random() * Math.PI * 2;
        if (this.rotation) {
            particle.rotation += angle;
        }
        rotatePoint(angle, particle.position);
        // now add in the center of the torus
        particle.position.x += this.x;
        particle.position.y += this.y;
    }
}
Torus.type = 'torus';
Torus.editorConfig = null;

/**
 * Standard behavior order values, specifying when/how they are used. Other numeric values can be used,
 * but only the Spawn value will be handled in a special way. All other values will be sorted numerically.
 * Behaviors with the same value will not be given any specific sort order, as they are assumed to not
 * interfere with each other.
 */
var BehaviorOrder;
(function (BehaviorOrder) {
    /**
     * Spawn - initial placement and/or rotation. This happens before rotation/translation due to
     * emitter rotation/position is applied.
     */
    BehaviorOrder[BehaviorOrder["Spawn"] = 0] = "Spawn";
    /**
     * Normal priority, for things that don't matter when they are applied.
     */
    BehaviorOrder[BehaviorOrder["Normal"] = 2] = "Normal";
    /**
     * Delayed priority, for things that need to read other values in order to act correctly.
     */
    BehaviorOrder[BehaviorOrder["Late"] = 5] = "Late";
})(BehaviorOrder || (BehaviorOrder = {}));

/**
 * A Movement behavior that handles movement by applying a constant acceleration to all particles.
 *
 * Example configuration:
 * ```javascript
 * {
 *     "type": "moveAcceleration",
 *     "config": {
 *          "accel": {
 *               "x": 0,
 *               "y": 2000
 *          },
 *          "minStart": 600,
 *          "maxStart": 600,
 *          "rotate": true
 *     }
 *}
 * ```
 */
class AccelerationBehavior {
    constructor(config) {
        // doesn't _really_ need to be late, but doing so ensures that we can override any
        // rotation behavior that is mistakenly added
        this.order = BehaviorOrder.Late;
        this.minStart = config.minStart;
        this.maxStart = config.maxStart;
        this.accel = config.accel;
        this.rotate = !!config.rotate;
        this.maxSpeed = config.maxSpeed ?? 0;
    }
    initParticles(first) {
        let next = first;
        while (next) {
            const speed = (Math.random() * (this.maxStart - this.minStart)) + this.minStart;
            if (!next.config.velocity) {
                next.config.velocity = new pixi_js__WEBPACK_IMPORTED_MODULE_0__.Point(speed, 0);
            }
            else {
                next.config.velocity.set(speed, 0);
            }
            rotatePoint(next.rotation, next.config.velocity);
            next = next.next;
        }
    }
    updateParticle(particle, deltaSec) {
        const vel = particle.config.velocity;
        const oldVX = vel.x;
        const oldVY = vel.y;
        vel.x += this.accel.x * deltaSec;
        vel.y += this.accel.y * deltaSec;
        if (this.maxSpeed) {
            const currentSpeed = length(vel);
            // if we are going faster than we should, clamp at the max speed
            // DO NOT recalculate vector length
            if (currentSpeed > this.maxSpeed) {
                scaleBy(vel, this.maxSpeed / currentSpeed);
            }
        }
        // calculate position delta by the midpoint between our old velocity and our new velocity
        particle.x += (oldVX + vel.x) / 2 * deltaSec;
        particle.y += (oldVY + vel.y) / 2 * deltaSec;
        if (this.rotate) {
            particle.rotation = Math.atan2(vel.y, vel.x);
        }
    }
}
AccelerationBehavior.type = 'moveAcceleration';
AccelerationBehavior.editorConfig = null;

function intValueSimple(lerp) {
    if (this.ease)
        lerp = this.ease(lerp);
    return ((this.first.next.value - this.first.value) * lerp) + this.first.value;
}
function intColorSimple(lerp) {
    if (this.ease)
        lerp = this.ease(lerp);
    const curVal = this.first.value;
    const nextVal = this.first.next.value;
    const r = ((nextVal.r - curVal.r) * lerp) + curVal.r;
    const g = ((nextVal.g - curVal.g) * lerp) + curVal.g;
    const b = ((nextVal.b - curVal.b) * lerp) + curVal.b;
    return combineRGBComponents(r, g, b);
}
function intValueComplex(lerp) {
    if (this.ease)
        lerp = this.ease(lerp);
    // make sure we are on the right segment
    let current = this.first;
    let next = current.next;
    while (lerp > next.time) {
        current = next;
        next = next.next;
    }
    // convert the lerp value to the segment range
    lerp = (lerp - current.time) / (next.time - current.time);
    return ((next.value - current.value) * lerp) + current.value;
}
function intColorComplex(lerp) {
    if (this.ease)
        lerp = this.ease(lerp);
    // make sure we are on the right segment
    let current = this.first;
    let next = current.next;
    while (lerp > next.time) {
        current = next;
        next = next.next;
    }
    // convert the lerp value to the segment range
    lerp = (lerp - current.time) / (next.time - current.time);
    const curVal = current.value;
    const nextVal = next.value;
    const r = ((nextVal.r - curVal.r) * lerp) + curVal.r;
    const g = ((nextVal.g - curVal.g) * lerp) + curVal.g;
    const b = ((nextVal.b - curVal.b) * lerp) + curVal.b;
    return combineRGBComponents(r, g, b);
}
function intValueStepped(lerp) {
    if (this.ease)
        lerp = this.ease(lerp);
    // make sure we are on the right segment
    let current = this.first;
    while (current.next && lerp > current.next.time) {
        current = current.next;
    }
    return current.value;
}
function intColorStepped(lerp) {
    if (this.ease)
        lerp = this.ease(lerp);
    // make sure we are on the right segment
    let current = this.first;
    while (current.next && lerp > current.next.time) {
        current = current.next;
    }
    const curVal = current.value;
    return combineRGBComponents(curVal.r, curVal.g, curVal.b);
}
/**
 * Singly linked list container for keeping track of interpolated properties for particles.
 * Each Particle will have one of these for each interpolated property.
 */
class PropertyList {
    /**
     * @param isColor If this list handles color values
     */
    constructor(isColor = false) {
        this.first = null;
        this.isColor = !!isColor;
        this.interpolate = null;
        this.ease = null;
    }
    /**
     * Resets the list for use.
     * @param first The first node in the list.
     * @param first.isStepped If the values should be stepped instead of interpolated linearly.
     */
    reset(first) {
        this.first = first;
        const isSimple = first.next && first.next.time >= 1;
        if (isSimple) {
            this.interpolate = this.isColor ? intColorSimple : intValueSimple;
        }
        else if (first.isStepped) {
            this.interpolate = this.isColor ? intColorStepped : intValueStepped;
        }
        else {
            this.interpolate = this.isColor ? intColorComplex : intValueComplex;
        }
        this.ease = this.first.ease;
    }
}

/**
 * An Alpha behavior that applies an interpolated or stepped list of values to the particle's opacity.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'alpha',
 *     config: {
 *         alpha: {
 *              list: [{value: 0, time: 0}, {value: 1, time: 0.25}, {value: 0, time: 1}]
 *         },
 *     }
 * }
 * ```
 */
class AlphaBehavior {
    constructor(config) {
        this.order = BehaviorOrder.Normal;
        this.list = new PropertyList(false);
        this.list.reset(PropertyNode.createList(config.alpha));
    }
    initParticles(first) {
        let next = first;
        while (next) {
            next.alpha = this.list.first.value;
            next = next.next;
        }
    }
    updateParticle(particle) {
        particle.alpha = this.list.interpolate(particle.agePercent);
    }
}
AlphaBehavior.type = 'alpha';
AlphaBehavior.editorConfig = null;
/**
 * An Alpha behavior that applies a static value to the particle's opacity at particle initialization.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'alphaStatic',
 *     config: {
 *         alpha: 0.75,
 *     }
 * }
 * ```
 */
class StaticAlphaBehavior {
    constructor(config) {
        this.order = BehaviorOrder.Normal;
        this.value = config.alpha;
    }
    initParticles(first) {
        let next = first;
        while (next) {
            next.alpha = this.value;
            next = next.next;
        }
    }
}
StaticAlphaBehavior.type = 'alphaStatic';
StaticAlphaBehavior.editorConfig = null;

function getTextures(textures) {
    const outTextures = [];
    for (let j = 0; j < textures.length; ++j) {
        let tex = textures[j];
        if (typeof tex === 'string') {
            outTextures.push(GetTextureFromString(tex));
        }
        else if (tex instanceof pixi_js__WEBPACK_IMPORTED_MODULE_0__.Texture) {
            outTextures.push(tex);
        }
        // assume an object with extra data determining duplicate frame data
        else {
            let dupe = tex.count || 1;
            if (typeof tex.texture === 'string') {
                tex = GetTextureFromString(tex.texture);
            }
            else // if(tex.texture instanceof Texture)
             {
                tex = tex.texture;
            }
            for (; dupe > 0; --dupe) {
                outTextures.push(tex);
            }
        }
    }
    return outTextures;
}
/**
 * A Texture behavior that picks a random animation for each particle to play.
 * See {@link AnimatedParticleArt} for detailed configuration info.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'animatedRandom',
 *     config: {
 *         anims: [
 *              {
 *                  framerate: 25,
 *                  loop: true,
 *                  textures: ['frame1', 'frame2', 'frame3']
 *              },
 *              {
 *                  framerate: 25,
 *                  loop: true,
 *                  textures: ['frame3', 'frame2', 'frame1']
 *              }
 *         ],
 *     }
 * }
 * ```
 */
class RandomAnimatedTextureBehavior {
    constructor(config) {
        this.order = BehaviorOrder.Normal;
        this.anims = [];
        for (let i = 0; i < config.anims.length; ++i) {
            const anim = config.anims[i];
            const textures = getTextures(anim.textures);
            // eslint-disable-next-line no-nested-ternary
            const framerate = anim.framerate < 0 ? -1 : (anim.framerate > 0 ? anim.framerate : 60);
            const parsedAnim = {
                textures,
                duration: framerate > 0 ? textures.length / framerate : 0,
                framerate,
                loop: framerate > 0 ? !!anim.loop : false,
            };
            this.anims.push(parsedAnim);
        }
    }
    initParticles(first) {
        let next = first;
        while (next) {
            const index = Math.floor(Math.random() * this.anims.length);
            const anim = next.config.anim = this.anims[index];
            next.texture = anim.textures[0];
            next.config.animElapsed = 0;
            // if anim should match particle life exactly
            if (anim.framerate === -1) {
                next.config.animDuration = next.maxLife;
                next.config.animFramerate = anim.textures.length / next.maxLife;
            }
            else {
                next.config.animDuration = anim.duration;
                next.config.animFramerate = anim.framerate;
            }
            next = next.next;
        }
    }
    updateParticle(particle, deltaSec) {
        const config = particle.config;
        const anim = config.anim;
        config.animElapsed += deltaSec;
        if (config.animElapsed >= config.animDuration) {
            // loop elapsed back around
            if (config.anim.loop) {
                config.animElapsed = config.animElapsed % config.animDuration;
            }
            // subtract a small amount to prevent attempting to go past the end of the animation
            else {
                config.animElapsed = config.animDuration - 0.000001;
            }
        }
        // add a very small number to the frame and then floor it to avoid
        // the frame being one short due to floating point errors.
        const frame = ((config.animElapsed * config.animFramerate) + 0.0000001) | 0;
        // in the very rare case that framerate * elapsed math ends up going past the end, use the last texture
        particle.texture = anim.textures[frame] || anim.textures[anim.textures.length - 1] || pixi_js__WEBPACK_IMPORTED_MODULE_0__.Texture.EMPTY;
    }
}
RandomAnimatedTextureBehavior.type = 'animatedRandom';
RandomAnimatedTextureBehavior.editorConfig = null;
/**
 * A Texture behavior that uses a single animation for each particle to play.
 * See {@link AnimatedParticleArt} for detailed configuration info.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'animatedSingle',
 *     config: {
 *         anim: {
 *              framerate: 25,
 *              loop: true,
 *              textures: ['frame1', 'frame2', 'frame3']
 *         }
 *     }
 * }
 * ```
 */
class SingleAnimatedTextureBehavior {
    constructor(config) {
        this.order = BehaviorOrder.Normal;
        const anim = config.anim;
        const textures = getTextures(anim.textures);
        // eslint-disable-next-line no-nested-ternary
        const framerate = anim.framerate < 0 ? -1 : (anim.framerate > 0 ? anim.framerate : 60);
        this.anim = {
            textures,
            duration: framerate > 0 ? textures.length / framerate : 0,
            framerate,
            loop: framerate > 0 ? !!anim.loop : false,
        };
    }
    initParticles(first) {
        let next = first;
        const anim = this.anim;
        while (next) {
            next.texture = anim.textures[0];
            next.config.animElapsed = 0;
            // if anim should match particle life exactly
            if (anim.framerate === -1) {
                next.config.animDuration = next.maxLife;
                next.config.animFramerate = anim.textures.length / next.maxLife;
            }
            else {
                next.config.animDuration = anim.duration;
                next.config.animFramerate = anim.framerate;
            }
            next = next.next;
        }
    }
    updateParticle(particle, deltaSec) {
        const anim = this.anim;
        const config = particle.config;
        config.animElapsed += deltaSec;
        if (config.animElapsed >= config.animDuration) {
            // loop elapsed back around
            if (anim.loop) {
                config.animElapsed = config.animElapsed % config.animDuration;
            }
            // subtract a small amount to prevent attempting to go past the end of the animation
            else {
                config.animElapsed = config.animDuration - 0.000001;
            }
        }
        // add a very small number to the frame and then floor it to avoid
        // the frame being one short due to floating point errors.
        const frame = ((config.animElapsed * config.animFramerate) + 0.0000001) | 0;
        // in the very rare case that framerate * elapsed math ends up going past the end, use the last texture
        particle.texture = anim.textures[frame] || anim.textures[anim.textures.length - 1] || pixi_js__WEBPACK_IMPORTED_MODULE_0__.Texture.EMPTY;
    }
}
SingleAnimatedTextureBehavior.type = 'animatedSingle';
SingleAnimatedTextureBehavior.editorConfig = null;

/**
 * A Blend Mode behavior that applies a blend mode value to the particle at initialization.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'blendMode',
 *     config: {
 *         blendMode: 'multiply',
 *     }
 * }
 * ```
 */
class BlendModeBehavior {
    constructor(config) {
        this.order = BehaviorOrder.Normal;
        this.value = config.blendMode;
    }
    initParticles(first) {
        let next = first;
        while (next) {
            next.blendMode = getBlendMode(this.value);
            next = next.next;
        }
    }
}
BlendModeBehavior.type = 'blendMode';
BlendModeBehavior.editorConfig = null;

/**
 * A Spawn behavior that sends particles out from a single point or ring, and is capable of evenly spacing
 * the particle's starting angles.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'spawnBurst',
 *     config: {
 *          spacing: 90,
 *          start: 0,
 *          distance: 40,
 *     }
 * }
 * ```
 */
class BurstSpawnBehavior {
    constructor(config) {
        this.order = BehaviorOrder.Spawn;
        this.spacing = config.spacing * DEG_TO_RADS;
        this.start = config.start * DEG_TO_RADS;
        this.distance = config.distance;
    }
    initParticles(first) {
        let count = 0;
        let next = first;
        while (next) {
            let angle;
            if (this.spacing) {
                angle = this.start + (this.spacing * count);
            }
            else {
                angle = Math.random() * Math.PI * 2;
            }
            next.rotation = angle;
            if (this.distance) {
                next.position.x = this.distance;
                rotatePoint(angle, next.position);
            }
            next = next.next;
            ++count;
        }
    }
}
BurstSpawnBehavior.type = 'spawnBurst';
BurstSpawnBehavior.editorConfig = null;

/**
 * A Color behavior that applies an interpolated or stepped list of values to the particle's tint property.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'color',
 *     config: {
 *         color: {
 *              list: [{value: '#ff0000' time: 0}, {value: '#00ff00', time: 0.5}, {value: '#0000ff', time: 1}]
 *         },
 *     }
 * }
 * ```
 */
class ColorBehavior {
    constructor(config) {
        this.order = BehaviorOrder.Normal;
        this.list = new PropertyList(true);
        this.list.reset(PropertyNode.createList(config.color));
    }
    initParticles(first) {
        let next = first;
        const color = this.list.first.value;
        const tint = combineRGBComponents(color.r, color.g, color.b);
        while (next) {
            next.tint = tint;
            next = next.next;
        }
    }
    updateParticle(particle) {
        particle.tint = this.list.interpolate(particle.agePercent);
    }
}
ColorBehavior.type = 'color';
ColorBehavior.editorConfig = null;
/**
 * A Color behavior that applies a single color to the particle's tint property at initialization.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'colorStatic',
 *     config: {
 *         color: '#ffff00',
 *     }
 * }
 * ```
 */
class StaticColorBehavior {
    constructor(config) {
        this.order = BehaviorOrder.Normal;
        let color = config.color;
        if (color.charAt(0) === '#') {
            color = color.substr(1);
        }
        else if (color.indexOf('0x') === 0) {
            color = color.substr(2);
        }
        this.value = parseInt(color, 16);
    }
    initParticles(first) {
        let next = first;
        while (next) {
            next.tint = this.value;
            next = next.next;
        }
    }
}
StaticColorBehavior.type = 'colorStatic';
StaticColorBehavior.editorConfig = null;

/**
 * A Texture behavior that assigns a texture to each particle from its list, in order, before looping around to the first
 * texture again. String values will be converted to textures with {@link ParticleUtils.GetTextureFromString}.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'textureOrdered',
 *     config: {
 *         textures: ["myTex1Id", "myTex2Id", "myTex3Id", "myTex4Id"],
 *     }
 * }
 * ```
 */
class OrderedTextureBehavior {
    constructor(config) {
        this.order = BehaviorOrder.Normal;
        this.index = 0;
        this.textures = config.textures.map((tex) => (typeof tex === 'string' ? GetTextureFromString(tex) : tex));
    }
    initParticles(first) {
        let next = first;
        while (next) {
            next.texture = this.textures[this.index];
            if (++this.index >= this.textures.length) {
                this.index = 0;
            }
            next = next.next;
        }
    }
}
OrderedTextureBehavior.type = 'textureOrdered';
OrderedTextureBehavior.editorConfig = null;

/**
 * A helper point for math things.
 * @hidden
 */
const helperPoint = new pixi_js__WEBPACK_IMPORTED_MODULE_0__.Point();
/**
 * A hand picked list of Math functions (and a couple properties) that are
 * allowable. They should be used without the preceding "Math."
 * @hidden
 */
const MATH_FUNCS = [
    'E',
    'LN2',
    'LN10',
    'LOG2E',
    'LOG10E',
    'PI',
    'SQRT1_2',
    'SQRT2',
    'abs',
    'acos',
    'acosh',
    'asin',
    'asinh',
    'atan',
    'atanh',
    'atan2',
    'cbrt',
    'ceil',
    'cos',
    'cosh',
    'exp',
    'expm1',
    'floor',
    'fround',
    'hypot',
    'log',
    'log1p',
    'log10',
    'log2',
    'max',
    'min',
    'pow',
    'random',
    'round',
    'sign',
    'sin',
    'sinh',
    'sqrt',
    'tan',
    'tanh',
];
/**
 * create an actual regular expression object from the string
 * @hidden
 */
const WHITELISTER = new RegExp([
    // Allow the 4 basic operations, parentheses and all numbers/decimals, as well
    // as 'x', for the variable usage.
    '[01234567890\\.\\*\\-\\+\\/\\(\\)x ,]',
].concat(MATH_FUNCS).join('|'), 'g');
/**
 * Parses a string into a function for path following.
 * This involves whitelisting the string for safety, inserting "Math." to math function
 * names, and using `new Function()` to generate a function.
 * @hidden
 * @param pathString The string to parse.
 * @return The path function - takes x, outputs y.
 */
function parsePath(pathString) {
    const matches = pathString.match(WHITELISTER);
    for (let i = matches.length - 1; i >= 0; --i) {
        if (MATH_FUNCS.indexOf(matches[i]) >= 0) {
            matches[i] = `Math.${matches[i]}`;
        }
    }
    pathString = matches.join('');
    // eslint-disable-next-line no-new-func
    return new Function('x', `return ${pathString};`);
}
/**
 * A particle that follows a path defined by an algebraic expression, e.g. "sin(x)" or
 * "5x + 3".
 * To use this class, the behavior config must have a "path" string or function.
 *
 * A string should have "x" in it to represent movement (from the
 * speed settings of the behavior). It may have numbers, parentheses, the four basic
 * operations, and any Math functions or properties (without the preceding "Math.").
 * The overall movement of the particle and the expression value become x and y positions for
 * the particle, respectively. The final position is rotated by the spawn rotation/angle of
 * the particle.
 *
 * A function merely needs to accept the "x" argument and output the a corresponding "y" value.
 *
 * Some example paths:
 *
 * * `"sin(x/10) * 20"` A sine wave path.
 * * `"cos(x/100) * 30"` Particles curve counterclockwise (for medium speed/low lifetime particles)
 * * `"pow(x/10, 2) / 2"` Particles curve clockwise (remember, +y is down).
 * * `(x) => Math.floor(x) * 3` Supplying an existing function should look like this
 *
 * Example configuration:
 * ```javascript
 * {
 *     "type": "movePath",
 *     "config": {
 *          "path": "round(sin(x) * 2",
 *          "speed": {
 *              "list": [{value: 10, time: 0}, {value: 100, time: 0.25}, {value: 0, time: 1}],
 *          },
 *          "minMult": 0.8
 *     }
 *}
 */
class PathBehavior {
    constructor(config) {
        // *MUST* happen after other behaviors do initialization so that we can read initial transformations
        this.order = BehaviorOrder.Late;
        if (config.path) {
            if (typeof config.path === 'function') {
                this.path = config.path;
            }
            else {
                try {
                    this.path = parsePath(config.path);
                }
                catch (e) {
                    this.path = null;
                }
            }
        }
        else {
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            this.path = (x) => x;
        }
        this.list = new PropertyList(false);
        this.list.reset(PropertyNode.createList(config.speed));
        this.minMult = config.minMult ?? 1;
    }
    initParticles(first) {
        let next = first;
        while (next) {
            /*
             * The initial rotation in degrees of the particle, because the direction of the path
             * is based on that.
             */
            next.config.initRotation = next.rotation;
            /* The initial position of the particle, as all path movement is added to that. */
            if (!next.config.initPosition) {
                next.config.initPosition = new pixi_js__WEBPACK_IMPORTED_MODULE_0__.Point(next.x, next.y);
            }
            else {
                next.config.initPosition.copyFrom(next.position);
            }
            /* Total single directional movement, due to speed. */
            next.config.movement = 0;
            // also do speed multiplier, since this includes basic speed movement
            const mult = (Math.random() * (1 - this.minMult)) + this.minMult;
            next.config.speedMult = mult;
            next = next.next;
        }
    }
    updateParticle(particle, deltaSec) {
        // increase linear movement based on speed
        const speed = this.list.interpolate(particle.agePercent) * particle.config.speedMult;
        particle.config.movement += speed * deltaSec;
        // set up the helper point for rotation
        helperPoint.x = particle.config.movement;
        helperPoint.y = this.path(helperPoint.x);
        rotatePoint(particle.config.initRotation, helperPoint);
        particle.position.x = particle.config.initPosition.x + helperPoint.x;
        particle.position.y = particle.config.initPosition.y + helperPoint.y;
    }
}
PathBehavior.type = 'movePath';
PathBehavior.editorConfig = null;

/**
 * A Spawn behavior that sends particles out from a single point at the emitter's position.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'spawnPoint',
 *     config: {}
 * }
 * ```
 */
class PointSpawnBehavior {
    constructor() {
        this.order = BehaviorOrder.Spawn;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    initParticles(_first) {
        // really just a no-op
    }
}
PointSpawnBehavior.type = 'spawnPoint';
PointSpawnBehavior.editorConfig = null;

/**
 * A Texture behavior that assigns a random texture to each particle from its list.
 * String values will be converted to textures with {@link ParticleUtils.GetTextureFromString}.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'textureRandom',
 *     config: {
 *         textures: ["myTex1Id", "myTex2Id", "myTex3Id", "myTex4Id"],
 *     }
 * }
 * ```
 */
class RandomTextureBehavior {
    constructor(config) {
        this.order = BehaviorOrder.Normal;
        this.textures = config.textures.map((tex) => (typeof tex === 'string' ? GetTextureFromString(tex) : tex));
    }
    initParticles(first) {
        let next = first;
        while (next) {
            const index = Math.floor(Math.random() * this.textures.length);
            next.texture = this.textures[index];
            next = next.next;
        }
    }
}
RandomTextureBehavior.type = 'textureRandom';
RandomTextureBehavior.editorConfig = null;

/**
 * A Rotation behavior that handles starting rotation, rotation speed, and rotational acceleration.
 *
 * Example configuration:
 * ```javascript
 * {
 *     "type": "rotation",
 *     "config": {
 *          "minStart": 0,
 *          "maxStart": 180,
 *          "minSpeed": 30,
 *          "maxSpeed": 45,
 *          "accel": 20
 *     }
 *}
 * ```
 */
class RotationBehavior {
    constructor(config) {
        this.order = BehaviorOrder.Normal;
        this.minStart = config.minStart * DEG_TO_RADS;
        this.maxStart = config.maxStart * DEG_TO_RADS;
        this.minSpeed = config.minSpeed * DEG_TO_RADS;
        this.maxSpeed = config.maxSpeed * DEG_TO_RADS;
        this.accel = config.accel * DEG_TO_RADS;
    }
    initParticles(first) {
        let next = first;
        while (next) {
            if (this.minStart === this.maxStart) {
                next.rotation += this.maxStart;
            }
            else {
                next.rotation += (Math.random() * (this.maxStart - this.minStart)) + this.minStart;
            }
            next.config.rotSpeed = (Math.random() * (this.maxSpeed - this.minSpeed)) + this.minSpeed;
            next = next.next;
        }
    }
    updateParticle(particle, deltaSec) {
        if (this.accel) {
            const oldSpeed = particle.config.rotSpeed;
            particle.config.rotSpeed += this.accel * deltaSec;
            particle.rotation += (particle.config.rotSpeed + oldSpeed) / 2 * deltaSec;
        }
        else {
            particle.rotation += particle.config.rotSpeed * deltaSec;
        }
    }
}
RotationBehavior.type = 'rotation';
RotationBehavior.editorConfig = null;
/**
 * A Rotation behavior that handles starting rotation.
 *
 * Example configuration:
 * ```javascript
 * {
 *     "type": "rotationStatic",
 *     "config": {
 *          "min": 0,
 *          "max": 180,
 *     }
 *}
 * ```
 */
class StaticRotationBehavior {
    constructor(config) {
        this.order = BehaviorOrder.Normal;
        this.min = config.min * DEG_TO_RADS;
        this.max = config.max * DEG_TO_RADS;
    }
    initParticles(first) {
        let next = first;
        while (next) {
            if (this.min === this.max) {
                next.rotation += this.max;
            }
            else {
                next.rotation += (Math.random() * (this.max - this.min)) + this.min;
            }
            next = next.next;
        }
    }
}
StaticRotationBehavior.type = 'rotationStatic';
StaticRotationBehavior.editorConfig = null;
/**
 * A Rotation behavior that blocks all rotation caused by spawn settings,
 * by resetting it to the specified rotation (or 0).
 *
 * Example configuration:
 * ```javascript
 * {
 *     "type": "noRotation",
 *     "config": {
 *          "rotation": 0
 *     }
 *}
 * ```
 */
class NoRotationBehavior {
    constructor(config) {
        this.order = BehaviorOrder.Late + 1;
        this.rotation = (config.rotation || 0) * DEG_TO_RADS;
    }
    initParticles(first) {
        let next = first;
        while (next) {
            next.rotation = this.rotation;
            next = next.next;
        }
    }
}
NoRotationBehavior.type = 'noRotation';
NoRotationBehavior.editorConfig = null;

/**
 * A Scale behavior that applies an interpolated or stepped list of values to the particle's x & y scale.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'scale',
 *     config: {
 *          scale: {
 *              list: [{value: 0, time: 0}, {value: 1, time: 0.25}, {value: 0, time: 1}],
 *              isStepped: true
 *          },
 *          minMult: 0.5
 *     }
 * }
 * ```
 */
class ScaleBehavior {
    constructor(config) {
        this.order = BehaviorOrder.Normal;
        this.list = new PropertyList(false);
        this.list.reset(PropertyNode.createList(config.scale));
        this.minMult = config.minMult ?? 1;
    }
    initParticles(first) {
        let next = first;
        while (next) {
            const mult = (Math.random() * (1 - this.minMult)) + this.minMult;
            next.config.scaleMult = mult;
            next.scale.x = next.scale.y = this.list.first.value * mult;
            next = next.next;
        }
    }
    updateParticle(particle) {
        particle.scale.x = particle.scale.y = this.list.interpolate(particle.agePercent) * particle.config.scaleMult;
    }
}
ScaleBehavior.type = 'scale';
ScaleBehavior.editorConfig = null;
/**
 * A Scale behavior that applies a randomly picked value to the particle's x & y scale at initialization.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'scaleStatic',
 *     config: {
 *         min: 0.25,
 *         max: 0.75,
 *     }
 * }
 * ```
 */
class StaticScaleBehavior {
    constructor(config) {
        this.order = BehaviorOrder.Normal;
        this.min = config.min;
        this.max = config.max;
    }
    initParticles(first) {
        let next = first;
        while (next) {
            const scale = (Math.random() * (this.max - this.min)) + this.min;
            next.scale.x = next.scale.y = scale;
            next = next.next;
        }
    }
}
StaticScaleBehavior.type = 'scaleStatic';
StaticScaleBehavior.editorConfig = null;

/**
 * A Spawn behavior that places (and optionally rotates) particles according to a
 * specified shape. Additional shapes can be registered with {@link registerShape | SpawnShape.registerShape()}.
 * Additional shapes must implement the {@link SpawnShape} interface, and their class must match the
 * {@link SpawnShapeClass} interface.
 * Shapes included by default are:
 * * {@link Rectangle}
 * * {@link Torus}
 * * {@link PolygonalChain}
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'spawnShape',
 *     config: {
 *          type: 'rect',
 *          data: {
 *              x: 0,
 *              y: 0,
 *              width: 20,
 *              height: 300,
 *          }
 *     }
 * }
 * ```
 */
class ShapeSpawnBehavior {
    /**
     * Registers a shape to be used by the ShapeSpawn behavior.
     * @param constructor The shape class constructor to use, with a static `type` property to reference it by.
     * @param typeOverride An optional type override, primarily for registering a shape under multiple names.
     */
    static registerShape(constructor, typeOverride) {
        ShapeSpawnBehavior.shapes[typeOverride || constructor.type] = constructor;
    }
    constructor(config) {
        this.order = BehaviorOrder.Spawn;
        const ShapeClass = ShapeSpawnBehavior.shapes[config.type];
        if (!ShapeClass) {
            throw new Error(`No shape found with type '${config.type}'`);
        }
        this.shape = new ShapeClass(config.data);
    }
    initParticles(first) {
        let next = first;
        while (next) {
            this.shape.getRandPos(next);
            next = next.next;
        }
    }
}
ShapeSpawnBehavior.type = 'spawnShape';
ShapeSpawnBehavior.editorConfig = null;
/**
 * Dictionary of all registered shape classes.
 */
ShapeSpawnBehavior.shapes = {};
ShapeSpawnBehavior.registerShape(PolygonalChain);
ShapeSpawnBehavior.registerShape(Rectangle);
ShapeSpawnBehavior.registerShape(Torus);
ShapeSpawnBehavior.registerShape(Torus, 'circle');

/**
 * A Textuure behavior that assigns a single texture to each particle.
 * String values will be converted to textures with {@link ParticleUtils.GetTextureFromString}.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'textureSingle',
 *     config: {
 *         texture: Texture.from('myTexId'),
 *     }
 * }
 * ```
 */
class SingleTextureBehavior {
    constructor(config) {
        this.order = BehaviorOrder.Normal;
        this.texture = typeof config.texture === 'string' ? GetTextureFromString(config.texture) : config.texture;
    }
    initParticles(first) {
        let next = first;
        while (next) {
            next.texture = this.texture;
            next = next.next;
        }
    }
}
SingleTextureBehavior.type = 'textureSingle';
SingleTextureBehavior.editorConfig = null;

/**
 * A Movement behavior that uses an interpolated or stepped list of values for a particles speed at any given moment.
 * Movement direction is controlled by the particle's starting rotation.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'moveSpeed',
 *     config: {
 *          speed: {
 *              list: [{value: 10, time: 0}, {value: 100, time: 0.25}, {value: 0, time: 1}],
 *          },
 *          minMult: 0.8
 *     }
 * }
 * ```
 */
class SpeedBehavior {
    constructor(config) {
        this.order = BehaviorOrder.Late;
        this.list = new PropertyList(false);
        this.list.reset(PropertyNode.createList(config.speed));
        this.minMult = config.minMult ?? 1;
    }
    initParticles(first) {
        let next = first;
        while (next) {
            const mult = (Math.random() * (1 - this.minMult)) + this.minMult;
            next.config.speedMult = mult;
            if (!next.config.velocity) {
                next.config.velocity = new pixi_js__WEBPACK_IMPORTED_MODULE_0__.Point(this.list.first.value * mult, 0);
            }
            else {
                next.config.velocity.set(this.list.first.value * mult, 0);
            }
            rotatePoint(next.rotation, next.config.velocity);
            next = next.next;
        }
    }
    updateParticle(particle, deltaSec) {
        const speed = this.list.interpolate(particle.agePercent) * particle.config.speedMult;
        const vel = particle.config.velocity;
        normalize(vel);
        scaleBy(vel, speed);
        particle.x += vel.x * deltaSec;
        particle.y += vel.y * deltaSec;
    }
}
SpeedBehavior.type = 'moveSpeed';
SpeedBehavior.editorConfig = null;
/**
 * A Movement behavior that uses a randomly picked constant speed throughout a particle's lifetime.
 * Movement direction is controlled by the particle's starting rotation.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'moveSpeedStatic',
 *     config: {
 *          min: 100,
 *          max: 150
 *     }
 * }
 * ```
 */
class StaticSpeedBehavior {
    constructor(config) {
        this.order = BehaviorOrder.Late;
        this.min = config.min;
        this.max = config.max;
    }
    initParticles(first) {
        let next = first;
        while (next) {
            const speed = (Math.random() * (this.max - this.min)) + this.min;
            if (!next.config.velocity) {
                next.config.velocity = new pixi_js__WEBPACK_IMPORTED_MODULE_0__.Point(speed, 0);
            }
            else {
                next.config.velocity.set(speed, 0);
            }
            rotatePoint(next.rotation, next.config.velocity);
            next = next.next;
        }
    }
    updateParticle(particle, deltaSec) {
        const velocity = particle.config.velocity;
        particle.x += velocity.x * deltaSec;
        particle.y += velocity.y * deltaSec;
    }
}
StaticSpeedBehavior.type = 'moveSpeedStatic';
StaticSpeedBehavior.editorConfig = null;

/**
 * An individual particle image. You shouldn't have to deal with these.
 */
class Particle extends pixi_js__WEBPACK_IMPORTED_MODULE_0__.Sprite {
    /**
     * @param emitter The emitter that controls this particle.
     */
    constructor(emitter) {
        // start off the sprite with a blank texture, since we are going to replace it
        // later when the particle is initialized.
        super();
        // initialize LinkedListChild props so they are included in underlying JS class definition
        this.prevChild = this.nextChild = null;
        this.emitter = emitter;
        this.config = {};
        // particles should be centered
        this.anchor.x = this.anchor.y = 0.5;
        this.maxLife = 0;
        this.age = 0;
        this.agePercent = 0;
        this.oneOverLife = 0;
        this.next = null;
        this.prev = null;
        // save often used functions on the instance instead of the prototype for better speed
        this.init = this.init;
        this.kill = this.kill;
    }
    /**
     * Initializes the particle for use, based on the properties that have to
     * have been set already on the particle.
     */
    init(maxLife) {
        this.maxLife = maxLife;
        // reset the age
        this.age = this.agePercent = 0;
        // reset the sprite props
        this.rotation = 0;
        this.position.x = this.position.y = 0;
        this.scale.x = this.scale.y = 1;
        this.tint = 0xffffff;
        this.alpha = 1;
        // save our lerp helper
        this.oneOverLife = 1 / this.maxLife;
        // ensure visibility
        this.visible = true;
    }
    /**
     * Kills the particle, removing it from the display list
     * and telling the emitter to recycle it.
     */
    kill() {
        this.emitter.recycle(this);
    }
    /**
     * Destroys the particle, removing references and preventing future use.
     */
    destroy() {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.emitter = this.next = this.prev = null;
        super.destroy();
    }
}

// get the shared ticker, only supports V5 and V6 with individual packages
/**
 * @hidden
 */
const ticker = pixi_js__WEBPACK_IMPORTED_MODULE_0__.Ticker.shared;
/**
 * Key used in sorted order to determine when to set particle position from the emitter position
 * and rotation.
 */
const PositionParticle = Symbol('Position particle per emitter position');
/**
 * A particle emitter.
 */
class Emitter {
    /**
     * Registers a new behavior, so that it will be recognized when initializing emitters.
     * Behaviors registered later with duplicate types will override older ones, although there is no limit on
     * the allowed types.
     * @param constructor The behavior class to register.
     */
    static registerBehavior(constructor) {
        Emitter.knownBehaviors[constructor.type] = constructor;
    }
    /**
     * @param particleParent The container to add the particles to.
     * @param particleImages A texture or array of textures to use
     *                       for the particles. Strings will be turned
     *                       into textures via Texture.from().
     * @param config A configuration object containing settings for the emitter.
     * @param config.emit If config.emit is explicitly passed as false, the
     *                    Emitter will start disabled.
     * @param config.autoUpdate If config.autoUpdate is explicitly passed as
     *                          true, the Emitter will automatically call
     *                          update via the PIXI shared ticker.
     */
    constructor(particleParent, config) {
        this.initBehaviors = [];
        this.updateBehaviors = [];
        this.recycleBehaviors = [];
        // properties for individual particles
        this.minLifetime = 0;
        this.maxLifetime = 0;
        this.customEase = null;
        // properties for spawning particles
        this._frequency = 1;
        this.spawnChance = 1;
        this.maxParticles = 1000;
        this.emitterLifetime = -1;
        this.spawnPos = new pixi_js__WEBPACK_IMPORTED_MODULE_0__.Point();
        this.particlesPerWave = 1;
        // emitter properties
        this.rotation = 0;
        this.ownerPos = new pixi_js__WEBPACK_IMPORTED_MODULE_0__.Point();
        this._prevEmitterPos = new pixi_js__WEBPACK_IMPORTED_MODULE_0__.Point();
        this._prevPosIsValid = false;
        this._posChanged = false;
        this._parent = null;
        this.addAtBack = false;
        this.particleCount = 0;
        this._emit = false;
        this._spawnTimer = 0;
        this._emitterLife = -1;
        this._activeParticlesFirst = null;
        this._activeParticlesLast = null;
        this._poolFirst = null;
        this._origConfig = null;
        this._autoUpdate = false;
        this._destroyWhenComplete = false;
        this._completeCallback = null;
        // set the initial parent
        this.parent = particleParent;
        if (config) {
            this.init(config);
        }
        // save often used functions on the instance instead of the prototype for better speed
        this.recycle = this.recycle;
        this.update = this.update;
        this.rotate = this.rotate;
        this.updateSpawnPos = this.updateSpawnPos;
        this.updateOwnerPos = this.updateOwnerPos;
    }
    /**
     * Time between particle spawns in seconds. If this value is not a number greater than 0,
     * it will be set to 1 (particle per second) to prevent infinite loops.
     */
    get frequency() { return this._frequency; }
    set frequency(value) {
        // do some error checking to prevent infinite loops
        if (typeof value === 'number' && value > 0) {
            this._frequency = value;
        }
        else {
            this._frequency = 1;
        }
    }
    /**
    * The container to add particles to. Settings this will dump any active particles.
    */
    get parent() { return this._parent; }
    set parent(value) {
        this.cleanup();
        this._parent = value;
    }
    /**
     * Sets up the emitter based on the config settings.
     * @param config A configuration object containing settings for the emitter.
     */
    init(config) {
        if (!config) {
            return;
        }
        // clean up any existing particles
        this.cleanup();
        // store the original config and particle images, in case we need to re-initialize
        // when the particle constructor is changed
        this._origConfig = config;
        // /////////////////////////
        // Particle Properties    //
        // /////////////////////////
        // set up the lifetime
        this.minLifetime = config.lifetime.min;
        this.maxLifetime = config.lifetime.max;
        // use the custom ease if provided
        if (config.ease) {
            this.customEase = typeof config.ease === 'function'
                ? config.ease : generateEase(config.ease);
        }
        else {
            this.customEase = null;
        }
        // ////////////////////////
        // Emitter Properties    //
        // ////////////////////////
        // reset spawn type specific settings
        this.particlesPerWave = 1;
        if (config.particlesPerWave && config.particlesPerWave > 1) {
            this.particlesPerWave = config.particlesPerWave;
        }
        // set the spawning frequency
        this.frequency = config.frequency;
        this.spawnChance = (typeof config.spawnChance === 'number' && config.spawnChance > 0) ? config.spawnChance : 1;
        // set the emitter lifetime
        this.emitterLifetime = config.emitterLifetime || -1;
        // set the max particles
        this.maxParticles = config.maxParticles > 0 ? config.maxParticles : 1000;
        // determine if we should add the particle at the back of the list or not
        this.addAtBack = !!config.addAtBack;
        // reset the emitter position and rotation variables
        this.rotation = 0;
        this.ownerPos.set(0);
        if (config.pos) {
            this.spawnPos.copyFrom(config.pos);
        }
        else {
            this.spawnPos.set(0);
        }
        this._prevEmitterPos.copyFrom(this.spawnPos);
        // previous emitter position is invalid and should not be used for interpolation
        this._prevPosIsValid = false;
        // start emitting
        this._spawnTimer = 0;
        this.emit = config.emit === undefined ? true : !!config.emit;
        this.autoUpdate = !!config.autoUpdate;
        // ////////////////////////
        // Behaviors             //
        // ////////////////////////
        const behaviors = config.behaviors.map((data) => {
            const constructor = Emitter.knownBehaviors[data.type];
            if (!constructor) {
                console.error(`Unknown behavior: ${data.type}`);
                return null;
            }
            return new constructor(data.config);
        })
            .filter((b) => !!b);
        behaviors.push(PositionParticle);
        behaviors.sort((a, b) => {
            if (a === PositionParticle) {
                return b.order === BehaviorOrder.Spawn ? 1 : -1;
            }
            else if (b === PositionParticle) {
                return a.order === BehaviorOrder.Spawn ? -1 : 1;
            }
            return a.order - b.order;
        });
        this.initBehaviors = behaviors.slice();
        this.updateBehaviors = behaviors.filter((b) => b !== PositionParticle && b.updateParticle);
        this.recycleBehaviors = behaviors.filter((b) => b !== PositionParticle && b.recycleParticle);
    }
    /**
     * Gets the instantiated behavior of the specified type, if it is present on this emitter.
     * @param type The behavior type to find.
     */
    getBehavior(type) {
        // bail if we don't know about such an emitter
        if (!Emitter.knownBehaviors[type])
            return null;
        // find one that is an instance of the specified type
        return this.initBehaviors.find((b) => b instanceof Emitter.knownBehaviors[type]) || null;
    }
    /**
     * Fills the pool with the specified number of particles, so that they don't have to be instantiated later.
     * @param count The number of particles to create.
     */
    fillPool(count) {
        for (; count > 0; --count) {
            const p = new Particle(this);
            p.next = this._poolFirst;
            this._poolFirst = p;
        }
    }
    /**
     * Recycles an individual particle. For internal use only.
     * @param particle The particle to recycle.
     * @param fromCleanup If this is being called to manually clean up all particles.
     * @internal
     */
    recycle(particle, fromCleanup = false) {
        for (let i = 0; i < this.recycleBehaviors.length; ++i) {
            this.recycleBehaviors[i].recycleParticle(particle, !fromCleanup);
        }
        if (particle.next) {
            particle.next.prev = particle.prev;
        }
        if (particle.prev) {
            particle.prev.next = particle.next;
        }
        if (particle === this._activeParticlesLast) {
            this._activeParticlesLast = particle.prev;
        }
        if (particle === this._activeParticlesFirst) {
            this._activeParticlesFirst = particle.next;
        }
        // add to pool
        particle.prev = null;
        particle.next = this._poolFirst;
        this._poolFirst = particle;
        // remove child from display, or make it invisible if it is in a ParticleContainer
        if (particle.parent) {
            particle.parent.removeChild(particle);
        }
        // decrease count
        --this.particleCount;
    }
    /**
     * Sets the rotation of the emitter to a new value. This rotates the spawn position in addition
     * to particle direction.
     * @param newRot The new rotation, in degrees.
     */
    rotate(newRot) {
        if (this.rotation === newRot)
            return;
        // caclulate the difference in rotation for rotating spawnPos
        const diff = newRot - this.rotation;
        this.rotation = newRot;
        // rotate spawnPos
        rotatePoint(diff, this.spawnPos);
        // mark the position as having changed
        this._posChanged = true;
    }
    /**
     * Changes the spawn position of the emitter.
     * @param x The new x value of the spawn position for the emitter.
     * @param y The new y value of the spawn position for the emitter.
     */
    updateSpawnPos(x, y) {
        this._posChanged = true;
        this.spawnPos.x = x;
        this.spawnPos.y = y;
    }
    /**
     * Changes the position of the emitter's owner. You should call this if you are adding
     * particles to the world container that your emitter's owner is moving around in.
     * @param x The new x value of the emitter's owner.
     * @param y The new y value of the emitter's owner.
     */
    updateOwnerPos(x, y) {
        this._posChanged = true;
        this.ownerPos.x = x;
        this.ownerPos.y = y;
    }
    /**
     * Prevents emitter position interpolation in the next update.
     * This should be used if you made a major position change of your emitter's owner
     * that was not normal movement.
     */
    resetPositionTracking() {
        this._prevPosIsValid = false;
    }
    /**
     * If particles should be emitted during update() calls. Setting this to false
     * stops new particles from being created, but allows existing ones to die out.
     */
    get emit() { return this._emit; }
    set emit(value) {
        this._emit = !!value;
        this._emitterLife = this.emitterLifetime;
    }
    /**
     * If the update function is called automatically from the shared ticker.
     * Setting this to false requires calling the update function manually.
     */
    get autoUpdate() { return this._autoUpdate; }
    set autoUpdate(value) {
        if (this._autoUpdate && !value) {
            ticker.remove(this.update, this);
        }
        else if (!this._autoUpdate && value) {
            ticker.add(this.update, this);
        }
        this._autoUpdate = !!value;
    }
    /**
     * Starts emitting particles, sets autoUpdate to true, and sets up the Emitter to destroy itself
     * when particle emission is complete.
     * @param callback Callback for when emission is complete (all particles have died off)
     */
    playOnceAndDestroy(callback) {
        this.autoUpdate = true;
        this.emit = true;
        this._destroyWhenComplete = true;
        this._completeCallback = callback;
    }
    /**
     * Starts emitting particles and optionally calls a callback when particle emission is complete.
     * @param callback Callback for when emission is complete (all particles have died off)
     */
    playOnce(callback) {
        this.emit = true;
        this._completeCallback = callback;
    }
    /**
     * Updates all particles spawned by this emitter and emits new ones.
     * @param delta Time elapsed since the previous frame, in __seconds__. Or Ticker instance for pixi.js v8.0.0
     */
    update(delta) {
        if (typeof delta !== 'number') {
            delta = delta.deltaTime;
        }
        if (this._autoUpdate) {
            delta = ticker.elapsedMS * 0.001;
        }
        // if we don't have a parent to add particles to, then don't do anything.
        // this also works as a isDestroyed check
        if (!this._parent)
            return;
        // == update existing particles ==
        // update all particle lifetimes before turning them over to behaviors
        for (let particle = this._activeParticlesFirst, next; particle; particle = next) {
            // save next particle in case we recycle this one
            next = particle.next;
            // increase age
            particle.age += delta;
            // recycle particle if it is too old
            if (particle.age > particle.maxLife || particle.age < 0) {
                this.recycle(particle);
            }
            else {
                // determine our interpolation value
                let lerp = particle.age * particle.oneOverLife; // lifetime / maxLife;
                // global ease affects all interpolation calculations
                if (this.customEase) {
                    if (this.customEase.length === 4) {
                        // the t, b, c, d parameters that some tween libraries use
                        // (time, initial value, end value, duration)
                        lerp = this.customEase(lerp, 0, 1, 1);
                    }
                    else {
                        // the simplified version that we like that takes
                        // one parameter, time from 0-1. TweenJS eases provide this usage.
                        lerp = this.customEase(lerp);
                    }
                }
                // set age percent for all interpolation calculations
                particle.agePercent = lerp;
                // let each behavior run wild on the active particles
                for (let i = 0; i < this.updateBehaviors.length; ++i) {
                    if (this.updateBehaviors[i].updateParticle(particle, delta)) {
                        this.recycle(particle);
                        break;
                    }
                }
            }
        }
        let prevX;
        let prevY;
        // if the previous position is valid, store these for later interpolation
        if (this._prevPosIsValid) {
            prevX = this._prevEmitterPos.x;
            prevY = this._prevEmitterPos.y;
        }
        // store current position of the emitter as local variables
        const curX = this.ownerPos.x + this.spawnPos.x;
        const curY = this.ownerPos.y + this.spawnPos.y;
        // spawn new particles
        if (this._emit) {
            // decrease spawn timer
            this._spawnTimer -= delta < 0 ? 0 : delta;
            // while _spawnTimer < 0, we have particles to spawn
            while (this._spawnTimer <= 0) {
                // determine if the emitter should stop spawning
                if (this._emitterLife >= 0) {
                    this._emitterLife -= this._frequency;
                    if (this._emitterLife <= 0) {
                        this._spawnTimer = 0;
                        this._emitterLife = 0;
                        this.emit = false;
                        break;
                    }
                }
                // determine if we have hit the particle limit
                if (this.particleCount >= this.maxParticles) {
                    this._spawnTimer += this._frequency;
                    continue;
                }
                let emitPosX;
                let emitPosY;
                // If the position has changed and this isn't the first spawn,
                // interpolate the spawn position
                if (this._prevPosIsValid && this._posChanged) {
                    // 1 - _spawnTimer / delta, but _spawnTimer is negative
                    const lerp = 1 + (this._spawnTimer / delta);
                    emitPosX = ((curX - prevX) * lerp) + prevX;
                    emitPosY = ((curY - prevY) * lerp) + prevY;
                }
                // otherwise just set to the spawn position
                else {
                    emitPosX = curX;
                    emitPosY = curY;
                }
                let waveFirst = null;
                let waveLast = null;
                // create enough particles to fill the wave
                for (let len = Math.min(this.particlesPerWave, this.maxParticles - this.particleCount), i = 0; i < len; ++i) {
                    // see if we actually spawn one
                    if (this.spawnChance < 1 && Math.random() >= this.spawnChance) {
                        continue;
                    }
                    // determine the particle lifetime
                    let lifetime;
                    if (this.minLifetime === this.maxLifetime) {
                        lifetime = this.minLifetime;
                    }
                    else {
                        lifetime = (Math.random() * (this.maxLifetime - this.minLifetime)) + this.minLifetime;
                    }
                    // only make the particle if it wouldn't immediately destroy itself
                    if (-this._spawnTimer >= lifetime) {
                        continue;
                    }
                    // create particle
                    let p;
                    if (this._poolFirst) {
                        p = this._poolFirst;
                        this._poolFirst = this._poolFirst.next;
                        p.next = null;
                    }
                    else {
                        p = new Particle(this);
                    }
                    // initialize particle
                    p.init(lifetime);
                    // add the particle to the display list
                    if (this.addAtBack) {
                        this._parent.addChildAt(p, 0);
                    }
                    else {
                        this._parent.addChild(p);
                    }
                    // add particles to list of ones in this wave
                    if (waveFirst) {
                        waveLast.next = p;
                        p.prev = waveLast;
                        waveLast = p;
                    }
                    else {
                        waveLast = waveFirst = p;
                    }
                    // increase our particle count
                    ++this.particleCount;
                }
                if (waveFirst) {
                    // add particle to list of active particles
                    if (this._activeParticlesLast) {
                        this._activeParticlesLast.next = waveFirst;
                        waveFirst.prev = this._activeParticlesLast;
                        this._activeParticlesLast = waveLast;
                    }
                    else {
                        this._activeParticlesFirst = waveFirst;
                        this._activeParticlesLast = waveLast;
                    }
                    // run behavior init on particles
                    for (let i = 0; i < this.initBehaviors.length; ++i) {
                        const behavior = this.initBehaviors[i];
                        // if we hit our special key, interrupt behaviors to apply
                        // emitter position/rotation
                        if (behavior === PositionParticle) {
                            for (let particle = waveFirst, next; particle; particle = next) {
                                // save next particle in case we recycle this one
                                next = particle.next;
                                // rotate the particle's position by the emitter's rotation
                                if (this.rotation !== 0) {
                                    rotatePoint(this.rotation, particle.position);
                                    particle.rotation += this.rotation;
                                }
                                // offset by the emitter's position
                                particle.position.x += emitPosX;
                                particle.position.y += emitPosY;
                                // also, just update the particle's age properties while we are looping through
                                particle.age += -this._spawnTimer;
                                // determine our interpolation value
                                let lerp = particle.age * particle.oneOverLife; // lifetime / maxLife;
                                // global ease affects all interpolation calculations
                                if (this.customEase) {
                                    if (this.customEase.length === 4) {
                                        // the t, b, c, d parameters that some tween libraries use
                                        // (time, initial value, end value, duration)
                                        lerp = this.customEase(lerp, 0, 1, 1);
                                    }
                                    else {
                                        // the simplified version that we like that takes
                                        // one parameter, time from 0-1. TweenJS eases provide this usage.
                                        lerp = this.customEase(lerp);
                                    }
                                }
                                // set age percent for all interpolation calculations
                                particle.agePercent = lerp;
                            }
                        }
                        else {
                            behavior.initParticles(waveFirst);
                        }
                    }
                    for (let particle = waveFirst, next; particle; particle = next) {
                        // save next particle in case we recycle this one
                        next = particle.next;
                        // now update the particles by the time passed, so the particles are spread out properly
                        for (let i = 0; i < this.updateBehaviors.length; ++i) {
                            // we want a positive delta, because a negative delta messes things up
                            if (this.updateBehaviors[i].updateParticle(particle, -this._spawnTimer)) {
                                // bail if the particle got reycled
                                this.recycle(particle);
                                break;
                            }
                        }
                    }
                }
                // increase timer and continue on to any other particles that need to be created
                this._spawnTimer += this._frequency;
            }
        }
        // if the position changed before this update, then keep track of that
        if (this._posChanged) {
            this._prevEmitterPos.x = curX;
            this._prevEmitterPos.y = curY;
            this._prevPosIsValid = true;
            this._posChanged = false;
        }
        // if we are all done and should destroy ourselves, take care of that
        if (!this._emit && !this._activeParticlesFirst) {
            if (this._completeCallback) {
                const cb = this._completeCallback;
                this._completeCallback = null;
                cb();
            }
            if (this._destroyWhenComplete) {
                this.destroy();
            }
        }
    }
    /**
     * Emits a single wave of particles, using standard spawnChance & particlesPerWave settings. Does not affect
     * regular spawning through the frequency, and ignores the emit property. The max particle count is respected, however,
     * so if there are already too many particles then nothing will happen.
     */
    emitNow() {
        const emitPosX = this.ownerPos.x + this.spawnPos.x;
        const emitPosY = this.ownerPos.y + this.spawnPos.y;
        let waveFirst = null;
        let waveLast = null;
        // create enough particles to fill the wave
        for (let len = Math.min(this.particlesPerWave, this.maxParticles - this.particleCount), i = 0; i < len; ++i) {
            // see if we actually spawn one
            if (this.spawnChance < 1 && Math.random() >= this.spawnChance) {
                continue;
            }
            // create particle
            let p;
            if (this._poolFirst) {
                p = this._poolFirst;
                this._poolFirst = this._poolFirst.next;
                p.next = null;
            }
            else {
                p = new Particle(this);
            }
            let lifetime;
            if (this.minLifetime === this.maxLifetime) {
                lifetime = this.minLifetime;
            }
            else {
                lifetime = (Math.random() * (this.maxLifetime - this.minLifetime)) + this.minLifetime;
            }
            // initialize particle
            p.init(lifetime);
            // add the particle to the display list
            if (this.addAtBack) {
                this._parent.addChildAt(p, 0);
            }
            else {
                this._parent.addChild(p);
            }
            // add particles to list of ones in this wave
            if (waveFirst) {
                waveLast.next = p;
                p.prev = waveLast;
                waveLast = p;
            }
            else {
                waveLast = waveFirst = p;
            }
            // increase our particle count
            ++this.particleCount;
        }
        if (waveFirst) {
            // add particle to list of active particles
            if (this._activeParticlesLast) {
                this._activeParticlesLast.next = waveFirst;
                waveFirst.prev = this._activeParticlesLast;
                this._activeParticlesLast = waveLast;
            }
            else {
                this._activeParticlesFirst = waveFirst;
                this._activeParticlesLast = waveLast;
            }
            // run behavior init on particles
            for (let i = 0; i < this.initBehaviors.length; ++i) {
                const behavior = this.initBehaviors[i];
                // if we hit our special key, interrupt behaviors to apply
                // emitter position/rotation
                if (behavior === PositionParticle) {
                    for (let particle = waveFirst, next; particle; particle = next) {
                        // save next particle in case we recycle this one
                        next = particle.next;
                        // rotate the particle's position by the emitter's rotation
                        if (this.rotation !== 0) {
                            rotatePoint(this.rotation, particle.position);
                            particle.rotation += this.rotation;
                        }
                        // offset by the emitter's position
                        particle.position.x += emitPosX;
                        particle.position.y += emitPosY;
                    }
                }
                else {
                    behavior.initParticles(waveFirst);
                }
            }
        }
    }
    /**
     * Kills all active particles immediately.
     */
    cleanup() {
        let particle;
        let next;
        for (particle = this._activeParticlesFirst; particle; particle = next) {
            next = particle.next;
            this.recycle(particle, true);
        }
        this._activeParticlesFirst = this._activeParticlesLast = null;
        this.particleCount = 0;
    }
    /**
     * If this emitter has been destroyed. Note that a destroyed emitter can still be reused, after
     * having a new parent set and being reinitialized.
     */
    get destroyed() {
        return !(this._parent && this.initBehaviors.length);
    }
    /**
     * Destroys the emitter and all of its particles.
     */
    destroy() {
        // make sure we aren't still listening to any tickers
        this.autoUpdate = false;
        // puts all active particles in the pool, and removes them from the particle parent
        this.cleanup();
        // wipe the pool clean
        let next;
        for (let particle = this._poolFirst; particle; particle = next) {
            // store next value so we don't lose it in our destroy call
            next = particle.next;
            particle.destroy();
        }
        this._poolFirst = this._parent = this.spawnPos = this.ownerPos
            = this.customEase = this._completeCallback = null;
        this.initBehaviors.length = this.updateBehaviors.length = this.recycleBehaviors.length = 0;
    }
}
Emitter.knownBehaviors = {};

/**
 * Converts emitter configuration from pre-5.0.0 library values into the current version.
 *
 * Example usage:
 * ```javascript
 * const emitter = new Emitter(myContainer, upgradeConfig(myOldConfig, [myTexture, myOtherTexture]));
 * ```
 * @param config The old emitter config to upgrade.
 * @param art The old art values as would have been passed into the Emitter constructor or `Emitter.init()`
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function upgradeConfig(config, art) {
    // just ensure we aren't given any V3 config data
    if ('behaviors' in config) {
        return config;
    }
    const out = {
        lifetime: config.lifetime,
        ease: config.ease,
        particlesPerWave: config.particlesPerWave,
        frequency: config.frequency,
        spawnChance: config.spawnChance,
        emitterLifetime: config.emitterLifetime,
        maxParticles: config.maxParticles,
        addAtBack: config.addAtBack,
        pos: config.pos,
        emit: config.emit,
        autoUpdate: config.autoUpdate,
        behaviors: [],
    };
    // set up the alpha
    if (config.alpha) {
        if ('start' in config.alpha) {
            if (config.alpha.start === config.alpha.end) {
                if (config.alpha.start !== 1) {
                    out.behaviors.push({
                        type: 'alphaStatic',
                        config: { alpha: config.alpha.start },
                    });
                }
            }
            else {
                const list = {
                    list: [
                        { time: 0, value: config.alpha.start },
                        { time: 1, value: config.alpha.end },
                    ],
                };
                out.behaviors.push({
                    type: 'alpha',
                    config: { alpha: list },
                });
            }
        }
        else if (config.alpha.list.length === 1) {
            if (config.alpha.list[0].value !== 1) {
                out.behaviors.push({
                    type: 'alphaStatic',
                    config: { alpha: config.alpha.list[0].value },
                });
            }
        }
        else {
            out.behaviors.push({
                type: 'alpha',
                config: { alpha: config.alpha },
            });
        }
    }
    // acceleration movement
    if (config.acceleration && (config.acceleration.x || config.acceleration.y)) {
        let minStart;
        let maxStart;
        if ('start' in config.speed) {
            minStart = config.speed.start * (config.speed.minimumSpeedMultiplier ?? 1);
            maxStart = config.speed.start;
        }
        else {
            minStart = config.speed.list[0].value * (config.minimumSpeedMultiplier ?? 1);
            maxStart = config.speed.list[0].value;
        }
        out.behaviors.push({
            type: 'moveAcceleration',
            config: {
                accel: config.acceleration,
                minStart,
                maxStart,
                rotate: !config.noRotation,
                maxSpeed: config.maxSpeed,
            },
        });
    }
    // path movement
    else if (config.extraData?.path) {
        let list;
        let mult;
        if ('start' in config.speed) {
            mult = config.speed.minimumSpeedMultiplier ?? 1;
            if (config.speed.start === config.speed.end) {
                list = {
                    list: [{ time: 0, value: config.speed.start }],
                };
            }
            else {
                list = {
                    list: [
                        { time: 0, value: config.speed.start },
                        { time: 1, value: config.speed.end },
                    ],
                };
            }
        }
        else {
            list = config.speed;
            mult = (config.minimumSpeedMultiplier ?? 1);
        }
        out.behaviors.push({
            type: 'movePath',
            config: {
                path: config.extraData.path,
                speed: list,
                minMult: mult,
            },
        });
    }
    // normal speed movement
    else {
        if (config.speed) {
            if ('start' in config.speed) {
                if (config.speed.start === config.speed.end) {
                    out.behaviors.push({
                        type: 'moveSpeedStatic',
                        config: {
                            min: config.speed.start * (config.speed.minimumSpeedMultiplier ?? 1),
                            max: config.speed.start,
                        },
                    });
                }
                else {
                    const list = {
                        list: [
                            { time: 0, value: config.speed.start },
                            { time: 1, value: config.speed.end },
                        ],
                    };
                    out.behaviors.push({
                        type: 'moveSpeed',
                        config: { speed: list, minMult: config.speed.minimumSpeedMultiplier },
                    });
                }
            }
            else if (config.speed.list.length === 1) {
                out.behaviors.push({
                    type: 'moveSpeedStatic',
                    config: {
                        min: config.speed.list[0].value * (config.minimumSpeedMultiplier ?? 1),
                        max: config.speed.list[0].value,
                    },
                });
            }
            else {
                out.behaviors.push({
                    type: 'moveSpeed',
                    config: { speed: config.speed, minMult: (config.minimumSpeedMultiplier ?? 1) },
                });
            }
        }
    }
    // scale
    if (config.scale) {
        if ('start' in config.scale) {
            const mult = config.scale.minimumScaleMultiplier ?? 1;
            if (config.scale.start === config.scale.end) {
                out.behaviors.push({
                    type: 'scaleStatic',
                    config: {
                        min: config.scale.start * mult,
                        max: config.scale.start,
                    },
                });
            }
            else {
                const list = {
                    list: [
                        { time: 0, value: config.scale.start },
                        { time: 1, value: config.scale.end },
                    ],
                };
                out.behaviors.push({
                    type: 'scale',
                    config: { scale: list, minMult: mult },
                });
            }
        }
        else if (config.scale.list.length === 1) {
            const mult = config.minimumScaleMultiplier ?? 1;
            const scale = config.scale.list[0].value;
            out.behaviors.push({
                type: 'scaleStatic',
                config: { min: scale * mult, max: scale },
            });
        }
        else {
            out.behaviors.push({
                type: 'scale',
                config: { scale: config.scale, minMult: config.minimumScaleMultiplier ?? 1 },
            });
        }
    }
    // color
    if (config.color) {
        if ('start' in config.color) {
            if (config.color.start === config.color.end) {
                if (config.color.start !== 'ffffff') {
                    out.behaviors.push({
                        type: 'colorStatic',
                        config: { color: config.color.start },
                    });
                }
            }
            else {
                const list = {
                    list: [
                        { time: 0, value: config.color.start },
                        { time: 1, value: config.color.end },
                    ],
                };
                out.behaviors.push({
                    type: 'color',
                    config: { color: list },
                });
            }
        }
        else if (config.color.list.length === 1) {
            if (config.color.list[0].value !== 'ffffff') {
                out.behaviors.push({
                    type: 'colorStatic',
                    config: { color: config.color.list[0].value },
                });
            }
        }
        else {
            out.behaviors.push({
                type: 'color',
                config: { color: config.color },
            });
        }
    }
    // rotation
    if (config.rotationAcceleration || config.rotationSpeed?.min || config.rotationSpeed?.max) {
        out.behaviors.push({
            type: 'rotation',
            config: {
                accel: config.rotationAcceleration || 0,
                minSpeed: config.rotationSpeed?.min || 0,
                maxSpeed: config.rotationSpeed?.max || 0,
                minStart: config.startRotation?.min || 0,
                maxStart: config.startRotation?.max || 0,
            },
        });
    }
    else if (config.startRotation?.min || config.startRotation?.max) {
        out.behaviors.push({
            type: 'rotationStatic',
            config: {
                min: config.startRotation?.min || 0,
                max: config.startRotation?.max || 0,
            },
        });
    }
    if (config.noRotation) {
        out.behaviors.push({
            type: 'noRotation',
            config: {},
        });
    }
    // blend mode
    if (config.blendMode && config.blendMode !== 'normal') {
        out.behaviors.push({
            type: 'blendMode',
            config: {
                blendMode: config.blendMode,
            },
        });
    }
    // animated
    if (Array.isArray(art) && typeof art[0] !== 'string' && 'framerate' in art[0]) {
        for (let i = 0; i < art.length; ++i) {
            if (art[i].framerate === 'matchLife') {
                art[i].framerate = -1;
            }
        }
        out.behaviors.push({
            type: 'animatedRandom',
            config: {
                anims: art,
            },
        });
    }
    else if (typeof art !== 'string' && 'framerate' in art) {
        if (art.framerate === 'matchLife') {
            art.framerate = -1;
        }
        out.behaviors.push({
            type: 'animatedSingle',
            config: {
                anim: art,
            },
        });
    }
    // ordered art
    else if (config.orderedArt && Array.isArray(art)) {
        out.behaviors.push({
            type: 'textureOrdered',
            config: {
                textures: art,
            },
        });
    }
    // random texture
    else if (Array.isArray(art)) {
        out.behaviors.push({
            type: 'textureRandom',
            config: {
                textures: art,
            },
        });
    }
    // single texture
    else {
        out.behaviors.push({
            type: 'textureSingle',
            config: {
                texture: art,
            },
        });
    }
    // spawn burst
    if (config.spawnType === 'burst') {
        out.behaviors.push({
            type: 'spawnBurst',
            config: {
                start: config.angleStart || 0,
                spacing: config.particleSpacing,
                // older formats bursted from a single point
                distance: 0,
            },
        });
    }
    // spawn point
    else if (config.spawnType === 'point') {
        out.behaviors.push({
            type: 'spawnPoint',
            config: {},
        });
    }
    // spawn shape
    else {
        let shape;
        if (config.spawnType === 'ring') {
            shape = {
                type: 'torus',
                data: {
                    x: config.spawnCircle.x,
                    y: config.spawnCircle.y,
                    radius: config.spawnCircle.r,
                    innerRadius: config.spawnCircle.minR,
                    affectRotation: true,
                },
            };
        }
        else if (config.spawnType === 'circle') {
            shape = {
                type: 'torus',
                data: {
                    x: config.spawnCircle.x,
                    y: config.spawnCircle.y,
                    radius: config.spawnCircle.r,
                    innerRadius: 0,
                    affectRotation: false,
                },
            };
        }
        else if (config.spawnType === 'rect') {
            shape = {
                type: 'rect',
                data: config.spawnRect,
            };
        }
        else if (config.spawnType === 'polygonalChain') {
            shape = {
                type: 'polygonalChain',
                data: config.spawnPolygon,
            };
        }
        if (shape) {
            out.behaviors.push({
                type: 'spawnShape',
                config: shape,
            });
        }
    }
    return out;
}

Emitter.registerBehavior(AccelerationBehavior);
Emitter.registerBehavior(AlphaBehavior);
Emitter.registerBehavior(StaticAlphaBehavior);
Emitter.registerBehavior(RandomAnimatedTextureBehavior);
Emitter.registerBehavior(SingleAnimatedTextureBehavior);
Emitter.registerBehavior(BlendModeBehavior);
Emitter.registerBehavior(BurstSpawnBehavior);
Emitter.registerBehavior(ColorBehavior);
Emitter.registerBehavior(StaticColorBehavior);
Emitter.registerBehavior(OrderedTextureBehavior);
Emitter.registerBehavior(PathBehavior);
Emitter.registerBehavior(PointSpawnBehavior);
Emitter.registerBehavior(RandomTextureBehavior);
Emitter.registerBehavior(RotationBehavior);
Emitter.registerBehavior(StaticRotationBehavior);
Emitter.registerBehavior(NoRotationBehavior);
Emitter.registerBehavior(ScaleBehavior);
Emitter.registerBehavior(StaticScaleBehavior);
Emitter.registerBehavior(ShapeSpawnBehavior);
Emitter.registerBehavior(SingleTextureBehavior);
Emitter.registerBehavior(SpeedBehavior);
Emitter.registerBehavior(StaticSpeedBehavior);


//# sourceMappingURL=particle-emitter.es.js.map


/***/ }),

/***/ 880:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Back: () => (/* reexport */ Back),
  Bounce: () => (/* reexport */ Bounce),
  CSSPlugin: () => (/* reexport */ CSSPlugin),
  Circ: () => (/* reexport */ Circ),
  Cubic: () => (/* reexport */ Cubic),
  Elastic: () => (/* reexport */ Elastic),
  Expo: () => (/* reexport */ Expo),
  Linear: () => (/* reexport */ Linear),
  Power0: () => (/* reexport */ Power0),
  Power1: () => (/* reexport */ Power1),
  Power2: () => (/* reexport */ Power2),
  Power3: () => (/* reexport */ Power3),
  Power4: () => (/* reexport */ Power4),
  Quad: () => (/* reexport */ Quad),
  Quart: () => (/* reexport */ Quart),
  Quint: () => (/* reexport */ Quint),
  Sine: () => (/* reexport */ Sine),
  SteppedEase: () => (/* reexport */ SteppedEase),
  Strong: () => (/* reexport */ Strong),
  TimelineLite: () => (/* reexport */ Timeline),
  TimelineMax: () => (/* reexport */ Timeline),
  TweenLite: () => (/* reexport */ Tween),
  TweenMax: () => (/* binding */ TweenMaxWithCSS),
  "default": () => (/* binding */ gsapWithCSS),
  gsap: () => (/* binding */ gsapWithCSS)
});

;// CONCATENATED MODULE: ./node_modules/gsap/gsap-core.js
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

/*!
 * GSAP 3.12.5
 * https://gsap.com
 *
 * @license Copyright 2008-2024, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license or for
 * Club GSAP members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/

/* eslint-disable */
var _config = {
  autoSleep: 120,
  force3D: "auto",
  nullTargetWarn: 1,
  units: {
    lineHeight: ""
  }
},
    _defaults = {
  duration: .5,
  overwrite: false,
  delay: 0
},
    _suppressOverwrites,
    _reverting,
    _context,
    _bigNum = 1e8,
    _tinyNum = 1 / _bigNum,
    _2PI = Math.PI * 2,
    _HALF_PI = _2PI / 4,
    _gsID = 0,
    _sqrt = Math.sqrt,
    _cos = Math.cos,
    _sin = Math.sin,
    _isString = function _isString(value) {
  return typeof value === "string";
},
    _isFunction = function _isFunction(value) {
  return typeof value === "function";
},
    _isNumber = function _isNumber(value) {
  return typeof value === "number";
},
    _isUndefined = function _isUndefined(value) {
  return typeof value === "undefined";
},
    _isObject = function _isObject(value) {
  return typeof value === "object";
},
    _isNotFalse = function _isNotFalse(value) {
  return value !== false;
},
    _windowExists = function _windowExists() {
  return typeof window !== "undefined";
},
    _isFuncOrString = function _isFuncOrString(value) {
  return _isFunction(value) || _isString(value);
},
    _isTypedArray = typeof ArrayBuffer === "function" && ArrayBuffer.isView || function () {},
    // note: IE10 has ArrayBuffer, but NOT ArrayBuffer.isView().
_isArray = Array.isArray,
    _strictNumExp = /(?:-?\.?\d|\.)+/gi,
    //only numbers (including negatives and decimals) but NOT relative values.
_numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,
    //finds any numbers, including ones that start with += or -=, negative numbers, and ones in scientific notation like 1e-8.
_numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g,
    _complexStringNumExp = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,
    //duplicate so that while we're looping through matches from exec(), it doesn't contaminate the lastIndex of _numExp which we use to search for colors too.
_relExp = /[+-]=-?[.\d]+/,
    _delimitedValueExp = /[^,'"\[\]\s]+/gi,
    // previously /[#\-+.]*\b[a-z\d\-=+%.]+/gi but didn't catch special characters.
_unitExp = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,
    _globalTimeline,
    _win,
    _coreInitted,
    _doc,
    _globals = {},
    _installScope = {},
    _coreReady,
    _install = function _install(scope) {
  return (_installScope = _merge(scope, _globals)) && gsap;
},
    _missingPlugin = function _missingPlugin(property, value) {
  return console.warn("Invalid property", property, "set to", value, "Missing plugin? gsap.registerPlugin()");
},
    _warn = function _warn(message, suppress) {
  return !suppress && console.warn(message);
},
    _addGlobal = function _addGlobal(name, obj) {
  return name && (_globals[name] = obj) && _installScope && (_installScope[name] = obj) || _globals;
},
    _emptyFunc = function _emptyFunc() {
  return 0;
},
    _startAtRevertConfig = {
  suppressEvents: true,
  isStart: true,
  kill: false
},
    _revertConfigNoKill = {
  suppressEvents: true,
  kill: false
},
    _revertConfig = {
  suppressEvents: true
},
    _reservedProps = {},
    _lazyTweens = [],
    _lazyLookup = {},
    _lastRenderedFrame,
    _plugins = {},
    _effects = {},
    _nextGCFrame = 30,
    _harnessPlugins = [],
    _callbackNames = "",
    _harness = function _harness(targets) {
  var target = targets[0],
      harnessPlugin,
      i;
  _isObject(target) || _isFunction(target) || (targets = [targets]);

  if (!(harnessPlugin = (target._gsap || {}).harness)) {
    // find the first target with a harness. We assume targets passed into an animation will be of similar type, meaning the same kind of harness can be used for them all (performance optimization)
    i = _harnessPlugins.length;

    while (i-- && !_harnessPlugins[i].targetTest(target)) {}

    harnessPlugin = _harnessPlugins[i];
  }

  i = targets.length;

  while (i--) {
    targets[i] && (targets[i]._gsap || (targets[i]._gsap = new GSCache(targets[i], harnessPlugin))) || targets.splice(i, 1);
  }

  return targets;
},
    _getCache = function _getCache(target) {
  return target._gsap || _harness(toArray(target))[0]._gsap;
},
    _getProperty = function _getProperty(target, property, v) {
  return (v = target[property]) && _isFunction(v) ? target[property]() : _isUndefined(v) && target.getAttribute && target.getAttribute(property) || v;
},
    _forEachName = function _forEachName(names, func) {
  return (names = names.split(",")).forEach(func) || names;
},
    //split a comma-delimited list of names into an array, then run a forEach() function and return the split array (this is just a way to consolidate/shorten some code).
_round = function _round(value) {
  return Math.round(value * 100000) / 100000 || 0;
},
    _roundPrecise = function _roundPrecise(value) {
  return Math.round(value * 10000000) / 10000000 || 0;
},
    // increased precision mostly for timing values.
_parseRelative = function _parseRelative(start, value) {
  var operator = value.charAt(0),
      end = parseFloat(value.substr(2));
  start = parseFloat(start);
  return operator === "+" ? start + end : operator === "-" ? start - end : operator === "*" ? start * end : start / end;
},
    _arrayContainsAny = function _arrayContainsAny(toSearch, toFind) {
  //searches one array to find matches for any of the items in the toFind array. As soon as one is found, it returns true. It does NOT return all the matches; it's simply a boolean search.
  var l = toFind.length,
      i = 0;

  for (; toSearch.indexOf(toFind[i]) < 0 && ++i < l;) {}

  return i < l;
},
    _lazyRender = function _lazyRender() {
  var l = _lazyTweens.length,
      a = _lazyTweens.slice(0),
      i,
      tween;

  _lazyLookup = {};
  _lazyTweens.length = 0;

  for (i = 0; i < l; i++) {
    tween = a[i];
    tween && tween._lazy && (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
  }
},
    _lazySafeRender = function _lazySafeRender(animation, time, suppressEvents, force) {
  _lazyTweens.length && !_reverting && _lazyRender();
  animation.render(time, suppressEvents, force || _reverting && time < 0 && (animation._initted || animation._startAt));
  _lazyTweens.length && !_reverting && _lazyRender(); //in case rendering caused any tweens to lazy-init, we should render them because typically when someone calls seek() or time() or progress(), they expect an immediate render.
},
    _numericIfPossible = function _numericIfPossible(value) {
  var n = parseFloat(value);
  return (n || n === 0) && (value + "").match(_delimitedValueExp).length < 2 ? n : _isString(value) ? value.trim() : value;
},
    _passThrough = function _passThrough(p) {
  return p;
},
    _setDefaults = function _setDefaults(obj, defaults) {
  for (var p in defaults) {
    p in obj || (obj[p] = defaults[p]);
  }

  return obj;
},
    _setKeyframeDefaults = function _setKeyframeDefaults(excludeDuration) {
  return function (obj, defaults) {
    for (var p in defaults) {
      p in obj || p === "duration" && excludeDuration || p === "ease" || (obj[p] = defaults[p]);
    }
  };
},
    _merge = function _merge(base, toMerge) {
  for (var p in toMerge) {
    base[p] = toMerge[p];
  }

  return base;
},
    _mergeDeep = function _mergeDeep(base, toMerge) {
  for (var p in toMerge) {
    p !== "__proto__" && p !== "constructor" && p !== "prototype" && (base[p] = _isObject(toMerge[p]) ? _mergeDeep(base[p] || (base[p] = {}), toMerge[p]) : toMerge[p]);
  }

  return base;
},
    _copyExcluding = function _copyExcluding(obj, excluding) {
  var copy = {},
      p;

  for (p in obj) {
    p in excluding || (copy[p] = obj[p]);
  }

  return copy;
},
    _inheritDefaults = function _inheritDefaults(vars) {
  var parent = vars.parent || _globalTimeline,
      func = vars.keyframes ? _setKeyframeDefaults(_isArray(vars.keyframes)) : _setDefaults;

  if (_isNotFalse(vars.inherit)) {
    while (parent) {
      func(vars, parent.vars.defaults);
      parent = parent.parent || parent._dp;
    }
  }

  return vars;
},
    _arraysMatch = function _arraysMatch(a1, a2) {
  var i = a1.length,
      match = i === a2.length;

  while (match && i-- && a1[i] === a2[i]) {}

  return i < 0;
},
    _addLinkedListItem = function _addLinkedListItem(parent, child, firstProp, lastProp, sortBy) {
  if (firstProp === void 0) {
    firstProp = "_first";
  }

  if (lastProp === void 0) {
    lastProp = "_last";
  }

  var prev = parent[lastProp],
      t;

  if (sortBy) {
    t = child[sortBy];

    while (prev && prev[sortBy] > t) {
      prev = prev._prev;
    }
  }

  if (prev) {
    child._next = prev._next;
    prev._next = child;
  } else {
    child._next = parent[firstProp];
    parent[firstProp] = child;
  }

  if (child._next) {
    child._next._prev = child;
  } else {
    parent[lastProp] = child;
  }

  child._prev = prev;
  child.parent = child._dp = parent;
  return child;
},
    _removeLinkedListItem = function _removeLinkedListItem(parent, child, firstProp, lastProp) {
  if (firstProp === void 0) {
    firstProp = "_first";
  }

  if (lastProp === void 0) {
    lastProp = "_last";
  }

  var prev = child._prev,
      next = child._next;

  if (prev) {
    prev._next = next;
  } else if (parent[firstProp] === child) {
    parent[firstProp] = next;
  }

  if (next) {
    next._prev = prev;
  } else if (parent[lastProp] === child) {
    parent[lastProp] = prev;
  }

  child._next = child._prev = child.parent = null; // don't delete the _dp just so we can revert if necessary. But parent should be null to indicate the item isn't in a linked list.
},
    _removeFromParent = function _removeFromParent(child, onlyIfParentHasAutoRemove) {
  child.parent && (!onlyIfParentHasAutoRemove || child.parent.autoRemoveChildren) && child.parent.remove && child.parent.remove(child);
  child._act = 0;
},
    _uncache = function _uncache(animation, child) {
  if (animation && (!child || child._end > animation._dur || child._start < 0)) {
    // performance optimization: if a child animation is passed in we should only uncache if that child EXTENDS the animation (its end time is beyond the end)
    var a = animation;

    while (a) {
      a._dirty = 1;
      a = a.parent;
    }
  }

  return animation;
},
    _recacheAncestors = function _recacheAncestors(animation) {
  var parent = animation.parent;

  while (parent && parent.parent) {
    //sometimes we must force a re-sort of all children and update the duration/totalDuration of all ancestor timelines immediately in case, for example, in the middle of a render loop, one tween alters another tween's timeScale which shoves its startTime before 0, forcing the parent timeline to shift around and shiftChildren() which could affect that next tween's render (startTime). Doesn't matter for the root timeline though.
    parent._dirty = 1;
    parent.totalDuration();
    parent = parent.parent;
  }

  return animation;
},
    _rewindStartAt = function _rewindStartAt(tween, totalTime, suppressEvents, force) {
  return tween._startAt && (_reverting ? tween._startAt.revert(_revertConfigNoKill) : tween.vars.immediateRender && !tween.vars.autoRevert || tween._startAt.render(totalTime, true, force));
},
    _hasNoPausedAncestors = function _hasNoPausedAncestors(animation) {
  return !animation || animation._ts && _hasNoPausedAncestors(animation.parent);
},
    _elapsedCycleDuration = function _elapsedCycleDuration(animation) {
  return animation._repeat ? _animationCycle(animation._tTime, animation = animation.duration() + animation._rDelay) * animation : 0;
},
    // feed in the totalTime and cycleDuration and it'll return the cycle (iteration minus 1) and if the playhead is exactly at the very END, it will NOT bump up to the next cycle.
_animationCycle = function _animationCycle(tTime, cycleDuration) {
  var whole = Math.floor(tTime /= cycleDuration);
  return tTime && whole === tTime ? whole - 1 : whole;
},
    _parentToChildTotalTime = function _parentToChildTotalTime(parentTime, child) {
  return (parentTime - child._start) * child._ts + (child._ts >= 0 ? 0 : child._dirty ? child.totalDuration() : child._tDur);
},
    _setEnd = function _setEnd(animation) {
  return animation._end = _roundPrecise(animation._start + (animation._tDur / Math.abs(animation._ts || animation._rts || _tinyNum) || 0));
},
    _alignPlayhead = function _alignPlayhead(animation, totalTime) {
  // adjusts the animation's _start and _end according to the provided totalTime (only if the parent's smoothChildTiming is true and the animation isn't paused). It doesn't do any rendering or forcing things back into parent timelines, etc. - that's what totalTime() is for.
  var parent = animation._dp;

  if (parent && parent.smoothChildTiming && animation._ts) {
    animation._start = _roundPrecise(parent._time - (animation._ts > 0 ? totalTime / animation._ts : ((animation._dirty ? animation.totalDuration() : animation._tDur) - totalTime) / -animation._ts));

    _setEnd(animation);

    parent._dirty || _uncache(parent, animation); //for performance improvement. If the parent's cache is already dirty, it already took care of marking the ancestors as dirty too, so skip the function call here.
  }

  return animation;
},

/*
_totalTimeToTime = (clampedTotalTime, duration, repeat, repeatDelay, yoyo) => {
	let cycleDuration = duration + repeatDelay,
		time = _round(clampedTotalTime % cycleDuration);
	if (time > duration) {
		time = duration;
	}
	return (yoyo && (~~(clampedTotalTime / cycleDuration) & 1)) ? duration - time : time;
},
*/
_postAddChecks = function _postAddChecks(timeline, child) {
  var t;

  if (child._time || !child._dur && child._initted || child._start < timeline._time && (child._dur || !child.add)) {
    // in case, for example, the _start is moved on a tween that has already rendered, or if it's being inserted into a timeline BEFORE where the playhead is currently. Imagine it's at its end state, then the startTime is moved WAY later (after the end of this timeline), it should render at its beginning. Special case: if it's a timeline (has .add() method) and no duration, we can skip rendering because the user may be populating it AFTER adding it to a parent timeline (unconventional, but possible, and we wouldn't want it to get removed if the parent's autoRemoveChildren is true).
    t = _parentToChildTotalTime(timeline.rawTime(), child);

    if (!child._dur || _clamp(0, child.totalDuration(), t) - child._tTime > _tinyNum) {
      child.render(t, true);
    }
  } //if the timeline has already ended but the inserted tween/timeline extends the duration, we should enable this timeline again so that it renders properly. We should also align the playhead with the parent timeline's when appropriate.


  if (_uncache(timeline, child)._dp && timeline._initted && timeline._time >= timeline._dur && timeline._ts) {
    //in case any of the ancestors had completed but should now be enabled...
    if (timeline._dur < timeline.duration()) {
      t = timeline;

      while (t._dp) {
        t.rawTime() >= 0 && t.totalTime(t._tTime); //moves the timeline (shifts its startTime) if necessary, and also enables it. If it's currently zero, though, it may not be scheduled to render until later so there's no need to force it to align with the current playhead position. Only move to catch up with the playhead.

        t = t._dp;
      }
    }

    timeline._zTime = -_tinyNum; // helps ensure that the next render() will be forced (crossingStart = true in render()), even if the duration hasn't changed (we're adding a child which would need to get rendered). Definitely an edge case. Note: we MUST do this AFTER the loop above where the totalTime() might trigger a render() because this _addToTimeline() method gets called from the Animation constructor, BEFORE tweens even record their targets, etc. so we wouldn't want things to get triggered in the wrong order.
  }
},
    _addToTimeline = function _addToTimeline(timeline, child, position, skipChecks) {
  child.parent && _removeFromParent(child);
  child._start = _roundPrecise((_isNumber(position) ? position : position || timeline !== _globalTimeline ? _parsePosition(timeline, position, child) : timeline._time) + child._delay);
  child._end = _roundPrecise(child._start + (child.totalDuration() / Math.abs(child.timeScale()) || 0));

  _addLinkedListItem(timeline, child, "_first", "_last", timeline._sort ? "_start" : 0);

  _isFromOrFromStart(child) || (timeline._recent = child);
  skipChecks || _postAddChecks(timeline, child);
  timeline._ts < 0 && _alignPlayhead(timeline, timeline._tTime); // if the timeline is reversed and the new child makes it longer, we may need to adjust the parent's _start (push it back)

  return timeline;
},
    _scrollTrigger = function _scrollTrigger(animation, trigger) {
  return (_globals.ScrollTrigger || _missingPlugin("scrollTrigger", trigger)) && _globals.ScrollTrigger.create(trigger, animation);
},
    _attemptInitTween = function _attemptInitTween(tween, time, force, suppressEvents, tTime) {
  _initTween(tween, time, tTime);

  if (!tween._initted) {
    return 1;
  }

  if (!force && tween._pt && !_reverting && (tween._dur && tween.vars.lazy !== false || !tween._dur && tween.vars.lazy) && _lastRenderedFrame !== _ticker.frame) {
    _lazyTweens.push(tween);

    tween._lazy = [tTime, suppressEvents];
    return 1;
  }
},
    _parentPlayheadIsBeforeStart = function _parentPlayheadIsBeforeStart(_ref) {
  var parent = _ref.parent;
  return parent && parent._ts && parent._initted && !parent._lock && (parent.rawTime() < 0 || _parentPlayheadIsBeforeStart(parent));
},
    // check parent's _lock because when a timeline repeats/yoyos and does its artificial wrapping, we shouldn't force the ratio back to 0
_isFromOrFromStart = function _isFromOrFromStart(_ref2) {
  var data = _ref2.data;
  return data === "isFromStart" || data === "isStart";
},
    _renderZeroDurationTween = function _renderZeroDurationTween(tween, totalTime, suppressEvents, force) {
  var prevRatio = tween.ratio,
      ratio = totalTime < 0 || !totalTime && (!tween._start && _parentPlayheadIsBeforeStart(tween) && !(!tween._initted && _isFromOrFromStart(tween)) || (tween._ts < 0 || tween._dp._ts < 0) && !_isFromOrFromStart(tween)) ? 0 : 1,
      // if the tween or its parent is reversed and the totalTime is 0, we should go to a ratio of 0. Edge case: if a from() or fromTo() stagger tween is placed later in a timeline, the "startAt" zero-duration tween could initially render at a time when the parent timeline's playhead is technically BEFORE where this tween is, so make sure that any "from" and "fromTo" startAt tweens are rendered the first time at a ratio of 1.
  repeatDelay = tween._rDelay,
      tTime = 0,
      pt,
      iteration,
      prevIteration;

  if (repeatDelay && tween._repeat) {
    // in case there's a zero-duration tween that has a repeat with a repeatDelay
    tTime = _clamp(0, tween._tDur, totalTime);
    iteration = _animationCycle(tTime, repeatDelay);
    tween._yoyo && iteration & 1 && (ratio = 1 - ratio);

    if (iteration !== _animationCycle(tween._tTime, repeatDelay)) {
      // if iteration changed
      prevRatio = 1 - ratio;
      tween.vars.repeatRefresh && tween._initted && tween.invalidate();
    }
  }

  if (ratio !== prevRatio || _reverting || force || tween._zTime === _tinyNum || !totalTime && tween._zTime) {
    if (!tween._initted && _attemptInitTween(tween, totalTime, force, suppressEvents, tTime)) {
      // if we render the very beginning (time == 0) of a fromTo(), we must force the render (normal tweens wouldn't need to render at a time of 0 when the prevTime was also 0). This is also mandatory to make sure overwriting kicks in immediately.
      return;
    }

    prevIteration = tween._zTime;
    tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0); // when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect.

    suppressEvents || (suppressEvents = totalTime && !prevIteration); // if it was rendered previously at exactly 0 (_zTime) and now the playhead is moving away, DON'T fire callbacks otherwise they'll seem like duplicates.

    tween.ratio = ratio;
    tween._from && (ratio = 1 - ratio);
    tween._time = 0;
    tween._tTime = tTime;
    pt = tween._pt;

    while (pt) {
      pt.r(ratio, pt.d);
      pt = pt._next;
    }

    totalTime < 0 && _rewindStartAt(tween, totalTime, suppressEvents, true);
    tween._onUpdate && !suppressEvents && _callback(tween, "onUpdate");
    tTime && tween._repeat && !suppressEvents && tween.parent && _callback(tween, "onRepeat");

    if ((totalTime >= tween._tDur || totalTime < 0) && tween.ratio === ratio) {
      ratio && _removeFromParent(tween, 1);

      if (!suppressEvents && !_reverting) {
        _callback(tween, ratio ? "onComplete" : "onReverseComplete", true);

        tween._prom && tween._prom();
      }
    }
  } else if (!tween._zTime) {
    tween._zTime = totalTime;
  }
},
    _findNextPauseTween = function _findNextPauseTween(animation, prevTime, time) {
  var child;

  if (time > prevTime) {
    child = animation._first;

    while (child && child._start <= time) {
      if (child.data === "isPause" && child._start > prevTime) {
        return child;
      }

      child = child._next;
    }
  } else {
    child = animation._last;

    while (child && child._start >= time) {
      if (child.data === "isPause" && child._start < prevTime) {
        return child;
      }

      child = child._prev;
    }
  }
},
    _setDuration = function _setDuration(animation, duration, skipUncache, leavePlayhead) {
  var repeat = animation._repeat,
      dur = _roundPrecise(duration) || 0,
      totalProgress = animation._tTime / animation._tDur;
  totalProgress && !leavePlayhead && (animation._time *= dur / animation._dur);
  animation._dur = dur;
  animation._tDur = !repeat ? dur : repeat < 0 ? 1e10 : _roundPrecise(dur * (repeat + 1) + animation._rDelay * repeat);
  totalProgress > 0 && !leavePlayhead && _alignPlayhead(animation, animation._tTime = animation._tDur * totalProgress);
  animation.parent && _setEnd(animation);
  skipUncache || _uncache(animation.parent, animation);
  return animation;
},
    _onUpdateTotalDuration = function _onUpdateTotalDuration(animation) {
  return animation instanceof Timeline ? _uncache(animation) : _setDuration(animation, animation._dur);
},
    _zeroPosition = {
  _start: 0,
  endTime: _emptyFunc,
  totalDuration: _emptyFunc
},
    _parsePosition = function _parsePosition(animation, position, percentAnimation) {
  var labels = animation.labels,
      recent = animation._recent || _zeroPosition,
      clippedDuration = animation.duration() >= _bigNum ? recent.endTime(false) : animation._dur,
      //in case there's a child that infinitely repeats, users almost never intend for the insertion point of a new child to be based on a SUPER long value like that so we clip it and assume the most recently-added child's endTime should be used instead.
  i,
      offset,
      isPercent;

  if (_isString(position) && (isNaN(position) || position in labels)) {
    //if the string is a number like "1", check to see if there's a label with that name, otherwise interpret it as a number (absolute value).
    offset = position.charAt(0);
    isPercent = position.substr(-1) === "%";
    i = position.indexOf("=");

    if (offset === "<" || offset === ">") {
      i >= 0 && (position = position.replace(/=/, ""));
      return (offset === "<" ? recent._start : recent.endTime(recent._repeat >= 0)) + (parseFloat(position.substr(1)) || 0) * (isPercent ? (i < 0 ? recent : percentAnimation).totalDuration() / 100 : 1);
    }

    if (i < 0) {
      position in labels || (labels[position] = clippedDuration);
      return labels[position];
    }

    offset = parseFloat(position.charAt(i - 1) + position.substr(i + 1));

    if (isPercent && percentAnimation) {
      offset = offset / 100 * (_isArray(percentAnimation) ? percentAnimation[0] : percentAnimation).totalDuration();
    }

    return i > 1 ? _parsePosition(animation, position.substr(0, i - 1), percentAnimation) + offset : clippedDuration + offset;
  }

  return position == null ? clippedDuration : +position;
},
    _createTweenType = function _createTweenType(type, params, timeline) {
  var isLegacy = _isNumber(params[1]),
      varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1),
      vars = params[varsIndex],
      irVars,
      parent;

  isLegacy && (vars.duration = params[1]);
  vars.parent = timeline;

  if (type) {
    irVars = vars;
    parent = timeline;

    while (parent && !("immediateRender" in irVars)) {
      // inheritance hasn't happened yet, but someone may have set a default in an ancestor timeline. We could do vars.immediateRender = _isNotFalse(_inheritDefaults(vars).immediateRender) but that'd exact a slight performance penalty because _inheritDefaults() also runs in the Tween constructor. We're paying a small kb price here to gain speed.
      irVars = parent.vars.defaults || {};
      parent = _isNotFalse(parent.vars.inherit) && parent.parent;
    }

    vars.immediateRender = _isNotFalse(irVars.immediateRender);
    type < 2 ? vars.runBackwards = 1 : vars.startAt = params[varsIndex - 1]; // "from" vars
  }

  return new Tween(params[0], vars, params[varsIndex + 1]);
},
    _conditionalReturn = function _conditionalReturn(value, func) {
  return value || value === 0 ? func(value) : func;
},
    _clamp = function _clamp(min, max, value) {
  return value < min ? min : value > max ? max : value;
},
    getUnit = function getUnit(value, v) {
  return !_isString(value) || !(v = _unitExp.exec(value)) ? "" : v[1];
},
    // note: protect against padded numbers as strings, like "100.100". That shouldn't return "00" as the unit. If it's numeric, return no unit.
clamp = function clamp(min, max, value) {
  return _conditionalReturn(value, function (v) {
    return _clamp(min, max, v);
  });
},
    _slice = [].slice,
    _isArrayLike = function _isArrayLike(value, nonEmpty) {
  return value && _isObject(value) && "length" in value && (!nonEmpty && !value.length || value.length - 1 in value && _isObject(value[0])) && !value.nodeType && value !== _win;
},
    _flatten = function _flatten(ar, leaveStrings, accumulator) {
  if (accumulator === void 0) {
    accumulator = [];
  }

  return ar.forEach(function (value) {
    var _accumulator;

    return _isString(value) && !leaveStrings || _isArrayLike(value, 1) ? (_accumulator = accumulator).push.apply(_accumulator, toArray(value)) : accumulator.push(value);
  }) || accumulator;
},
    //takes any value and returns an array. If it's a string (and leaveStrings isn't true), it'll use document.querySelectorAll() and convert that to an array. It'll also accept iterables like jQuery objects.
toArray = function toArray(value, scope, leaveStrings) {
  return _context && !scope && _context.selector ? _context.selector(value) : _isString(value) && !leaveStrings && (_coreInitted || !_wake()) ? _slice.call((scope || _doc).querySelectorAll(value), 0) : _isArray(value) ? _flatten(value, leaveStrings) : _isArrayLike(value) ? _slice.call(value, 0) : value ? [value] : [];
},
    selector = function selector(value) {
  value = toArray(value)[0] || _warn("Invalid scope") || {};
  return function (v) {
    var el = value.current || value.nativeElement || value;
    return toArray(v, el.querySelectorAll ? el : el === value ? _warn("Invalid scope") || _doc.createElement("div") : value);
  };
},
    shuffle = function shuffle(a) {
  return a.sort(function () {
    return .5 - Math.random();
  });
},
    // alternative that's a bit faster and more reliably diverse but bigger:   for (let j, v, i = a.length; i; j = Math.floor(Math.random() * i), v = a[--i], a[i] = a[j], a[j] = v); return a;
//for distributing values across an array. Can accept a number, a function or (most commonly) a function which can contain the following properties: {base, amount, from, ease, grid, axis, length, each}. Returns a function that expects the following parameters: index, target, array. Recognizes the following
distribute = function distribute(v) {
  if (_isFunction(v)) {
    return v;
  }

  var vars = _isObject(v) ? v : {
    each: v
  },
      //n:1 is just to indicate v was a number; we leverage that later to set v according to the length we get. If a number is passed in, we treat it like the old stagger value where 0.1, for example, would mean that things would be distributed with 0.1 between each element in the array rather than a total "amount" that's chunked out among them all.
  ease = _parseEase(vars.ease),
      from = vars.from || 0,
      base = parseFloat(vars.base) || 0,
      cache = {},
      isDecimal = from > 0 && from < 1,
      ratios = isNaN(from) || isDecimal,
      axis = vars.axis,
      ratioX = from,
      ratioY = from;

  if (_isString(from)) {
    ratioX = ratioY = {
      center: .5,
      edges: .5,
      end: 1
    }[from] || 0;
  } else if (!isDecimal && ratios) {
    ratioX = from[0];
    ratioY = from[1];
  }

  return function (i, target, a) {
    var l = (a || vars).length,
        distances = cache[l],
        originX,
        originY,
        x,
        y,
        d,
        j,
        max,
        min,
        wrapAt;

    if (!distances) {
      wrapAt = vars.grid === "auto" ? 0 : (vars.grid || [1, _bigNum])[1];

      if (!wrapAt) {
        max = -_bigNum;

        while (max < (max = a[wrapAt++].getBoundingClientRect().left) && wrapAt < l) {}

        wrapAt < l && wrapAt--;
      }

      distances = cache[l] = [];
      originX = ratios ? Math.min(wrapAt, l) * ratioX - .5 : from % wrapAt;
      originY = wrapAt === _bigNum ? 0 : ratios ? l * ratioY / wrapAt - .5 : from / wrapAt | 0;
      max = 0;
      min = _bigNum;

      for (j = 0; j < l; j++) {
        x = j % wrapAt - originX;
        y = originY - (j / wrapAt | 0);
        distances[j] = d = !axis ? _sqrt(x * x + y * y) : Math.abs(axis === "y" ? y : x);
        d > max && (max = d);
        d < min && (min = d);
      }

      from === "random" && shuffle(distances);
      distances.max = max - min;
      distances.min = min;
      distances.v = l = (parseFloat(vars.amount) || parseFloat(vars.each) * (wrapAt > l ? l - 1 : !axis ? Math.max(wrapAt, l / wrapAt) : axis === "y" ? l / wrapAt : wrapAt) || 0) * (from === "edges" ? -1 : 1);
      distances.b = l < 0 ? base - l : base;
      distances.u = getUnit(vars.amount || vars.each) || 0; //unit

      ease = ease && l < 0 ? _invertEase(ease) : ease;
    }

    l = (distances[i] - distances.min) / distances.max || 0;
    return _roundPrecise(distances.b + (ease ? ease(l) : l) * distances.v) + distances.u; //round in order to work around floating point errors
  };
},
    _roundModifier = function _roundModifier(v) {
  //pass in 0.1 get a function that'll round to the nearest tenth, or 5 to round to the closest 5, or 0.001 to the closest 1000th, etc.
  var p = Math.pow(10, ((v + "").split(".")[1] || "").length); //to avoid floating point math errors (like 24 * 0.1 == 2.4000000000000004), we chop off at a specific number of decimal places (much faster than toFixed())

  return function (raw) {
    var n = _roundPrecise(Math.round(parseFloat(raw) / v) * v * p);

    return (n - n % 1) / p + (_isNumber(raw) ? 0 : getUnit(raw)); // n - n % 1 replaces Math.floor() in order to handle negative values properly. For example, Math.floor(-150.00000000000003) is 151!
  };
},
    snap = function snap(snapTo, value) {
  var isArray = _isArray(snapTo),
      radius,
      is2D;

  if (!isArray && _isObject(snapTo)) {
    radius = isArray = snapTo.radius || _bigNum;

    if (snapTo.values) {
      snapTo = toArray(snapTo.values);

      if (is2D = !_isNumber(snapTo[0])) {
        radius *= radius; //performance optimization so we don't have to Math.sqrt() in the loop.
      }
    } else {
      snapTo = _roundModifier(snapTo.increment);
    }
  }

  return _conditionalReturn(value, !isArray ? _roundModifier(snapTo) : _isFunction(snapTo) ? function (raw) {
    is2D = snapTo(raw);
    return Math.abs(is2D - raw) <= radius ? is2D : raw;
  } : function (raw) {
    var x = parseFloat(is2D ? raw.x : raw),
        y = parseFloat(is2D ? raw.y : 0),
        min = _bigNum,
        closest = 0,
        i = snapTo.length,
        dx,
        dy;

    while (i--) {
      if (is2D) {
        dx = snapTo[i].x - x;
        dy = snapTo[i].y - y;
        dx = dx * dx + dy * dy;
      } else {
        dx = Math.abs(snapTo[i] - x);
      }

      if (dx < min) {
        min = dx;
        closest = i;
      }
    }

    closest = !radius || min <= radius ? snapTo[closest] : raw;
    return is2D || closest === raw || _isNumber(raw) ? closest : closest + getUnit(raw);
  });
},
    random = function random(min, max, roundingIncrement, returnFunction) {
  return _conditionalReturn(_isArray(min) ? !max : roundingIncrement === true ? !!(roundingIncrement = 0) : !returnFunction, function () {
    return _isArray(min) ? min[~~(Math.random() * min.length)] : (roundingIncrement = roundingIncrement || 1e-5) && (returnFunction = roundingIncrement < 1 ? Math.pow(10, (roundingIncrement + "").length - 2) : 1) && Math.floor(Math.round((min - roundingIncrement / 2 + Math.random() * (max - min + roundingIncrement * .99)) / roundingIncrement) * roundingIncrement * returnFunction) / returnFunction;
  });
},
    pipe = function pipe() {
  for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) {
    functions[_key] = arguments[_key];
  }

  return function (value) {
    return functions.reduce(function (v, f) {
      return f(v);
    }, value);
  };
},
    unitize = function unitize(func, unit) {
  return function (value) {
    return func(parseFloat(value)) + (unit || getUnit(value));
  };
},
    normalize = function normalize(min, max, value) {
  return mapRange(min, max, 0, 1, value);
},
    _wrapArray = function _wrapArray(a, wrapper, value) {
  return _conditionalReturn(value, function (index) {
    return a[~~wrapper(index)];
  });
},
    wrap = function wrap(min, max, value) {
  // NOTE: wrap() CANNOT be an arrow function! A very odd compiling bug causes problems (unrelated to GSAP).
  var range = max - min;
  return _isArray(min) ? _wrapArray(min, wrap(0, min.length), max) : _conditionalReturn(value, function (value) {
    return (range + (value - min) % range) % range + min;
  });
},
    wrapYoyo = function wrapYoyo(min, max, value) {
  var range = max - min,
      total = range * 2;
  return _isArray(min) ? _wrapArray(min, wrapYoyo(0, min.length - 1), max) : _conditionalReturn(value, function (value) {
    value = (total + (value - min) % total) % total || 0;
    return min + (value > range ? total - value : value);
  });
},
    _replaceRandom = function _replaceRandom(value) {
  //replaces all occurrences of random(...) in a string with the calculated random value. can be a range like random(-100, 100, 5) or an array like random([0, 100, 500])
  var prev = 0,
      s = "",
      i,
      nums,
      end,
      isArray;

  while (~(i = value.indexOf("random(", prev))) {
    end = value.indexOf(")", i);
    isArray = value.charAt(i + 7) === "[";
    nums = value.substr(i + 7, end - i - 7).match(isArray ? _delimitedValueExp : _strictNumExp);
    s += value.substr(prev, i - prev) + random(isArray ? nums : +nums[0], isArray ? 0 : +nums[1], +nums[2] || 1e-5);
    prev = end + 1;
  }

  return s + value.substr(prev, value.length - prev);
},
    mapRange = function mapRange(inMin, inMax, outMin, outMax, value) {
  var inRange = inMax - inMin,
      outRange = outMax - outMin;
  return _conditionalReturn(value, function (value) {
    return outMin + ((value - inMin) / inRange * outRange || 0);
  });
},
    interpolate = function interpolate(start, end, progress, mutate) {
  var func = isNaN(start + end) ? 0 : function (p) {
    return (1 - p) * start + p * end;
  };

  if (!func) {
    var isString = _isString(start),
        master = {},
        p,
        i,
        interpolators,
        l,
        il;

    progress === true && (mutate = 1) && (progress = null);

    if (isString) {
      start = {
        p: start
      };
      end = {
        p: end
      };
    } else if (_isArray(start) && !_isArray(end)) {
      interpolators = [];
      l = start.length;
      il = l - 2;

      for (i = 1; i < l; i++) {
        interpolators.push(interpolate(start[i - 1], start[i])); //build the interpolators up front as a performance optimization so that when the function is called many times, it can just reuse them.
      }

      l--;

      func = function func(p) {
        p *= l;
        var i = Math.min(il, ~~p);
        return interpolators[i](p - i);
      };

      progress = end;
    } else if (!mutate) {
      start = _merge(_isArray(start) ? [] : {}, start);
    }

    if (!interpolators) {
      for (p in end) {
        _addPropTween.call(master, start, p, "get", end[p]);
      }

      func = function func(p) {
        return _renderPropTweens(p, master) || (isString ? start.p : start);
      };
    }
  }

  return _conditionalReturn(progress, func);
},
    _getLabelInDirection = function _getLabelInDirection(timeline, fromTime, backward) {
  //used for nextLabel() and previousLabel()
  var labels = timeline.labels,
      min = _bigNum,
      p,
      distance,
      label;

  for (p in labels) {
    distance = labels[p] - fromTime;

    if (distance < 0 === !!backward && distance && min > (distance = Math.abs(distance))) {
      label = p;
      min = distance;
    }
  }

  return label;
},
    _callback = function _callback(animation, type, executeLazyFirst) {
  var v = animation.vars,
      callback = v[type],
      prevContext = _context,
      context = animation._ctx,
      params,
      scope,
      result;

  if (!callback) {
    return;
  }

  params = v[type + "Params"];
  scope = v.callbackScope || animation;
  executeLazyFirst && _lazyTweens.length && _lazyRender(); //in case rendering caused any tweens to lazy-init, we should render them because typically when a timeline finishes, users expect things to have rendered fully. Imagine an onUpdate on a timeline that reports/checks tweened values.

  context && (_context = context);
  result = params ? callback.apply(scope, params) : callback.call(scope);
  _context = prevContext;
  return result;
},
    _interrupt = function _interrupt(animation) {
  _removeFromParent(animation);

  animation.scrollTrigger && animation.scrollTrigger.kill(!!_reverting);
  animation.progress() < 1 && _callback(animation, "onInterrupt");
  return animation;
},
    _quickTween,
    _registerPluginQueue = [],
    _createPlugin = function _createPlugin(config) {
  if (!config) return;
  config = !config.name && config["default"] || config; // UMD packaging wraps things oddly, so for example MotionPathHelper becomes {MotionPathHelper:MotionPathHelper, default:MotionPathHelper}.

  if (_windowExists() || config.headless) {
    // edge case: some build tools may pass in a null/undefined value
    var name = config.name,
        isFunc = _isFunction(config),
        Plugin = name && !isFunc && config.init ? function () {
      this._props = [];
    } : config,
        //in case someone passes in an object that's not a plugin, like CustomEase
    instanceDefaults = {
      init: _emptyFunc,
      render: _renderPropTweens,
      add: _addPropTween,
      kill: _killPropTweensOf,
      modifier: _addPluginModifier,
      rawVars: 0
    },
        statics = {
      targetTest: 0,
      get: 0,
      getSetter: _getSetter,
      aliases: {},
      register: 0
    };

    _wake();

    if (config !== Plugin) {
      if (_plugins[name]) {
        return;
      }

      _setDefaults(Plugin, _setDefaults(_copyExcluding(config, instanceDefaults), statics)); //static methods


      _merge(Plugin.prototype, _merge(instanceDefaults, _copyExcluding(config, statics))); //instance methods


      _plugins[Plugin.prop = name] = Plugin;

      if (config.targetTest) {
        _harnessPlugins.push(Plugin);

        _reservedProps[name] = 1;
      }

      name = (name === "css" ? "CSS" : name.charAt(0).toUpperCase() + name.substr(1)) + "Plugin"; //for the global name. "motionPath" should become MotionPathPlugin
    }

    _addGlobal(name, Plugin);

    config.register && config.register(gsap, Plugin, PropTween);
  } else {
    _registerPluginQueue.push(config);
  }
},

/*
 * --------------------------------------------------------------------------------------
 * COLORS
 * --------------------------------------------------------------------------------------
 */
_255 = 255,
    _colorLookup = {
  aqua: [0, _255, _255],
  lime: [0, _255, 0],
  silver: [192, 192, 192],
  black: [0, 0, 0],
  maroon: [128, 0, 0],
  teal: [0, 128, 128],
  blue: [0, 0, _255],
  navy: [0, 0, 128],
  white: [_255, _255, _255],
  olive: [128, 128, 0],
  yellow: [_255, _255, 0],
  orange: [_255, 165, 0],
  gray: [128, 128, 128],
  purple: [128, 0, 128],
  green: [0, 128, 0],
  red: [_255, 0, 0],
  pink: [_255, 192, 203],
  cyan: [0, _255, _255],
  transparent: [_255, _255, _255, 0]
},
    // possible future idea to replace the hard-coded color name values - put this in the ticker.wake() where we set the _doc:
// let ctx = _doc.createElement("canvas").getContext("2d");
// _forEachName("aqua,lime,silver,black,maroon,teal,blue,navy,white,olive,yellow,orange,gray,purple,green,red,pink,cyan", color => {ctx.fillStyle = color; _colorLookup[color] = splitColor(ctx.fillStyle)});
_hue = function _hue(h, m1, m2) {
  h += h < 0 ? 1 : h > 1 ? -1 : 0;
  return (h * 6 < 1 ? m1 + (m2 - m1) * h * 6 : h < .5 ? m2 : h * 3 < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * _255 + .5 | 0;
},
    splitColor = function splitColor(v, toHSL, forceAlpha) {
  var a = !v ? _colorLookup.black : _isNumber(v) ? [v >> 16, v >> 8 & _255, v & _255] : 0,
      r,
      g,
      b,
      h,
      s,
      l,
      max,
      min,
      d,
      wasHSL;

  if (!a) {
    if (v.substr(-1) === ",") {
      //sometimes a trailing comma is included and we should chop it off (typically from a comma-delimited list of values like a textShadow:"2px 2px 2px blue, 5px 5px 5px rgb(255,0,0)" - in this example "blue," has a trailing comma. We could strip it out inside parseComplex() but we'd need to do it to the beginning and ending values plus it wouldn't provide protection from other potential scenarios like if the user passes in a similar value.
      v = v.substr(0, v.length - 1);
    }

    if (_colorLookup[v]) {
      a = _colorLookup[v];
    } else if (v.charAt(0) === "#") {
      if (v.length < 6) {
        //for shorthand like #9F0 or #9F0F (could have alpha)
        r = v.charAt(1);
        g = v.charAt(2);
        b = v.charAt(3);
        v = "#" + r + r + g + g + b + b + (v.length === 5 ? v.charAt(4) + v.charAt(4) : "");
      }

      if (v.length === 9) {
        // hex with alpha, like #fd5e53ff
        a = parseInt(v.substr(1, 6), 16);
        return [a >> 16, a >> 8 & _255, a & _255, parseInt(v.substr(7), 16) / 255];
      }

      v = parseInt(v.substr(1), 16);
      a = [v >> 16, v >> 8 & _255, v & _255];
    } else if (v.substr(0, 3) === "hsl") {
      a = wasHSL = v.match(_strictNumExp);

      if (!toHSL) {
        h = +a[0] % 360 / 360;
        s = +a[1] / 100;
        l = +a[2] / 100;
        g = l <= .5 ? l * (s + 1) : l + s - l * s;
        r = l * 2 - g;
        a.length > 3 && (a[3] *= 1); //cast as number

        a[0] = _hue(h + 1 / 3, r, g);
        a[1] = _hue(h, r, g);
        a[2] = _hue(h - 1 / 3, r, g);
      } else if (~v.indexOf("=")) {
        //if relative values are found, just return the raw strings with the relative prefixes in place.
        a = v.match(_numExp);
        forceAlpha && a.length < 4 && (a[3] = 1);
        return a;
      }
    } else {
      a = v.match(_strictNumExp) || _colorLookup.transparent;
    }

    a = a.map(Number);
  }

  if (toHSL && !wasHSL) {
    r = a[0] / _255;
    g = a[1] / _255;
    b = a[2] / _255;
    max = Math.max(r, g, b);
    min = Math.min(r, g, b);
    l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }

    a[0] = ~~(h + .5);
    a[1] = ~~(s * 100 + .5);
    a[2] = ~~(l * 100 + .5);
  }

  forceAlpha && a.length < 4 && (a[3] = 1);
  return a;
},
    _colorOrderData = function _colorOrderData(v) {
  // strips out the colors from the string, finds all the numeric slots (with units) and returns an array of those. The Array also has a "c" property which is an Array of the index values where the colors belong. This is to help work around issues where there's a mis-matched order of color/numeric data like drop-shadow(#f00 0px 1px 2px) and drop-shadow(0x 1px 2px #f00). This is basically a helper function used in _formatColors()
  var values = [],
      c = [],
      i = -1;
  v.split(_colorExp).forEach(function (v) {
    var a = v.match(_numWithUnitExp) || [];
    values.push.apply(values, a);
    c.push(i += a.length + 1);
  });
  values.c = c;
  return values;
},
    _formatColors = function _formatColors(s, toHSL, orderMatchData) {
  var result = "",
      colors = (s + result).match(_colorExp),
      type = toHSL ? "hsla(" : "rgba(",
      i = 0,
      c,
      shell,
      d,
      l;

  if (!colors) {
    return s;
  }

  colors = colors.map(function (color) {
    return (color = splitColor(color, toHSL, 1)) && type + (toHSL ? color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : color.join(",")) + ")";
  });

  if (orderMatchData) {
    d = _colorOrderData(s);
    c = orderMatchData.c;

    if (c.join(result) !== d.c.join(result)) {
      shell = s.replace(_colorExp, "1").split(_numWithUnitExp);
      l = shell.length - 1;

      for (; i < l; i++) {
        result += shell[i] + (~c.indexOf(i) ? colors.shift() || type + "0,0,0,0)" : (d.length ? d : colors.length ? colors : orderMatchData).shift());
      }
    }
  }

  if (!shell) {
    shell = s.split(_colorExp);
    l = shell.length - 1;

    for (; i < l; i++) {
      result += shell[i] + colors[i];
    }
  }

  return result + shell[l];
},
    _colorExp = function () {
  var s = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b",
      //we'll dynamically build this Regular Expression to conserve file size. After building it, it will be able to find rgb(), rgba(), # (hexadecimal), and named color values like red, blue, purple, etc.,
  p;

  for (p in _colorLookup) {
    s += "|" + p + "\\b";
  }

  return new RegExp(s + ")", "gi");
}(),
    _hslExp = /hsl[a]?\(/,
    _colorStringFilter = function _colorStringFilter(a) {
  var combined = a.join(" "),
      toHSL;
  _colorExp.lastIndex = 0;

  if (_colorExp.test(combined)) {
    toHSL = _hslExp.test(combined);
    a[1] = _formatColors(a[1], toHSL);
    a[0] = _formatColors(a[0], toHSL, _colorOrderData(a[1])); // make sure the order of numbers/colors match with the END value.

    return true;
  }
},

/*
 * --------------------------------------------------------------------------------------
 * TICKER
 * --------------------------------------------------------------------------------------
 */
_tickerActive,
    _ticker = function () {
  var _getTime = Date.now,
      _lagThreshold = 500,
      _adjustedLag = 33,
      _startTime = _getTime(),
      _lastUpdate = _startTime,
      _gap = 1000 / 240,
      _nextTime = _gap,
      _listeners = [],
      _id,
      _req,
      _raf,
      _self,
      _delta,
      _i,
      _tick = function _tick(v) {
    var elapsed = _getTime() - _lastUpdate,
        manual = v === true,
        overlap,
        dispatch,
        time,
        frame;

    (elapsed > _lagThreshold || elapsed < 0) && (_startTime += elapsed - _adjustedLag);
    _lastUpdate += elapsed;
    time = _lastUpdate - _startTime;
    overlap = time - _nextTime;

    if (overlap > 0 || manual) {
      frame = ++_self.frame;
      _delta = time - _self.time * 1000;
      _self.time = time = time / 1000;
      _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
      dispatch = 1;
    }

    manual || (_id = _req(_tick)); //make sure the request is made before we dispatch the "tick" event so that timing is maintained. Otherwise, if processing the "tick" requires a bunch of time (like 15ms) and we're using a setTimeout() that's based on 16.7ms, it'd technically take 31.7ms between frames otherwise.

    if (dispatch) {
      for (_i = 0; _i < _listeners.length; _i++) {
        // use _i and check _listeners.length instead of a variable because a listener could get removed during the loop, and if that happens to an element less than the current index, it'd throw things off in the loop.
        _listeners[_i](time, _delta, frame, v);
      }
    }
  };

  _self = {
    time: 0,
    frame: 0,
    tick: function tick() {
      _tick(true);
    },
    deltaRatio: function deltaRatio(fps) {
      return _delta / (1000 / (fps || 60));
    },
    wake: function wake() {
      if (_coreReady) {
        if (!_coreInitted && _windowExists()) {
          _win = _coreInitted = window;
          _doc = _win.document || {};
          _globals.gsap = gsap;
          (_win.gsapVersions || (_win.gsapVersions = [])).push(gsap.version);

          _install(_installScope || _win.GreenSockGlobals || !_win.gsap && _win || {});

          _registerPluginQueue.forEach(_createPlugin);
        }

        _raf = typeof requestAnimationFrame !== "undefined" && requestAnimationFrame;
        _id && _self.sleep();

        _req = _raf || function (f) {
          return setTimeout(f, _nextTime - _self.time * 1000 + 1 | 0);
        };

        _tickerActive = 1;

        _tick(2);
      }
    },
    sleep: function sleep() {
      (_raf ? cancelAnimationFrame : clearTimeout)(_id);
      _tickerActive = 0;
      _req = _emptyFunc;
    },
    lagSmoothing: function lagSmoothing(threshold, adjustedLag) {
      _lagThreshold = threshold || Infinity; // zero should be interpreted as basically unlimited

      _adjustedLag = Math.min(adjustedLag || 33, _lagThreshold);
    },
    fps: function fps(_fps) {
      _gap = 1000 / (_fps || 240);
      _nextTime = _self.time * 1000 + _gap;
    },
    add: function add(callback, once, prioritize) {
      var func = once ? function (t, d, f, v) {
        callback(t, d, f, v);

        _self.remove(func);
      } : callback;

      _self.remove(callback);

      _listeners[prioritize ? "unshift" : "push"](func);

      _wake();

      return func;
    },
    remove: function remove(callback, i) {
      ~(i = _listeners.indexOf(callback)) && _listeners.splice(i, 1) && _i >= i && _i--;
    },
    _listeners: _listeners
  };
  return _self;
}(),
    _wake = function _wake() {
  return !_tickerActive && _ticker.wake();
},
    //also ensures the core classes are initialized.

/*
* -------------------------------------------------
* EASING
* -------------------------------------------------
*/
_easeMap = {},
    _customEaseExp = /^[\d.\-M][\d.\-,\s]/,
    _quotesExp = /["']/g,
    _parseObjectInString = function _parseObjectInString(value) {
  //takes a string like "{wiggles:10, type:anticipate})" and turns it into a real object. Notice it ends in ")" and includes the {} wrappers. This is because we only use this function for parsing ease configs and prioritized optimization rather than reusability.
  var obj = {},
      split = value.substr(1, value.length - 3).split(":"),
      key = split[0],
      i = 1,
      l = split.length,
      index,
      val,
      parsedVal;

  for (; i < l; i++) {
    val = split[i];
    index = i !== l - 1 ? val.lastIndexOf(",") : val.length;
    parsedVal = val.substr(0, index);
    obj[key] = isNaN(parsedVal) ? parsedVal.replace(_quotesExp, "").trim() : +parsedVal;
    key = val.substr(index + 1).trim();
  }

  return obj;
},
    _valueInParentheses = function _valueInParentheses(value) {
  var open = value.indexOf("(") + 1,
      close = value.indexOf(")"),
      nested = value.indexOf("(", open);
  return value.substring(open, ~nested && nested < close ? value.indexOf(")", close + 1) : close);
},
    _configEaseFromString = function _configEaseFromString(name) {
  //name can be a string like "elastic.out(1,0.5)", and pass in _easeMap as obj and it'll parse it out and call the actual function like _easeMap.Elastic.easeOut.config(1,0.5). It will also parse custom ease strings as long as CustomEase is loaded and registered (internally as _easeMap._CE).
  var split = (name + "").split("("),
      ease = _easeMap[split[0]];
  return ease && split.length > 1 && ease.config ? ease.config.apply(null, ~name.indexOf("{") ? [_parseObjectInString(split[1])] : _valueInParentheses(name).split(",").map(_numericIfPossible)) : _easeMap._CE && _customEaseExp.test(name) ? _easeMap._CE("", name) : ease;
},
    _invertEase = function _invertEase(ease) {
  return function (p) {
    return 1 - ease(1 - p);
  };
},
    // allow yoyoEase to be set in children and have those affected when the parent/ancestor timeline yoyos.
_propagateYoyoEase = function _propagateYoyoEase(timeline, isYoyo) {
  var child = timeline._first,
      ease;

  while (child) {
    if (child instanceof Timeline) {
      _propagateYoyoEase(child, isYoyo);
    } else if (child.vars.yoyoEase && (!child._yoyo || !child._repeat) && child._yoyo !== isYoyo) {
      if (child.timeline) {
        _propagateYoyoEase(child.timeline, isYoyo);
      } else {
        ease = child._ease;
        child._ease = child._yEase;
        child._yEase = ease;
        child._yoyo = isYoyo;
      }
    }

    child = child._next;
  }
},
    _parseEase = function _parseEase(ease, defaultEase) {
  return !ease ? defaultEase : (_isFunction(ease) ? ease : _easeMap[ease] || _configEaseFromString(ease)) || defaultEase;
},
    _insertEase = function _insertEase(names, easeIn, easeOut, easeInOut) {
  if (easeOut === void 0) {
    easeOut = function easeOut(p) {
      return 1 - easeIn(1 - p);
    };
  }

  if (easeInOut === void 0) {
    easeInOut = function easeInOut(p) {
      return p < .5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2;
    };
  }

  var ease = {
    easeIn: easeIn,
    easeOut: easeOut,
    easeInOut: easeInOut
  },
      lowercaseName;

  _forEachName(names, function (name) {
    _easeMap[name] = _globals[name] = ease;
    _easeMap[lowercaseName = name.toLowerCase()] = easeOut;

    for (var p in ease) {
      _easeMap[lowercaseName + (p === "easeIn" ? ".in" : p === "easeOut" ? ".out" : ".inOut")] = _easeMap[name + "." + p] = ease[p];
    }
  });

  return ease;
},
    _easeInOutFromOut = function _easeInOutFromOut(easeOut) {
  return function (p) {
    return p < .5 ? (1 - easeOut(1 - p * 2)) / 2 : .5 + easeOut((p - .5) * 2) / 2;
  };
},
    _configElastic = function _configElastic(type, amplitude, period) {
  var p1 = amplitude >= 1 ? amplitude : 1,
      //note: if amplitude is < 1, we simply adjust the period for a more natural feel. Otherwise the math doesn't work right and the curve starts at 1.
  p2 = (period || (type ? .3 : .45)) / (amplitude < 1 ? amplitude : 1),
      p3 = p2 / _2PI * (Math.asin(1 / p1) || 0),
      easeOut = function easeOut(p) {
    return p === 1 ? 1 : p1 * Math.pow(2, -10 * p) * _sin((p - p3) * p2) + 1;
  },
      ease = type === "out" ? easeOut : type === "in" ? function (p) {
    return 1 - easeOut(1 - p);
  } : _easeInOutFromOut(easeOut);

  p2 = _2PI / p2; //precalculate to optimize

  ease.config = function (amplitude, period) {
    return _configElastic(type, amplitude, period);
  };

  return ease;
},
    _configBack = function _configBack(type, overshoot) {
  if (overshoot === void 0) {
    overshoot = 1.70158;
  }

  var easeOut = function easeOut(p) {
    return p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0;
  },
      ease = type === "out" ? easeOut : type === "in" ? function (p) {
    return 1 - easeOut(1 - p);
  } : _easeInOutFromOut(easeOut);

  ease.config = function (overshoot) {
    return _configBack(type, overshoot);
  };

  return ease;
}; // a cheaper (kb and cpu) but more mild way to get a parameterized weighted ease by feeding in a value between -1 (easeIn) and 1 (easeOut) where 0 is linear.
// _weightedEase = ratio => {
// 	let y = 0.5 + ratio / 2;
// 	return p => (2 * (1 - p) * p * y + p * p);
// },
// a stronger (but more expensive kb/cpu) parameterized weighted ease that lets you feed in a value between -1 (easeIn) and 1 (easeOut) where 0 is linear.
// _weightedEaseStrong = ratio => {
// 	ratio = .5 + ratio / 2;
// 	let o = 1 / 3 * (ratio < .5 ? ratio : 1 - ratio),
// 		b = ratio - o,
// 		c = ratio + o;
// 	return p => p === 1 ? p : 3 * b * (1 - p) * (1 - p) * p + 3 * c * (1 - p) * p * p + p * p * p;
// };


_forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", function (name, i) {
  var power = i < 5 ? i + 1 : i;

  _insertEase(name + ",Power" + (power - 1), i ? function (p) {
    return Math.pow(p, power);
  } : function (p) {
    return p;
  }, function (p) {
    return 1 - Math.pow(1 - p, power);
  }, function (p) {
    return p < .5 ? Math.pow(p * 2, power) / 2 : 1 - Math.pow((1 - p) * 2, power) / 2;
  });
});

_easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;

_insertEase("Elastic", _configElastic("in"), _configElastic("out"), _configElastic());

(function (n, c) {
  var n1 = 1 / c,
      n2 = 2 * n1,
      n3 = 2.5 * n1,
      easeOut = function easeOut(p) {
    return p < n1 ? n * p * p : p < n2 ? n * Math.pow(p - 1.5 / c, 2) + .75 : p < n3 ? n * (p -= 2.25 / c) * p + .9375 : n * Math.pow(p - 2.625 / c, 2) + .984375;
  };

  _insertEase("Bounce", function (p) {
    return 1 - easeOut(1 - p);
  }, easeOut);
})(7.5625, 2.75);

_insertEase("Expo", function (p) {
  return p ? Math.pow(2, 10 * (p - 1)) : 0;
});

_insertEase("Circ", function (p) {
  return -(_sqrt(1 - p * p) - 1);
});

_insertEase("Sine", function (p) {
  return p === 1 ? 1 : -_cos(p * _HALF_PI) + 1;
});

_insertEase("Back", _configBack("in"), _configBack("out"), _configBack());

_easeMap.SteppedEase = _easeMap.steps = _globals.SteppedEase = {
  config: function config(steps, immediateStart) {
    if (steps === void 0) {
      steps = 1;
    }

    var p1 = 1 / steps,
        p2 = steps + (immediateStart ? 0 : 1),
        p3 = immediateStart ? 1 : 0,
        max = 1 - _tinyNum;
    return function (p) {
      return ((p2 * _clamp(0, max, p) | 0) + p3) * p1;
    };
  }
};
_defaults.ease = _easeMap["quad.out"];

_forEachName("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function (name) {
  return _callbackNames += name + "," + name + "Params,";
});
/*
 * --------------------------------------------------------------------------------------
 * CACHE
 * --------------------------------------------------------------------------------------
 */


var GSCache = function GSCache(target, harness) {
  this.id = _gsID++;
  target._gsap = this;
  this.target = target;
  this.harness = harness;
  this.get = harness ? harness.get : _getProperty;
  this.set = harness ? harness.getSetter : _getSetter;
};
/*
 * --------------------------------------------------------------------------------------
 * ANIMATION
 * --------------------------------------------------------------------------------------
 */

var Animation = /*#__PURE__*/function () {
  function Animation(vars) {
    this.vars = vars;
    this._delay = +vars.delay || 0;

    if (this._repeat = vars.repeat === Infinity ? -2 : vars.repeat || 0) {
      // TODO: repeat: Infinity on a timeline's children must flag that timeline internally and affect its totalDuration, otherwise it'll stop in the negative direction when reaching the start.
      this._rDelay = vars.repeatDelay || 0;
      this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
    }

    this._ts = 1;

    _setDuration(this, +vars.duration, 1, 1);

    this.data = vars.data;

    if (_context) {
      this._ctx = _context;

      _context.data.push(this);
    }

    _tickerActive || _ticker.wake();
  }

  var _proto = Animation.prototype;

  _proto.delay = function delay(value) {
    if (value || value === 0) {
      this.parent && this.parent.smoothChildTiming && this.startTime(this._start + value - this._delay);
      this._delay = value;
      return this;
    }

    return this._delay;
  };

  _proto.duration = function duration(value) {
    return arguments.length ? this.totalDuration(this._repeat > 0 ? value + (value + this._rDelay) * this._repeat : value) : this.totalDuration() && this._dur;
  };

  _proto.totalDuration = function totalDuration(value) {
    if (!arguments.length) {
      return this._tDur;
    }

    this._dirty = 0;
    return _setDuration(this, this._repeat < 0 ? value : (value - this._repeat * this._rDelay) / (this._repeat + 1));
  };

  _proto.totalTime = function totalTime(_totalTime, suppressEvents) {
    _wake();

    if (!arguments.length) {
      return this._tTime;
    }

    var parent = this._dp;

    if (parent && parent.smoothChildTiming && this._ts) {
      _alignPlayhead(this, _totalTime);

      !parent._dp || parent.parent || _postAddChecks(parent, this); // edge case: if this is a child of a timeline that already completed, for example, we must re-activate the parent.
      //in case any of the ancestor timelines had completed but should now be enabled, we should reset their totalTime() which will also ensure that they're lined up properly and enabled. Skip for animations that are on the root (wasteful). Example: a TimelineLite.exportRoot() is performed when there's a paused tween on the root, the export will not complete until that tween is unpaused, but imagine a child gets restarted later, after all [unpaused] tweens have completed. The start of that child would get pushed out, but one of the ancestors may have completed.

      while (parent && parent.parent) {
        if (parent.parent._time !== parent._start + (parent._ts >= 0 ? parent._tTime / parent._ts : (parent.totalDuration() - parent._tTime) / -parent._ts)) {
          parent.totalTime(parent._tTime, true);
        }

        parent = parent.parent;
      }

      if (!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && _totalTime < this._tDur || this._ts < 0 && _totalTime > 0 || !this._tDur && !_totalTime)) {
        //if the animation doesn't have a parent, put it back into its last parent (recorded as _dp for exactly cases like this). Limit to parents with autoRemoveChildren (like globalTimeline) so that if the user manually removes an animation from a timeline and then alters its playhead, it doesn't get added back in.
        _addToTimeline(this._dp, this, this._start - this._delay);
      }
    }

    if (this._tTime !== _totalTime || !this._dur && !suppressEvents || this._initted && Math.abs(this._zTime) === _tinyNum || !_totalTime && !this._initted && (this.add || this._ptLookup)) {
      // check for _ptLookup on a Tween instance to ensure it has actually finished being instantiated, otherwise if this.reverse() gets called in the Animation constructor, it could trigger a render() here even though the _targets weren't populated, thus when _init() is called there won't be any PropTweens (it'll act like the tween is non-functional)
      this._ts || (this._pTime = _totalTime); // otherwise, if an animation is paused, then the playhead is moved back to zero, then resumed, it'd revert back to the original time at the pause
      //if (!this._lock) { // avoid endless recursion (not sure we need this yet or if it's worth the performance hit)
      //   this._lock = 1;

      _lazySafeRender(this, _totalTime, suppressEvents); //   this._lock = 0;
      //}

    }

    return this;
  };

  _proto.time = function time(value, suppressEvents) {
    return arguments.length ? this.totalTime(Math.min(this.totalDuration(), value + _elapsedCycleDuration(this)) % (this._dur + this._rDelay) || (value ? this._dur : 0), suppressEvents) : this._time; // note: if the modulus results in 0, the playhead could be exactly at the end or the beginning, and we always defer to the END with a non-zero value, otherwise if you set the time() to the very end (duration()), it would render at the START!
  };

  _proto.totalProgress = function totalProgress(value, suppressEvents) {
    return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() > 0 ? 1 : 0;
  };

  _proto.progress = function progress(value, suppressEvents) {
    return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - value : value) + _elapsedCycleDuration(this), suppressEvents) : this.duration() ? Math.min(1, this._time / this._dur) : this.rawTime() > 0 ? 1 : 0;
  };

  _proto.iteration = function iteration(value, suppressEvents) {
    var cycleDuration = this.duration() + this._rDelay;

    return arguments.length ? this.totalTime(this._time + (value - 1) * cycleDuration, suppressEvents) : this._repeat ? _animationCycle(this._tTime, cycleDuration) + 1 : 1;
  } // potential future addition:
  // isPlayingBackwards() {
  // 	let animation = this,
  // 		orientation = 1; // 1 = forward, -1 = backward
  // 	while (animation) {
  // 		orientation *= animation.reversed() || (animation.repeat() && !(animation.iteration() & 1)) ? -1 : 1;
  // 		animation = animation.parent;
  // 	}
  // 	return orientation < 0;
  // }
  ;

  _proto.timeScale = function timeScale(value, suppressEvents) {
    if (!arguments.length) {
      return this._rts === -_tinyNum ? 0 : this._rts; // recorded timeScale. Special case: if someone calls reverse() on an animation with timeScale of 0, we assign it -_tinyNum to remember it's reversed.
    }

    if (this._rts === value) {
      return this;
    }

    var tTime = this.parent && this._ts ? _parentToChildTotalTime(this.parent._time, this) : this._tTime; // make sure to do the parentToChildTotalTime() BEFORE setting the new _ts because the old one must be used in that calculation.
    // future addition? Up side: fast and minimal file size. Down side: only works on this animation; if a timeline is reversed, for example, its childrens' onReverse wouldn't get called.
    //(+value < 0 && this._rts >= 0) && _callback(this, "onReverse", true);
    // prioritize rendering where the parent's playhead lines up instead of this._tTime because there could be a tween that's animating another tween's timeScale in the same rendering loop (same parent), thus if the timeScale tween renders first, it would alter _start BEFORE _tTime was set on that tick (in the rendering loop), effectively freezing it until the timeScale tween finishes.

    this._rts = +value || 0;
    this._ts = this._ps || value === -_tinyNum ? 0 : this._rts; // _ts is the functional timeScale which would be 0 if the animation is paused.

    this.totalTime(_clamp(-Math.abs(this._delay), this._tDur, tTime), suppressEvents !== false);

    _setEnd(this); // if parent.smoothChildTiming was false, the end time didn't get updated in the _alignPlayhead() method, so do it here.


    return _recacheAncestors(this);
  };

  _proto.paused = function paused(value) {
    if (!arguments.length) {
      return this._ps;
    }

    if (this._ps !== value) {
      this._ps = value;

      if (value) {
        this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()); // if the pause occurs during the delay phase, make sure that's factored in when resuming.

        this._ts = this._act = 0; // _ts is the functional timeScale, so a paused tween would effectively have a timeScale of 0. We record the "real" timeScale as _rts (recorded time scale)
      } else {
        _wake();

        this._ts = this._rts; //only defer to _pTime (pauseTime) if tTime is zero. Remember, someone could pause() an animation, then scrub the playhead and resume(). If the parent doesn't have smoothChildTiming, we render at the rawTime() because the startTime won't get updated.

        this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== _tinyNum && (this._tTime -= _tinyNum)); // edge case: animation.progress(1).pause().play() wouldn't render again because the playhead is already at the end, but the call to totalTime() below will add it back to its parent...and not remove it again (since removing only happens upon rendering at a new time). Offsetting the _tTime slightly is done simply to cause the final render in totalTime() that'll pop it off its timeline (if autoRemoveChildren is true, of course). Check to make sure _zTime isn't -_tinyNum to avoid an edge case where the playhead is pushed to the end but INSIDE a tween/callback, the timeline itself is paused thus halting rendering and leaving a few unrendered. When resuming, it wouldn't render those otherwise.
      }
    }

    return this;
  };

  _proto.startTime = function startTime(value) {
    if (arguments.length) {
      this._start = value;
      var parent = this.parent || this._dp;
      parent && (parent._sort || !this.parent) && _addToTimeline(parent, this, value - this._delay);
      return this;
    }

    return this._start;
  };

  _proto.endTime = function endTime(includeRepeats) {
    return this._start + (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
  };

  _proto.rawTime = function rawTime(wrapRepeats) {
    var parent = this.parent || this._dp; // _dp = detached parent

    return !parent ? this._tTime : wrapRepeats && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : !this._ts ? this._tTime : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
  };

  _proto.revert = function revert(config) {
    if (config === void 0) {
      config = _revertConfig;
    }

    var prevIsReverting = _reverting;
    _reverting = config;

    if (this._initted || this._startAt) {
      this.timeline && this.timeline.revert(config);
      this.totalTime(-0.01, config.suppressEvents);
    }

    this.data !== "nested" && config.kill !== false && this.kill();
    _reverting = prevIsReverting;
    return this;
  };

  _proto.globalTime = function globalTime(rawTime) {
    var animation = this,
        time = arguments.length ? rawTime : animation.rawTime();

    while (animation) {
      time = animation._start + time / (Math.abs(animation._ts) || 1);
      animation = animation._dp;
    }

    return !this.parent && this._sat ? this._sat.globalTime(rawTime) : time; // the _startAt tweens for .fromTo() and .from() that have immediateRender should always be FIRST in the timeline (important for context.revert()). "_sat" stands for _startAtTween, referring to the parent tween that created the _startAt. We must discern if that tween had immediateRender so that we can know whether or not to prioritize it in revert().
  };

  _proto.repeat = function repeat(value) {
    if (arguments.length) {
      this._repeat = value === Infinity ? -2 : value;
      return _onUpdateTotalDuration(this);
    }

    return this._repeat === -2 ? Infinity : this._repeat;
  };

  _proto.repeatDelay = function repeatDelay(value) {
    if (arguments.length) {
      var time = this._time;
      this._rDelay = value;

      _onUpdateTotalDuration(this);

      return time ? this.time(time) : this;
    }

    return this._rDelay;
  };

  _proto.yoyo = function yoyo(value) {
    if (arguments.length) {
      this._yoyo = value;
      return this;
    }

    return this._yoyo;
  };

  _proto.seek = function seek(position, suppressEvents) {
    return this.totalTime(_parsePosition(this, position), _isNotFalse(suppressEvents));
  };

  _proto.restart = function restart(includeDelay, suppressEvents) {
    return this.play().totalTime(includeDelay ? -this._delay : 0, _isNotFalse(suppressEvents));
  };

  _proto.play = function play(from, suppressEvents) {
    from != null && this.seek(from, suppressEvents);
    return this.reversed(false).paused(false);
  };

  _proto.reverse = function reverse(from, suppressEvents) {
    from != null && this.seek(from || this.totalDuration(), suppressEvents);
    return this.reversed(true).paused(false);
  };

  _proto.pause = function pause(atTime, suppressEvents) {
    atTime != null && this.seek(atTime, suppressEvents);
    return this.paused(true);
  };

  _proto.resume = function resume() {
    return this.paused(false);
  };

  _proto.reversed = function reversed(value) {
    if (arguments.length) {
      !!value !== this.reversed() && this.timeScale(-this._rts || (value ? -_tinyNum : 0)); // in case timeScale is zero, reversing would have no effect so we use _tinyNum.

      return this;
    }

    return this._rts < 0;
  };

  _proto.invalidate = function invalidate() {
    this._initted = this._act = 0;
    this._zTime = -_tinyNum;
    return this;
  };

  _proto.isActive = function isActive() {
    var parent = this.parent || this._dp,
        start = this._start,
        rawTime;
    return !!(!parent || this._ts && this._initted && parent.isActive() && (rawTime = parent.rawTime(true)) >= start && rawTime < this.endTime(true) - _tinyNum);
  };

  _proto.eventCallback = function eventCallback(type, callback, params) {
    var vars = this.vars;

    if (arguments.length > 1) {
      if (!callback) {
        delete vars[type];
      } else {
        vars[type] = callback;
        params && (vars[type + "Params"] = params);
        type === "onUpdate" && (this._onUpdate = callback);
      }

      return this;
    }

    return vars[type];
  };

  _proto.then = function then(onFulfilled) {
    var self = this;
    return new Promise(function (resolve) {
      var f = _isFunction(onFulfilled) ? onFulfilled : _passThrough,
          _resolve = function _resolve() {
        var _then = self.then;
        self.then = null; // temporarily null the then() method to avoid an infinite loop (see https://github.com/greensock/GSAP/issues/322)

        _isFunction(f) && (f = f(self)) && (f.then || f === self) && (self.then = _then);
        resolve(f);
        self.then = _then;
      };

      if (self._initted && self.totalProgress() === 1 && self._ts >= 0 || !self._tTime && self._ts < 0) {
        _resolve();
      } else {
        self._prom = _resolve;
      }
    });
  };

  _proto.kill = function kill() {
    _interrupt(this);
  };

  return Animation;
}();

_setDefaults(Animation.prototype, {
  _time: 0,
  _start: 0,
  _end: 0,
  _tTime: 0,
  _tDur: 0,
  _dirty: 0,
  _repeat: 0,
  _yoyo: false,
  parent: null,
  _initted: false,
  _rDelay: 0,
  _ts: 1,
  _dp: 0,
  ratio: 0,
  _zTime: -_tinyNum,
  _prom: 0,
  _ps: false,
  _rts: 1
});
/*
 * -------------------------------------------------
 * TIMELINE
 * -------------------------------------------------
 */


var Timeline = /*#__PURE__*/function (_Animation) {
  _inheritsLoose(Timeline, _Animation);

  function Timeline(vars, position) {
    var _this;

    if (vars === void 0) {
      vars = {};
    }

    _this = _Animation.call(this, vars) || this;
    _this.labels = {};
    _this.smoothChildTiming = !!vars.smoothChildTiming;
    _this.autoRemoveChildren = !!vars.autoRemoveChildren;
    _this._sort = _isNotFalse(vars.sortChildren);
    _globalTimeline && _addToTimeline(vars.parent || _globalTimeline, _assertThisInitialized(_this), position);
    vars.reversed && _this.reverse();
    vars.paused && _this.paused(true);
    vars.scrollTrigger && _scrollTrigger(_assertThisInitialized(_this), vars.scrollTrigger);
    return _this;
  }

  var _proto2 = Timeline.prototype;

  _proto2.to = function to(targets, vars, position) {
    _createTweenType(0, arguments, this);

    return this;
  };

  _proto2.from = function from(targets, vars, position) {
    _createTweenType(1, arguments, this);

    return this;
  };

  _proto2.fromTo = function fromTo(targets, fromVars, toVars, position) {
    _createTweenType(2, arguments, this);

    return this;
  };

  _proto2.set = function set(targets, vars, position) {
    vars.duration = 0;
    vars.parent = this;
    _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
    vars.immediateRender = !!vars.immediateRender;
    new Tween(targets, vars, _parsePosition(this, position), 1);
    return this;
  };

  _proto2.call = function call(callback, params, position) {
    return _addToTimeline(this, Tween.delayedCall(0, callback, params), position);
  } //ONLY for backward compatibility! Maybe delete?
  ;

  _proto2.staggerTo = function staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
    vars.duration = duration;
    vars.stagger = vars.stagger || stagger;
    vars.onComplete = onCompleteAll;
    vars.onCompleteParams = onCompleteAllParams;
    vars.parent = this;
    new Tween(targets, vars, _parsePosition(this, position));
    return this;
  };

  _proto2.staggerFrom = function staggerFrom(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
    vars.runBackwards = 1;
    _inheritDefaults(vars).immediateRender = _isNotFalse(vars.immediateRender);
    return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams);
  };

  _proto2.staggerFromTo = function staggerFromTo(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams) {
    toVars.startAt = fromVars;
    _inheritDefaults(toVars).immediateRender = _isNotFalse(toVars.immediateRender);
    return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams);
  };

  _proto2.render = function render(totalTime, suppressEvents, force) {
    var prevTime = this._time,
        tDur = this._dirty ? this.totalDuration() : this._tDur,
        dur = this._dur,
        tTime = totalTime <= 0 ? 0 : _roundPrecise(totalTime),
        // if a paused timeline is resumed (or its _start is updated for another reason...which rounds it), that could result in the playhead shifting a **tiny** amount and a zero-duration child at that spot may get rendered at a different ratio, like its totalTime in render() may be 1e-17 instead of 0, for example.
    crossingStart = this._zTime < 0 !== totalTime < 0 && (this._initted || !dur),
        time,
        child,
        next,
        iteration,
        cycleDuration,
        prevPaused,
        pauseTween,
        timeScale,
        prevStart,
        prevIteration,
        yoyo,
        isYoyo;
    this !== _globalTimeline && tTime > tDur && totalTime >= 0 && (tTime = tDur);

    if (tTime !== this._tTime || force || crossingStart) {
      if (prevTime !== this._time && dur) {
        //if totalDuration() finds a child with a negative startTime and smoothChildTiming is true, things get shifted around internally so we need to adjust the time accordingly. For example, if a tween starts at -30 we must shift EVERYTHING forward 30 seconds and move this timeline's startTime backward by 30 seconds so that things align with the playhead (no jump).
        tTime += this._time - prevTime;
        totalTime += this._time - prevTime;
      }

      time = tTime;
      prevStart = this._start;
      timeScale = this._ts;
      prevPaused = !timeScale;

      if (crossingStart) {
        dur || (prevTime = this._zTime); //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration timeline, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect.

        (totalTime || !suppressEvents) && (this._zTime = totalTime);
      }

      if (this._repeat) {
        //adjust the time for repeats and yoyos
        yoyo = this._yoyo;
        cycleDuration = dur + this._rDelay;

        if (this._repeat < -1 && totalTime < 0) {
          return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
        }

        time = _roundPrecise(tTime % cycleDuration); //round to avoid floating point errors. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)

        if (tTime === tDur) {
          // the tDur === tTime is for edge cases where there's a lengthy decimal on the duration and it may reach the very end but the time is rendered as not-quite-there (remember, tDur is rounded to 4 decimals whereas dur isn't)
          iteration = this._repeat;
          time = dur;
        } else {
          iteration = ~~(tTime / cycleDuration);

          if (iteration && iteration === tTime / cycleDuration) {
            time = dur;
            iteration--;
          }

          time > dur && (time = dur);
        }

        prevIteration = _animationCycle(this._tTime, cycleDuration);
        !prevTime && this._tTime && prevIteration !== iteration && this._tTime - prevIteration * cycleDuration - this._dur <= 0 && (prevIteration = iteration); // edge case - if someone does addPause() at the very beginning of a repeating timeline, that pause is technically at the same spot as the end which causes this._time to get set to 0 when the totalTime would normally place the playhead at the end. See https://gsap.com/forums/topic/23823-closing-nav-animation-not-working-on-ie-and-iphone-6-maybe-other-older-browser/?tab=comments#comment-113005 also, this._tTime - prevIteration * cycleDuration - this._dur <= 0 just checks to make sure it wasn't previously in the "repeatDelay" portion

        if (yoyo && iteration & 1) {
          time = dur - time;
          isYoyo = 1;
        }
        /*
        make sure children at the end/beginning of the timeline are rendered properly. If, for example,
        a 3-second long timeline rendered at 2.9 seconds previously, and now renders at 3.2 seconds (which
        would get translated to 2.8 seconds if the timeline yoyos or 0.2 seconds if it just repeats), there
        could be a callback or a short tween that's at 2.95 or 3 seconds in which wouldn't render. So
        we need to push the timeline to the end (and/or beginning depending on its yoyo value). Also we must
        ensure that zero-duration tweens at the very beginning or end of the Timeline work.
        */


        if (iteration !== prevIteration && !this._lock) {
          var rewinding = yoyo && prevIteration & 1,
              doesWrap = rewinding === (yoyo && iteration & 1);
          iteration < prevIteration && (rewinding = !rewinding);
          prevTime = rewinding ? 0 : tTime % dur ? dur : tTime; // if the playhead is landing exactly at the end of an iteration, use that totalTime rather than only the duration, otherwise it'll skip the 2nd render since it's effectively at the same time.

          this._lock = 1;
          this.render(prevTime || (isYoyo ? 0 : _roundPrecise(iteration * cycleDuration)), suppressEvents, !dur)._lock = 0;
          this._tTime = tTime; // if a user gets the iteration() inside the onRepeat, for example, it should be accurate.

          !suppressEvents && this.parent && _callback(this, "onRepeat");
          this.vars.repeatRefresh && !isYoyo && (this.invalidate()._lock = 1);

          if (prevTime && prevTime !== this._time || prevPaused !== !this._ts || this.vars.onRepeat && !this.parent && !this._act) {
            // if prevTime is 0 and we render at the very end, _time will be the end, thus won't match. So in this edge case, prevTime won't match _time but that's okay. If it gets killed in the onRepeat, eject as well.
            return this;
          }

          dur = this._dur; // in case the duration changed in the onRepeat

          tDur = this._tDur;

          if (doesWrap) {
            this._lock = 2;
            prevTime = rewinding ? dur : -0.0001;
            this.render(prevTime, true);
            this.vars.repeatRefresh && !isYoyo && this.invalidate();
          }

          this._lock = 0;

          if (!this._ts && !prevPaused) {
            return this;
          } //in order for yoyoEase to work properly when there's a stagger, we must swap out the ease in each sub-tween.


          _propagateYoyoEase(this, isYoyo);
        }
      }

      if (this._hasPause && !this._forcing && this._lock < 2) {
        pauseTween = _findNextPauseTween(this, _roundPrecise(prevTime), _roundPrecise(time));

        if (pauseTween) {
          tTime -= time - (time = pauseTween._start);
        }
      }

      this._tTime = tTime;
      this._time = time;
      this._act = !timeScale; //as long as it's not paused, force it to be active so that if the user renders independent of the parent timeline, it'll be forced to re-render on the next tick.

      if (!this._initted) {
        this._onUpdate = this.vars.onUpdate;
        this._initted = 1;
        this._zTime = totalTime;
        prevTime = 0; // upon init, the playhead should always go forward; someone could invalidate() a completed timeline and then if they restart(), that would make child tweens render in reverse order which could lock in the wrong starting values if they build on each other, like tl.to(obj, {x: 100}).to(obj, {x: 0}).
      }

      if (!prevTime && time && !suppressEvents && !iteration) {
        _callback(this, "onStart");

        if (this._tTime !== tTime) {
          // in case the onStart triggered a render at a different spot, eject. Like if someone did animation.pause(0.5) or something inside the onStart.
          return this;
        }
      }

      if (time >= prevTime && totalTime >= 0) {
        child = this._first;

        while (child) {
          next = child._next;

          if ((child._act || time >= child._start) && child._ts && pauseTween !== child) {
            if (child.parent !== this) {
              // an extreme edge case - the child's render could do something like kill() the "next" one in the linked list, or reparent it. In that case we must re-initiate the whole render to be safe.
              return this.render(totalTime, suppressEvents, force);
            }

            child.render(child._ts > 0 ? (time - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (time - child._start) * child._ts, suppressEvents, force);

            if (time !== this._time || !this._ts && !prevPaused) {
              //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
              pauseTween = 0;
              next && (tTime += this._zTime = -_tinyNum); // it didn't finish rendering, so flag zTime as negative so that so that the next time render() is called it'll be forced (to render any remaining children)

              break;
            }
          }

          child = next;
        }
      } else {
        child = this._last;
        var adjustedTime = totalTime < 0 ? totalTime : time; //when the playhead goes backward beyond the start of this timeline, we must pass that information down to the child animations so that zero-duration tweens know whether to render their starting or ending values.

        while (child) {
          next = child._prev;

          if ((child._act || adjustedTime <= child._end) && child._ts && pauseTween !== child) {
            if (child.parent !== this) {
              // an extreme edge case - the child's render could do something like kill() the "next" one in the linked list, or reparent it. In that case we must re-initiate the whole render to be safe.
              return this.render(totalTime, suppressEvents, force);
            }

            child.render(child._ts > 0 ? (adjustedTime - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (adjustedTime - child._start) * child._ts, suppressEvents, force || _reverting && (child._initted || child._startAt)); // if reverting, we should always force renders of initted tweens (but remember that .fromTo() or .from() may have a _startAt but not _initted yet). If, for example, a .fromTo() tween with a stagger (which creates an internal timeline) gets reverted BEFORE some of its child tweens render for the first time, it may not properly trigger them to revert.

            if (time !== this._time || !this._ts && !prevPaused) {
              //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
              pauseTween = 0;
              next && (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum); // it didn't finish rendering, so adjust zTime so that so that the next time render() is called it'll be forced (to render any remaining children)

              break;
            }
          }

          child = next;
        }
      }

      if (pauseTween && !suppressEvents) {
        this.pause();
        pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime = time >= prevTime ? 1 : -1;

        if (this._ts) {
          //the callback resumed playback! So since we may have held back the playhead due to where the pause is positioned, go ahead and jump to where it's SUPPOSED to be (if no pause happened).
          this._start = prevStart; //if the pause was at an earlier time and the user resumed in the callback, it could reposition the timeline (changing its startTime), throwing things off slightly, so we make sure the _start doesn't shift.

          _setEnd(this);

          return this.render(totalTime, suppressEvents, force);
        }
      }

      this._onUpdate && !suppressEvents && _callback(this, "onUpdate", true);
      if (tTime === tDur && this._tTime >= this.totalDuration() || !tTime && prevTime) if (prevStart === this._start || Math.abs(timeScale) !== Math.abs(this._ts)) if (!this._lock) {
        // remember, a child's callback may alter this timeline's playhead or timeScale which is why we need to add some of these checks.
        (totalTime || !dur) && (tTime === tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1); // don't remove if the timeline is reversed and the playhead isn't at 0, otherwise tl.progress(1).reverse() won't work. Only remove if the playhead is at the end and timeScale is positive, or if the playhead is at 0 and the timeScale is negative.

        if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime || !tDur)) {
          _callback(this, tTime === tDur && totalTime >= 0 ? "onComplete" : "onReverseComplete", true);

          this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
        }
      }
    }

    return this;
  };

  _proto2.add = function add(child, position) {
    var _this2 = this;

    _isNumber(position) || (position = _parsePosition(this, position, child));

    if (!(child instanceof Animation)) {
      if (_isArray(child)) {
        child.forEach(function (obj) {
          return _this2.add(obj, position);
        });
        return this;
      }

      if (_isString(child)) {
        return this.addLabel(child, position);
      }

      if (_isFunction(child)) {
        child = Tween.delayedCall(0, child);
      } else {
        return this;
      }
    }

    return this !== child ? _addToTimeline(this, child, position) : this; //don't allow a timeline to be added to itself as a child!
  };

  _proto2.getChildren = function getChildren(nested, tweens, timelines, ignoreBeforeTime) {
    if (nested === void 0) {
      nested = true;
    }

    if (tweens === void 0) {
      tweens = true;
    }

    if (timelines === void 0) {
      timelines = true;
    }

    if (ignoreBeforeTime === void 0) {
      ignoreBeforeTime = -_bigNum;
    }

    var a = [],
        child = this._first;

    while (child) {
      if (child._start >= ignoreBeforeTime) {
        if (child instanceof Tween) {
          tweens && a.push(child);
        } else {
          timelines && a.push(child);
          nested && a.push.apply(a, child.getChildren(true, tweens, timelines));
        }
      }

      child = child._next;
    }

    return a;
  };

  _proto2.getById = function getById(id) {
    var animations = this.getChildren(1, 1, 1),
        i = animations.length;

    while (i--) {
      if (animations[i].vars.id === id) {
        return animations[i];
      }
    }
  };

  _proto2.remove = function remove(child) {
    if (_isString(child)) {
      return this.removeLabel(child);
    }

    if (_isFunction(child)) {
      return this.killTweensOf(child);
    }

    _removeLinkedListItem(this, child);

    if (child === this._recent) {
      this._recent = this._last;
    }

    return _uncache(this);
  };

  _proto2.totalTime = function totalTime(_totalTime2, suppressEvents) {
    if (!arguments.length) {
      return this._tTime;
    }

    this._forcing = 1;

    if (!this._dp && this._ts) {
      //special case for the global timeline (or any other that has no parent or detached parent).
      this._start = _roundPrecise(_ticker.time - (this._ts > 0 ? _totalTime2 / this._ts : (this.totalDuration() - _totalTime2) / -this._ts));
    }

    _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);

    this._forcing = 0;
    return this;
  };

  _proto2.addLabel = function addLabel(label, position) {
    this.labels[label] = _parsePosition(this, position);
    return this;
  };

  _proto2.removeLabel = function removeLabel(label) {
    delete this.labels[label];
    return this;
  };

  _proto2.addPause = function addPause(position, callback, params) {
    var t = Tween.delayedCall(0, callback || _emptyFunc, params);
    t.data = "isPause";
    this._hasPause = 1;
    return _addToTimeline(this, t, _parsePosition(this, position));
  };

  _proto2.removePause = function removePause(position) {
    var child = this._first;
    position = _parsePosition(this, position);

    while (child) {
      if (child._start === position && child.data === "isPause") {
        _removeFromParent(child);
      }

      child = child._next;
    }
  };

  _proto2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
    var tweens = this.getTweensOf(targets, onlyActive),
        i = tweens.length;

    while (i--) {
      _overwritingTween !== tweens[i] && tweens[i].kill(targets, props);
    }

    return this;
  };

  _proto2.getTweensOf = function getTweensOf(targets, onlyActive) {
    var a = [],
        parsedTargets = toArray(targets),
        child = this._first,
        isGlobalTime = _isNumber(onlyActive),
        // a number is interpreted as a global time. If the animation spans
    children;

    while (child) {
      if (child instanceof Tween) {
        if (_arrayContainsAny(child._targets, parsedTargets) && (isGlobalTime ? (!_overwritingTween || child._initted && child._ts) && child.globalTime(0) <= onlyActive && child.globalTime(child.totalDuration()) > onlyActive : !onlyActive || child.isActive())) {
          // note: if this is for overwriting, it should only be for tweens that aren't paused and are initted.
          a.push(child);
        }
      } else if ((children = child.getTweensOf(parsedTargets, onlyActive)).length) {
        a.push.apply(a, children);
      }

      child = child._next;
    }

    return a;
  } // potential future feature - targets() on timelines
  // targets() {
  // 	let result = [];
  // 	this.getChildren(true, true, false).forEach(t => result.push(...t.targets()));
  // 	return result.filter((v, i) => result.indexOf(v) === i);
  // }
  ;

  _proto2.tweenTo = function tweenTo(position, vars) {
    vars = vars || {};

    var tl = this,
        endTime = _parsePosition(tl, position),
        _vars = vars,
        startAt = _vars.startAt,
        _onStart = _vars.onStart,
        onStartParams = _vars.onStartParams,
        immediateRender = _vars.immediateRender,
        initted,
        tween = Tween.to(tl, _setDefaults({
      ease: vars.ease || "none",
      lazy: false,
      immediateRender: false,
      time: endTime,
      overwrite: "auto",
      duration: vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale()) || _tinyNum,
      onStart: function onStart() {
        tl.pause();

        if (!initted) {
          var duration = vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale());
          tween._dur !== duration && _setDuration(tween, duration, 0, 1).render(tween._time, true, true);
          initted = 1;
        }

        _onStart && _onStart.apply(tween, onStartParams || []); //in case the user had an onStart in the vars - we don't want to overwrite it.
      }
    }, vars));

    return immediateRender ? tween.render(0) : tween;
  };

  _proto2.tweenFromTo = function tweenFromTo(fromPosition, toPosition, vars) {
    return this.tweenTo(toPosition, _setDefaults({
      startAt: {
        time: _parsePosition(this, fromPosition)
      }
    }, vars));
  };

  _proto2.recent = function recent() {
    return this._recent;
  };

  _proto2.nextLabel = function nextLabel(afterTime) {
    if (afterTime === void 0) {
      afterTime = this._time;
    }

    return _getLabelInDirection(this, _parsePosition(this, afterTime));
  };

  _proto2.previousLabel = function previousLabel(beforeTime) {
    if (beforeTime === void 0) {
      beforeTime = this._time;
    }

    return _getLabelInDirection(this, _parsePosition(this, beforeTime), 1);
  };

  _proto2.currentLabel = function currentLabel(value) {
    return arguments.length ? this.seek(value, true) : this.previousLabel(this._time + _tinyNum);
  };

  _proto2.shiftChildren = function shiftChildren(amount, adjustLabels, ignoreBeforeTime) {
    if (ignoreBeforeTime === void 0) {
      ignoreBeforeTime = 0;
    }

    var child = this._first,
        labels = this.labels,
        p;

    while (child) {
      if (child._start >= ignoreBeforeTime) {
        child._start += amount;
        child._end += amount;
      }

      child = child._next;
    }

    if (adjustLabels) {
      for (p in labels) {
        if (labels[p] >= ignoreBeforeTime) {
          labels[p] += amount;
        }
      }
    }

    return _uncache(this);
  };

  _proto2.invalidate = function invalidate(soft) {
    var child = this._first;
    this._lock = 0;

    while (child) {
      child.invalidate(soft);
      child = child._next;
    }

    return _Animation.prototype.invalidate.call(this, soft);
  };

  _proto2.clear = function clear(includeLabels) {
    if (includeLabels === void 0) {
      includeLabels = true;
    }

    var child = this._first,
        next;

    while (child) {
      next = child._next;
      this.remove(child);
      child = next;
    }

    this._dp && (this._time = this._tTime = this._pTime = 0);
    includeLabels && (this.labels = {});
    return _uncache(this);
  };

  _proto2.totalDuration = function totalDuration(value) {
    var max = 0,
        self = this,
        child = self._last,
        prevStart = _bigNum,
        prev,
        start,
        parent;

    if (arguments.length) {
      return self.timeScale((self._repeat < 0 ? self.duration() : self.totalDuration()) / (self.reversed() ? -value : value));
    }

    if (self._dirty) {
      parent = self.parent;

      while (child) {
        prev = child._prev; //record it here in case the tween changes position in the sequence...

        child._dirty && child.totalDuration(); //could change the tween._startTime, so make sure the animation's cache is clean before analyzing it.

        start = child._start;

        if (start > prevStart && self._sort && child._ts && !self._lock) {
          //in case one of the tweens shifted out of order, it needs to be re-inserted into the correct position in the sequence
          self._lock = 1; //prevent endless recursive calls - there are methods that get triggered that check duration/totalDuration when we add().

          _addToTimeline(self, child, start - child._delay, 1)._lock = 0;
        } else {
          prevStart = start;
        }

        if (start < 0 && child._ts) {
          //children aren't allowed to have negative startTimes unless smoothChildTiming is true, so adjust here if one is found.
          max -= start;

          if (!parent && !self._dp || parent && parent.smoothChildTiming) {
            self._start += start / self._ts;
            self._time -= start;
            self._tTime -= start;
          }

          self.shiftChildren(-start, false, -1e999);
          prevStart = 0;
        }

        child._end > max && child._ts && (max = child._end);
        child = prev;
      }

      _setDuration(self, self === _globalTimeline && self._time > max ? self._time : max, 1, 1);

      self._dirty = 0;
    }

    return self._tDur;
  };

  Timeline.updateRoot = function updateRoot(time) {
    if (_globalTimeline._ts) {
      _lazySafeRender(_globalTimeline, _parentToChildTotalTime(time, _globalTimeline));

      _lastRenderedFrame = _ticker.frame;
    }

    if (_ticker.frame >= _nextGCFrame) {
      _nextGCFrame += _config.autoSleep || 120;
      var child = _globalTimeline._first;
      if (!child || !child._ts) if (_config.autoSleep && _ticker._listeners.length < 2) {
        while (child && !child._ts) {
          child = child._next;
        }

        child || _ticker.sleep();
      }
    }
  };

  return Timeline;
}(Animation);

_setDefaults(Timeline.prototype, {
  _lock: 0,
  _hasPause: 0,
  _forcing: 0
});

var _addComplexStringPropTween = function _addComplexStringPropTween(target, prop, start, end, setter, stringFilter, funcParam) {
  //note: we call _addComplexStringPropTween.call(tweenInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.
  var pt = new PropTween(this._pt, target, prop, 0, 1, _renderComplexString, null, setter),
      index = 0,
      matchIndex = 0,
      result,
      startNums,
      color,
      endNum,
      chunk,
      startNum,
      hasRandom,
      a;
  pt.b = start;
  pt.e = end;
  start += ""; //ensure values are strings

  end += "";

  if (hasRandom = ~end.indexOf("random(")) {
    end = _replaceRandom(end);
  }

  if (stringFilter) {
    a = [start, end];
    stringFilter(a, target, prop); //pass an array with the starting and ending values and let the filter do whatever it needs to the values.

    start = a[0];
    end = a[1];
  }

  startNums = start.match(_complexStringNumExp) || [];

  while (result = _complexStringNumExp.exec(end)) {
    endNum = result[0];
    chunk = end.substring(index, result.index);

    if (color) {
      color = (color + 1) % 5;
    } else if (chunk.substr(-5) === "rgba(") {
      color = 1;
    }

    if (endNum !== startNums[matchIndex++]) {
      startNum = parseFloat(startNums[matchIndex - 1]) || 0; //these nested PropTweens are handled in a special way - we'll never actually call a render or setter method on them. We'll just loop through them in the parent complex string PropTween's render method.

      pt._pt = {
        _next: pt._pt,
        p: chunk || matchIndex === 1 ? chunk : ",",
        //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
        s: startNum,
        c: endNum.charAt(1) === "=" ? _parseRelative(startNum, endNum) - startNum : parseFloat(endNum) - startNum,
        m: color && color < 4 ? Math.round : 0
      };
      index = _complexStringNumExp.lastIndex;
    }
  }

  pt.c = index < end.length ? end.substring(index, end.length) : ""; //we use the "c" of the PropTween to store the final part of the string (after the last number)

  pt.fp = funcParam;

  if (_relExp.test(end) || hasRandom) {
    pt.e = 0; //if the end string contains relative values or dynamic random(...) values, delete the end it so that on the final render we don't actually set it to the string with += or -= characters (forces it to use the calculated value).
  }

  this._pt = pt; //start the linked list with this new PropTween. Remember, we call _addComplexStringPropTween.call(tweenInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.

  return pt;
},
    _addPropTween = function _addPropTween(target, prop, start, end, index, targets, modifier, stringFilter, funcParam, optional) {
  _isFunction(end) && (end = end(index || 0, target, targets));
  var currentValue = target[prop],
      parsedStart = start !== "get" ? start : !_isFunction(currentValue) ? currentValue : funcParam ? target[prop.indexOf("set") || !_isFunction(target["get" + prop.substr(3)]) ? prop : "get" + prop.substr(3)](funcParam) : target[prop](),
      setter = !_isFunction(currentValue) ? _setterPlain : funcParam ? _setterFuncWithParam : _setterFunc,
      pt;

  if (_isString(end)) {
    if (~end.indexOf("random(")) {
      end = _replaceRandom(end);
    }

    if (end.charAt(1) === "=") {
      pt = _parseRelative(parsedStart, end) + (getUnit(parsedStart) || 0);

      if (pt || pt === 0) {
        // to avoid isNaN, like if someone passes in a value like "!= whatever"
        end = pt;
      }
    }
  }

  if (!optional || parsedStart !== end || _forceAllPropTweens) {
    if (!isNaN(parsedStart * end) && end !== "") {
      // fun fact: any number multiplied by "" is evaluated as the number 0!
      pt = new PropTween(this._pt, target, prop, +parsedStart || 0, end - (parsedStart || 0), typeof currentValue === "boolean" ? _renderBoolean : _renderPlain, 0, setter);
      funcParam && (pt.fp = funcParam);
      modifier && pt.modifier(modifier, this, target);
      return this._pt = pt;
    }

    !currentValue && !(prop in target) && _missingPlugin(prop, end);
    return _addComplexStringPropTween.call(this, target, prop, parsedStart, end, setter, stringFilter || _config.stringFilter, funcParam);
  }
},
    //creates a copy of the vars object and processes any function-based values (putting the resulting values directly into the copy) as well as strings with "random()" in them. It does NOT process relative values.
_processVars = function _processVars(vars, index, target, targets, tween) {
  _isFunction(vars) && (vars = _parseFuncOrString(vars, tween, index, target, targets));

  if (!_isObject(vars) || vars.style && vars.nodeType || _isArray(vars) || _isTypedArray(vars)) {
    return _isString(vars) ? _parseFuncOrString(vars, tween, index, target, targets) : vars;
  }

  var copy = {},
      p;

  for (p in vars) {
    copy[p] = _parseFuncOrString(vars[p], tween, index, target, targets);
  }

  return copy;
},
    _checkPlugin = function _checkPlugin(property, vars, tween, index, target, targets) {
  var plugin, pt, ptLookup, i;

  if (_plugins[property] && (plugin = new _plugins[property]()).init(target, plugin.rawVars ? vars[property] : _processVars(vars[property], index, target, targets, tween), tween, index, targets) !== false) {
    tween._pt = pt = new PropTween(tween._pt, target, property, 0, 1, plugin.render, plugin, 0, plugin.priority);

    if (tween !== _quickTween) {
      ptLookup = tween._ptLookup[tween._targets.indexOf(target)]; //note: we can't use tween._ptLookup[index] because for staggered tweens, the index from the fullTargets array won't match what it is in each individual tween that spawns from the stagger.

      i = plugin._props.length;

      while (i--) {
        ptLookup[plugin._props[i]] = pt;
      }
    }
  }

  return plugin;
},
    _overwritingTween,
    //store a reference temporarily so we can avoid overwriting itself.
_forceAllPropTweens,
    _initTween = function _initTween(tween, time, tTime) {
  var vars = tween.vars,
      ease = vars.ease,
      startAt = vars.startAt,
      immediateRender = vars.immediateRender,
      lazy = vars.lazy,
      onUpdate = vars.onUpdate,
      runBackwards = vars.runBackwards,
      yoyoEase = vars.yoyoEase,
      keyframes = vars.keyframes,
      autoRevert = vars.autoRevert,
      dur = tween._dur,
      prevStartAt = tween._startAt,
      targets = tween._targets,
      parent = tween.parent,
      fullTargets = parent && parent.data === "nested" ? parent.vars.targets : targets,
      autoOverwrite = tween._overwrite === "auto" && !_suppressOverwrites,
      tl = tween.timeline,
      cleanVars,
      i,
      p,
      pt,
      target,
      hasPriority,
      gsData,
      harness,
      plugin,
      ptLookup,
      index,
      harnessVars,
      overwritten;
  tl && (!keyframes || !ease) && (ease = "none");
  tween._ease = _parseEase(ease, _defaults.ease);
  tween._yEase = yoyoEase ? _invertEase(_parseEase(yoyoEase === true ? ease : yoyoEase, _defaults.ease)) : 0;

  if (yoyoEase && tween._yoyo && !tween._repeat) {
    //there must have been a parent timeline with yoyo:true that is currently in its yoyo phase, so flip the eases.
    yoyoEase = tween._yEase;
    tween._yEase = tween._ease;
    tween._ease = yoyoEase;
  }

  tween._from = !tl && !!vars.runBackwards; //nested timelines should never run backwards - the backwards-ness is in the child tweens.

  if (!tl || keyframes && !vars.stagger) {
    //if there's an internal timeline, skip all the parsing because we passed that task down the chain.
    harness = targets[0] ? _getCache(targets[0]).harness : 0;
    harnessVars = harness && vars[harness.prop]; //someone may need to specify CSS-specific values AND non-CSS values, like if the element has an "x" property plus it's a standard DOM element. We allow people to distinguish by wrapping plugin-specific stuff in a css:{} object for example.

    cleanVars = _copyExcluding(vars, _reservedProps);

    if (prevStartAt) {
      prevStartAt._zTime < 0 && prevStartAt.progress(1); // in case it's a lazy startAt that hasn't rendered yet.

      time < 0 && runBackwards && immediateRender && !autoRevert ? prevStartAt.render(-1, true) : prevStartAt.revert(runBackwards && dur ? _revertConfigNoKill : _startAtRevertConfig); // if it's a "startAt" (not "from()" or runBackwards: true), we only need to do a shallow revert (keep transforms cached in CSSPlugin)
      // don't just _removeFromParent(prevStartAt.render(-1, true)) because that'll leave inline styles. We're creating a new _startAt for "startAt" tweens that re-capture things to ensure that if the pre-tween values changed since the tween was created, they're recorded.

      prevStartAt._lazy = 0;
    }

    if (startAt) {
      _removeFromParent(tween._startAt = Tween.set(targets, _setDefaults({
        data: "isStart",
        overwrite: false,
        parent: parent,
        immediateRender: true,
        lazy: !prevStartAt && _isNotFalse(lazy),
        startAt: null,
        delay: 0,
        onUpdate: onUpdate && function () {
          return _callback(tween, "onUpdate");
        },
        stagger: 0
      }, startAt))); //copy the properties/values into a new object to avoid collisions, like var to = {x:0}, from = {x:500}; timeline.fromTo(e, from, to).fromTo(e, to, from);


      tween._startAt._dp = 0; // don't allow it to get put back into root timeline! Like when revert() is called and totalTime() gets set.

      tween._startAt._sat = tween; // used in globalTime(). _sat stands for _startAtTween

      time < 0 && (_reverting || !immediateRender && !autoRevert) && tween._startAt.revert(_revertConfigNoKill); // rare edge case, like if a render is forced in the negative direction of a non-initted tween.

      if (immediateRender) {
        if (dur && time <= 0 && tTime <= 0) {
          // check tTime here because in the case of a yoyo tween whose playhead gets pushed to the end like tween.progress(1), we should allow it through so that the onComplete gets fired properly.
          time && (tween._zTime = time);
          return; //we skip initialization here so that overwriting doesn't occur until the tween actually begins. Otherwise, if you create several immediateRender:true tweens of the same target/properties to drop into a Timeline, the last one created would overwrite the first ones because they didn't get placed into the timeline yet before the first render occurs and kicks in overwriting.
        }
      }
    } else if (runBackwards && dur) {
      //from() tweens must be handled uniquely: their beginning values must be rendered but we don't want overwriting to occur yet (when time is still 0). Wait until the tween actually begins before doing all the routines like overwriting. At that time, we should render at the END of the tween to ensure that things initialize correctly (remember, from() tweens go backwards)
      if (!prevStartAt) {
        time && (immediateRender = false); //in rare cases (like if a from() tween runs and then is invalidate()-ed), immediateRender could be true but the initial forced-render gets skipped, so there's no need to force the render in this context when the _time is greater than 0

        p = _setDefaults({
          overwrite: false,
          data: "isFromStart",
          //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
          lazy: immediateRender && !prevStartAt && _isNotFalse(lazy),
          immediateRender: immediateRender,
          //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
          stagger: 0,
          parent: parent //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y: gsap.utils.wrap([-100,100]), stagger: 0.5})

        }, cleanVars);
        harnessVars && (p[harness.prop] = harnessVars); // in case someone does something like .from(..., {css:{}})

        _removeFromParent(tween._startAt = Tween.set(targets, p));

        tween._startAt._dp = 0; // don't allow it to get put back into root timeline!

        tween._startAt._sat = tween; // used in globalTime()

        time < 0 && (_reverting ? tween._startAt.revert(_revertConfigNoKill) : tween._startAt.render(-1, true));
        tween._zTime = time;

        if (!immediateRender) {
          _initTween(tween._startAt, _tinyNum, _tinyNum); //ensures that the initial values are recorded

        } else if (!time) {
          return;
        }
      }
    }

    tween._pt = tween._ptCache = 0;
    lazy = dur && _isNotFalse(lazy) || lazy && !dur;

    for (i = 0; i < targets.length; i++) {
      target = targets[i];
      gsData = target._gsap || _harness(targets)[i]._gsap;
      tween._ptLookup[i] = ptLookup = {};
      _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender(); //if other tweens of the same target have recently initted but haven't rendered yet, we've got to force the render so that the starting values are correct (imagine populating a timeline with a bunch of sequential tweens and then jumping to the end)

      index = fullTargets === targets ? i : fullTargets.indexOf(target);

      if (harness && (plugin = new harness()).init(target, harnessVars || cleanVars, tween, index, fullTargets) !== false) {
        tween._pt = pt = new PropTween(tween._pt, target, plugin.name, 0, 1, plugin.render, plugin, 0, plugin.priority);

        plugin._props.forEach(function (name) {
          ptLookup[name] = pt;
        });

        plugin.priority && (hasPriority = 1);
      }

      if (!harness || harnessVars) {
        for (p in cleanVars) {
          if (_plugins[p] && (plugin = _checkPlugin(p, cleanVars, tween, index, target, fullTargets))) {
            plugin.priority && (hasPriority = 1);
          } else {
            ptLookup[p] = pt = _addPropTween.call(tween, target, p, "get", cleanVars[p], index, fullTargets, 0, vars.stringFilter);
          }
        }
      }

      tween._op && tween._op[i] && tween.kill(target, tween._op[i]);

      if (autoOverwrite && tween._pt) {
        _overwritingTween = tween;

        _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(time)); // make sure the overwriting doesn't overwrite THIS tween!!!


        overwritten = !tween.parent;
        _overwritingTween = 0;
      }

      tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
    }

    hasPriority && _sortPropTweensByPriority(tween);
    tween._onInit && tween._onInit(tween); //plugins like RoundProps must wait until ALL of the PropTweens are instantiated. In the plugin's init() function, it sets the _onInit on the tween instance. May not be pretty/intuitive, but it's fast and keeps file size down.
  }

  tween._onUpdate = onUpdate;
  tween._initted = (!tween._op || tween._pt) && !overwritten; // if overwrittenProps resulted in the entire tween being killed, do NOT flag it as initted or else it may render for one tick.

  keyframes && time <= 0 && tl.render(_bigNum, true, true); // if there's a 0% keyframe, it'll render in the "before" state for any staggered/delayed animations thus when the following tween initializes, it'll use the "before" state instead of the "after" state as the initial values.
},
    _updatePropTweens = function _updatePropTweens(tween, property, value, start, startIsRelative, ratio, time, skipRecursion) {
  var ptCache = (tween._pt && tween._ptCache || (tween._ptCache = {}))[property],
      pt,
      rootPT,
      lookup,
      i;

  if (!ptCache) {
    ptCache = tween._ptCache[property] = [];
    lookup = tween._ptLookup;
    i = tween._targets.length;

    while (i--) {
      pt = lookup[i][property];

      if (pt && pt.d && pt.d._pt) {
        // it's a plugin, so find the nested PropTween
        pt = pt.d._pt;

        while (pt && pt.p !== property && pt.fp !== property) {
          // "fp" is functionParam for things like setting CSS variables which require .setProperty("--var-name", value)
          pt = pt._next;
        }
      }

      if (!pt) {
        // there is no PropTween associated with that property, so we must FORCE one to be created and ditch out of this
        // if the tween has other properties that already rendered at new positions, we'd normally have to rewind to put them back like tween.render(0, true) before forcing an _initTween(), but that can create another edge case like tweening a timeline's progress would trigger onUpdates to fire which could move other things around. It's better to just inform users that .resetTo() should ONLY be used for tweens that already have that property. For example, you can't gsap.to(...{ y: 0 }) and then tween.restTo("x", 200) for example.
        _forceAllPropTweens = 1; // otherwise, when we _addPropTween() and it finds no change between the start and end values, it skips creating a PropTween (for efficiency...why tween when there's no difference?) but in this case we NEED that PropTween created so we can edit it.

        tween.vars[property] = "+=0";

        _initTween(tween, time);

        _forceAllPropTweens = 0;
        return skipRecursion ? _warn(property + " not eligible for reset") : 1; // if someone tries to do a quickTo() on a special property like borderRadius which must get split into 4 different properties, that's not eligible for .resetTo().
      }

      ptCache.push(pt);
    }
  }

  i = ptCache.length;

  while (i--) {
    rootPT = ptCache[i];
    pt = rootPT._pt || rootPT; // complex values may have nested PropTweens. We only accommodate the FIRST value.

    pt.s = (start || start === 0) && !startIsRelative ? start : pt.s + (start || 0) + ratio * pt.c;
    pt.c = value - pt.s;
    rootPT.e && (rootPT.e = _round(value) + getUnit(rootPT.e)); // mainly for CSSPlugin (end value)

    rootPT.b && (rootPT.b = pt.s + getUnit(rootPT.b)); // (beginning value)
  }
},
    _addAliasesToVars = function _addAliasesToVars(targets, vars) {
  var harness = targets[0] ? _getCache(targets[0]).harness : 0,
      propertyAliases = harness && harness.aliases,
      copy,
      p,
      i,
      aliases;

  if (!propertyAliases) {
    return vars;
  }

  copy = _merge({}, vars);

  for (p in propertyAliases) {
    if (p in copy) {
      aliases = propertyAliases[p].split(",");
      i = aliases.length;

      while (i--) {
        copy[aliases[i]] = copy[p];
      }
    }
  }

  return copy;
},
    // parses multiple formats, like {"0%": {x: 100}, {"50%": {x: -20}} and { x: {"0%": 100, "50%": -20} }, and an "ease" can be set on any object. We populate an "allProps" object with an Array for each property, like {x: [{}, {}], y:[{}, {}]} with data for each property tween. The objects have a "t" (time), "v", (value), and "e" (ease) property. This allows us to piece together a timeline later.
_parseKeyframe = function _parseKeyframe(prop, obj, allProps, easeEach) {
  var ease = obj.ease || easeEach || "power1.inOut",
      p,
      a;

  if (_isArray(obj)) {
    a = allProps[prop] || (allProps[prop] = []); // t = time (out of 100), v = value, e = ease

    obj.forEach(function (value, i) {
      return a.push({
        t: i / (obj.length - 1) * 100,
        v: value,
        e: ease
      });
    });
  } else {
    for (p in obj) {
      a = allProps[p] || (allProps[p] = []);
      p === "ease" || a.push({
        t: parseFloat(prop),
        v: obj[p],
        e: ease
      });
    }
  }
},
    _parseFuncOrString = function _parseFuncOrString(value, tween, i, target, targets) {
  return _isFunction(value) ? value.call(tween, i, target, targets) : _isString(value) && ~value.indexOf("random(") ? _replaceRandom(value) : value;
},
    _staggerTweenProps = _callbackNames + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert",
    _staggerPropsToSkip = {};

_forEachName(_staggerTweenProps + ",id,stagger,delay,duration,paused,scrollTrigger", function (name) {
  return _staggerPropsToSkip[name] = 1;
});
/*
 * --------------------------------------------------------------------------------------
 * TWEEN
 * --------------------------------------------------------------------------------------
 */


var Tween = /*#__PURE__*/function (_Animation2) {
  _inheritsLoose(Tween, _Animation2);

  function Tween(targets, vars, position, skipInherit) {
    var _this3;

    if (typeof vars === "number") {
      position.duration = vars;
      vars = position;
      position = null;
    }

    _this3 = _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars)) || this;
    var _this3$vars = _this3.vars,
        duration = _this3$vars.duration,
        delay = _this3$vars.delay,
        immediateRender = _this3$vars.immediateRender,
        stagger = _this3$vars.stagger,
        overwrite = _this3$vars.overwrite,
        keyframes = _this3$vars.keyframes,
        defaults = _this3$vars.defaults,
        scrollTrigger = _this3$vars.scrollTrigger,
        yoyoEase = _this3$vars.yoyoEase,
        parent = vars.parent || _globalTimeline,
        parsedTargets = (_isArray(targets) || _isTypedArray(targets) ? _isNumber(targets[0]) : "length" in vars) ? [targets] : toArray(targets),
        tl,
        i,
        copy,
        l,
        p,
        curTarget,
        staggerFunc,
        staggerVarsToMerge;
    _this3._targets = parsedTargets.length ? _harness(parsedTargets) : _warn("GSAP target " + targets + " not found. https://gsap.com", !_config.nullTargetWarn) || [];
    _this3._ptLookup = []; //PropTween lookup. An array containing an object for each target, having keys for each tweening property

    _this3._overwrite = overwrite;

    if (keyframes || stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
      vars = _this3.vars;
      tl = _this3.timeline = new Timeline({
        data: "nested",
        defaults: defaults || {},
        targets: parent && parent.data === "nested" ? parent.vars.targets : parsedTargets
      }); // we need to store the targets because for staggers and keyframes, we end up creating an individual tween for each but function-based values need to know the index and the whole Array of targets.

      tl.kill();
      tl.parent = tl._dp = _assertThisInitialized(_this3);
      tl._start = 0;

      if (stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
        l = parsedTargets.length;
        staggerFunc = stagger && distribute(stagger);

        if (_isObject(stagger)) {
          //users can pass in callbacks like onStart/onComplete in the stagger object. These should fire with each individual tween.
          for (p in stagger) {
            if (~_staggerTweenProps.indexOf(p)) {
              staggerVarsToMerge || (staggerVarsToMerge = {});
              staggerVarsToMerge[p] = stagger[p];
            }
          }
        }

        for (i = 0; i < l; i++) {
          copy = _copyExcluding(vars, _staggerPropsToSkip);
          copy.stagger = 0;
          yoyoEase && (copy.yoyoEase = yoyoEase);
          staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
          curTarget = parsedTargets[i]; //don't just copy duration or delay because if they're a string or function, we'd end up in an infinite loop because _isFuncOrString() would evaluate as true in the child tweens, entering this loop, etc. So we parse the value straight from vars and default to 0.

          copy.duration = +_parseFuncOrString(duration, _assertThisInitialized(_this3), i, curTarget, parsedTargets);
          copy.delay = (+_parseFuncOrString(delay, _assertThisInitialized(_this3), i, curTarget, parsedTargets) || 0) - _this3._delay;

          if (!stagger && l === 1 && copy.delay) {
            // if someone does delay:"random(1, 5)", repeat:-1, for example, the delay shouldn't be inside the repeat.
            _this3._delay = delay = copy.delay;
            _this3._start += delay;
            copy.delay = 0;
          }

          tl.to(curTarget, copy, staggerFunc ? staggerFunc(i, curTarget, parsedTargets) : 0);
          tl._ease = _easeMap.none;
        }

        tl.duration() ? duration = delay = 0 : _this3.timeline = 0; // if the timeline's duration is 0, we don't need a timeline internally!
      } else if (keyframes) {
        _inheritDefaults(_setDefaults(tl.vars.defaults, {
          ease: "none"
        }));

        tl._ease = _parseEase(keyframes.ease || vars.ease || "none");
        var time = 0,
            a,
            kf,
            v;

        if (_isArray(keyframes)) {
          keyframes.forEach(function (frame) {
            return tl.to(parsedTargets, frame, ">");
          });
          tl.duration(); // to ensure tl._dur is cached because we tap into it for performance purposes in the render() method.
        } else {
          copy = {};

          for (p in keyframes) {
            p === "ease" || p === "easeEach" || _parseKeyframe(p, keyframes[p], copy, keyframes.easeEach);
          }

          for (p in copy) {
            a = copy[p].sort(function (a, b) {
              return a.t - b.t;
            });
            time = 0;

            for (i = 0; i < a.length; i++) {
              kf = a[i];
              v = {
                ease: kf.e,
                duration: (kf.t - (i ? a[i - 1].t : 0)) / 100 * duration
              };
              v[p] = kf.v;
              tl.to(parsedTargets, v, time);
              time += v.duration;
            }
          }

          tl.duration() < duration && tl.to({}, {
            duration: duration - tl.duration()
          }); // in case keyframes didn't go to 100%
        }
      }

      duration || _this3.duration(duration = tl.duration());
    } else {
      _this3.timeline = 0; //speed optimization, faster lookups (no going up the prototype chain)
    }

    if (overwrite === true && !_suppressOverwrites) {
      _overwritingTween = _assertThisInitialized(_this3);

      _globalTimeline.killTweensOf(parsedTargets);

      _overwritingTween = 0;
    }

    _addToTimeline(parent, _assertThisInitialized(_this3), position);

    vars.reversed && _this3.reverse();
    vars.paused && _this3.paused(true);

    if (immediateRender || !duration && !keyframes && _this3._start === _roundPrecise(parent._time) && _isNotFalse(immediateRender) && _hasNoPausedAncestors(_assertThisInitialized(_this3)) && parent.data !== "nested") {
      _this3._tTime = -_tinyNum; //forces a render without having to set the render() "force" parameter to true because we want to allow lazying by default (using the "force" parameter always forces an immediate full render)

      _this3.render(Math.max(0, -delay) || 0); //in case delay is negative

    }

    scrollTrigger && _scrollTrigger(_assertThisInitialized(_this3), scrollTrigger);
    return _this3;
  }

  var _proto3 = Tween.prototype;

  _proto3.render = function render(totalTime, suppressEvents, force) {
    var prevTime = this._time,
        tDur = this._tDur,
        dur = this._dur,
        isNegative = totalTime < 0,
        tTime = totalTime > tDur - _tinyNum && !isNegative ? tDur : totalTime < _tinyNum ? 0 : totalTime,
        time,
        pt,
        iteration,
        cycleDuration,
        prevIteration,
        isYoyo,
        ratio,
        timeline,
        yoyoEase;

    if (!dur) {
      _renderZeroDurationTween(this, totalTime, suppressEvents, force);
    } else if (tTime !== this._tTime || !totalTime || force || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== isNegative) {
      //this senses if we're crossing over the start time, in which case we must record _zTime and force the render, but we do it in this lengthy conditional way for performance reasons (usually we can skip the calculations): this._initted && (this._zTime < 0) !== (totalTime < 0)
      time = tTime;
      timeline = this.timeline;

      if (this._repeat) {
        //adjust the time for repeats and yoyos
        cycleDuration = dur + this._rDelay;

        if (this._repeat < -1 && isNegative) {
          return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
        }

        time = _roundPrecise(tTime % cycleDuration); //round to avoid floating point errors. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)

        if (tTime === tDur) {
          // the tDur === tTime is for edge cases where there's a lengthy decimal on the duration and it may reach the very end but the time is rendered as not-quite-there (remember, tDur is rounded to 4 decimals whereas dur isn't)
          iteration = this._repeat;
          time = dur;
        } else {
          iteration = ~~(tTime / cycleDuration);

          if (iteration && iteration === _roundPrecise(tTime / cycleDuration)) {
            time = dur;
            iteration--;
          }

          time > dur && (time = dur);
        }

        isYoyo = this._yoyo && iteration & 1;

        if (isYoyo) {
          yoyoEase = this._yEase;
          time = dur - time;
        }

        prevIteration = _animationCycle(this._tTime, cycleDuration);

        if (time === prevTime && !force && this._initted && iteration === prevIteration) {
          //could be during the repeatDelay part. No need to render and fire callbacks.
          this._tTime = tTime;
          return this;
        }

        if (iteration !== prevIteration) {
          timeline && this._yEase && _propagateYoyoEase(timeline, isYoyo); //repeatRefresh functionality

          if (this.vars.repeatRefresh && !isYoyo && !this._lock && this._time !== cycleDuration && this._initted) {
            // this._time will === cycleDuration when we render at EXACTLY the end of an iteration. Without this condition, it'd often do the repeatRefresh render TWICE (again on the very next tick).
            this._lock = force = 1; //force, otherwise if lazy is true, the _attemptInitTween() will return and we'll jump out and get caught bouncing on each tick.

            this.render(_roundPrecise(cycleDuration * iteration), true).invalidate()._lock = 0;
          }
        }
      }

      if (!this._initted) {
        if (_attemptInitTween(this, isNegative ? totalTime : time, force, suppressEvents, tTime)) {
          this._tTime = 0; // in constructor if immediateRender is true, we set _tTime to -_tinyNum to have the playhead cross the starting point but we can't leave _tTime as a negative number.

          return this;
        }

        if (prevTime !== this._time && !(force && this.vars.repeatRefresh && iteration !== prevIteration)) {
          // rare edge case - during initialization, an onUpdate in the _startAt (.fromTo()) might force this tween to render at a different spot in which case we should ditch this render() call so that it doesn't revert the values. But we also don't want to dump if we're doing a repeatRefresh render!
          return this;
        }

        if (dur !== this._dur) {
          // while initting, a plugin like InertiaPlugin might alter the duration, so rerun from the start to ensure everything renders as it should.
          return this.render(totalTime, suppressEvents, force);
        }
      }

      this._tTime = tTime;
      this._time = time;

      if (!this._act && this._ts) {
        this._act = 1; //as long as it's not paused, force it to be active so that if the user renders independent of the parent timeline, it'll be forced to re-render on the next tick.

        this._lazy = 0;
      }

      this.ratio = ratio = (yoyoEase || this._ease)(time / dur);

      if (this._from) {
        this.ratio = ratio = 1 - ratio;
      }

      if (time && !prevTime && !suppressEvents && !iteration) {
        _callback(this, "onStart");

        if (this._tTime !== tTime) {
          // in case the onStart triggered a render at a different spot, eject. Like if someone did animation.pause(0.5) or something inside the onStart.
          return this;
        }
      }

      pt = this._pt;

      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }

      timeline && timeline.render(totalTime < 0 ? totalTime : timeline._dur * timeline._ease(time / this._dur), suppressEvents, force) || this._startAt && (this._zTime = totalTime);

      if (this._onUpdate && !suppressEvents) {
        isNegative && _rewindStartAt(this, totalTime, suppressEvents, force); //note: for performance reasons, we tuck this conditional logic inside less traveled areas (most tweens don't have an onUpdate). We'd just have it at the end before the onComplete, but the values should be updated before any onUpdate is called, so we ALSO put it here and then if it's not called, we do so later near the onComplete.

        _callback(this, "onUpdate");
      }

      this._repeat && iteration !== prevIteration && this.vars.onRepeat && !suppressEvents && this.parent && _callback(this, "onRepeat");

      if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
        isNegative && !this._onUpdate && _rewindStartAt(this, totalTime, true, true);
        (totalTime || !dur) && (tTime === this._tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1); // don't remove if we're rendering at exactly a time of 0, as there could be autoRevert values that should get set on the next tick (if the playhead goes backward beyond the startTime, negative totalTime). Don't remove if the timeline is reversed and the playhead isn't at 0, otherwise tl.progress(1).reverse() won't work. Only remove if the playhead is at the end and timeScale is positive, or if the playhead is at 0 and the timeScale is negative.

        if (!suppressEvents && !(isNegative && !prevTime) && (tTime || prevTime || isYoyo)) {
          // if prevTime and tTime are zero, we shouldn't fire the onReverseComplete. This could happen if you gsap.to(... {paused:true}).play();
          _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);

          this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
        }
      }
    }

    return this;
  };

  _proto3.targets = function targets() {
    return this._targets;
  };

  _proto3.invalidate = function invalidate(soft) {
    // "soft" gives us a way to clear out everything EXCEPT the recorded pre-"from" portion of from() tweens. Otherwise, for example, if you tween.progress(1).render(0, true true).invalidate(), the "from" values would persist and then on the next render, the from() tweens would initialize and the current value would match the "from" values, thus animate from the same value to the same value (no animation). We tap into this in ScrollTrigger's refresh() where we must push a tween to completion and then back again but honor its init state in case the tween is dependent on another tween further up on the page.
    (!soft || !this.vars.runBackwards) && (this._startAt = 0);
    this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0;
    this._ptLookup = [];
    this.timeline && this.timeline.invalidate(soft);
    return _Animation2.prototype.invalidate.call(this, soft);
  };

  _proto3.resetTo = function resetTo(property, value, start, startIsRelative, skipRecursion) {
    _tickerActive || _ticker.wake();
    this._ts || this.play();
    var time = Math.min(this._dur, (this._dp._time - this._start) * this._ts),
        ratio;
    this._initted || _initTween(this, time);
    ratio = this._ease(time / this._dur); // don't just get tween.ratio because it may not have rendered yet.
    // possible future addition to allow an object with multiple values to update, like tween.resetTo({x: 100, y: 200}); At this point, it doesn't seem worth the added kb given the fact that most users will likely opt for the convenient gsap.quickTo() way of interacting with this method.
    // if (_isObject(property)) { // performance optimization
    // 	for (p in property) {
    // 		if (_updatePropTweens(this, p, property[p], value ? value[p] : null, start, ratio, time)) {
    // 			return this.resetTo(property, value, start, startIsRelative); // if a PropTween wasn't found for the property, it'll get forced with a re-initialization so we need to jump out and start over again.
    // 		}
    // 	}
    // } else {

    if (_updatePropTweens(this, property, value, start, startIsRelative, ratio, time, skipRecursion)) {
      return this.resetTo(property, value, start, startIsRelative, 1); // if a PropTween wasn't found for the property, it'll get forced with a re-initialization so we need to jump out and start over again.
    } //}


    _alignPlayhead(this, 0);

    this.parent || _addLinkedListItem(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0);
    return this.render(0);
  };

  _proto3.kill = function kill(targets, vars) {
    if (vars === void 0) {
      vars = "all";
    }

    if (!targets && (!vars || vars === "all")) {
      this._lazy = this._pt = 0;
      return this.parent ? _interrupt(this) : this;
    }

    if (this.timeline) {
      var tDur = this.timeline.totalDuration();
      this.timeline.killTweensOf(targets, vars, _overwritingTween && _overwritingTween.vars.overwrite !== true)._first || _interrupt(this); // if nothing is left tweening, interrupt.

      this.parent && tDur !== this.timeline.totalDuration() && _setDuration(this, this._dur * this.timeline._tDur / tDur, 0, 1); // if a nested tween is killed that changes the duration, it should affect this tween's duration. We must use the ratio, though, because sometimes the internal timeline is stretched like for keyframes where they don't all add up to whatever the parent tween's duration was set to.

      return this;
    }

    var parsedTargets = this._targets,
        killingTargets = targets ? toArray(targets) : parsedTargets,
        propTweenLookup = this._ptLookup,
        firstPT = this._pt,
        overwrittenProps,
        curLookup,
        curOverwriteProps,
        props,
        p,
        pt,
        i;

    if ((!vars || vars === "all") && _arraysMatch(parsedTargets, killingTargets)) {
      vars === "all" && (this._pt = 0);
      return _interrupt(this);
    }

    overwrittenProps = this._op = this._op || [];

    if (vars !== "all") {
      //so people can pass in a comma-delimited list of property names
      if (_isString(vars)) {
        p = {};

        _forEachName(vars, function (name) {
          return p[name] = 1;
        });

        vars = p;
      }

      vars = _addAliasesToVars(parsedTargets, vars);
    }

    i = parsedTargets.length;

    while (i--) {
      if (~killingTargets.indexOf(parsedTargets[i])) {
        curLookup = propTweenLookup[i];

        if (vars === "all") {
          overwrittenProps[i] = vars;
          props = curLookup;
          curOverwriteProps = {};
        } else {
          curOverwriteProps = overwrittenProps[i] = overwrittenProps[i] || {};
          props = vars;
        }

        for (p in props) {
          pt = curLookup && curLookup[p];

          if (pt) {
            if (!("kill" in pt.d) || pt.d.kill(p) === true) {
              _removeLinkedListItem(this, pt, "_pt");
            }

            delete curLookup[p];
          }

          if (curOverwriteProps !== "all") {
            curOverwriteProps[p] = 1;
          }
        }
      }
    }

    this._initted && !this._pt && firstPT && _interrupt(this); //if all tweening properties are killed, kill the tween. Without this line, if there's a tween with multiple targets and then you killTweensOf() each target individually, the tween would technically still remain active and fire its onComplete even though there aren't any more properties tweening.

    return this;
  };

  Tween.to = function to(targets, vars) {
    return new Tween(targets, vars, arguments[2]);
  };

  Tween.from = function from(targets, vars) {
    return _createTweenType(1, arguments);
  };

  Tween.delayedCall = function delayedCall(delay, callback, params, scope) {
    return new Tween(callback, 0, {
      immediateRender: false,
      lazy: false,
      overwrite: false,
      delay: delay,
      onComplete: callback,
      onReverseComplete: callback,
      onCompleteParams: params,
      onReverseCompleteParams: params,
      callbackScope: scope
    }); // we must use onReverseComplete too for things like timeline.add(() => {...}) which should be triggered in BOTH directions (forward and reverse)
  };

  Tween.fromTo = function fromTo(targets, fromVars, toVars) {
    return _createTweenType(2, arguments);
  };

  Tween.set = function set(targets, vars) {
    vars.duration = 0;
    vars.repeatDelay || (vars.repeat = 0);
    return new Tween(targets, vars);
  };

  Tween.killTweensOf = function killTweensOf(targets, props, onlyActive) {
    return _globalTimeline.killTweensOf(targets, props, onlyActive);
  };

  return Tween;
}(Animation);

_setDefaults(Tween.prototype, {
  _targets: [],
  _lazy: 0,
  _startAt: 0,
  _op: 0,
  _onInit: 0
}); //add the pertinent timeline methods to Tween instances so that users can chain conveniently and create a timeline automatically. (removed due to concerns that it'd ultimately add to more confusion especially for beginners)
// _forEachName("to,from,fromTo,set,call,add,addLabel,addPause", name => {
// 	Tween.prototype[name] = function() {
// 		let tl = new Timeline();
// 		return _addToTimeline(tl, this)[name].apply(tl, toArray(arguments));
// 	}
// });
//for backward compatibility. Leverage the timeline calls.


_forEachName("staggerTo,staggerFrom,staggerFromTo", function (name) {
  Tween[name] = function () {
    var tl = new Timeline(),
        params = _slice.call(arguments, 0);

    params.splice(name === "staggerFromTo" ? 5 : 4, 0, 0);
    return tl[name].apply(tl, params);
  };
});
/*
 * --------------------------------------------------------------------------------------
 * PROPTWEEN
 * --------------------------------------------------------------------------------------
 */


var _setterPlain = function _setterPlain(target, property, value) {
  return target[property] = value;
},
    _setterFunc = function _setterFunc(target, property, value) {
  return target[property](value);
},
    _setterFuncWithParam = function _setterFuncWithParam(target, property, value, data) {
  return target[property](data.fp, value);
},
    _setterAttribute = function _setterAttribute(target, property, value) {
  return target.setAttribute(property, value);
},
    _getSetter = function _getSetter(target, property) {
  return _isFunction(target[property]) ? _setterFunc : _isUndefined(target[property]) && target.setAttribute ? _setterAttribute : _setterPlain;
},
    _renderPlain = function _renderPlain(ratio, data) {
  return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1000000) / 1000000, data);
},
    _renderBoolean = function _renderBoolean(ratio, data) {
  return data.set(data.t, data.p, !!(data.s + data.c * ratio), data);
},
    _renderComplexString = function _renderComplexString(ratio, data) {
  var pt = data._pt,
      s = "";

  if (!ratio && data.b) {
    //b = beginning string
    s = data.b;
  } else if (ratio === 1 && data.e) {
    //e = ending string
    s = data.e;
  } else {
    while (pt) {
      s = pt.p + (pt.m ? pt.m(pt.s + pt.c * ratio) : Math.round((pt.s + pt.c * ratio) * 10000) / 10000) + s; //we use the "p" property for the text inbetween (like a suffix). And in the context of a complex string, the modifier (m) is typically just Math.round(), like for RGB colors.

      pt = pt._next;
    }

    s += data.c; //we use the "c" of the PropTween to store the final chunk of non-numeric text.
  }

  data.set(data.t, data.p, s, data);
},
    _renderPropTweens = function _renderPropTweens(ratio, data) {
  var pt = data._pt;

  while (pt) {
    pt.r(ratio, pt.d);
    pt = pt._next;
  }
},
    _addPluginModifier = function _addPluginModifier(modifier, tween, target, property) {
  var pt = this._pt,
      next;

  while (pt) {
    next = pt._next;
    pt.p === property && pt.modifier(modifier, tween, target);
    pt = next;
  }
},
    _killPropTweensOf = function _killPropTweensOf(property) {
  var pt = this._pt,
      hasNonDependentRemaining,
      next;

  while (pt) {
    next = pt._next;

    if (pt.p === property && !pt.op || pt.op === property) {
      _removeLinkedListItem(this, pt, "_pt");
    } else if (!pt.dep) {
      hasNonDependentRemaining = 1;
    }

    pt = next;
  }

  return !hasNonDependentRemaining;
},
    _setterWithModifier = function _setterWithModifier(target, property, value, data) {
  data.mSet(target, property, data.m.call(data.tween, value, data.mt), data);
},
    _sortPropTweensByPriority = function _sortPropTweensByPriority(parent) {
  var pt = parent._pt,
      next,
      pt2,
      first,
      last; //sorts the PropTween linked list in order of priority because some plugins need to do their work after ALL of the PropTweens were created (like RoundPropsPlugin and ModifiersPlugin)

  while (pt) {
    next = pt._next;
    pt2 = first;

    while (pt2 && pt2.pr > pt.pr) {
      pt2 = pt2._next;
    }

    if (pt._prev = pt2 ? pt2._prev : last) {
      pt._prev._next = pt;
    } else {
      first = pt;
    }

    if (pt._next = pt2) {
      pt2._prev = pt;
    } else {
      last = pt;
    }

    pt = next;
  }

  parent._pt = first;
}; //PropTween key: t = target, p = prop, r = renderer, d = data, s = start, c = change, op = overwriteProperty (ONLY populated when it's different than p), pr = priority, _next/_prev for the linked list siblings, set = setter, m = modifier, mSet = modifierSetter (the original setter, before a modifier was added)


var PropTween = /*#__PURE__*/function () {
  function PropTween(next, target, prop, start, change, renderer, data, setter, priority) {
    this.t = target;
    this.s = start;
    this.c = change;
    this.p = prop;
    this.r = renderer || _renderPlain;
    this.d = data || this;
    this.set = setter || _setterPlain;
    this.pr = priority || 0;
    this._next = next;

    if (next) {
      next._prev = this;
    }
  }

  var _proto4 = PropTween.prototype;

  _proto4.modifier = function modifier(func, tween, target) {
    this.mSet = this.mSet || this.set; //in case it was already set (a PropTween can only have one modifier)

    this.set = _setterWithModifier;
    this.m = func;
    this.mt = target; //modifier target

    this.tween = tween;
  };

  return PropTween;
}(); //Initialization tasks

_forEachName(_callbackNames + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function (name) {
  return _reservedProps[name] = 1;
});

_globals.TweenMax = _globals.TweenLite = Tween;
_globals.TimelineLite = _globals.TimelineMax = Timeline;
_globalTimeline = new Timeline({
  sortChildren: false,
  defaults: _defaults,
  autoRemoveChildren: true,
  id: "root",
  smoothChildTiming: true
});
_config.stringFilter = _colorStringFilter;

var _media = [],
    _listeners = {},
    _emptyArray = [],
    _lastMediaTime = 0,
    _contextID = 0,
    _dispatch = function _dispatch(type) {
  return (_listeners[type] || _emptyArray).map(function (f) {
    return f();
  });
},
    _onMediaChange = function _onMediaChange() {
  var time = Date.now(),
      matches = [];

  if (time - _lastMediaTime > 2) {
    _dispatch("matchMediaInit");

    _media.forEach(function (c) {
      var queries = c.queries,
          conditions = c.conditions,
          match,
          p,
          anyMatch,
          toggled;

      for (p in queries) {
        match = _win.matchMedia(queries[p]).matches; // Firefox doesn't update the "matches" property of the MediaQueryList object correctly - it only does so as it calls its change handler - so we must re-create a media query here to ensure it's accurate.

        match && (anyMatch = 1);

        if (match !== conditions[p]) {
          conditions[p] = match;
          toggled = 1;
        }
      }

      if (toggled) {
        c.revert();
        anyMatch && matches.push(c);
      }
    });

    _dispatch("matchMediaRevert");

    matches.forEach(function (c) {
      return c.onMatch(c, function (func) {
        return c.add(null, func);
      });
    });
    _lastMediaTime = time;

    _dispatch("matchMedia");
  }
};

var Context = /*#__PURE__*/function () {
  function Context(func, scope) {
    this.selector = scope && selector(scope);
    this.data = [];
    this._r = []; // returned/cleanup functions

    this.isReverted = false;
    this.id = _contextID++; // to work around issues that frameworks like Vue cause by making things into Proxies which make it impossible to do something like _media.indexOf(this) because "this" would no longer refer to the Context instance itself - it'd refer to a Proxy! We needed a way to identify the context uniquely

    func && this.add(func);
  }

  var _proto5 = Context.prototype;

  _proto5.add = function add(name, func, scope) {
    // possible future addition if we need the ability to add() an animation to a context and for whatever reason cannot create that animation inside of a context.add(() => {...}) function.
    // if (name && _isFunction(name.revert)) {
    // 	this.data.push(name);
    // 	return (name._ctx = this);
    // }
    if (_isFunction(name)) {
      scope = func;
      func = name;
      name = _isFunction;
    }

    var self = this,
        f = function f() {
      var prev = _context,
          prevSelector = self.selector,
          result;
      prev && prev !== self && prev.data.push(self);
      scope && (self.selector = selector(scope));
      _context = self;
      result = func.apply(self, arguments);
      _isFunction(result) && self._r.push(result);
      _context = prev;
      self.selector = prevSelector;
      self.isReverted = false;
      return result;
    };

    self.last = f;
    return name === _isFunction ? f(self, function (func) {
      return self.add(null, func);
    }) : name ? self[name] = f : f;
  };

  _proto5.ignore = function ignore(func) {
    var prev = _context;
    _context = null;
    func(this);
    _context = prev;
  };

  _proto5.getTweens = function getTweens() {
    var a = [];
    this.data.forEach(function (e) {
      return e instanceof Context ? a.push.apply(a, e.getTweens()) : e instanceof Tween && !(e.parent && e.parent.data === "nested") && a.push(e);
    });
    return a;
  };

  _proto5.clear = function clear() {
    this._r.length = this.data.length = 0;
  };

  _proto5.kill = function kill(revert, matchMedia) {
    var _this4 = this;

    if (revert) {
      (function () {
        var tweens = _this4.getTweens(),
            i = _this4.data.length,
            t;

        while (i--) {
          // Flip plugin tweens are very different in that they should actually be pushed to their end. The plugin replaces the timeline's .revert() method to do exactly that. But we also need to remove any of those nested tweens inside the flip timeline so that they don't get individually reverted.
          t = _this4.data[i];

          if (t.data === "isFlip") {
            t.revert();
            t.getChildren(true, true, false).forEach(function (tween) {
              return tweens.splice(tweens.indexOf(tween), 1);
            });
          }
        } // save as an object so that we can cache the globalTime for each tween to optimize performance during the sort


        tweens.map(function (t) {
          return {
            g: t._dur || t._delay || t._sat && !t._sat.vars.immediateRender ? t.globalTime(0) : -Infinity,
            t: t
          };
        }).sort(function (a, b) {
          return b.g - a.g || -Infinity;
        }).forEach(function (o) {
          return o.t.revert(revert);
        }); // note: all of the _startAt tweens should be reverted in reverse order that they were created, and they'll all have the same globalTime (-1) so the " || -1" in the sort keeps the order properly.

        i = _this4.data.length;

        while (i--) {
          // make sure we loop backwards so that, for example, SplitTexts that were created later on the same element get reverted first
          t = _this4.data[i];

          if (t instanceof Timeline) {
            if (t.data !== "nested") {
              t.scrollTrigger && t.scrollTrigger.revert();
              t.kill(); // don't revert() the timeline because that's duplicating efforts since we already reverted all the tweens
            }
          } else {
            !(t instanceof Tween) && t.revert && t.revert(revert);
          }
        }

        _this4._r.forEach(function (f) {
          return f(revert, _this4);
        });

        _this4.isReverted = true;
      })();
    } else {
      this.data.forEach(function (e) {
        return e.kill && e.kill();
      });
    }

    this.clear();

    if (matchMedia) {
      var i = _media.length;

      while (i--) {
        // previously, we checked _media.indexOf(this), but some frameworks like Vue enforce Proxy objects that make it impossible to get the proper result that way, so we must use a unique ID number instead.
        _media[i].id === this.id && _media.splice(i, 1);
      }
    }
  };

  _proto5.revert = function revert(config) {
    this.kill(config || {});
  };

  return Context;
}();

var MatchMedia = /*#__PURE__*/function () {
  function MatchMedia(scope) {
    this.contexts = [];
    this.scope = scope;
    _context && _context.data.push(this);
  }

  var _proto6 = MatchMedia.prototype;

  _proto6.add = function add(conditions, func, scope) {
    _isObject(conditions) || (conditions = {
      matches: conditions
    });
    var context = new Context(0, scope || this.scope),
        cond = context.conditions = {},
        mq,
        p,
        active;
    _context && !context.selector && (context.selector = _context.selector); // in case a context is created inside a context. Like a gsap.matchMedia() that's inside a scoped gsap.context()

    this.contexts.push(context);
    func = context.add("onMatch", func);
    context.queries = conditions;

    for (p in conditions) {
      if (p === "all") {
        active = 1;
      } else {
        mq = _win.matchMedia(conditions[p]);

        if (mq) {
          _media.indexOf(context) < 0 && _media.push(context);
          (cond[p] = mq.matches) && (active = 1);
          mq.addListener ? mq.addListener(_onMediaChange) : mq.addEventListener("change", _onMediaChange);
        }
      }
    }

    active && func(context, function (f) {
      return context.add(null, f);
    });
    return this;
  } // refresh() {
  // 	let time = _lastMediaTime,
  // 		media = _media;
  // 	_lastMediaTime = -1;
  // 	_media = this.contexts;
  // 	_onMediaChange();
  // 	_lastMediaTime = time;
  // 	_media = media;
  // }
  ;

  _proto6.revert = function revert(config) {
    this.kill(config || {});
  };

  _proto6.kill = function kill(revert) {
    this.contexts.forEach(function (c) {
      return c.kill(revert, true);
    });
  };

  return MatchMedia;
}();
/*
 * --------------------------------------------------------------------------------------
 * GSAP
 * --------------------------------------------------------------------------------------
 */


var _gsap = {
  registerPlugin: function registerPlugin() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    args.forEach(function (config) {
      return _createPlugin(config);
    });
  },
  timeline: function timeline(vars) {
    return new Timeline(vars);
  },
  getTweensOf: function getTweensOf(targets, onlyActive) {
    return _globalTimeline.getTweensOf(targets, onlyActive);
  },
  getProperty: function getProperty(target, property, unit, uncache) {
    _isString(target) && (target = toArray(target)[0]); //in case selector text or an array is passed in

    var getter = _getCache(target || {}).get,
        format = unit ? _passThrough : _numericIfPossible;

    unit === "native" && (unit = "");
    return !target ? target : !property ? function (property, unit, uncache) {
      return format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
    } : format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
  },
  quickSetter: function quickSetter(target, property, unit) {
    target = toArray(target);

    if (target.length > 1) {
      var setters = target.map(function (t) {
        return gsap.quickSetter(t, property, unit);
      }),
          l = setters.length;
      return function (value) {
        var i = l;

        while (i--) {
          setters[i](value);
        }
      };
    }

    target = target[0] || {};

    var Plugin = _plugins[property],
        cache = _getCache(target),
        p = cache.harness && (cache.harness.aliases || {})[property] || property,
        // in case it's an alias, like "rotate" for "rotation".
    setter = Plugin ? function (value) {
      var p = new Plugin();
      _quickTween._pt = 0;
      p.init(target, unit ? value + unit : value, _quickTween, 0, [target]);
      p.render(1, p);
      _quickTween._pt && _renderPropTweens(1, _quickTween);
    } : cache.set(target, p);

    return Plugin ? setter : function (value) {
      return setter(target, p, unit ? value + unit : value, cache, 1);
    };
  },
  quickTo: function quickTo(target, property, vars) {
    var _merge2;

    var tween = gsap.to(target, _merge((_merge2 = {}, _merge2[property] = "+=0.1", _merge2.paused = true, _merge2), vars || {})),
        func = function func(value, start, startIsRelative) {
      return tween.resetTo(property, value, start, startIsRelative);
    };

    func.tween = tween;
    return func;
  },
  isTweening: function isTweening(targets) {
    return _globalTimeline.getTweensOf(targets, true).length > 0;
  },
  defaults: function defaults(value) {
    value && value.ease && (value.ease = _parseEase(value.ease, _defaults.ease));
    return _mergeDeep(_defaults, value || {});
  },
  config: function config(value) {
    return _mergeDeep(_config, value || {});
  },
  registerEffect: function registerEffect(_ref3) {
    var name = _ref3.name,
        effect = _ref3.effect,
        plugins = _ref3.plugins,
        defaults = _ref3.defaults,
        extendTimeline = _ref3.extendTimeline;
    (plugins || "").split(",").forEach(function (pluginName) {
      return pluginName && !_plugins[pluginName] && !_globals[pluginName] && _warn(name + " effect requires " + pluginName + " plugin.");
    });

    _effects[name] = function (targets, vars, tl) {
      return effect(toArray(targets), _setDefaults(vars || {}, defaults), tl);
    };

    if (extendTimeline) {
      Timeline.prototype[name] = function (targets, vars, position) {
        return this.add(_effects[name](targets, _isObject(vars) ? vars : (position = vars) && {}, this), position);
      };
    }
  },
  registerEase: function registerEase(name, ease) {
    _easeMap[name] = _parseEase(ease);
  },
  parseEase: function parseEase(ease, defaultEase) {
    return arguments.length ? _parseEase(ease, defaultEase) : _easeMap;
  },
  getById: function getById(id) {
    return _globalTimeline.getById(id);
  },
  exportRoot: function exportRoot(vars, includeDelayedCalls) {
    if (vars === void 0) {
      vars = {};
    }

    var tl = new Timeline(vars),
        child,
        next;
    tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);

    _globalTimeline.remove(tl);

    tl._dp = 0; //otherwise it'll get re-activated when adding children and be re-introduced into _globalTimeline's linked list (then added to itself).

    tl._time = tl._tTime = _globalTimeline._time;
    child = _globalTimeline._first;

    while (child) {
      next = child._next;

      if (includeDelayedCalls || !(!child._dur && child instanceof Tween && child.vars.onComplete === child._targets[0])) {
        _addToTimeline(tl, child, child._start - child._delay);
      }

      child = next;
    }

    _addToTimeline(_globalTimeline, tl, 0);

    return tl;
  },
  context: function context(func, scope) {
    return func ? new Context(func, scope) : _context;
  },
  matchMedia: function matchMedia(scope) {
    return new MatchMedia(scope);
  },
  matchMediaRefresh: function matchMediaRefresh() {
    return _media.forEach(function (c) {
      var cond = c.conditions,
          found,
          p;

      for (p in cond) {
        if (cond[p]) {
          cond[p] = false;
          found = 1;
        }
      }

      found && c.revert();
    }) || _onMediaChange();
  },
  addEventListener: function addEventListener(type, callback) {
    var a = _listeners[type] || (_listeners[type] = []);
    ~a.indexOf(callback) || a.push(callback);
  },
  removeEventListener: function removeEventListener(type, callback) {
    var a = _listeners[type],
        i = a && a.indexOf(callback);
    i >= 0 && a.splice(i, 1);
  },
  utils: {
    wrap: wrap,
    wrapYoyo: wrapYoyo,
    distribute: distribute,
    random: random,
    snap: snap,
    normalize: normalize,
    getUnit: getUnit,
    clamp: clamp,
    splitColor: splitColor,
    toArray: toArray,
    selector: selector,
    mapRange: mapRange,
    pipe: pipe,
    unitize: unitize,
    interpolate: interpolate,
    shuffle: shuffle
  },
  install: _install,
  effects: _effects,
  ticker: _ticker,
  updateRoot: Timeline.updateRoot,
  plugins: _plugins,
  globalTimeline: _globalTimeline,
  core: {
    PropTween: PropTween,
    globals: _addGlobal,
    Tween: Tween,
    Timeline: Timeline,
    Animation: Animation,
    getCache: _getCache,
    _removeLinkedListItem: _removeLinkedListItem,
    reverting: function reverting() {
      return _reverting;
    },
    context: function context(toAdd) {
      if (toAdd && _context) {
        _context.data.push(toAdd);

        toAdd._ctx = _context;
      }

      return _context;
    },
    suppressOverwrites: function suppressOverwrites(value) {
      return _suppressOverwrites = value;
    }
  }
};

_forEachName("to,from,fromTo,delayedCall,set,killTweensOf", function (name) {
  return _gsap[name] = Tween[name];
});

_ticker.add(Timeline.updateRoot);

_quickTween = _gsap.to({}, {
  duration: 0
}); // ---- EXTRA PLUGINS --------------------------------------------------------

var _getPluginPropTween = function _getPluginPropTween(plugin, prop) {
  var pt = plugin._pt;

  while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) {
    pt = pt._next;
  }

  return pt;
},
    _addModifiers = function _addModifiers(tween, modifiers) {
  var targets = tween._targets,
      p,
      i,
      pt;

  for (p in modifiers) {
    i = targets.length;

    while (i--) {
      pt = tween._ptLookup[i][p];

      if (pt && (pt = pt.d)) {
        if (pt._pt) {
          // is a plugin
          pt = _getPluginPropTween(pt, p);
        }

        pt && pt.modifier && pt.modifier(modifiers[p], tween, targets[i], p);
      }
    }
  }
},
    _buildModifierPlugin = function _buildModifierPlugin(name, modifier) {
  return {
    name: name,
    rawVars: 1,
    //don't pre-process function-based values or "random()" strings.
    init: function init(target, vars, tween) {
      tween._onInit = function (tween) {
        var temp, p;

        if (_isString(vars)) {
          temp = {};

          _forEachName(vars, function (name) {
            return temp[name] = 1;
          }); //if the user passes in a comma-delimited list of property names to roundProps, like "x,y", we round to whole numbers.


          vars = temp;
        }

        if (modifier) {
          temp = {};

          for (p in vars) {
            temp[p] = modifier(vars[p]);
          }

          vars = temp;
        }

        _addModifiers(tween, vars);
      };
    }
  };
}; //register core plugins


var gsap = _gsap.registerPlugin({
  name: "attr",
  init: function init(target, vars, tween, index, targets) {
    var p, pt, v;
    this.tween = tween;

    for (p in vars) {
      v = target.getAttribute(p) || "";
      pt = this.add(target, "setAttribute", (v || 0) + "", vars[p], index, targets, 0, 0, p);
      pt.op = p;
      pt.b = v; // record the beginning value so we can revert()

      this._props.push(p);
    }
  },
  render: function render(ratio, data) {
    var pt = data._pt;

    while (pt) {
      _reverting ? pt.set(pt.t, pt.p, pt.b, pt) : pt.r(ratio, pt.d); // if reverting, go back to the original (pt.b)

      pt = pt._next;
    }
  }
}, {
  name: "endArray",
  init: function init(target, value) {
    var i = value.length;

    while (i--) {
      this.add(target, i, target[i] || 0, value[i], 0, 0, 0, 0, 0, 1);
    }
  }
}, _buildModifierPlugin("roundProps", _roundModifier), _buildModifierPlugin("modifiers"), _buildModifierPlugin("snap", snap)) || _gsap; //to prevent the core plugins from being dropped via aggressive tree shaking, we must include them in the variable declaration in this way.

Tween.version = Timeline.version = gsap.version = "3.12.5";
_coreReady = 1;
_windowExists() && _wake();
var Power0 = _easeMap.Power0,
    Power1 = _easeMap.Power1,
    Power2 = _easeMap.Power2,
    Power3 = _easeMap.Power3,
    Power4 = _easeMap.Power4,
    Linear = _easeMap.Linear,
    Quad = _easeMap.Quad,
    Cubic = _easeMap.Cubic,
    Quart = _easeMap.Quart,
    Quint = _easeMap.Quint,
    Strong = _easeMap.Strong,
    Elastic = _easeMap.Elastic,
    Back = _easeMap.Back,
    SteppedEase = _easeMap.SteppedEase,
    Bounce = _easeMap.Bounce,
    Sine = _easeMap.Sine,
    Expo = _easeMap.Expo,
    Circ = _easeMap.Circ;

 //export some internal methods/orojects for use in CSSPlugin so that we can externalize that file and allow custom builds that exclude it.


;// CONCATENATED MODULE: ./node_modules/gsap/CSSPlugin.js
/*!
 * CSSPlugin 3.12.5
 * https://gsap.com
 *
 * Copyright 2008-2024, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license or for
 * Club GSAP members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/

/* eslint-disable */


var CSSPlugin_win,
    CSSPlugin_doc,
    _docElement,
    _pluginInitted,
    _tempDiv,
    _tempDivStyler,
    _recentSetterPlugin,
    CSSPlugin_reverting,
    CSSPlugin_windowExists = function _windowExists() {
  return typeof window !== "undefined";
},
    _transformProps = {},
    _RAD2DEG = 180 / Math.PI,
    _DEG2RAD = Math.PI / 180,
    _atan2 = Math.atan2,
    CSSPlugin_bigNum = 1e8,
    _capsExp = /([A-Z])/g,
    _horizontalExp = /(left|right|width|margin|padding|x)/i,
    _complexExp = /[\s,\(]\S/,
    _propertyAliases = {
  autoAlpha: "opacity,visibility",
  scale: "scaleX,scaleY",
  alpha: "opacity"
},
    _renderCSSProp = function _renderCSSProp(ratio, data) {
  return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u, data);
},
    _renderPropWithEnd = function _renderPropWithEnd(ratio, data) {
  return data.set(data.t, data.p, ratio === 1 ? data.e : Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u, data);
},
    _renderCSSPropWithBeginning = function _renderCSSPropWithBeginning(ratio, data) {
  return data.set(data.t, data.p, ratio ? Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u : data.b, data);
},
    //if units change, we need a way to render the original unit/value when the tween goes all the way back to the beginning (ratio:0)
_renderRoundedCSSProp = function _renderRoundedCSSProp(ratio, data) {
  var value = data.s + data.c * ratio;
  data.set(data.t, data.p, ~~(value + (value < 0 ? -.5 : .5)) + data.u, data);
},
    _renderNonTweeningValue = function _renderNonTweeningValue(ratio, data) {
  return data.set(data.t, data.p, ratio ? data.e : data.b, data);
},
    _renderNonTweeningValueOnlyAtEnd = function _renderNonTweeningValueOnlyAtEnd(ratio, data) {
  return data.set(data.t, data.p, ratio !== 1 ? data.b : data.e, data);
},
    _setterCSSStyle = function _setterCSSStyle(target, property, value) {
  return target.style[property] = value;
},
    _setterCSSProp = function _setterCSSProp(target, property, value) {
  return target.style.setProperty(property, value);
},
    _setterTransform = function _setterTransform(target, property, value) {
  return target._gsap[property] = value;
},
    _setterScale = function _setterScale(target, property, value) {
  return target._gsap.scaleX = target._gsap.scaleY = value;
},
    _setterScaleWithRender = function _setterScaleWithRender(target, property, value, data, ratio) {
  var cache = target._gsap;
  cache.scaleX = cache.scaleY = value;
  cache.renderTransform(ratio, cache);
},
    _setterTransformWithRender = function _setterTransformWithRender(target, property, value, data, ratio) {
  var cache = target._gsap;
  cache[property] = value;
  cache.renderTransform(ratio, cache);
},
    _transformProp = "transform",
    _transformOriginProp = _transformProp + "Origin",
    _saveStyle = function _saveStyle(property, isNotCSS) {
  var _this = this;

  var target = this.target,
      style = target.style,
      cache = target._gsap;

  if (property in _transformProps && style) {
    this.tfm = this.tfm || {};

    if (property !== "transform") {
      property = _propertyAliases[property] || property;
      ~property.indexOf(",") ? property.split(",").forEach(function (a) {
        return _this.tfm[a] = _get(target, a);
      }) : this.tfm[property] = cache.x ? cache[property] : _get(target, property); // note: scale would map to "scaleX,scaleY", thus we loop and apply them both.

      property === _transformOriginProp && (this.tfm.zOrigin = cache.zOrigin);
    } else {
      return _propertyAliases.transform.split(",").forEach(function (p) {
        return _saveStyle.call(_this, p, isNotCSS);
      });
    }

    if (this.props.indexOf(_transformProp) >= 0) {
      return;
    }

    if (cache.svg) {
      this.svgo = target.getAttribute("data-svg-origin");
      this.props.push(_transformOriginProp, isNotCSS, "");
    }

    property = _transformProp;
  }

  (style || isNotCSS) && this.props.push(property, isNotCSS, style[property]);
},
    _removeIndependentTransforms = function _removeIndependentTransforms(style) {
  if (style.translate) {
    style.removeProperty("translate");
    style.removeProperty("scale");
    style.removeProperty("rotate");
  }
},
    _revertStyle = function _revertStyle() {
  var props = this.props,
      target = this.target,
      style = target.style,
      cache = target._gsap,
      i,
      p;

  for (i = 0; i < props.length; i += 3) {
    // stored like this: property, isNotCSS, value
    props[i + 1] ? target[props[i]] = props[i + 2] : props[i + 2] ? style[props[i]] = props[i + 2] : style.removeProperty(props[i].substr(0, 2) === "--" ? props[i] : props[i].replace(_capsExp, "-$1").toLowerCase());
  }

  if (this.tfm) {
    for (p in this.tfm) {
      cache[p] = this.tfm[p];
    }

    if (cache.svg) {
      cache.renderTransform();
      target.setAttribute("data-svg-origin", this.svgo || "");
    }

    i = CSSPlugin_reverting();

    if ((!i || !i.isStart) && !style[_transformProp]) {
      _removeIndependentTransforms(style);

      if (cache.zOrigin && style[_transformOriginProp]) {
        style[_transformOriginProp] += " " + cache.zOrigin + "px"; // since we're uncaching, we must put the zOrigin back into the transformOrigin so that we can pull it out accurately when we parse again. Otherwise, we'd lose the z portion of the origin since we extract it to protect from Safari bugs.

        cache.zOrigin = 0;
        cache.renderTransform();
      }

      cache.uncache = 1; // if it's a startAt that's being reverted in the _initTween() of the core, we don't need to uncache transforms. This is purely a performance optimization.
    }
  }
},
    _getStyleSaver = function _getStyleSaver(target, properties) {
  var saver = {
    target: target,
    props: [],
    revert: _revertStyle,
    save: _saveStyle
  };
  target._gsap || gsap.core.getCache(target); // just make sure there's a _gsap cache defined because we read from it in _saveStyle() and it's more efficient to just check it here once.

  properties && properties.split(",").forEach(function (p) {
    return saver.save(p);
  });
  return saver;
},
    _supports3D,
    _createElement = function _createElement(type, ns) {
  var e = CSSPlugin_doc.createElementNS ? CSSPlugin_doc.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : CSSPlugin_doc.createElement(type); //some servers swap in https for http in the namespace which can break things, making "style" inaccessible.

  return e && e.style ? e : CSSPlugin_doc.createElement(type); //some environments won't allow access to the element's style when created with a namespace in which case we default to the standard createElement() to work around the issue. Also note that when GSAP is embedded directly inside an SVG file, createElement() won't allow access to the style object in Firefox (see https://gsap.com/forums/topic/20215-problem-using-tweenmax-in-standalone-self-containing-svg-file-err-cannot-set-property-csstext-of-undefined/).
},
    _getComputedProperty = function _getComputedProperty(target, property, skipPrefixFallback) {
  var cs = getComputedStyle(target);
  return cs[property] || cs.getPropertyValue(property.replace(_capsExp, "-$1").toLowerCase()) || cs.getPropertyValue(property) || !skipPrefixFallback && _getComputedProperty(target, _checkPropPrefix(property) || property, 1) || ""; //css variables may not need caps swapped out for dashes and lowercase.
},
    _prefixes = "O,Moz,ms,Ms,Webkit".split(","),
    _checkPropPrefix = function _checkPropPrefix(property, element, preferPrefix) {
  var e = element || _tempDiv,
      s = e.style,
      i = 5;

  if (property in s && !preferPrefix) {
    return property;
  }

  property = property.charAt(0).toUpperCase() + property.substr(1);

  while (i-- && !(_prefixes[i] + property in s)) {}

  return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? _prefixes[i] : "") + property;
},
    _initCore = function _initCore() {
  if (CSSPlugin_windowExists() && window.document) {
    CSSPlugin_win = window;
    CSSPlugin_doc = CSSPlugin_win.document;
    _docElement = CSSPlugin_doc.documentElement;
    _tempDiv = _createElement("div") || {
      style: {}
    };
    _tempDivStyler = _createElement("div");
    _transformProp = _checkPropPrefix(_transformProp);
    _transformOriginProp = _transformProp + "Origin";
    _tempDiv.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0"; //make sure to override certain properties that may contaminate measurements, in case the user has overreaching style sheets.

    _supports3D = !!_checkPropPrefix("perspective");
    CSSPlugin_reverting = gsap.core.reverting;
    _pluginInitted = 1;
  }
},
    _getBBoxHack = function _getBBoxHack(swapIfPossible) {
  //works around issues in some browsers (like Firefox) that don't correctly report getBBox() on SVG elements inside a <defs> element and/or <mask>. We try creating an SVG, adding it to the documentElement and toss the element in there so that it's definitely part of the rendering tree, then grab the bbox and if it works, we actually swap out the original getBBox() method for our own that does these extra steps whenever getBBox is needed. This helps ensure that performance is optimal (only do all these extra steps when absolutely necessary...most elements don't need it).
  var svg = _createElement("svg", this.ownerSVGElement && this.ownerSVGElement.getAttribute("xmlns") || "http://www.w3.org/2000/svg"),
      oldParent = this.parentNode,
      oldSibling = this.nextSibling,
      oldCSS = this.style.cssText,
      bbox;

  _docElement.appendChild(svg);

  svg.appendChild(this);
  this.style.display = "block";

  if (swapIfPossible) {
    try {
      bbox = this.getBBox();
      this._gsapBBox = this.getBBox; //store the original

      this.getBBox = _getBBoxHack;
    } catch (e) {}
  } else if (this._gsapBBox) {
    bbox = this._gsapBBox();
  }

  if (oldParent) {
    if (oldSibling) {
      oldParent.insertBefore(this, oldSibling);
    } else {
      oldParent.appendChild(this);
    }
  }

  _docElement.removeChild(svg);

  this.style.cssText = oldCSS;
  return bbox;
},
    _getAttributeFallbacks = function _getAttributeFallbacks(target, attributesArray) {
  var i = attributesArray.length;

  while (i--) {
    if (target.hasAttribute(attributesArray[i])) {
      return target.getAttribute(attributesArray[i]);
    }
  }
},
    _getBBox = function _getBBox(target) {
  var bounds;

  try {
    bounds = target.getBBox(); //Firefox throws errors if you try calling getBBox() on an SVG element that's not rendered (like in a <symbol> or <defs>). https://bugzilla.mozilla.org/show_bug.cgi?id=612118
  } catch (error) {
    bounds = _getBBoxHack.call(target, true);
  }

  bounds && (bounds.width || bounds.height) || target.getBBox === _getBBoxHack || (bounds = _getBBoxHack.call(target, true)); //some browsers (like Firefox) misreport the bounds if the element has zero width and height (it just assumes it's at x:0, y:0), thus we need to manually grab the position in that case.

  return bounds && !bounds.width && !bounds.x && !bounds.y ? {
    x: +_getAttributeFallbacks(target, ["x", "cx", "x1"]) || 0,
    y: +_getAttributeFallbacks(target, ["y", "cy", "y1"]) || 0,
    width: 0,
    height: 0
  } : bounds;
},
    _isSVG = function _isSVG(e) {
  return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _getBBox(e));
},
    //reports if the element is an SVG on which getBBox() actually works
_removeProperty = function _removeProperty(target, property) {
  if (property) {
    var style = target.style,
        first2Chars;

    if (property in _transformProps && property !== _transformOriginProp) {
      property = _transformProp;
    }

    if (style.removeProperty) {
      first2Chars = property.substr(0, 2);

      if (first2Chars === "ms" || property.substr(0, 6) === "webkit") {
        //Microsoft and some Webkit browsers don't conform to the standard of capitalizing the first prefix character, so we adjust so that when we prefix the caps with a dash, it's correct (otherwise it'd be "ms-transform" instead of "-ms-transform" for IE9, for example)
        property = "-" + property;
      }

      style.removeProperty(first2Chars === "--" ? property : property.replace(_capsExp, "-$1").toLowerCase());
    } else {
      //note: old versions of IE use "removeAttribute()" instead of "removeProperty()"
      style.removeAttribute(property);
    }
  }
},
    _addNonTweeningPT = function _addNonTweeningPT(plugin, target, property, beginning, end, onlySetAtEnd) {
  var pt = new PropTween(plugin._pt, target, property, 0, 1, onlySetAtEnd ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue);
  plugin._pt = pt;
  pt.b = beginning;
  pt.e = end;

  plugin._props.push(property);

  return pt;
},
    _nonConvertibleUnits = {
  deg: 1,
  rad: 1,
  turn: 1
},
    _nonStandardLayouts = {
  grid: 1,
  flex: 1
},
    //takes a single value like 20px and converts it to the unit specified, like "%", returning only the numeric amount.
_convertToUnit = function _convertToUnit(target, property, value, unit) {
  var curValue = parseFloat(value) || 0,
      curUnit = (value + "").trim().substr((curValue + "").length) || "px",
      // some browsers leave extra whitespace at the beginning of CSS variables, hence the need to trim()
  style = _tempDiv.style,
      horizontal = _horizontalExp.test(property),
      isRootSVG = target.tagName.toLowerCase() === "svg",
      measureProperty = (isRootSVG ? "client" : "offset") + (horizontal ? "Width" : "Height"),
      amount = 100,
      toPixels = unit === "px",
      toPercent = unit === "%",
      px,
      parent,
      cache,
      isSVG;

  if (unit === curUnit || !curValue || _nonConvertibleUnits[unit] || _nonConvertibleUnits[curUnit]) {
    return curValue;
  }

  curUnit !== "px" && !toPixels && (curValue = _convertToUnit(target, property, value, "px"));
  isSVG = target.getCTM && _isSVG(target);

  if ((toPercent || curUnit === "%") && (_transformProps[property] || ~property.indexOf("adius"))) {
    px = isSVG ? target.getBBox()[horizontal ? "width" : "height"] : target[measureProperty];
    return _round(toPercent ? curValue / px * amount : curValue / 100 * px);
  }

  style[horizontal ? "width" : "height"] = amount + (toPixels ? curUnit : unit);
  parent = ~property.indexOf("adius") || unit === "em" && target.appendChild && !isRootSVG ? target : target.parentNode;

  if (isSVG) {
    parent = (target.ownerSVGElement || {}).parentNode;
  }

  if (!parent || parent === CSSPlugin_doc || !parent.appendChild) {
    parent = CSSPlugin_doc.body;
  }

  cache = parent._gsap;

  if (cache && toPercent && cache.width && horizontal && cache.time === _ticker.time && !cache.uncache) {
    return _round(curValue / cache.width * amount);
  } else {
    if (toPercent && (property === "height" || property === "width")) {
      // if we're dealing with width/height that's inside a container with padding and/or it's a flexbox/grid container, we must apply it to the target itself rather than the _tempDiv in order to ensure complete accuracy, factoring in the parent's padding.
      var v = target.style[property];
      target.style[property] = amount + unit;
      px = target[measureProperty];
      v ? target.style[property] = v : _removeProperty(target, property);
    } else {
      (toPercent || curUnit === "%") && !_nonStandardLayouts[_getComputedProperty(parent, "display")] && (style.position = _getComputedProperty(target, "position"));
      parent === target && (style.position = "static"); // like for borderRadius, if it's a % we must have it relative to the target itself but that may not have position: relative or position: absolute in which case it'd go up the chain until it finds its offsetParent (bad). position: static protects against that.

      parent.appendChild(_tempDiv);
      px = _tempDiv[measureProperty];
      parent.removeChild(_tempDiv);
      style.position = "absolute";
    }

    if (horizontal && toPercent) {
      cache = _getCache(parent);
      cache.time = _ticker.time;
      cache.width = parent[measureProperty];
    }
  }

  return _round(toPixels ? px * curValue / amount : px && curValue ? amount / px * curValue : 0);
},
    _get = function _get(target, property, unit, uncache) {
  var value;
  _pluginInitted || _initCore();

  if (property in _propertyAliases && property !== "transform") {
    property = _propertyAliases[property];

    if (~property.indexOf(",")) {
      property = property.split(",")[0];
    }
  }

  if (_transformProps[property] && property !== "transform") {
    value = _parseTransform(target, uncache);
    value = property !== "transformOrigin" ? value[property] : value.svg ? value.origin : _firstTwoOnly(_getComputedProperty(target, _transformOriginProp)) + " " + value.zOrigin + "px";
  } else {
    value = target.style[property];

    if (!value || value === "auto" || uncache || ~(value + "").indexOf("calc(")) {
      value = _specialProps[property] && _specialProps[property](target, property, unit) || _getComputedProperty(target, property) || _getProperty(target, property) || (property === "opacity" ? 1 : 0); // note: some browsers, like Firefox, don't report borderRadius correctly! Instead, it only reports every corner like  borderTopLeftRadius
    }
  }

  return unit && !~(value + "").trim().indexOf(" ") ? _convertToUnit(target, property, value, unit) + unit : value;
},
    _tweenComplexCSSString = function _tweenComplexCSSString(target, prop, start, end) {
  // note: we call _tweenComplexCSSString.call(pluginInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.
  if (!start || start === "none") {
    // some browsers like Safari actually PREFER the prefixed property and mis-report the unprefixed value like clipPath (BUG). In other words, even though clipPath exists in the style ("clipPath" in target.style) and it's set in the CSS properly (along with -webkit-clip-path), Safari reports clipPath as "none" whereas WebkitClipPath reports accurately like "ellipse(100% 0% at 50% 0%)", so in this case we must SWITCH to using the prefixed property instead. See https://gsap.com/forums/topic/18310-clippath-doesnt-work-on-ios/
    var p = _checkPropPrefix(prop, target, 1),
        s = p && _getComputedProperty(target, p, 1);

    if (s && s !== start) {
      prop = p;
      start = s;
    } else if (prop === "borderColor") {
      start = _getComputedProperty(target, "borderTopColor"); // Firefox bug: always reports "borderColor" as "", so we must fall back to borderTopColor. See https://gsap.com/forums/topic/24583-how-to-return-colors-that-i-had-after-reverse/
    }
  }

  var pt = new PropTween(this._pt, target.style, prop, 0, 1, _renderComplexString),
      index = 0,
      matchIndex = 0,
      a,
      result,
      startValues,
      startNum,
      color,
      startValue,
      endValue,
      endNum,
      chunk,
      endUnit,
      startUnit,
      endValues;
  pt.b = start;
  pt.e = end;
  start += ""; // ensure values are strings

  end += "";

  if (end === "auto") {
    startValue = target.style[prop];
    target.style[prop] = end;
    end = _getComputedProperty(target, prop) || end;
    startValue ? target.style[prop] = startValue : _removeProperty(target, prop);
  }

  a = [start, end];

  _colorStringFilter(a); // pass an array with the starting and ending values and let the filter do whatever it needs to the values. If colors are found, it returns true and then we must match where the color shows up order-wise because for things like boxShadow, sometimes the browser provides the computed values with the color FIRST, but the user provides it with the color LAST, so flip them if necessary. Same for drop-shadow().


  start = a[0];
  end = a[1];
  startValues = start.match(_numWithUnitExp) || [];
  endValues = end.match(_numWithUnitExp) || [];

  if (endValues.length) {
    while (result = _numWithUnitExp.exec(end)) {
      endValue = result[0];
      chunk = end.substring(index, result.index);

      if (color) {
        color = (color + 1) % 5;
      } else if (chunk.substr(-5) === "rgba(" || chunk.substr(-5) === "hsla(") {
        color = 1;
      }

      if (endValue !== (startValue = startValues[matchIndex++] || "")) {
        startNum = parseFloat(startValue) || 0;
        startUnit = startValue.substr((startNum + "").length);
        endValue.charAt(1) === "=" && (endValue = _parseRelative(startNum, endValue) + startUnit);
        endNum = parseFloat(endValue);
        endUnit = endValue.substr((endNum + "").length);
        index = _numWithUnitExp.lastIndex - endUnit.length;

        if (!endUnit) {
          //if something like "perspective:300" is passed in and we must add a unit to the end
          endUnit = endUnit || _config.units[prop] || startUnit;

          if (index === end.length) {
            end += endUnit;
            pt.e += endUnit;
          }
        }

        if (startUnit !== endUnit) {
          startNum = _convertToUnit(target, prop, startValue, endUnit) || 0;
        } // these nested PropTweens are handled in a special way - we'll never actually call a render or setter method on them. We'll just loop through them in the parent complex string PropTween's render method.


        pt._pt = {
          _next: pt._pt,
          p: chunk || matchIndex === 1 ? chunk : ",",
          //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
          s: startNum,
          c: endNum - startNum,
          m: color && color < 4 || prop === "zIndex" ? Math.round : 0
        };
      }
    }

    pt.c = index < end.length ? end.substring(index, end.length) : ""; //we use the "c" of the PropTween to store the final part of the string (after the last number)
  } else {
    pt.r = prop === "display" && end === "none" ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue;
  }

  _relExp.test(end) && (pt.e = 0); //if the end string contains relative values or dynamic random(...) values, delete the end it so that on the final render we don't actually set it to the string with += or -= characters (forces it to use the calculated value).

  this._pt = pt; //start the linked list with this new PropTween. Remember, we call _tweenComplexCSSString.call(pluginInstance...) to ensure that it's scoped properly. We may call it from within another plugin too, thus "this" would refer to the plugin.

  return pt;
},
    _keywordToPercent = {
  top: "0%",
  bottom: "100%",
  left: "0%",
  right: "100%",
  center: "50%"
},
    _convertKeywordsToPercentages = function _convertKeywordsToPercentages(value) {
  var split = value.split(" "),
      x = split[0],
      y = split[1] || "50%";

  if (x === "top" || x === "bottom" || y === "left" || y === "right") {
    //the user provided them in the wrong order, so flip them
    value = x;
    x = y;
    y = value;
  }

  split[0] = _keywordToPercent[x] || x;
  split[1] = _keywordToPercent[y] || y;
  return split.join(" ");
},
    _renderClearProps = function _renderClearProps(ratio, data) {
  if (data.tween && data.tween._time === data.tween._dur) {
    var target = data.t,
        style = target.style,
        props = data.u,
        cache = target._gsap,
        prop,
        clearTransforms,
        i;

    if (props === "all" || props === true) {
      style.cssText = "";
      clearTransforms = 1;
    } else {
      props = props.split(",");
      i = props.length;

      while (--i > -1) {
        prop = props[i];

        if (_transformProps[prop]) {
          clearTransforms = 1;
          prop = prop === "transformOrigin" ? _transformOriginProp : _transformProp;
        }

        _removeProperty(target, prop);
      }
    }

    if (clearTransforms) {
      _removeProperty(target, _transformProp);

      if (cache) {
        cache.svg && target.removeAttribute("transform");

        _parseTransform(target, 1); // force all the cached values back to "normal"/identity, otherwise if there's another tween that's already set to render transforms on this element, it could display the wrong values.


        cache.uncache = 1;

        _removeIndependentTransforms(style);
      }
    }
  }
},
    // note: specialProps should return 1 if (and only if) they have a non-zero priority. It indicates we need to sort the linked list.
_specialProps = {
  clearProps: function clearProps(plugin, target, property, endValue, tween) {
    if (tween.data !== "isFromStart") {
      var pt = plugin._pt = new PropTween(plugin._pt, target, property, 0, 0, _renderClearProps);
      pt.u = endValue;
      pt.pr = -10;
      pt.tween = tween;

      plugin._props.push(property);

      return 1;
    }
  }
  /* className feature (about 0.4kb gzipped).
  , className(plugin, target, property, endValue, tween) {
  	let _renderClassName = (ratio, data) => {
  			data.css.render(ratio, data.css);
  			if (!ratio || ratio === 1) {
  				let inline = data.rmv,
  					target = data.t,
  					p;
  				target.setAttribute("class", ratio ? data.e : data.b);
  				for (p in inline) {
  					_removeProperty(target, p);
  				}
  			}
  		},
  		_getAllStyles = (target) => {
  			let styles = {},
  				computed = getComputedStyle(target),
  				p;
  			for (p in computed) {
  				if (isNaN(p) && p !== "cssText" && p !== "length") {
  					styles[p] = computed[p];
  				}
  			}
  			_setDefaults(styles, _parseTransform(target, 1));
  			return styles;
  		},
  		startClassList = target.getAttribute("class"),
  		style = target.style,
  		cssText = style.cssText,
  		cache = target._gsap,
  		classPT = cache.classPT,
  		inlineToRemoveAtEnd = {},
  		data = {t:target, plugin:plugin, rmv:inlineToRemoveAtEnd, b:startClassList, e:(endValue.charAt(1) !== "=") ? endValue : startClassList.replace(new RegExp("(?:\\s|^)" + endValue.substr(2) + "(?![\\w-])"), "") + ((endValue.charAt(0) === "+") ? " " + endValue.substr(2) : "")},
  		changingVars = {},
  		startVars = _getAllStyles(target),
  		transformRelated = /(transform|perspective)/i,
  		endVars, p;
  	if (classPT) {
  		classPT.r(1, classPT.d);
  		_removeLinkedListItem(classPT.d.plugin, classPT, "_pt");
  	}
  	target.setAttribute("class", data.e);
  	endVars = _getAllStyles(target, true);
  	target.setAttribute("class", startClassList);
  	for (p in endVars) {
  		if (endVars[p] !== startVars[p] && !transformRelated.test(p)) {
  			changingVars[p] = endVars[p];
  			if (!style[p] && style[p] !== "0") {
  				inlineToRemoveAtEnd[p] = 1;
  			}
  		}
  	}
  	cache.classPT = plugin._pt = new PropTween(plugin._pt, target, "className", 0, 0, _renderClassName, data, 0, -11);
  	if (style.cssText !== cssText) { //only apply if things change. Otherwise, in cases like a background-image that's pulled dynamically, it could cause a refresh. See https://gsap.com/forums/topic/20368-possible-gsap-bug-switching-classnames-in-chrome/.
  		style.cssText = cssText; //we recorded cssText before we swapped classes and ran _getAllStyles() because in cases when a className tween is overwritten, we remove all the related tweening properties from that class change (otherwise class-specific stuff can't override properties we've directly set on the target's style object due to specificity).
  	}
  	_parseTransform(target, true); //to clear the caching of transforms
  	data.css = new gsap.plugins.css();
  	data.css.init(target, changingVars, tween);
  	plugin._props.push(...data.css._props);
  	return 1;
  }
  */

},

/*
 * --------------------------------------------------------------------------------------
 * TRANSFORMS
 * --------------------------------------------------------------------------------------
 */
_identity2DMatrix = [1, 0, 0, 1, 0, 0],
    _rotationalProperties = {},
    _isNullTransform = function _isNullTransform(value) {
  return value === "matrix(1, 0, 0, 1, 0, 0)" || value === "none" || !value;
},
    _getComputedTransformMatrixAsArray = function _getComputedTransformMatrixAsArray(target) {
  var matrixString = _getComputedProperty(target, _transformProp);

  return _isNullTransform(matrixString) ? _identity2DMatrix : matrixString.substr(7).match(_numExp).map(_round);
},
    _getMatrix = function _getMatrix(target, force2D) {
  var cache = target._gsap || _getCache(target),
      style = target.style,
      matrix = _getComputedTransformMatrixAsArray(target),
      parent,
      nextSibling,
      temp,
      addedToDOM;

  if (cache.svg && target.getAttribute("transform")) {
    temp = target.transform.baseVal.consolidate().matrix; //ensures that even complex values like "translate(50,60) rotate(135,0,0)" are parsed because it mashes it into a matrix.

    matrix = [temp.a, temp.b, temp.c, temp.d, temp.e, temp.f];
    return matrix.join(",") === "1,0,0,1,0,0" ? _identity2DMatrix : matrix;
  } else if (matrix === _identity2DMatrix && !target.offsetParent && target !== _docElement && !cache.svg) {
    //note: if offsetParent is null, that means the element isn't in the normal document flow, like if it has display:none or one of its ancestors has display:none). Firefox returns null for getComputedStyle() if the element is in an iframe that has display:none. https://bugzilla.mozilla.org/show_bug.cgi?id=548397
    //browsers don't report transforms accurately unless the element is in the DOM and has a display value that's not "none". Firefox and Microsoft browsers have a partial bug where they'll report transforms even if display:none BUT not any percentage-based values like translate(-50%, 8px) will be reported as if it's translate(0, 8px).
    temp = style.display;
    style.display = "block";
    parent = target.parentNode;

    if (!parent || !target.offsetParent) {
      // note: in 3.3.0 we switched target.offsetParent to _doc.body.contains(target) to avoid [sometimes unnecessary] MutationObserver calls but that wasn't adequate because there are edge cases where nested position: fixed elements need to get reparented to accurately sense transforms. See https://github.com/greensock/GSAP/issues/388 and https://github.com/greensock/GSAP/issues/375
      addedToDOM = 1; //flag

      nextSibling = target.nextElementSibling;

      _docElement.appendChild(target); //we must add it to the DOM in order to get values properly

    }

    matrix = _getComputedTransformMatrixAsArray(target);
    temp ? style.display = temp : _removeProperty(target, "display");

    if (addedToDOM) {
      nextSibling ? parent.insertBefore(target, nextSibling) : parent ? parent.appendChild(target) : _docElement.removeChild(target);
    }
  }

  return force2D && matrix.length > 6 ? [matrix[0], matrix[1], matrix[4], matrix[5], matrix[12], matrix[13]] : matrix;
},
    _applySVGOrigin = function _applySVGOrigin(target, origin, originIsAbsolute, smooth, matrixArray, pluginToAddPropTweensTo) {
  var cache = target._gsap,
      matrix = matrixArray || _getMatrix(target, true),
      xOriginOld = cache.xOrigin || 0,
      yOriginOld = cache.yOrigin || 0,
      xOffsetOld = cache.xOffset || 0,
      yOffsetOld = cache.yOffset || 0,
      a = matrix[0],
      b = matrix[1],
      c = matrix[2],
      d = matrix[3],
      tx = matrix[4],
      ty = matrix[5],
      originSplit = origin.split(" "),
      xOrigin = parseFloat(originSplit[0]) || 0,
      yOrigin = parseFloat(originSplit[1]) || 0,
      bounds,
      determinant,
      x,
      y;

  if (!originIsAbsolute) {
    bounds = _getBBox(target);
    xOrigin = bounds.x + (~originSplit[0].indexOf("%") ? xOrigin / 100 * bounds.width : xOrigin);
    yOrigin = bounds.y + (~(originSplit[1] || originSplit[0]).indexOf("%") ? yOrigin / 100 * bounds.height : yOrigin); // if (!("xOrigin" in cache) && (xOrigin || yOrigin)) { // added in 3.12.3, reverted in 3.12.4; requires more exploration
    // 	xOrigin -= bounds.x;
    // 	yOrigin -= bounds.y;
    // }
  } else if (matrix !== _identity2DMatrix && (determinant = a * d - b * c)) {
    //if it's zero (like if scaleX and scaleY are zero), skip it to avoid errors with dividing by zero.
    x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + (c * ty - d * tx) / determinant;
    y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - (a * ty - b * tx) / determinant;
    xOrigin = x;
    yOrigin = y; // theory: we only had to do this for smoothing and it assumes that the previous one was not originIsAbsolute.
  }

  if (smooth || smooth !== false && cache.smooth) {
    tx = xOrigin - xOriginOld;
    ty = yOrigin - yOriginOld;
    cache.xOffset = xOffsetOld + (tx * a + ty * c) - tx;
    cache.yOffset = yOffsetOld + (tx * b + ty * d) - ty;
  } else {
    cache.xOffset = cache.yOffset = 0;
  }

  cache.xOrigin = xOrigin;
  cache.yOrigin = yOrigin;
  cache.smooth = !!smooth;
  cache.origin = origin;
  cache.originIsAbsolute = !!originIsAbsolute;
  target.style[_transformOriginProp] = "0px 0px"; //otherwise, if someone sets  an origin via CSS, it will likely interfere with the SVG transform attribute ones (because remember, we're baking the origin into the matrix() value).

  if (pluginToAddPropTweensTo) {
    _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOrigin", xOriginOld, xOrigin);

    _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOrigin", yOriginOld, yOrigin);

    _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOffset", xOffsetOld, cache.xOffset);

    _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOffset", yOffsetOld, cache.yOffset);
  }

  target.setAttribute("data-svg-origin", xOrigin + " " + yOrigin);
},
    _parseTransform = function _parseTransform(target, uncache) {
  var cache = target._gsap || new GSCache(target);

  if ("x" in cache && !uncache && !cache.uncache) {
    return cache;
  }

  var style = target.style,
      invertedScaleX = cache.scaleX < 0,
      px = "px",
      deg = "deg",
      cs = getComputedStyle(target),
      origin = _getComputedProperty(target, _transformOriginProp) || "0",
      x,
      y,
      z,
      scaleX,
      scaleY,
      rotation,
      rotationX,
      rotationY,
      skewX,
      skewY,
      perspective,
      xOrigin,
      yOrigin,
      matrix,
      angle,
      cos,
      sin,
      a,
      b,
      c,
      d,
      a12,
      a22,
      t1,
      t2,
      t3,
      a13,
      a23,
      a33,
      a42,
      a43,
      a32;
  x = y = z = rotation = rotationX = rotationY = skewX = skewY = perspective = 0;
  scaleX = scaleY = 1;
  cache.svg = !!(target.getCTM && _isSVG(target));

  if (cs.translate) {
    // accommodate independent transforms by combining them into normal ones.
    if (cs.translate !== "none" || cs.scale !== "none" || cs.rotate !== "none") {
      style[_transformProp] = (cs.translate !== "none" ? "translate3d(" + (cs.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") " : "") + (cs.rotate !== "none" ? "rotate(" + cs.rotate + ") " : "") + (cs.scale !== "none" ? "scale(" + cs.scale.split(" ").join(",") + ") " : "") + (cs[_transformProp] !== "none" ? cs[_transformProp] : "");
    }

    style.scale = style.rotate = style.translate = "none";
  }

  matrix = _getMatrix(target, cache.svg);

  if (cache.svg) {
    if (cache.uncache) {
      // if cache.uncache is true (and maybe if origin is 0,0), we need to set element.style.transformOrigin = (cache.xOrigin - bbox.x) + "px " + (cache.yOrigin - bbox.y) + "px". Previously we let the data-svg-origin stay instead, but when introducing revert(), it complicated things.
      t2 = target.getBBox();
      origin = cache.xOrigin - t2.x + "px " + (cache.yOrigin - t2.y) + "px";
      t1 = "";
    } else {
      t1 = !uncache && target.getAttribute("data-svg-origin"); //  Remember, to work around browser inconsistencies we always force SVG elements' transformOrigin to 0,0 and offset the translation accordingly.
    }

    _applySVGOrigin(target, t1 || origin, !!t1 || cache.originIsAbsolute, cache.smooth !== false, matrix);
  }

  xOrigin = cache.xOrigin || 0;
  yOrigin = cache.yOrigin || 0;

  if (matrix !== _identity2DMatrix) {
    a = matrix[0]; //a11

    b = matrix[1]; //a21

    c = matrix[2]; //a31

    d = matrix[3]; //a41

    x = a12 = matrix[4];
    y = a22 = matrix[5]; //2D matrix

    if (matrix.length === 6) {
      scaleX = Math.sqrt(a * a + b * b);
      scaleY = Math.sqrt(d * d + c * c);
      rotation = a || b ? _atan2(b, a) * _RAD2DEG : 0; //note: if scaleX is 0, we cannot accurately measure rotation. Same for skewX with a scaleY of 0. Therefore, we default to the previously recorded value (or zero if that doesn't exist).

      skewX = c || d ? _atan2(c, d) * _RAD2DEG + rotation : 0;
      skewX && (scaleY *= Math.abs(Math.cos(skewX * _DEG2RAD)));

      if (cache.svg) {
        x -= xOrigin - (xOrigin * a + yOrigin * c);
        y -= yOrigin - (xOrigin * b + yOrigin * d);
      } //3D matrix

    } else {
      a32 = matrix[6];
      a42 = matrix[7];
      a13 = matrix[8];
      a23 = matrix[9];
      a33 = matrix[10];
      a43 = matrix[11];
      x = matrix[12];
      y = matrix[13];
      z = matrix[14];
      angle = _atan2(a32, a33);
      rotationX = angle * _RAD2DEG; //rotationX

      if (angle) {
        cos = Math.cos(-angle);
        sin = Math.sin(-angle);
        t1 = a12 * cos + a13 * sin;
        t2 = a22 * cos + a23 * sin;
        t3 = a32 * cos + a33 * sin;
        a13 = a12 * -sin + a13 * cos;
        a23 = a22 * -sin + a23 * cos;
        a33 = a32 * -sin + a33 * cos;
        a43 = a42 * -sin + a43 * cos;
        a12 = t1;
        a22 = t2;
        a32 = t3;
      } //rotationY


      angle = _atan2(-c, a33);
      rotationY = angle * _RAD2DEG;

      if (angle) {
        cos = Math.cos(-angle);
        sin = Math.sin(-angle);
        t1 = a * cos - a13 * sin;
        t2 = b * cos - a23 * sin;
        t3 = c * cos - a33 * sin;
        a43 = d * sin + a43 * cos;
        a = t1;
        b = t2;
        c = t3;
      } //rotationZ


      angle = _atan2(b, a);
      rotation = angle * _RAD2DEG;

      if (angle) {
        cos = Math.cos(angle);
        sin = Math.sin(angle);
        t1 = a * cos + b * sin;
        t2 = a12 * cos + a22 * sin;
        b = b * cos - a * sin;
        a22 = a22 * cos - a12 * sin;
        a = t1;
        a12 = t2;
      }

      if (rotationX && Math.abs(rotationX) + Math.abs(rotation) > 359.9) {
        //when rotationY is set, it will often be parsed as 180 degrees different than it should be, and rotationX and rotation both being 180 (it looks the same), so we adjust for that here.
        rotationX = rotation = 0;
        rotationY = 180 - rotationY;
      }

      scaleX = _round(Math.sqrt(a * a + b * b + c * c));
      scaleY = _round(Math.sqrt(a22 * a22 + a32 * a32));
      angle = _atan2(a12, a22);
      skewX = Math.abs(angle) > 0.0002 ? angle * _RAD2DEG : 0;
      perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
    }

    if (cache.svg) {
      //sense if there are CSS transforms applied on an SVG element in which case we must overwrite them when rendering. The transform attribute is more reliable cross-browser, but we can't just remove the CSS ones because they may be applied in a CSS rule somewhere (not just inline).
      t1 = target.getAttribute("transform");
      cache.forceCSS = target.setAttribute("transform", "") || !_isNullTransform(_getComputedProperty(target, _transformProp));
      t1 && target.setAttribute("transform", t1);
    }
  }

  if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
    if (invertedScaleX) {
      scaleX *= -1;
      skewX += rotation <= 0 ? 180 : -180;
      rotation += rotation <= 0 ? 180 : -180;
    } else {
      scaleY *= -1;
      skewX += skewX <= 0 ? 180 : -180;
    }
  }

  uncache = uncache || cache.uncache;
  cache.x = x - ((cache.xPercent = x && (!uncache && cache.xPercent || (Math.round(target.offsetWidth / 2) === Math.round(-x) ? -50 : 0))) ? target.offsetWidth * cache.xPercent / 100 : 0) + px;
  cache.y = y - ((cache.yPercent = y && (!uncache && cache.yPercent || (Math.round(target.offsetHeight / 2) === Math.round(-y) ? -50 : 0))) ? target.offsetHeight * cache.yPercent / 100 : 0) + px;
  cache.z = z + px;
  cache.scaleX = _round(scaleX);
  cache.scaleY = _round(scaleY);
  cache.rotation = _round(rotation) + deg;
  cache.rotationX = _round(rotationX) + deg;
  cache.rotationY = _round(rotationY) + deg;
  cache.skewX = skewX + deg;
  cache.skewY = skewY + deg;
  cache.transformPerspective = perspective + px;

  if (cache.zOrigin = parseFloat(origin.split(" ")[2]) || !uncache && cache.zOrigin || 0) {
    style[_transformOriginProp] = _firstTwoOnly(origin);
  }

  cache.xOffset = cache.yOffset = 0;
  cache.force3D = _config.force3D;
  cache.renderTransform = cache.svg ? _renderSVGTransforms : _supports3D ? _renderCSSTransforms : _renderNon3DTransforms;
  cache.uncache = 0;
  return cache;
},
    _firstTwoOnly = function _firstTwoOnly(value) {
  return (value = value.split(" "))[0] + " " + value[1];
},
    //for handling transformOrigin values, stripping out the 3rd dimension
_addPxTranslate = function _addPxTranslate(target, start, value) {
  var unit = getUnit(start);
  return _round(parseFloat(start) + parseFloat(_convertToUnit(target, "x", value + "px", unit))) + unit;
},
    _renderNon3DTransforms = function _renderNon3DTransforms(ratio, cache) {
  cache.z = "0px";
  cache.rotationY = cache.rotationX = "0deg";
  cache.force3D = 0;

  _renderCSSTransforms(ratio, cache);
},
    _zeroDeg = "0deg",
    _zeroPx = "0px",
    _endParenthesis = ") ",
    _renderCSSTransforms = function _renderCSSTransforms(ratio, cache) {
  var _ref = cache || this,
      xPercent = _ref.xPercent,
      yPercent = _ref.yPercent,
      x = _ref.x,
      y = _ref.y,
      z = _ref.z,
      rotation = _ref.rotation,
      rotationY = _ref.rotationY,
      rotationX = _ref.rotationX,
      skewX = _ref.skewX,
      skewY = _ref.skewY,
      scaleX = _ref.scaleX,
      scaleY = _ref.scaleY,
      transformPerspective = _ref.transformPerspective,
      force3D = _ref.force3D,
      target = _ref.target,
      zOrigin = _ref.zOrigin,
      transforms = "",
      use3D = force3D === "auto" && ratio && ratio !== 1 || force3D === true; // Safari has a bug that causes it not to render 3D transform-origin values properly, so we force the z origin to 0, record it in the cache, and then do the math here to offset the translate values accordingly (basically do the 3D transform-origin part manually)


  if (zOrigin && (rotationX !== _zeroDeg || rotationY !== _zeroDeg)) {
    var angle = parseFloat(rotationY) * _DEG2RAD,
        a13 = Math.sin(angle),
        a33 = Math.cos(angle),
        cos;

    angle = parseFloat(rotationX) * _DEG2RAD;
    cos = Math.cos(angle);
    x = _addPxTranslate(target, x, a13 * cos * -zOrigin);
    y = _addPxTranslate(target, y, -Math.sin(angle) * -zOrigin);
    z = _addPxTranslate(target, z, a33 * cos * -zOrigin + zOrigin);
  }

  if (transformPerspective !== _zeroPx) {
    transforms += "perspective(" + transformPerspective + _endParenthesis;
  }

  if (xPercent || yPercent) {
    transforms += "translate(" + xPercent + "%, " + yPercent + "%) ";
  }

  if (use3D || x !== _zeroPx || y !== _zeroPx || z !== _zeroPx) {
    transforms += z !== _zeroPx || use3D ? "translate3d(" + x + ", " + y + ", " + z + ") " : "translate(" + x + ", " + y + _endParenthesis;
  }

  if (rotation !== _zeroDeg) {
    transforms += "rotate(" + rotation + _endParenthesis;
  }

  if (rotationY !== _zeroDeg) {
    transforms += "rotateY(" + rotationY + _endParenthesis;
  }

  if (rotationX !== _zeroDeg) {
    transforms += "rotateX(" + rotationX + _endParenthesis;
  }

  if (skewX !== _zeroDeg || skewY !== _zeroDeg) {
    transforms += "skew(" + skewX + ", " + skewY + _endParenthesis;
  }

  if (scaleX !== 1 || scaleY !== 1) {
    transforms += "scale(" + scaleX + ", " + scaleY + _endParenthesis;
  }

  target.style[_transformProp] = transforms || "translate(0, 0)";
},
    _renderSVGTransforms = function _renderSVGTransforms(ratio, cache) {
  var _ref2 = cache || this,
      xPercent = _ref2.xPercent,
      yPercent = _ref2.yPercent,
      x = _ref2.x,
      y = _ref2.y,
      rotation = _ref2.rotation,
      skewX = _ref2.skewX,
      skewY = _ref2.skewY,
      scaleX = _ref2.scaleX,
      scaleY = _ref2.scaleY,
      target = _ref2.target,
      xOrigin = _ref2.xOrigin,
      yOrigin = _ref2.yOrigin,
      xOffset = _ref2.xOffset,
      yOffset = _ref2.yOffset,
      forceCSS = _ref2.forceCSS,
      tx = parseFloat(x),
      ty = parseFloat(y),
      a11,
      a21,
      a12,
      a22,
      temp;

  rotation = parseFloat(rotation);
  skewX = parseFloat(skewX);
  skewY = parseFloat(skewY);

  if (skewY) {
    //for performance reasons, we combine all skewing into the skewX and rotation values. Remember, a skewY of 10 degrees looks the same as a rotation of 10 degrees plus a skewX of 10 degrees.
    skewY = parseFloat(skewY);
    skewX += skewY;
    rotation += skewY;
  }

  if (rotation || skewX) {
    rotation *= _DEG2RAD;
    skewX *= _DEG2RAD;
    a11 = Math.cos(rotation) * scaleX;
    a21 = Math.sin(rotation) * scaleX;
    a12 = Math.sin(rotation - skewX) * -scaleY;
    a22 = Math.cos(rotation - skewX) * scaleY;

    if (skewX) {
      skewY *= _DEG2RAD;
      temp = Math.tan(skewX - skewY);
      temp = Math.sqrt(1 + temp * temp);
      a12 *= temp;
      a22 *= temp;

      if (skewY) {
        temp = Math.tan(skewY);
        temp = Math.sqrt(1 + temp * temp);
        a11 *= temp;
        a21 *= temp;
      }
    }

    a11 = _round(a11);
    a21 = _round(a21);
    a12 = _round(a12);
    a22 = _round(a22);
  } else {
    a11 = scaleX;
    a22 = scaleY;
    a21 = a12 = 0;
  }

  if (tx && !~(x + "").indexOf("px") || ty && !~(y + "").indexOf("px")) {
    tx = _convertToUnit(target, "x", x, "px");
    ty = _convertToUnit(target, "y", y, "px");
  }

  if (xOrigin || yOrigin || xOffset || yOffset) {
    tx = _round(tx + xOrigin - (xOrigin * a11 + yOrigin * a12) + xOffset);
    ty = _round(ty + yOrigin - (xOrigin * a21 + yOrigin * a22) + yOffset);
  }

  if (xPercent || yPercent) {
    //The SVG spec doesn't support percentage-based translation in the "transform" attribute, so we merge it into the translation to simulate it.
    temp = target.getBBox();
    tx = _round(tx + xPercent / 100 * temp.width);
    ty = _round(ty + yPercent / 100 * temp.height);
  }

  temp = "matrix(" + a11 + "," + a21 + "," + a12 + "," + a22 + "," + tx + "," + ty + ")";
  target.setAttribute("transform", temp);
  forceCSS && (target.style[_transformProp] = temp); //some browsers prioritize CSS transforms over the transform attribute. When we sense that the user has CSS transforms applied, we must overwrite them this way (otherwise some browser simply won't render the transform attribute changes!)
},
    _addRotationalPropTween = function _addRotationalPropTween(plugin, target, property, startNum, endValue) {
  var cap = 360,
      isString = _isString(endValue),
      endNum = parseFloat(endValue) * (isString && ~endValue.indexOf("rad") ? _RAD2DEG : 1),
      change = endNum - startNum,
      finalValue = startNum + change + "deg",
      direction,
      pt;

  if (isString) {
    direction = endValue.split("_")[1];

    if (direction === "short") {
      change %= cap;

      if (change !== change % (cap / 2)) {
        change += change < 0 ? cap : -cap;
      }
    }

    if (direction === "cw" && change < 0) {
      change = (change + cap * CSSPlugin_bigNum) % cap - ~~(change / cap) * cap;
    } else if (direction === "ccw" && change > 0) {
      change = (change - cap * CSSPlugin_bigNum) % cap - ~~(change / cap) * cap;
    }
  }

  plugin._pt = pt = new PropTween(plugin._pt, target, property, startNum, change, _renderPropWithEnd);
  pt.e = finalValue;
  pt.u = "deg";

  plugin._props.push(property);

  return pt;
},
    _assign = function _assign(target, source) {
  // Internet Explorer doesn't have Object.assign(), so we recreate it here.
  for (var p in source) {
    target[p] = source[p];
  }

  return target;
},
    _addRawTransformPTs = function _addRawTransformPTs(plugin, transforms, target) {
  //for handling cases where someone passes in a whole transform string, like transform: "scale(2, 3) rotate(20deg) translateY(30em)"
  var startCache = _assign({}, target._gsap),
      exclude = "perspective,force3D,transformOrigin,svgOrigin",
      style = target.style,
      endCache,
      p,
      startValue,
      endValue,
      startNum,
      endNum,
      startUnit,
      endUnit;

  if (startCache.svg) {
    startValue = target.getAttribute("transform");
    target.setAttribute("transform", "");
    style[_transformProp] = transforms;
    endCache = _parseTransform(target, 1);

    _removeProperty(target, _transformProp);

    target.setAttribute("transform", startValue);
  } else {
    startValue = getComputedStyle(target)[_transformProp];
    style[_transformProp] = transforms;
    endCache = _parseTransform(target, 1);
    style[_transformProp] = startValue;
  }

  for (p in _transformProps) {
    startValue = startCache[p];
    endValue = endCache[p];

    if (startValue !== endValue && exclude.indexOf(p) < 0) {
      //tweening to no perspective gives very unintuitive results - just keep the same perspective in that case.
      startUnit = getUnit(startValue);
      endUnit = getUnit(endValue);
      startNum = startUnit !== endUnit ? _convertToUnit(target, p, startValue, endUnit) : parseFloat(startValue);
      endNum = parseFloat(endValue);
      plugin._pt = new PropTween(plugin._pt, endCache, p, startNum, endNum - startNum, _renderCSSProp);
      plugin._pt.u = endUnit || 0;

      plugin._props.push(p);
    }
  }

  _assign(endCache, startCache);
}; // handle splitting apart padding, margin, borderWidth, and borderRadius into their 4 components. Firefox, for example, won't report borderRadius correctly - it will only do borderTopLeftRadius and the other corners. We also want to handle paddingTop, marginLeft, borderRightWidth, etc.


_forEachName("padding,margin,Width,Radius", function (name, index) {
  var t = "Top",
      r = "Right",
      b = "Bottom",
      l = "Left",
      props = (index < 3 ? [t, r, b, l] : [t + l, t + r, b + r, b + l]).map(function (side) {
    return index < 2 ? name + side : "border" + side + name;
  });

  _specialProps[index > 1 ? "border" + name : name] = function (plugin, target, property, endValue, tween) {
    var a, vars;

    if (arguments.length < 4) {
      // getter, passed target, property, and unit (from _get())
      a = props.map(function (prop) {
        return _get(plugin, prop, property);
      });
      vars = a.join(" ");
      return vars.split(a[0]).length === 5 ? a[0] : vars;
    }

    a = (endValue + "").split(" ");
    vars = {};
    props.forEach(function (prop, i) {
      return vars[prop] = a[i] = a[i] || a[(i - 1) / 2 | 0];
    });
    plugin.init(target, vars, tween);
  };
});

var CSSPlugin = {
  name: "css",
  register: _initCore,
  targetTest: function targetTest(target) {
    return target.style && target.nodeType;
  },
  init: function init(target, vars, tween, index, targets) {
    var props = this._props,
        style = target.style,
        startAt = tween.vars.startAt,
        startValue,
        endValue,
        endNum,
        startNum,
        type,
        specialProp,
        p,
        startUnit,
        endUnit,
        relative,
        isTransformRelated,
        transformPropTween,
        cache,
        smooth,
        hasPriority,
        inlineProps;
    _pluginInitted || _initCore(); // we may call init() multiple times on the same plugin instance, like when adding special properties, so make sure we don't overwrite the revert data or inlineProps

    this.styles = this.styles || _getStyleSaver(target);
    inlineProps = this.styles.props;
    this.tween = tween;

    for (p in vars) {
      if (p === "autoRound") {
        continue;
      }

      endValue = vars[p];

      if (_plugins[p] && _checkPlugin(p, vars, tween, index, target, targets)) {
        // plugins
        continue;
      }

      type = typeof endValue;
      specialProp = _specialProps[p];

      if (type === "function") {
        endValue = endValue.call(tween, index, target, targets);
        type = typeof endValue;
      }

      if (type === "string" && ~endValue.indexOf("random(")) {
        endValue = _replaceRandom(endValue);
      }

      if (specialProp) {
        specialProp(this, target, p, endValue, tween) && (hasPriority = 1);
      } else if (p.substr(0, 2) === "--") {
        //CSS variable
        startValue = (getComputedStyle(target).getPropertyValue(p) + "").trim();
        endValue += "";
        _colorExp.lastIndex = 0;

        if (!_colorExp.test(startValue)) {
          // colors don't have units
          startUnit = getUnit(startValue);
          endUnit = getUnit(endValue);
        }

        endUnit ? startUnit !== endUnit && (startValue = _convertToUnit(target, p, startValue, endUnit) + endUnit) : startUnit && (endValue += startUnit);
        this.add(style, "setProperty", startValue, endValue, index, targets, 0, 0, p);
        props.push(p);
        inlineProps.push(p, 0, style[p]);
      } else if (type !== "undefined") {
        if (startAt && p in startAt) {
          // in case someone hard-codes a complex value as the start, like top: "calc(2vh / 2)". Without this, it'd use the computed value (always in px)
          startValue = typeof startAt[p] === "function" ? startAt[p].call(tween, index, target, targets) : startAt[p];
          _isString(startValue) && ~startValue.indexOf("random(") && (startValue = _replaceRandom(startValue));
          getUnit(startValue + "") || startValue === "auto" || (startValue += _config.units[p] || getUnit(_get(target, p)) || ""); // for cases when someone passes in a unitless value like {x: 100}; if we try setting translate(100, 0px) it won't work.

          (startValue + "").charAt(1) === "=" && (startValue = _get(target, p)); // can't work with relative values
        } else {
          startValue = _get(target, p);
        }

        startNum = parseFloat(startValue);
        relative = type === "string" && endValue.charAt(1) === "=" && endValue.substr(0, 2);
        relative && (endValue = endValue.substr(2));
        endNum = parseFloat(endValue);

        if (p in _propertyAliases) {
          if (p === "autoAlpha") {
            //special case where we control the visibility along with opacity. We still allow the opacity value to pass through and get tweened.
            if (startNum === 1 && _get(target, "visibility") === "hidden" && endNum) {
              //if visibility is initially set to "hidden", we should interpret that as intent to make opacity 0 (a convenience)
              startNum = 0;
            }

            inlineProps.push("visibility", 0, style.visibility);

            _addNonTweeningPT(this, style, "visibility", startNum ? "inherit" : "hidden", endNum ? "inherit" : "hidden", !endNum);
          }

          if (p !== "scale" && p !== "transform") {
            p = _propertyAliases[p];
            ~p.indexOf(",") && (p = p.split(",")[0]);
          }
        }

        isTransformRelated = p in _transformProps; //--- TRANSFORM-RELATED ---

        if (isTransformRelated) {
          this.styles.save(p);

          if (!transformPropTween) {
            cache = target._gsap;
            cache.renderTransform && !vars.parseTransform || _parseTransform(target, vars.parseTransform); // if, for example, gsap.set(... {transform:"translateX(50vw)"}), the _get() call doesn't parse the transform, thus cache.renderTransform won't be set yet so force the parsing of the transform here.

            smooth = vars.smoothOrigin !== false && cache.smooth;
            transformPropTween = this._pt = new PropTween(this._pt, style, _transformProp, 0, 1, cache.renderTransform, cache, 0, -1); //the first time through, create the rendering PropTween so that it runs LAST (in the linked list, we keep adding to the beginning)

            transformPropTween.dep = 1; //flag it as dependent so that if things get killed/overwritten and this is the only PropTween left, we can safely kill the whole tween.
          }

          if (p === "scale") {
            this._pt = new PropTween(this._pt, cache, "scaleY", cache.scaleY, (relative ? _parseRelative(cache.scaleY, relative + endNum) : endNum) - cache.scaleY || 0, _renderCSSProp);
            this._pt.u = 0;
            props.push("scaleY", p);
            p += "X";
          } else if (p === "transformOrigin") {
            inlineProps.push(_transformOriginProp, 0, style[_transformOriginProp]);
            endValue = _convertKeywordsToPercentages(endValue); //in case something like "left top" or "bottom right" is passed in. Convert to percentages.

            if (cache.svg) {
              _applySVGOrigin(target, endValue, 0, smooth, 0, this);
            } else {
              endUnit = parseFloat(endValue.split(" ")[2]) || 0; //handle the zOrigin separately!

              endUnit !== cache.zOrigin && _addNonTweeningPT(this, cache, "zOrigin", cache.zOrigin, endUnit);

              _addNonTweeningPT(this, style, p, _firstTwoOnly(startValue), _firstTwoOnly(endValue));
            }

            continue;
          } else if (p === "svgOrigin") {
            _applySVGOrigin(target, endValue, 1, smooth, 0, this);

            continue;
          } else if (p in _rotationalProperties) {
            _addRotationalPropTween(this, cache, p, startNum, relative ? _parseRelative(startNum, relative + endValue) : endValue);

            continue;
          } else if (p === "smoothOrigin") {
            _addNonTweeningPT(this, cache, "smooth", cache.smooth, endValue);

            continue;
          } else if (p === "force3D") {
            cache[p] = endValue;
            continue;
          } else if (p === "transform") {
            _addRawTransformPTs(this, endValue, target);

            continue;
          }
        } else if (!(p in style)) {
          p = _checkPropPrefix(p) || p;
        }

        if (isTransformRelated || (endNum || endNum === 0) && (startNum || startNum === 0) && !_complexExp.test(endValue) && p in style) {
          startUnit = (startValue + "").substr((startNum + "").length);
          endNum || (endNum = 0); // protect against NaN

          endUnit = getUnit(endValue) || (p in _config.units ? _config.units[p] : startUnit);
          startUnit !== endUnit && (startNum = _convertToUnit(target, p, startValue, endUnit));
          this._pt = new PropTween(this._pt, isTransformRelated ? cache : style, p, startNum, (relative ? _parseRelative(startNum, relative + endNum) : endNum) - startNum, !isTransformRelated && (endUnit === "px" || p === "zIndex") && vars.autoRound !== false ? _renderRoundedCSSProp : _renderCSSProp);
          this._pt.u = endUnit || 0;

          if (startUnit !== endUnit && endUnit !== "%") {
            //when the tween goes all the way back to the beginning, we need to revert it to the OLD/ORIGINAL value (with those units). We record that as a "b" (beginning) property and point to a render method that handles that. (performance optimization)
            this._pt.b = startValue;
            this._pt.r = _renderCSSPropWithBeginning;
          }
        } else if (!(p in style)) {
          if (p in target) {
            //maybe it's not a style - it could be a property added directly to an element in which case we'll try to animate that.
            this.add(target, p, startValue || target[p], relative ? relative + endValue : endValue, index, targets);
          } else if (p !== "parseTransform") {
            _missingPlugin(p, endValue);

            continue;
          }
        } else {
          _tweenComplexCSSString.call(this, target, p, startValue, relative ? relative + endValue : endValue);
        }

        isTransformRelated || (p in style ? inlineProps.push(p, 0, style[p]) : inlineProps.push(p, 1, startValue || target[p]));
        props.push(p);
      }
    }

    hasPriority && _sortPropTweensByPriority(this);
  },
  render: function render(ratio, data) {
    if (data.tween._time || !CSSPlugin_reverting()) {
      var pt = data._pt;

      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }
    } else {
      data.styles.revert();
    }
  },
  get: _get,
  aliases: _propertyAliases,
  getSetter: function getSetter(target, property, plugin) {
    //returns a setter function that accepts target, property, value and applies it accordingly. Remember, properties like "x" aren't as simple as target.style.property = value because they've got to be applied to a proxy object and then merged into a transform string in a renderer.
    var p = _propertyAliases[property];
    p && p.indexOf(",") < 0 && (property = p);
    return property in _transformProps && property !== _transformOriginProp && (target._gsap.x || _get(target, "x")) ? plugin && _recentSetterPlugin === plugin ? property === "scale" ? _setterScale : _setterTransform : (_recentSetterPlugin = plugin || {}) && (property === "scale" ? _setterScaleWithRender : _setterTransformWithRender) : target.style && !_isUndefined(target.style[property]) ? _setterCSSStyle : ~property.indexOf("-") ? _setterCSSProp : _getSetter(target, property);
  },
  core: {
    _removeProperty: _removeProperty,
    _getMatrix: _getMatrix
  }
};
gsap.utils.checkPrefix = _checkPropPrefix;
gsap.core.getStyleSaver = _getStyleSaver;

(function (positionAndScale, rotation, others, aliases) {
  var all = _forEachName(positionAndScale + "," + rotation + "," + others, function (name) {
    _transformProps[name] = 1;
  });

  _forEachName(rotation, function (name) {
    _config.units[name] = "deg";
    _rotationalProperties[name] = 1;
  });

  _propertyAliases[all[13]] = positionAndScale + "," + rotation;

  _forEachName(aliases, function (name) {
    var split = name.split(":");
    _propertyAliases[split[1]] = all[split[0]];
  });
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");

_forEachName("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function (name) {
  _config.units[name] = "px";
});

gsap.registerPlugin(CSSPlugin);

;// CONCATENATED MODULE: ./node_modules/gsap/index.js


var gsapWithCSS = gsap.registerPlugin(CSSPlugin) || gsap,
    // to protect from tree shaking
TweenMaxWithCSS = gsapWithCSS.core.Tween;


/***/ }),

/***/ 468:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Game = void 0;
const pixi_js_1 = __webpack_require__(836);
const TextContent_1 = __webpack_require__(791);
const Fire_1 = __webpack_require__(587);
const Menu_1 = __webpack_require__(963);
const Table_1 = __webpack_require__(111);
const FullScreenButton_1 = __webpack_require__(21);
const Config_1 = __webpack_require__(478);
class Game {
    constructor(stage, ticker) {
        this.stage = stage;
        this.ticker = ticker;
        this._content = new pixi_js_1.Container();
        this._ui = new pixi_js_1.Container();
        this._background = this.stage.addChild(new pixi_js_1.Sprite({ texture: pixi_js_1.Texture.from("background.jpg"), width: Config_1.Config.width, height: Config_1.Config.height }));
        this._background.alpha = 0.5;
        this._fullScreenButton = this._ui.addChild(this.getFullScreenButton());
        this._menu = this._ui.addChild(new Menu_1.Menu(Config_1.Config.width - 20, item => this.switchContent(item)));
        this.stage.addChild(this._content);
        this.stage.addChild(this._ui);
        this.addFrameRateDisplay();
        this.setupResizeListener();
    }
    setupResizeListener() {
        window.addEventListener('resize', () => {
            this.resizeElements();
        });
        this.resizeElements();
    }
    resizeElements() {
        var _a;
        let size;
        if (document.fullscreenElement) {
            size = { width: window.innerWidth, height: window.innerHeight };
        }
        else {
            size = { width: Config_1.Config.width, height: Config_1.Config.height };
        }
        this._background.setSize(size.width, size.height);
        this._fullScreenButton.position.set(size.width - this._fullScreenButton.width - 10, 10);
        this._menu.position.set((size.width - this._menu.width) / 2, size.height - this._menu.height - 10);
        (_a = this._currentContent) === null || _a === void 0 ? void 0 : _a.resize(size.width, size.height);
    }
    switchContent(item) {
        var _a;
        (_a = this._currentContent) === null || _a === void 0 ? void 0 : _a.remove();
        switch (item) {
            case "Cards":
                this._currentContent = this._content.addChild(new Table_1.Table());
                break;
            case "Text":
                this._currentContent = this._content.addChild(new TextContent_1.TextContent());
                break;
            case "Particles":
                this._currentContent = this._content.addChild(new Fire_1.Fire(this.ticker));
                break;
        }
        this.resizeElements();
    }
    getFullScreenButton() {
        const div = document.querySelector('div');
        const fullScreenButton = new FullScreenButton_1.FullScreenButton(isFullScreen => {
            if (isFullScreen) {
                div === null || div === void 0 ? void 0 : div.requestFullscreen();
            }
            else {
                window.document.exitFullscreen();
            }
        });
        return fullScreenButton;
    }
    addFrameRateDisplay() {
        const text = new pixi_js_1.Text({ style: new pixi_js_1.TextStyle({ fill: 0xFFFFFF, fontWeight: "400", fontSize: 12 }) });
        text.position.set(10);
        this._ui.addChild(text);
        this.ticker.add(ticker => { text.text = "FPS: " + ticker.FPS.toFixed(2); });
    }
}
exports.Game = Game;


/***/ }),

/***/ 478:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Config = void 0;
exports.Config = {
    width: 1024,
    height: 720
};


/***/ }),

/***/ 553:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Card = void 0;
const gsap_1 = __webpack_require__(880);
const pixi_js_1 = __webpack_require__(836);
class Card extends pixi_js_1.Sprite {
    constructor(suite, rank) {
        super(pixi_js_1.Texture.from("cards/card_back.png"));
        this.suite = suite;
        this.rank = rank;
        this.showsFace = false;
        this.anchor.set(0.5, 0.5);
    }
    showFront() {
        this.texture = this.getTexture(true);
    }
    showBack() {
        this.texture = this.getTexture(false);
    }
    flip() {
        const timeline = gsap_1.gsap.timeline();
        timeline.to(this.scale, { x: 0, duration: 0.2, ease: gsap_1.Linear.easeIn });
        timeline.to(this.scale, {
            x: 1,
            duration: 0.2,
            onStart: () => {
                this.showsFace = !this.showsFace;
                if (this.showsFace) {
                    this.showFront();
                }
                else {
                    this.showBack();
                }
            },
            ease: gsap_1.Linear.easeOut
        });
        timeline.play();
    }
    getTexture(front) {
        return pixi_js_1.Texture.from(front ? ("cards/card_" + this.suite + "_" + this.rank + ".png") : ("cards/card_back.png"));
    }
}
exports.Card = Card;


/***/ }),

/***/ 634:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Deck = void 0;
const pixi_js_1 = __webpack_require__(836);
class Deck {
    constructor(cards = []) {
        this.coords = new pixi_js_1.Point(0, 0);
        this.cards = cards;
        this.updateCardPositions();
    }
    positionForCard(index) {
        return new pixi_js_1.Point(this.coords.x, this.coords.y + (index * Deck.OFFSET));
    }
    topMostPosition() {
        return this.positionForCard(this.cards.length);
    }
    updateCardPositions() {
        this.cards.forEach((card, index) => card.position = this.positionForCard(index));
    }
}
exports.Deck = Deck;
Deck.OFFSET = 3;


/***/ }),

/***/ 111:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Table = void 0;
const pixi_js_1 = __webpack_require__(836);
const Card_1 = __webpack_require__(553);
const Deck_1 = __webpack_require__(634);
const gsap_1 = __webpack_require__(880);
class Table extends pixi_js_1.Container {
    constructor() {
        super();
        this._timelines = [];
        this._deckLeft = new Deck_1.Deck([...this.generateCards()]);
        this._deckRight = new Deck_1.Deck();
        this._deckLeft.cards.forEach(card => { this.addChild(card); });
        this._interval = setInterval(() => { this.moveCard(); }, 1000);
    }
    remove() {
        this.removeFromParent();
        if (this._interval)
            clearInterval(this._interval);
    }
    resize(width, height) {
        this._timelines.forEach(timeline => timeline.totalProgress(1.0));
        this._deckLeft.coords.set(width / 4, height / 5);
        this._deckLeft.updateCardPositions();
        this._deckRight.coords.set((width / 4 * 3), height / 5);
        this._deckRight.updateCardPositions();
    }
    moveCard() {
        if (this._deckLeft.cards.length == 0) {
            if (this._interval)
                clearInterval(this._interval);
            return;
        }
        const card = this._deckLeft.cards.pop();
        const destination = this._deckRight.topMostPosition();
        this._deckRight.cards.push(card);
        const timeline = gsap_1.gsap.timeline({
            onStart: () => {
                this._timelines.push(timeline);
            },
            onComplete: () => {
                const index = this._timelines.indexOf(timeline);
                if (index > -1)
                    this._timelines.splice(index, 1);
            }
        });
        timeline.to(card.position, { x: destination.x, duration: 2, ease: gsap_1.Cubic.easeInOut }, 0);
        timeline.to(card.position, { y: Math.max(card.y, destination.y) + 50, duration: 1, ease: gsap_1.Sine.easeOut }, 0);
        timeline.to(card.position, { y: destination.y, duration: 1, ease: gsap_1.Sine.easeIn }, 1);
        timeline.call(() => {
            card.flip();
            this.setChildIndex(card, this.children.length - 1);
        }, [], 0.8);
        timeline.play();
    }
    *generateCards() {
        const suites = ["clubs", "spades", "hearts", "diamonds"];
        const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "j", "q", "k", "a"];
        for (let i = 0; i < Table.CARDS; i++) {
            const suite = Math.floor(Math.random() * suites.length);
            const rank = Math.floor(Math.random() * ranks.length);
            yield new Card_1.Card(suites[suite], ranks[rank]);
        }
    }
}
exports.Table = Table;
Table.CARDS = 144;


/***/ }),

/***/ 587:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Fire = void 0;
const particle_emitter_1 = __webpack_require__(411);
const pixi_js_1 = __webpack_require__(836);
class Fire extends pixi_js_1.Container {
    constructor(ticker) {
        super();
        this.ticker = ticker;
        this._particleContainer = new pixi_js_1.Container();
        this.addChild(this._particleContainer);
        const emitter = this.buildEmitter(this._particleContainer);
        this.ticker.add(ticker => emitter.update(ticker.deltaTime / 50));
    }
    remove() {
        this.removeFromParent();
    }
    resize(width, height) {
        this._particleContainer.position.set(width / 2, height / 2);
    }
    buildEmitter(container) {
        const config = {
            lifetime: {
                min: 0.5,
                max: 1.0
            },
            frequency: 0.1,
            emitterLifetime: -1,
            maxParticles: 10,
            pos: {
                x: 0,
                y: 0
            },
            addAtBack: false,
            behaviors: [
                {
                    type: 'textureRandom',
                    config: {
                        textures: ["particle1.png", "particle2.png"],
                    }
                },
                {
                    type: "moveAcceleration",
                    config: {
                        accel: {
                            x: 0,
                            y: -200
                        },
                        minStart: 0,
                        maxStart: 0,
                        rotate: false
                    }
                },
                {
                    type: 'scale',
                    config: {
                        scale: {
                            list: [{ value: 0.5, time: 0.0 }, { value: 1.0, time: 1.0 }],
                            isStepped: false
                        },
                        minMult: 1.0
                    }
                },
                {
                    type: 'color',
                    config: {
                        color: {
                            list: [{ value: '#6b3400', time: 0.0 }, { value: '#1d0101', time: 1.0 }]
                        },
                    }
                },
                {
                    type: 'blendMode',
                    config: {
                        blendMode: 'add',
                    }
                },
                {
                    type: "rotation",
                    config: {
                        minStart: -50,
                        maxStart: 50,
                        minSpeed: -180,
                        maxSpeed: 180,
                        accel: 20
                    }
                }
            ]
        };
        // There are issues with the Particle System in PixiJS v8 that require some not-so-nice workarounds to make it work
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emitter = new particle_emitter_1.Emitter(container, config);
        emitter.emit = true;
        return emitter;
    }
}
exports.Fire = Fire;


/***/ }),

/***/ 469:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DecoratedText = void 0;
const pixi_js_1 = __webpack_require__(836);
class DecoratedText extends pixi_js_1.Container {
    constructor(string, icons, size = 400) {
        super();
        this.string = string;
        this.icons = icons;
        this.size = size;
        const weights = ["200", "300", "400", "500", "600", "700"];
        const style = new pixi_js_1.TextStyle({
            fill: Math.round(Math.random() * 0xffffff),
            fontSize: Math.round(Math.random() * 24) + 12,
            fontWeight: weights[Math.floor(Math.random() * weights.length)]
        });
        const text = new pixi_js_1.Text({ text: this.string, style: style });
        this.addChild(text);
        const indexes = this.placeholderIndexes(string, DecoratedText.PLACEHOLDER);
        const { coords, metrics } = this.getCoordinates(text, indexes);
        coords.forEach((coords, index) => {
            const icon = pixi_js_1.Sprite.from(icons[index] + ".png");
            icon.position.set(coords.x, coords.y);
            icon.anchor.set(0.5);
            icon.height = metrics.lineHeight;
            icon.width = icon.height;
            text.addChild(icon);
        });
    }
    getCoordinates(text, indexes) {
        const coords = [];
        const string = text.text;
        const style = text.style;
        const metrics = pixi_js_1.CanvasTextMetrics.measureText(string, style);
        const centerOffset = {
            x: pixi_js_1.CanvasTextMetrics.measureText(DecoratedText.PLACEHOLDER, style).width / 2,
            y: metrics.lineHeight / 2
        };
        let currentCharacter = 0;
        let currentIndex = 0;
        let charMetrics;
        const pos = { x: 0, y: 0 };
        for (let line = 0; line < metrics.lines.length; line++) {
            for (let char = 0; char < metrics.lines[line].length; char++) {
                if (indexes[currentIndex] == currentCharacter) {
                    coords.push({ x: pos.x + centerOffset.x, y: pos.y + centerOffset.y });
                    currentIndex++;
                }
                if (currentIndex >= indexes.length) {
                    return { coords: coords, metrics: metrics };
                }
                else {
                    charMetrics = pixi_js_1.CanvasTextMetrics.measureText(metrics.lines[line][char], style);
                    pos.x += charMetrics.width;
                    currentCharacter++;
                }
            }
            pos.x = text.x;
            pos.y += metrics.lineHeight;
        }
        return { coords: coords, metrics: metrics };
    }
    placeholderIndexes(string, key) {
        const result = [];
        let keyIndex = string.indexOf(key, 0);
        while (keyIndex > -1) {
            result.push(keyIndex);
            keyIndex = string.indexOf(key, keyIndex + 1);
        }
        return result;
    }
}
exports.DecoratedText = DecoratedText;
DecoratedText.PLACEHOLDER = " ‎ ‎ ‎ ";


/***/ }),

/***/ 791:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TextContent = void 0;
const pixi_js_1 = __webpack_require__(836);
const DecoratedText_1 = __webpack_require__(469);
class TextContent extends pixi_js_1.Container {
    constructor() {
        super();
        this._size = { width: 0, height: 0 };
        this._interval = setInterval(() => { this.generateNewText(); }, 2000);
        this.generateNewText();
    }
    remove() {
        this.removeFromParent();
        if (this._interval)
            clearInterval(this._interval);
    }
    resize(width, height) {
        this._size = { width: width, height: height };
        this.centerText();
    }
    generateNewText() {
        var _a;
        const [text, icons] = this.getDecoratedString();
        (_a = this._decoratedText) === null || _a === void 0 ? void 0 : _a.removeFromParent();
        this._decoratedText = this.addChild(new DecoratedText_1.DecoratedText(text, icons));
        this.centerText();
    }
    centerText() {
        if (this._decoratedText) {
            this._decoratedText.position.set((this._size.width - this._decoratedText.width) / 2, (this._size.height - this._decoratedText.height) / 2);
        }
    }
    getDecoratedString() {
        const words = TextContent.LOREM_IPSUM.split(" ");
        const numberOfWords = Math.floor((words.length - 3) * Math.random()) + 3;
        const numberOfIcons = Math.round(Math.random() * (numberOfWords / 3));
        const icons = Array.from({ length: numberOfIcons }, () => TextContent.ICONS[Math.floor(Math.random() * TextContent.ICONS.length)]);
        const availableIconPositions = Array.from({ length: numberOfWords }, (_, index) => index);
        const iconPositions = Array.from({ length: numberOfIcons }, () => {
            const positionIndex = Math.floor(Math.random() * availableIconPositions.length);
            const position = availableIconPositions[positionIndex];
            availableIconPositions.splice(positionIndex, 1);
            return position;
        }).sort((a, b) => a - b);
        const decoratedText = Array.from({ length: numberOfWords + numberOfIcons }, (_, index) => {
            const offsetIndex = index - (numberOfIcons - iconPositions.length);
            if (offsetIndex == iconPositions[0]) {
                iconPositions.shift();
                return DecoratedText_1.DecoratedText.PLACEHOLDER;
            }
            else {
                return words[offsetIndex];
            }
        }).join(" ");
        return [decoratedText, icons];
    }
}
exports.TextContent = TextContent;
TextContent.LOREM_IPSUM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
TextContent.ICONS = ["boo", "coin", "flower", "fuzzy", "goomba", "mushroom"];


/***/ }),

/***/ 21:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FullScreenButton = void 0;
const pixi_js_1 = __webpack_require__(836);
class FullScreenButton extends pixi_js_1.Sprite {
    constructor(onToggle) {
        super();
        this._isInFullScreen = false;
        this._enterIcon = pixi_js_1.Texture.from("full_enter.png");
        this._exitIcon = pixi_js_1.Texture.from("full_exit.png");
        this.texture = this._enterIcon;
        this.interactive = true;
        this.cursor = "pointer";
        this.on("pointerup", () => {
            this._isInFullScreen = !this._isInFullScreen;
            this.texture = this._isInFullScreen ? this._exitIcon : this._enterIcon;
            onToggle(this._isInFullScreen);
        });
    }
}
exports.FullScreenButton = FullScreenButton;


/***/ }),

/***/ 963:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Menu = void 0;
const pixi_js_1 = __webpack_require__(836);
class Menu extends pixi_js_1.Container {
    constructor(width, listener) {
        super();
        this._items = ["Cards", "Text", "Particles"];
        this.addChild(this.getBackground(width));
        this.buildItems(width, listener);
    }
    buildItems(width, listener) {
        this._items.forEach((value, index) => {
            const button = new MenuButton(width / 3, 50, value);
            button.x = (width / 3) * index;
            button.on("pointerup", () => {
                if (this._selected) {
                    this._selected.onDeselected();
                }
                this._selected = button;
                button.onSelected();
                listener(value);
            });
            button.on("mouseover", () => button.onOver());
            button.on("mouseleave", () => button.onOut());
            button.on("mousedown", () => button.onDown());
            button.on("mouseup", () => button.onUp());
            this.addChild(button);
        });
    }
    getBackground(width) {
        const shape = new pixi_js_1.Graphics();
        shape.rect(0, 0, width, 50);
        shape.fill({ color: 0x666666 });
        return shape;
    }
}
exports.Menu = Menu;
class MenuButton extends pixi_js_1.Graphics {
    constructor(width, height, title) {
        super();
        this.rect(0, 0, width, height);
        this.fill({ color: 0x593e67 });
        const label = new pixi_js_1.Text({ text: title, style: new pixi_js_1.TextStyle({ fill: 0xffffff, fontSize: 24 }) });
        label.anchor.set(0.5);
        label.position.set(width / 2, height / 2);
        this.addChild(label);
        this.cursor = "pointer";
        this.enabled = true;
    }
    set enabled(value) {
        this.interactive = value;
    }
    onOver() {
        this.tint = 0x84495f;
    }
    onOut() {
        this.tint = 0xFFFFFF;
    }
    onDown() {
        this.alpha = 0.5;
    }
    onUp() {
        this.alpha = 1.0;
    }
    onSelected() {
        this.onOver();
        this.enabled = false;
    }
    onDeselected() {
        this.onOut();
        this.enabled = true;
    }
}


/***/ }),

/***/ 156:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const pixi_js_1 = __webpack_require__(836);
const game_1 = __webpack_require__(468);
window.addEventListener('load', () => __awaiter(void 0, void 0, void 0, function* () {
    const canvas = document.querySelector('div');
    if (!canvas) {
        console.error("Invalid HTML layout: missing Pixi container");
        return;
    }
    const app = new pixi_js_1.Application();
    yield app.init({
        background: 0x000000,
        hello: true,
        resizeTo: canvas,
        antialias: true,
        resolution: window.devicePixelRatio,
        autoDensity: true
    });
    canvas.appendChild(app.canvas);
    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    });
    yield pixi_js_1.Assets.load(['/assets/sheet.json']);
    new game_1.Game(app.stage, app.ticker);
}));


/***/ }),

/***/ 836:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__836__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(156);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});