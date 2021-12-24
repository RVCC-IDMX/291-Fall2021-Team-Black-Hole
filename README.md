# 291-Fall2021-Team-Black-Hole
# Black Hole v3
Welcome to the Black Hole Project!

## Overview
This project, utilizing various techniques, methods, and engines, is an interactive presentation on black holes!
The user is presented with...
- title page
- interactive screen featuring slider and in/out animations
- information slides meant to educate the user on various related topics

The button affordances will begin the spaghettification animation by clicking the IN, at which the astronaut will begin the animation cycle; the OUT will return the astronaut to it's original position. 

The Slider will allow the user to adjust the strength of the black hole present on the screen. 

## Scenes
The content is presented through a slide/scene manager and director, using button affordances to move through content.
- title page/escape pod
- interactive scene
- what are black holes?
- types of black holes
- characteristics of black holes
- anatomy and physics of a black hole

# Animation

## Background Stars
Randomly generated, placed, and altered star sprites with an opacity animation give the illusion of stars flickering in the background.

## Spaghettification
The astronaut sprite will move toward the center of the blackhole, stretching and compressing. This will mimic the phenomena known as spaghettification.

## Scale Adjustment
Add one slider to adjust the filter strength, giving the effect different masses have on gravity.

Example: bulge.uniforms.strength = [1 - 4, etc.]

## Astronaut
The astronaut idly floats on a vertical path.

## Cluster
The cluster idly rotates in a pattern.

## Resources
### Images
- [Astronaut](https://pngimg.com/uploads/astronaut/astronaut_PNG66.png)
- [Cluster](https://giphy.com/stickers/galaxy-space-gif-j5QUSpXVuwtr2)
- [Meteor](https://www.pngplay.com/image/69268)
- [Favicon](https://www.transparentpng.com/download/black-hole-_247.html)
- [Window](https://gymrocket.com/gym-rocket/rocket-window/)
- Starfield background by Spencer Gunning

### Audio
Original Audio by Spencer Gunning

### Code
[Filters](https://www.npmjs.com/package/pixi-filters)

## Links
- [Final App](https://idmx291-f21-final.netlify.app)
- [Nat Geo](https://www.nationalgeographic.com/science/article/black-holes)
- [Photographing a Black Hole](https://www.nasa.gov/image-feature/photographing-a-black-hole)
- [What's a Black Hole](https://www.nasa.gov/vision/universe/starsgalaxies/black_hole_description.html)
- [Lensing](https://www.black-holes.org/the-science-numerical-relativity/numerical-relativity/gravitational-lensing)
- [Dilation](https://www.wtamu.edu/~cbaird/sq/2013/06/24/does-time-go-faster-at-the-top-of-a-building-compared-to-the-bottom/)