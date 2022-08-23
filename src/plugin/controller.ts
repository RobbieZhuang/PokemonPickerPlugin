import {dropPositionAdjustment} from '../app/utils/shared';

const cardWidth = 258;
const cardHeight = 360;

figma.showUI(__html__);
figma.ui.resize(500, 512);

let addedShapes = new Map<string, RectangleNode>();

function addTempToCanvas(cardId, img, x, y) {
    const image = figma.createImage(new Uint8Array(img));
    const newPaint = {
        type: 'IMAGE',
        scaleMode: 'FIT',
        imageHash: image.hash,
    };
    const newFills = [];
    newFills.push(newPaint);

    const shape = figma.createRectangle();
    shape.resize(cardWidth, cardHeight);
    shape.x = x;
    shape.y = y;
    figma.currentPage.appendChild(shape);
    figma.currentPage.selection = [shape];
    shape.fills = newFills;

    addedShapes[cardId] = shape;
}

function addCardToCanvas(cardId, img) {
    // todo: check that the card is still on the canvas (isn't deleted for some reason)

    const image = figma.createImage(new Uint8Array(img));
    const newPaint = {
        type: 'IMAGE',
        scaleMode: 'FIT',
        imageHash: image.hash,
    };
    const shape = addedShapes[cardId];
    const newFills = [];
    newFills.push(newPaint);
    shape.fills = newFills;
}

figma.ui.onmessage = (msg) => {
    if (msg.type === 'cardClickTemp') {
        addTempToCanvas(
            msg.id,
            msg.data,
            figma.viewport.center.x - cardWidth / 2,
            figma.viewport.center.y - cardHeight / 2
        );
    } else if (msg.type === 'cardClickHighRes') {
        addCardToCanvas(msg.id, msg.data);
    } else if (msg.type === 'cardDragTemp') {
        const adjustment = dropPositionAdjustment(msg.appVersion, cardWidth, cardHeight);
        addTempToCanvas(
            msg.id,
            msg.data,
            figma.viewport.bounds.x + msg.pos[0] / figma.viewport.zoom - adjustment[0],
            figma.viewport.bounds.y + (msg.pos[1] - 48) / figma.viewport.zoom - adjustment[1]
        );
    } else if (msg.type === 'cardDragHighRes') {
        addCardToCanvas(msg.id, msg.data);
    } else if (msg.type === 'zoomRequest') {
        figma.ui.postMessage({
            zoom: figma.viewport.zoom,
            size: {width: cardWidth, height: cardHeight},
        });
    }
};
