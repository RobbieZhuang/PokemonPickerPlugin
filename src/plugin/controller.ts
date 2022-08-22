import {dropPositionAdjustment} from '../app/utils/shared';

const cardWidth = 258;
const cardHeight = 360;

figma.showUI(__html__);
figma.ui.resize(500, 512);

let addedShapes = new Map<string, RectangleNode>();

function addCardToCanvas(img, cardId, x, y) {
    const image = figma.createImage(new Uint8Array(img));
    const newPaint = {
        type: 'IMAGE',
        scaleMode: 'FIT',
        imageHash: image.hash,
    };

    if (addedShapes[cardId]) {
        const shape = addedShapes[cardId];
        // console.log(addedShapes.length)
        addedShapes.delete(cardId);
        console.log(addedShapes.size)
        // addedShapes = addedShapes.delete(cardId);
        console.log(addedShapes, 'after deletion')
        const newFills = [];
        newFills.push(newPaint);
        shape.fills = newFills;

        figma.currentPage.selection = [shape];

        console.log(cardId, 'card replaces rectangle');
    } else {
        const shape = figma.createRectangle();
        shape.resize(cardWidth, cardHeight);
        shape.x = x;
        shape.y = y;
        const newFills = [];
        newFills.push(newPaint);
        shape.fills = newFills;
    
        figma.currentPage.appendChild(shape);
    
        figma.currentPage.selection = [shape];
        console.log('-1 create new node');
    }
}

function addOutlineToCanvas(x, y, id) {
    const shape = figma.createRectangle();
    shape.resize(cardWidth, cardHeight);
    shape.x = x;
    shape.y = y;
    figma.currentPage.appendChild(shape);
    figma.currentPage.selection = [shape];
    addedShapes[id] = shape;
}

figma.ui.onmessage = (msg) => {
    if (msg.type === 'card1') {
        addOutlineToCanvas(
            figma.viewport.center.x - cardWidth / 2,
            figma.viewport.center.y - cardHeight / 2,
            msg.id
        );
    } else if (msg.type === 'card2') {
        addCardToCanvas(msg.data, msg.id, figma.viewport.center.x - cardWidth / 2, figma.viewport.center.y - cardHeight / 2);
    } else if (msg.type === 'cardDrag1') {
        // const adjustment = dropPositionAdjustment(msg.appVersion, cardWidth, cardHeight);
        const adjustment = dropPositionAdjustment(msg.appVersion, cardWidth, cardHeight);
        // console.log(image);
        addOutlineToCanvas(
            figma.viewport.bounds.x + msg.pos[0] / figma.viewport.zoom - adjustment[0],
            figma.viewport.bounds.y + (msg.pos[1] - 48) / figma.viewport.zoom - adjustment[1],
            msg.id
        );
        // addCardToCanvas
    } else if (msg.type === 'cardDrag2') {
        const adjustment = dropPositionAdjustment(msg.appVersion, cardWidth, cardHeight);
        addCardToCanvas(
            msg.data,
            msg.id,
            figma.viewport.bounds.x + msg.pos[0] / figma.viewport.zoom - adjustment[0],
            figma.viewport.bounds.y + (msg.pos[1] - 48) / figma.viewport.zoom - adjustment[1]
        );
    } else if (msg.type === 'zoomRequest') {
        figma.ui.postMessage({
            zoom: figma.viewport.zoom,
            size: {width: cardWidth, height: cardHeight},
        });
    }
};
