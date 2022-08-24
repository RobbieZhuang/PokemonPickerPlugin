import {dropPositionAdjustment} from '../app/utils/shared';

const cardWidth = 258;
const cardHeight = 360;
const offset = 16;
let offsetCount = 0;

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
    shape.x = x + (offset * offsetCount);
    shape.y = y + (offset * offsetCount);
    figma.currentPage.appendChild(shape);
    figma.currentPage.selection = [shape];
    shape.fills = newFills;

    addedShapes[cardId] = shape;
    shape.setPluginData('cardId', cardId);
    offsetCount++;
}

function addHighResToCanvas(cardId, img) {
    const node = addedShapes[cardId];
    if (node.removed) {
        return;
    }

    const image = figma.createImage(new Uint8Array(img));
    const newPaint = {
        type: 'IMAGE',
        scaleMode: 'FIT',
        imageHash: image.hash,
    };
    const newFills = [];
    newFills.push(newPaint);
    node.fills = newFills;
}

figma.ui.onmessage = (msg) => {
    if (msg.type === 'clickTemp') {
        addTempToCanvas(
            msg.id,
            msg.data,
            figma.viewport.center.x - cardWidth / 2,
            figma.viewport.center.y - cardHeight / 2
        );
    } else if (msg.type === 'dragTemp') {
        const adjustment = dropPositionAdjustment(msg.appVersion, cardWidth, cardHeight);
        addTempToCanvas(
            msg.id,
            msg.data,
            figma.viewport.bounds.x + msg.pos[0] / figma.viewport.zoom - adjustment[0],
            figma.viewport.bounds.y + (msg.pos[1] - 48) / figma.viewport.zoom - adjustment[1]
        );
    } else if (msg.type === 'clickHighRes' || msg.type === 'dragHighRes') {
        addHighResToCanvas(msg.id, msg.data);
    } else if (msg.type === 'zoomRequest') {
        figma.ui.postMessage({
            zoom: figma.viewport.zoom,
            size: {width: cardWidth, height: cardHeight},
        });
    }
};
