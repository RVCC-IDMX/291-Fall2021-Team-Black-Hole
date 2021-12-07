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
let astronautOuter = new PIXI.Container();
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

// minmax function
let minMax = (num, min, max) => Math.min(Math.max(parseInt(num), min), max);

// SPRITE SETUP ------------------------------------------------------------ //

// Sprite pool
let bg          = initSprite('background', scx, scy, 0.34, 0.5, background);
let cluster     = initSprite('cluster', sw*0.7, sh*0.7, 2, 0.5, background);
let astronaut   = initSprite('astronaut', sw*0.15, scy, 0.4, 0.5, astronautOuter);
let sliderMain  = initSprite('slider', scx, sh*0.08, 0.6, 0.5, ui);
let sliderDial  = initSprite('nub', scx, sh*0.079, 0.6, 0.5, ui);
let buttonOut   = initSprite('out', sw*0.17, sh*0.87, 0.6, 0.5, ui);
let buttonIn    = initSprite('in', sw-sw*0.17, sh*0.87, 0.6, 0.5, ui);

// A

// "Black hole" filter
let bulge = new BulgePinchFilter({
    center: [0.75, 0.5],
    radius: 100,
    strength: 100,
});
background.filters = [bulge];

// Push containers to stage
app.stage.addChild(background);
app.stage.addChild(astronautOuter);
app.stage.addChild(ui);

// BLACK HOLE SIZE ------------------------------------------------------------ //

// Set attributes
sliderDial.interactive = true;
sliderDial.dragging = false;
sliderDial.cursor = 'pointer';

// Preload button textures
let nubTexture = PIXI.Texture.from('img/nub.png');
let nubTextureHover = PIXI.Texture.from('img/nub2.png');

// Set hover properties
sliderDial.on("pointerdown", e => sliderDial.texture = nubTextureHover);
sliderDial.on("pointerup", e => sliderDial.texture = nubTexture);

// Set click properties
sliderDial.on("pointerdown", e => sliderDial.dragging = true);
sliderDial.on("pointermove", e => {
    if (sliderDial.dragging) {
        // slider values
        let xpos = e.data.global.x;
        let xval = minMax(xpos, 193.5, sliderMain.width*0.825+193.5);
        sliderDial.x = xval
        let xcalc = (xval - 193.5) / (sliderMain.width*0.825);
        // curve fit (0, 50), (0.5, 100), (1, 400)
        let strength = 500 * Math.pow(xcalc, 2) - 150 * xcalc + 50;
        let size = 100 * (xcalc + 0.5)
        bulge.uniforms.strength = strength;
        bulge.uniforms.radius = size;
    }
});
sliderDial.on("pointerup", e => sliderDial.dragging = false);

// EXTRA UI ---------------------------------------------------------------- //

// Out button
buttonOut.interactive = true;
buttonOut.cursor = 'pointer';
let outTexture = PIXI.Texture.from('img/out.png');
let outTextureHover = PIXI.Texture.from('img/out2.png');
buttonOut.on("pointerdown", e => buttonOut.texture = outTextureHover);
buttonOut.on("pointerup", e => buttonOut.texture = outTexture);

// In button
buttonIn.interactive = true;
buttonIn.cursor = 'pointer';
let inTexture = PIXI.Texture.from('img/in.png');
let inTextureHover = PIXI.Texture.from('img/in2.png');
buttonIn.on("pointerdown", e => buttonIn.texture = inTextureHover);
buttonIn.on("pointerup", e => buttonIn.texture = inTexture);

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
    circin:     x => 1 - Math.sqrt(1 - Math.pow(x, 2)),
    circs:      x => x < 0.5 ? Ease.circin(x) / 2 : Ease.circout(x) / 2
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
            if (attrib != 'tint') {
                obj[attrib] = lerp(start, amp, alpha);
            } else {
                obj.tint = 0;
                for (let i=0; i<3; i++) {
                    let a0 = (start & (255 * Math.pow(256, i))) >> (8*i);
                    let a = (amp & (255 * Math.pow(256, i))) >> (8*i);
                    obj.tint += Math.floor(lerp(a0, a, alpha)) << (8*i);
                }
            }
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

// SCENES ------------------------------------------------------------------ //

buttonIn.on("pointerdown", e => {
    animate(astronautOuter, 8, Ease.sines, scx*0.55, 'x');
    animate(astronautOuter, 8, Ease.sines, 180, 'y');
    animate(astronautOuter, 8, Ease.sines, -pi/3, 'rotation');
    animate(astronaut, 7.5, Ease.sines, 0, 'scale.x');
    animate(astronaut, 7.5, Ease.circin, 0.1, 'scale.y');
    animate(astronaut, 8, Ease.sinein, 0xF58142, 'tint');
});

buttonOut.on("pointerdown", e => {
    animate(astronautOuter, 2, Ease.circout, 0, 'x');
    animate(astronautOuter, 2, Ease.circout, 0, 'y');
    animate(astronautOuter, 2, Ease.circout, 0, 'rotation');
    animate(astronaut, 1, Ease.circout, 0.4, 'scale.x');
    animate(astronaut, 1, Ease.circout, 0.4, 'scale.y');
    astronaut.tint = 0xFFFFFF;
});