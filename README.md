# 3dtiles-transformation-sample
demostration for transformation of 3d-tiles in CesiumJS.

## Introduction
![screenshot](https://github.com/CrashedBboy/3dtiles-transformation-sample/raw/master/static/demo/screenshot.PNG)
*screenshots.*

Transformation could be divided into three parts:
* Rotation
    - control bar
    - 90 degrees forward / backward
* Scaling
* Translation
    - adjusted by text input
    - adjust by cursor movement

Each part has a reset button to set it back to original status.

### 1. Rotation
![rotation](https://github.com/CrashedBboy/3dtiles-transformation-sample/raw/master/static/demo/rotation.gif)  

We use two different types of input to control the rotation: range bars and buttons.  
[This function](https://github.com/CrashedBboy/3dtiles-transformation-sample/blob/master/static/js/index.js#L27) is achieved by applying rotation matrix to tileset's root transformation.

### 2. Scaling
![scaling](https://github.com/CrashedBboy/3dtiles-transformation-sample/raw/master/static/demo/scaling.gif)  

[This](https://github.com/CrashedBboy/3dtiles-transformation-sample/blob/master/static/js/index.js#L67) is also achieved by changing root transformation matrtix.

### 3. Translation(from text input)

1. from text inputs  
![translation](https://github.com/CrashedBboy/3dtiles-transformation-sample/raw/master/static/demo/translation.gif)  
2. from cursor movements  
![translation_from_cursor](https://github.com/CrashedBboy/3dtiles-transformation-sample/raw/master/static/demo/translation_by_cursor.gif)  

[Both of these method](https://github.com/CrashedBboy/3dtiles-transformation-sample/blob/master/static/js/index.js#L94) are done by changing the `tileset.model` attribute.
