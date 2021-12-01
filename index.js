// ENVIRONMENT SETUP ------------------------------------------------------- //

// Define screen res, shortcuts
const sw = 640, sh = 480;
const scx = sw/2, scy = sh/2;
const pi = Math.PI;

// Load app
let app = new PIXI.Application({
    width: sw,
    height: sh,
    backgroundColor: 0x000000
});
let stage = app.stage;
let view = app.view;

// Add view to the document
document.body.appendChild(app.view);

// Initalize containers
let background = new PIXI.Container();
let ui = new PIXI.Container();

// FUNCTIONS --------------------------------------------------------------- //

let initSprite = (file, x, y, size, anchor, container) => {
    let sprite = PIXI.Sprite.from(`img/${file}.png`);
    sprite.x = x;
    sprite.y = y;
    sprite.scale.set(size);
    sprite.anchor.set(anchor);
    app.stage.addChild(sprite);
    if (container) container.addChild(sprite);
    return sprite;
};

// SPRITE SETUP ------------------------------------------------------------ //

// Sprite pool
let bg          = initSprite('background', scx, scy, 0.34, 0.5, background);
let cluster     = initSprite('cluster', sw*0.7, sh*0.7, 2, 0.5, background);
let astronaut   = initSprite('astronaut', sw*0.15, scy, 0.4, 0.5, background);
let sliderMain  = initSprite('slider', scx, sh*0.08, 0.6, 0.5, ui);
let sliderDial  = initSprite('nub', scx, sh*0.08, 0.6, 0.5, ui);
let buttonOut   = initSprite('out', sw*0.17, sh*0.87, 0.6, 0.5, ui);
let buttonIn    = initSprite('in', sw-sw*0.17, sh*0.87, 0.6, 0.5, ui);

// "Black hole" filter
let bulge = new BulgePinchFilter({
    center: [0.75, 0.5],
    radius: 125,
    strength: 2,
});
background.filters = [bulge];

// Push containers to stage
app.stage.addChild(background);
app.stage.addChild(ui);

// ANIMATION SETUP --------------------------------------------------------- //

// Eases
let Ease = {
    lin:        x => x,
    sinein:     x => 1 - Math.cos((x * Math.PI) / 2),
    sineout:    x => Math.sin((x * Math.PI) / 2),
    sines:      x => -(Math.cos(Math.PI * x) - 1) / 2,
    quadin:     x => x * x,
    quadout:    x => 1 * (1 - x) * (1 - x),
    quads:      x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2,
    circout:    x => Math.sqrt(1 - Math.pow(x - 1, 2)),
};

// Animate an object
let animate = (obj, duration, ease, amp, attrib) => {
    if (attrib.split('.').length != 1) {
        obj = obj[attrib.split('.')[0]]
        attrib = attrib.split('.')[1]
    }
    return new Promise( (resolve, reject) => {
        // Add initial attributes
        let start = obj[attrib];
        // Ticker stuff
        let t0 = Date.now()/1000;
        let loop = () => {
            let t = Date.now()/1000 - t0;
            let delta = t / duration;
            let alpha = ease(delta);
            if (delta >= 1) {
                obj[attrib] = amp;
                resolve();
                return;
            }
            let lerp = (a, b, n) => (1 - n) * a + n * b;
            obj[attrib] = lerp(start, amp, alpha);
            obj[attrib]['animationID'] = requestAnimationFrame(loop);
        };
        cancelAnimationFrame(obj[attrib]['animationID']);
        loop();
    });
};

// ANIMATION EXECUTION ----------------------------------------------------- //

let floatSin = async (sprite, duration, attrib, start, amp) => {
    await animate(sprite, duration/4, Ease.sineout, start+amp, attrib);
    await animate(sprite, duration/2, Ease.sines, start-amp, attrib);
    await animate(sprite, duration/4, Ease.sinein, start, attrib);
    floatSin(sprite, duration, attrib, start, amp);
};

let floatCos = async (sprite, duration, attrib, start, amp) => {
    await animate(sprite, duration/2, Ease.sines, start-amp, attrib);
    await animate(sprite, duration/2, Ease.sines, start, attrib);
    floatCos(sprite, duration, attrib, start, amp);
};

let linRotate = async (sprite, duration) => {
    sprite.rotation = 0;
    await animate(sprite, duration, Ease.lin, -2*pi, 'rotation');
    linRotate(sprite, duration);
};

// Default idle animations
floatSin(astronaut, 12, 'y', scy, -20,);
floatSin(astronaut, 7, 'rotation', pi/18, -pi/24);
linRotate(cluster, 250);
floatCos(cluster, 250, 'anchor.x', 0.4, -0.2);
floatCos(cluster, 250, 'y', sh*0.7, sh*0.3);
linRotate(bg, 500);
floatCos(bg, 500, 'anchor.x', 0.5, -0.2/4);
floatCos(bg, 500, 'y', scy, sh*0.3/4);

// ?? ---------------------------------------------------------------------- //