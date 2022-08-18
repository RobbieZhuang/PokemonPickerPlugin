function dragPosition(width, height) {
    let dragPosition = [width/2, height/2];
    if (navigator.appVersion.indexOf("Win") != -1)  {
        dragPosition = ([width/2, height/2])
    }
    if (navigator.appVersion.indexOf("Mac") != -1)  {
        dragPosition = ([width, height])
    }
    return dragPosition
}

function dropPositionAdjustment(appVersion, width, height) {
    let dragPosition = [width/2, height/2];
    if (appVersion.indexOf("Win") != -1)  {
        dragPosition = ([width/2, height/2])
    }
    if (appVersion.indexOf("Mac") != -1)  {
        dragPosition = ([width, 0])
    }
    return dragPosition
}

export {dragPosition, dropPositionAdjustment}