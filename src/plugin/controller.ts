const cardWidth = 630;
const cardHeight = 880;

figma.showUI(__html__);
figma.ui.resize(500, 512);

function addCardToCanvas(msg, x, y) {
    const image = figma.createImage(new Uint8Array(msg.data));
    const newPaint = {
        type: 'IMAGE',
        scaleMode: 'FIT',
        imageHash: image.hash,
    };
    const shape = figma.createRectangle();
    shape.resize(cardWidth, cardHeight);
    shape.x = x;
    shape.y = y;
    const newFills = [];
    newFills.push(newPaint);
    shape.fills = newFills;

    figma.currentPage.appendChild(shape);

    figma.currentPage.selection = [shape];
}

figma.ui.onmessage = (msg) => {
    if (msg.type === 'card') {
        addCardToCanvas(msg, figma.viewport.center.x - cardWidth / 2, figma.viewport.center.y - cardHeight / 2);
    } else if (msg.type === 'cardDrag') {
        addCardToCanvas(
            msg,
            figma.viewport.bounds.x + msg.pos[0] / figma.viewport.zoom - cardWidth / 2,
            figma.viewport.bounds.y + (msg.pos[1] - 48) / figma.viewport.zoom - cardHeight / 2
        );
    } else if (msg.type === 'zoomRequest') {
        figma.ui.postMessage({
            zoom: figma.viewport.zoom,
            size: {width: cardWidth, height: cardHeight},
        });
    }
};
