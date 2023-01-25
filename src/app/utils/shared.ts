function dragPosition(width, height, xRatio, yRatio) {
    return [width * xRatio, height * yRatio];
    // return [width / 2, height / 2];
}

function dropPositionAdjustment(appVersion, width, height) {
    let dragPosition = [width / 2, height / 2];
    if (appVersion.indexOf('Win') != -1) {
        dragPosition = [width / 2, height / 2];
    }
    if (appVersion.indexOf('Mac') != -1) {
        dragPosition = [width, 0];
    }
    return dragPosition;
}

export {dragPosition, dropPositionAdjustment};
