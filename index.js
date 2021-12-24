// ENVIRONMENT SETUP ------------------------------------------------------- //

// Touch mode
const MODE_DOWN = "pointerdown";
const MODE_UP = "pointerup";

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
let overlay = new PIXI.Container();

// BACKEND ----------------------------------------------------------------- //

let scene = 0; // 0: pre, 1: interactable, 2: infoslides
let slide = 0; // 0: n/a, 1: whatis, 2: characteristics, 3: types, 4: anatomy
let timeDelta = 0;

// FUNCTIONS --------------------------------------------------------------- //

// Sprite initializer
let initSprite = (file, x, y, size, opacity, anchor, container) => {
    const size1 = typeof size == 'object' ? size[0] : size;
    const size2 = typeof size == 'object' ? size[0] : size;
    let sprite = PIXI.Sprite.from(`img/${file}.png`);
    sprite.x = x;
    sprite.y = y;
    sprite.scale.set(size1, size2);
    sprite.alpha = opacity;
    sprite.anchor.set(anchor);
    app.stage.addChild(sprite);
    if (container) container.addChild(sprite);
    return sprite;
};

// Text initalizer
let initText = (content, x, y, font, color, size, weight, opacity, anchor, container) => {
    let text = new PIXI.Text(content, {
        fontFamily: font,
        fill: color,
        fontSize: size,
        fontWeight: weight,
        wordWrap: true,
        wordWrapWidth: 520
    });
    text.x = x;
    text.y = y;
    text.alpha = opacity;
    text.anchor.set(anchor);
    app.stage.addChild(text);
    if (container) container.addChild(text);
    return text;
};

// Button initializer
let initButton = (sprite, file) => {
    sprite.interactive = true;
    sprite.cursor = 'pointer';
    let outTexture = PIXI.Texture.from(`img/${file}.png`);
    let outTextureHover = PIXI.Texture.from(`img/${file}2.png`);
    sprite.on(MODE_DOWN, e => {
        sprite.texture = outTextureHover;
        timeDelta = 0;
    });
    sprite.on(MODE_UP, e => sprite.texture = outTexture);
};

const clamp = (num, min, max) => Math.min(Math.max(parseInt(num), min), max);
const setText = (obj, text) => obj.text = text;

// TEXT -------------------------------------------------------------------- //

headerText = [
    ``,
    `What is a Black Hole?`,
    `Characteristics of a Black Hole`,
    `Types of Black Holes`,
    `Anatomy and Physics of a Black Hole`,
];

descText = [
    ``,
    // 1
    `A black hole is recognized as an "astronomical object" with `+
    `a gravitational pull so strong nothing can escape it, not even light.\n\n`+
    `The most common way a black hole forms is stellar death, a star `+
    `will explode into a supernova at the end of its life, the release of `+
    `force allowing the intense gravity to collapse. Black holes can grow `+
    `and evaporate too!`,
    // 2
    `- Radius is determined by the formula R = 3M, where M is mass of the `+
    `black hole in units of solar mass.\n\n- Red shift: Gravity is strong `+
    `enough to shift colors to the red part of the spectrum.\n\n- Lensing: `+
    `The gravity that the light being bent over the hole multiple times.`,
    // 3
    `- Supermassive Black Holes: mass millions or billions the time of `+
    `the Sun.\n\n- Stellar: mass 5 to 10 times the Sun, called collapsars, `+
    `observed as radial energy bursts or hypernova.\n\n- Intermediate: mass `+
    `100 to 500 times of the Sun.\n\n- Miniature: called quantum mechanical `+
    `black holes, theoretical and smaller than stellar holes.`,
    // 4
    `- Accretion Disk: the disklike cloud of energy, gas, plasma, dust `+
    `particles that surround the body of a black hole.\n\n- Event Horizon: `+
    `the theoretical bounds of a black hole in which no light can escape.\n\n`+
    `- Singularity: the center of a black hole, the infinitely compressed`+
    `point of no return.\n\n- Spaghettifiction: the vertical stretching and`+
    `horizontal compression of objects into thin streams of particles.\n\n`+
    `- Dilation: The relation between space and time is warped by gravity, `+
    `making time go by slower the larger the mass and warp of spacetime, `+
    `and faster the smaller the mass and warp of spacetime.`
];

// AUDIO ------------------------------------------------------------------- //

let sfxDoor = new Audio("sfx/door.ogg");
let sfxButton = new Audio("sfx/button.ogg");
let sfxClick = new Audio("sfx/click.ogg");

// SPRITE SETUP ------------------------------------------------------------ //

// Sprite pool pt1
let bg          = initSprite('background', scx, scy, 0.34, 1, 0.5, background);
let cluster     = initSprite('cluster', sw*0.7, sh*0.7, 2, 1, 0.5, background);

// Animated stars
for (let i = 0; i < 1000; i++) {
    let s = initSprite('star', Math.random()*1.5*sw, Math.random()*1.5*sh, Math.random()/50, 0.7, 0.5, background);
    let k = initSprite('star', Math.random()*1.5*sw, Math.random()*1.5*sh, Math.random()/50, 0.7, 0.5, background);
    let j = initSprite('star', Math.random()*1.5*sw, Math.random()*1.5*sh, Math.random()/50, 0.7, 0.5, background);
    requestAnimationFrame(animate);
    function animate() {
        requestAnimationFrame(animate);
        let a = Date.now() / 1000;
        let b = Date.now() / 500;
        let c = Date.now() / 300;
        let freq = i / 1000;
        let amp = i / 1000;
        s.alpha = freq * Math.sin(a + amp) * 0.3;
        k.alpha = freq * Math.cos(b + amp) * 0.3;
        j.alpha = freq * Math.sin(c + amp) * 0.3;
    }
}

// Sprite pool pt2
let meteor      = initSprite('meteor', sw, sh*0.75, 0.1, 0, -3.7, background);
let astronaut   = initSprite('astronaut', sw*0.15, scy, 0.4, 1, 0.5, astronautOuter);
let sliderMain  = initSprite('slider', scx, sh*0.08, 0.6, 1, 0.5, ui);
let sliderDial  = initSprite('nub', scx, sh*0.079, 0.6, 1, 0.5, ui);
let buttonOut   = initSprite('out', sw*0.17, sh*0.87, 0.6, 1, 0.5, ui);
let buttonInfo  = initSprite('info', scx, sh*0.87, 0.5, 1, 0.5, ui);
let buttonIn    = initSprite('in', sw-sw*0.17, sh*0.87, 0.6, 1, 0.5, ui);
let dim         = initSprite('dim', 0, 0, [sw, sh], 0, 0, overlay)
let buttonClose = initSprite('close', sw*0.935, sh*0.09, 0.3, 1, 0.5, overlay);
let infoEngage  = initText("Interact with me!", scx, sh*0.19, 'M PLUS 1', '#d08dff', 28, 300, 0, 0.5, overlay);
let infoHeader  = initText(headerText[0], scx, sh*0.15, 'Open Sans Condensed', '#eee', 36, 800, 0, 0.5, overlay);
let infoDesc    = initText(descText[0], scx, sh*0.51, 'M PLUS 1','#eee', 18, 300, 0, 0.5, overlay);
let buttonBack  = initSprite('nav', sw*0.08, sh*1.19, -0.45, 1, 0.5, overlay);
let buttonNext  = initSprite('nav', sw*0.92, sh*1.19, 0.45, 1, 0.5, overlay);
let introWindow = initSprite('window', sw*0.502, sh*0.52, 0.57, 1, 0.5, overlay);
let buttonIntro = initSprite('nav', scx, sh*0.8, 0.6, 1, 0.5, overlay);
buttonIntro.rotation = -pi/2;

// "Black hole" filter
let bulge = new BulgePinchFilter({
    center: [0.5, 0.5],
    radius: 100,
    strength: 100,
});
background.filters = [bulge];

// Push containers to stage
app.stage.addChild(background);
app.stage.addChild(astronautOuter);
app.stage.addChild(ui);
app.stage.addChild(overlay);

// BLACK HOLE SIZE ------------------------------------------------------------ //

// Set attributes
sliderDial.interactive = true;
sliderDial.dragging = false;
sliderDial.cursor = 'pointer';

// Preload button textures
let nubTexture = PIXI.Texture.from('img/nub.png');
let nubTextureHover = PIXI.Texture.from('img/nub2.png');

// Set click properties 1
sliderDial.on(MODE_DOWN, e => sliderDial.texture = nubTextureHover);
sliderDial.on(MODE_UP, e => sliderDial.texture = nubTexture);

// Set click properties 2
sliderDial.on(MODE_DOWN, e => sliderDial.dragging = true);
sliderDial.on("pointermove", e => {
    if (sliderDial.dragging && scene != 0) {
        // slider values
        let xpos = e.data.global.x;
        let xval = clamp(xpos, 193.5, sliderMain.width*0.825+193.5);
        sliderDial.x = xval
        let xcalc = (xval - 193.5) / (sliderMain.width*0.825);
        // curve fit (0, 50), (0.5, 100), (1, 400)
        let strength = 500 * xcalc**2 - 150 * xcalc + 50;
        let size = 100 * (xcalc + 0.5)
        bulge.uniforms.strength = strength;
        bulge.uniforms.radius = size;
        // timer
        timeDelta = 0;
    }
});
sliderDial.on(MODE_UP, e => sliderDial.dragging = false);

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
    circin:     x => 1 - Math.sqrt(1 - Math.pow(x, 2))
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
                    let a0 = (start & (255*256**i)) >> (8*i);
                    let a = (amp & (255*256**i)) >> (8*i);
                    obj.tint += Math.floor(lerp(a0, a, alpha)) << (8*i);
                }
            }
            obj[attrib]['animationID'] = requestAnimationFrame(loop);
        };
        cancelAnimationFrame(obj[attrib]['animationID']);
        loop();
    });
};

// Animate the black hole's position 
let animateHole = (duration, ease, amp) => {
    return new Promise( (resolve, reject) => {
        let start = bulge.center[0];
        let t0 = Date.now()/1000;
        let loop = () => {
            let t = Date.now()/1000 - t0;
            let delta = t / duration;
            let alpha = ease(delta);
            if (delta >= 1) {
                bulge.center[0] = amp;
                resolve();
                return;
            }
            let lerp = (a, b, n) => (1 - n) * a + n * b;
            bulge.center[0] = lerp(start, amp, alpha);
            bulge.center[0]['animationID'] = requestAnimationFrame(loop);
        };
        cancelAnimationFrame(bulge.center[0]['animationID']);
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
linRotate(meteor, 18);

// UI ---------------------------------------------------------------------- //

initButton(buttonOut, 'out');
initButton(buttonIn, 'in');
initButton(buttonInfo, 'info');
initButton(buttonBack, 'nav');
initButton(buttonNext, 'nav');
initButton(buttonClose, 'close');
initButton(buttonIntro, 'nav');

// Reset the astronaut
const resetAstronaut = () => {
    animate(astronautOuter, 2, Ease.circout, 0, 'x');
    animate(astronautOuter, 2, Ease.circout, 0, 'y');
    animate(astronautOuter, 2, Ease.circout, 0, 'rotation');
    animate(astronaut, 1, Ease.circout, 0.4, 'scale.x');
    animate(astronaut, 1, Ease.circout, 0.4, 'scale.y');
    astronaut.tint = 0xFFFFFF;
};

// Reset from scene 1 to scene 0
const reset1_0 = () => {
    animate(introWindow, 1.5, Ease.circout, 0.6, 'scale.x');
    animate(introWindow, 1.5, Ease.circout, 0.6, 'scale.y');
    animate(buttonIntro, 1, Ease.circout, sh*0.8, 'y');
    animate(buttonIntro, 1, Ease.circout, 1, 'alpha');
    animate(sliderMain, 1.5, Ease.circout, scx, 'x');
    animate(sliderDial, 1.5, Ease.circout, scx, 'x');
    animate(bulge, 1.5, Ease.circout, 100, 'radius');
    animate(bulge, 1.5, Ease.circout, 100, 'strength');
    animateHole(1.5, Ease.circout, 0.5);
    resetAstronaut();
    animate(infoEngage, 0.4, Ease.sines, 0, 'alpha');
    animate(meteor, 0.1, Ease.sines, 0, 'alpha');
};

// Reset from scene 2 to scene 1
const reset2_1 = () => {
    animate(dim, 1, Ease.sines, 0, 'alpha');
    animate(sliderMain, 1.5, Ease.sines, sh*0.08, 'y');
    animate(sliderDial, 1.5, Ease.sines, sh*0.079, 'y');
    animate(buttonOut, 1.25, Ease.sines, sh*0.87, 'y');
    animate(buttonIn, 1.25, Ease.sines, sh*0.87, 'y');
    animate(buttonInfo, 1.4, Ease.quads, sh*0.87, 'y');
    animate(buttonBack, 1.5, Ease.sines, sh*1.19, 'y');
    animate(buttonNext, 1.5, Ease.sines, sh*1.19, 'y');
    animate(infoHeader, 1, Ease.quads, 0, 'alpha');
    animate(infoDesc, 1, Ease.quads, 0, 'alpha');
    animate(infoEngage, 2, Ease.sines, 0.8, 'alpha');
};

buttonIntro.on(MODE_DOWN, e => {
    scene = 1;
    animate(introWindow, 1, Ease.circin, 1.5, 'scale.x');
    animate(introWindow, 1, Ease.circin, 1.5, 'scale.y');
    animate(buttonIntro, 1, Ease.sines, sh*1.2, 'y');
    animate(buttonIntro, 1, Ease.sines, 0, 'alpha');
    animate(infoEngage, 1, Ease.sines, 0.8, 'alpha');
    animateHole(1.5, Ease.sines, 0.75);
    animate(meteor, 0.1, Ease.sines, 1, 'alpha');
    sfxDoor.play();
});

buttonIn.on(MODE_DOWN, e => {
    if (scene != 0) {
        animate(astronautOuter, 8, Ease.sines, scx*0.55, 'x');
        animate(astronautOuter, 8, Ease.sines, 180, 'y');
        animate(astronautOuter, 8, Ease.sines, -pi/3, 'rotation');
        animate(astronaut, 7.5, Ease.sines, 0, 'scale.x');
        animate(astronaut, 7.5, Ease.circin, 0.1, 'scale.y');
        animate(astronaut, 8, Ease.sinein, 0xF58142, 'tint');
        sfxButton.play();
    }
});

buttonOut.on(MODE_DOWN, e => {
    if (scene != 0) {
        resetAstronaut();
        sfxClick.play();
    }
});

buttonInfo.on(MODE_DOWN, e => {
    if (scene != 0) {
        scene = 2;
        slide = 1;
        animate(dim, 1, Ease.sines, 0.6, 'alpha');
        animate(astronautOuter, 1.5, Ease.sines, sw*-0.3, 'x');
        animate(sliderMain, 1.5, Ease.sines, sh*-0.28, 'y');
        animate(sliderDial, 1.5, Ease.sines, sh*-0.279, 'y');
        animate(buttonOut, 1.5, Ease.sines, sh*1.15, 'y');
        animate(buttonIn, 1.5, Ease.sines, sh*1.15, 'y');
        animate(buttonInfo, 2, Ease.quads, sh*1.15, 'y');
        animate(buttonNext, 1.5, Ease.sines, sh*0.89, 'y');
        setText(infoHeader, headerText[slide]);
        setText(infoDesc, descText[slide]);
        animate(infoEngage, 0.4, Ease.sines, 0, 'alpha');
        animate(infoHeader, 2, Ease.quads, 1, 'alpha');
        animate(infoDesc, 2, Ease.quads, 1, 'alpha');
        sfxButton.play();
    }
});

buttonClose.on(MODE_DOWN, e => {
    if (scene != 0) {
        if (scene == 1) {
            scene = 0;
            reset1_0();
        } else if (scene == 2) {
            scene = 1;
            slide = 0;
            reset2_1();
            animate(astronautOuter, 1.5, Ease.sines, 0, 'x');
        }
        sfxClick.play();
    }
});

buttonBack.on(MODE_DOWN, e => {
    if (slide != 1) {
        if (slide == 2) {
            animate(buttonBack, 0.2, Ease.quads, sh*1.19, 'y');
        } else if (slide == 4) {
            animate(buttonNext, 0.2, Ease.quads, sh*0.89, 'y');
        }
        slide--;
        setText(infoHeader, headerText[slide]);
        setText(infoDesc, descText[slide]);
    }
    sfxClick.play();
});

buttonNext.on(MODE_DOWN, e => {
    if (slide != 4) {
        if (slide == 1) {
            animate(buttonBack, 0.2, Ease.quads, sh*0.89, 'y');
        } else if (slide == 3) {
            animate(buttonNext, 0.2, Ease.quads, sh*1.19, 'y');
        }
        slide++;
        setText(infoHeader, headerText[slide]);
        setText(infoDesc, descText[slide]);
    }
    sfxClick.play();
});

// TIMER ------------------------------------------------------------------- //

let timer = async () => {
    await new Promise(done => setTimeout(() => done(), 5000));
    timeDelta += 5;
    if (timeDelta == 180) {
        scene = 0;
        reset1_0();
        reset2_1();
    }
    timer();
};

timer();