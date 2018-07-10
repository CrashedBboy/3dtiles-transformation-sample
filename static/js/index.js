var viewer, tileset, moveMode, lookAngle;

function load3DTileset(model, options) {

    let opts = {
        url: model.tileset
    };

    if (options && options.debug) {
        opts.debugColorizeTiles = true;
        opts.debugShowBoundingVolume = true;
        opts.debugShowViewerRequestVolume = true;
        opts.debugShowGeometricError = true;
        opts.debugShowRenderingStatistics = true;
        opts.debugShowMemoryUsage = true;
    }

    let tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset(opts));

    tileset.allTilesLoaded.addEventListener(function () {
        transformInitialize();
    });

    return tileset;
}

function rotate(x, y, z) {

    if (x === undefined) {
        x = tileset._root.customTransform.rotation.x;
    }

    if (y === undefined) {
        y = tileset._root.customTransform.rotation.y;
    }

    if (z === undefined) {
        z = tileset._root.customTransform.rotation.z;
    }

    let rotMat3 = Cesium.Matrix3.fromHeadingPitchRoll(
        new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(z),
            Cesium.Math.toRadians(y),
            Cesium.Math.toRadians(x)
        )
    );
    let rotMat4 = Cesium.Matrix4.fromRotationTranslation(rotMat3, undefined, undefined);

    tileset._root.customTransform.matrix.rotation = rotMat4;
    transform();
    tileset._root.customTransform.rotation.x = x;
    tileset._root.customTransform.rotation.y = y;
    tileset._root.customTransform.rotation.z = z;
}

function resetRotation() {
    tileset._root.customTransform.matrix.rotation = Cesium.Matrix4.IDENTITY;

    tileset._root.customTransform.rotation = { x: 0, y: 0, z: 0 };
    transform();

    $('.rotation-slider').val(0);
    $('.rotation-text').text('0');
}

function scale(s) {
    let m = Cesium.Matrix4.fromScale(new Cesium.Cartesian3(s, s, s));

    tileset._root.customTransform.matrix.scale = m;
    tileset._root.customTransform.scale = s;
    transform();
}

function resetScale() {
    tileset._root.customTransform.matrix.scale = Cesium.Matrix4.IDENTITY;

    tileset._root.customTransform.scale = 1.0;
    transform();

    $('#scale-input').val('1.0');
}

function translate(x, y, z) {

    var cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
    var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
    var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude + y, cartographic.latitude + x, z);
    var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());

    Cesium.Matrix4.multiply(tileset.modelMatrix, Cesium.Matrix4.fromTranslation(translation), tileset.modelMatrix);
}

function translateTo(latitude, longitude, height) {
    var oldPlace = Cesium.Cartesian3.fromRadians(
        tileset._root.customTransform.position.originalLongitude,
        tileset._root.customTransform.position.originalLatitude,
        tileset._root.customTransform.position.originalHeight
    );
    var newPlace = Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        tileset._root.customTransform.position.originalHeight + height
    );
    var translation = Cesium.Cartesian3.subtract(newPlace, oldPlace, new Cesium.Cartesian3());
    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    //viewer.zoomTo(tileset);

    tileset._root.customTransform.position.latitude = latitude;
    tileset._root.customTransform.position.longitude = longitude;
    tileset._root.customTransform.position.heightOffset = height;
}

function resetTranslation() {
    tileset._root.customTransform.position.latitude = tileset._root.customTransform.position.originalLatitude;
    tileset._root.customTransform.position.longitude = tileset._root.customTransform.position.originalLongitude;
    tileset._root.customTransform.position.heightOffset = 0;
    updatePositionInput(true);
}

function transform() {
    let m = new Cesium.Matrix4;
    Cesium.Matrix4.multiply(tileset._root.customTransform.matrix.origin, tileset._root.customTransform.matrix.rotation, m);
    Cesium.Matrix4.multiply(m, tileset._root.customTransform.matrix.scale, m);
    Cesium.Matrix4.multiply(m, tileset._root.customTransform.matrix.translation, tileset._root.transform);
}

function updatePositionInput(trigger = false) {
    $('#latitude-input').val(Cesium.Math.toDegrees(tileset._root.customTransform.position.latitude));
    $('#longitude-input').val(Cesium.Math.toDegrees(tileset._root.customTransform.position.longitude));
    $('#height-input').val(tileset._root.customTransform.position.heightOffset);

    if (trigger) {
        $('#latitude-input').trigger('input');
    }
}

function transformInitialize() {

    if (!tileset._root.customTransform) {

        let cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);

        tileset._root.customTransform = {
            matrix: {
                origin: tileset._root.transform.clone(),
                rotation: Cesium.Matrix4.IDENTITY,
                translation: Cesium.Matrix4.IDENTITY,
                scale: Cesium.Matrix4.IDENTITY
            },
            rotation: {
                x: 0,
                y: 0,
                z: 0
            },
            scale: 1.0,
            position: {
                originalLatitude: cartographic.latitude,
                originalLongitude: cartographic.longitude,
                originalHeight: cartographic.height,
                heightOffset: 0.0,
                latitude: cartographic.latitude,
                longitude: cartographic.longitude
            }
        };

        updatePositionInput(false);
    }
}

function lookByAngle(angle) {
    viewer.camera.lookAt(
        tileset.boundingSphere.center, new Cesium.HeadingPitchRange(
            Cesium.Math.toRadians(angle),
            Cesium.Math.toRadians(-30),
            2500)
    );
}

$('.rotation-slider').on('input', function () {
    let x = $('#x-rotation-panel .rotation-slider').val();
    let y = $('#y-rotation-panel .rotation-slider').val();
    let z = $('#z-rotation-panel .rotation-slider').val();

    // change angle text
    $('#x-rotation-panel .rotation-text').text(x);
    $('#y-rotation-panel .rotation-text').text(y);
    $('#z-rotation-panel .rotation-text').text(z);

    // call rotate
    rotate(x, y, z);
});

$('.rotate-ninety-negative').click(function () {
    let axis = $(this).data('axis');
    let angle = tileset._root.customTransform.rotation[axis] - 90;

    if (angle < 0) {
        angle += 360;
    }

    $('#' + axis + '-rotation-panel .rotation-slider').val(angle).trigger('input');
});

$('.rotate-ninety-positive').click(function () {

    let axis = $(this).data('axis');
    let angle = parseInt(tileset._root.customTransform.rotation[axis]) + 90;

    if (angle > 360) {
        angle -= 360;
    }

    $('#' + axis + '-rotation-panel .rotation-slider').val(angle).trigger('input');
});

$('#rotate-reset').click(resetRotation);

$('#scale-input').on('input', function () {
    let s = $(this).val();
    if (s != '') {
        scale(parseFloat(s));
    }
});

$('#scale-reset').click(resetScale);

$('#latitude-input, #longitude-input, #height-input').on('input', function () {
    let lat = $('#latitude-input').val();
    let lon = $('#longitude-input').val();
    let height = $('#height-input').val();

    if (lat =='' || lon == '' || height == '') {
        return;
    }

    translateTo(
        parseFloat(lat),
        parseFloat(lon),
        parseFloat(height)
    );
});

$('#translation-reset').click(resetTranslation);

$(document).ready(function () {
    //viewer = new Cesium.Viewer('cesiumContainer');
    viewer = new Cesium.Viewer('cesiumContainer', {
        contextOptions: {
            webgl:{preserveDrawingBuffer:true}
        }
    });

    let model = { tileset: 'static/tile/tileset_dragon.json' };
    tileset = load3DTileset(model, { debug: true });
    lookAngle = 180;
    viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(lookAngle),
        Cesium.Math.toRadians(-30),
        3000));

    moveMode = false;

    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (movement) {
        if (moveMode) {
            moveMode = false;
        } else {
            moveMode = true;
        }
        
    },  Cesium.ScreenSpaceEventType.MIDDLE_CLICK);

    setTimeout(function() {
        handler.setInputAction(function (movement) {
            if (moveMode) {
                let cartesian = viewer.scene.camera.pickEllipsoid(
                    movement.endPosition,
                    viewer.scene.globe.ellipsoid
                );
                if (cartesian) {
                    let cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
        
                    tileset._root.customTransform.position.latitude = cartographic.latitude;
                    tileset._root.customTransform.position.longitude = cartographic.longitude;
                    updatePositionInput(true);
        
                }
            }
            
        },  Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        /*
        setInterval(function() {
            if (lookAngle <= 180) {
                lookByAngle(lookAngle);
                lookAngle += 0.2;
            }
        }, 40);
        */
    }, 1000);
});