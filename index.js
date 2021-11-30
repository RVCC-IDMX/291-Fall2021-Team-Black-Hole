//Audio Event Listener
let audio = document.createElement("audio");
audio.autoplay = true;
audio.src = "ambience.ogg";

document.addEventListener("mousemove", () => {
    audio.play();
});

//The App
var app = new PIXI.Application({
    width: 640,
    height: 480,
    backgroundColor: 0x000000
});
var stage = app.stage;
var view = app.view;

//Add view to the document
document.body.appendChild(app.view);

//Filter Logic

//Step 1: Create container w/bg
const backgroundImage = PIXI.Sprite.from("img/background.jpg");
const cluster = PIXI.Sprite.from("img/cluster.gif");
cluster.scale.set(2);
cluster.x = 200;
const container = new PIXI.Container();
container.addChild(backgroundImage);
container.addChild(cluster);
app.stage.addChild(container);

//Step 2: Load filter
let bulge = new BulgePinchFilter({
    center: [0.5, 0.5],
    radius: 100,
    strength: 2,
});

//Step 3: Add filter to container
container.filters = [bulge];

//Slider Logic
function makeSlider() {
    let slideContain = new PIXI.Container();
    slideContain.interactive = true;
    slideContain.value = 0;

    let track = new PIXI.Graphics();
    track.beginFill(0xCCCCCC);
    track.drawRoundedRect(200, -10, 300, 20);
    track.alpha = .7;

    slideContain.addChild(track);

    let slide = new PIXI.Graphics();
    slide.interactive = true;
    slide.beginFill(0xEEEEEE);
    slide.drawRoundedRect(175, -25, 50, 50);
    slide.alpha - .95;

    slideContain.addChild(slide);

    slide.dragging = false;
    slide.on("pointerdown", e => {
        slide.dragging = true;
    });

    slide.on("pointermove", e => {
        if (slide.dragging) {
            let newX = e.data.global.x - slideContain.getGlobalPosition().x - 200;
            let newY = e.data.global.y - slideContain.getGlobalPosition().y;

            if (newX > track.width) newX = track.width;
            if (newX < 0) newX = 0;

            slideContain.value = newX / track.width;
            slide.x = newX;
            bulge.uniforms.strength = (newX);
        }
    });
    slide.on("pointerup", e => {
        slide.dragging = false;
    });
    slide.on("pointerupoutside", e => {
        slide.dragging = false;
    });
    return slideContain;
};

let slideContain = makeSlider();
app.stage.addChild(slideContain);

//Scene Logic

//Scene 1
let scene1 = new PIXI.Container();

let astronaut = PIXI.Sprite.from("img/astronaut.png");
astronaut.scale.set(.45);
astronaut.y = 100;
scene1.addChild(astronaut);

let nextButton = UI.Button(0, 0, "In");
nextButton.x = app.view.width - nextButton.width;
nextButton.y = app.view.height - nextButton.height;
app.stage.addChild(scene1);
app.stage.addChild(nextButton);

//SCene 2
let scene2 = new PIXI.Container();
let backButton = UI.Button(0, 0, "Out");
backButton.x = 0;
backButton.y = 380;
app.stage.addChild(scene2);
app.stage.addChild(backButton);

//Animation logic

//Pause animation function
function pause(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

//Stop animation function
Animate.stop = function (obj) {
    cancelAnimationFrame(obj).animationID;
}

//Director object to manage scenes
var Director = {

    //Object to hold list of scenes
    scene: {},

    //Add a scene to the list
    addScene: (name, scene) => {

        //If it exists throw an error
        if (Director.scene[name])
            throw "That scene already exists!"

        //Otherwise add it
        Director.scene[name] = scene;

        //If it's the first scene, make it the active one
        if (Director.currentScene == null)
            Director.currentScene = name;

    },

    //Keep track of the current scene
    currentScene: null,

    //Change scene function
    showScene: async (nextSceneName, params) => {

        if (params == undefined) params = {};

        let currentScene = Director.scene[Director.currentScene];
        let nextScene = Director.scene[nextSceneName];

        if (params.transition == undefined)
            params.transition = Director.cut;

        await params.transition(currentScene, nextScene, params);

        Director.currentScene = nextSceneName;

    },

    //
    //Transitions for changing scenes
    //

    //Cut (no transition)
    cut: async (currentScene, nextScene, params) => {
        app.stage.removeChild(currentScene);
        app.stage.addChild(nextScene);
    },

    //Fade between spaghetti
    spaghetti: async (currentScene, nextScene, params) => {
        //Check duration
        if (params == undefined) params = {};
        if (params.duration == undefined) params.duration = 500;

        //Fade out current scene
        //Translate astronaut
        await Animate.to(astronaut, { x: 250, y: 100, duration: 7000, easing: Animate.easeInOut });
        //Tint Red
        await Animate.to(astronaut, {
            tint: 0xF58142,
            duration: 2000,
        });
        //Fade out
        await Animate.to(currentScene, {
            alpha: 0,
            duration: 3000
        });
        //Remove it from stage
        app.stage.removeChild(currentScene);
        //Set next scene to zero alpha
        nextScene.alpha = 0;
        //Add it to the stage
        app.stage.addChild(nextScene);
        //Fade it in
        await Animate.to(nextScene, { alpha: 1, duration: params.duration / 2 });
        //Reset the off-stage scene's alpha back
        currentScene.alpha = 1;
        //Reset astronaut to original position
        Animate.to(astronaut, { x: 0, y: 100, duration: 10 });
        //Remove tint
        astronaut.tint = 0xFFFFFF;
        float();
    },

    //Fade between
    fade: async (currentScene, nextScene, params) => {

        //Check duration
        if (params == undefined) params = {};
        if (params.duration == undefined) params.duration = 500;

        //Fade out current scene
        await Animate.to(currentScene, { alpha: 0, duration: params.duration / 2 });
        //Remove it from stage
        app.stage.removeChild(currentScene);
        //Set next scene to zero alpha
        nextScene.alpha = 0;
        //Add it to the stage
        app.stage.addChild(nextScene);
        //Fade it in
        await Animate.to(nextScene, { alpha: 1, duration: params.duration / 2 });
        //Reset the off-stage scene's alpha back
        currentScene.alpha = 1;
    },
};

//Use Director setup to manage scenes alongside button clicks
Director.addScene("first", scene1);
Director.addScene("second", scene2);

//First next button, goes to second scene
nextButton.pointerdown = () => {
    Director.showScene("second", { transition: Director.spaghetti });
}

//Buttons for second slide, goes to first scene
backButton.pointerdown = () => {
    Director.showScene("first", { transition: Director.fade });
}

//Animations

//Astronaut idle floating animation
async function float() {
    await Animate.to(astronaut, {
        x: 0, y: 50,
        duration: 5000,
        easing: Animate.easeInOut
    });
    await Animate.to(astronaut, {
        x: 0, y: 120,
        duration: 5000,
        easing: Animate.easeInOut
    });
    float();
}
float();

//Cluster idle animation
async function jitter() {
    await Animate.to(cluster, {
        x: 210, y: 2, duration: 7000, easing: Animate.easeInOut
    });
    await Animate.to(cluster, {
        x: 185, y: -1, duration: 7000, easing: Animate.easeInOut
    });
    jitter();
}
jitter();