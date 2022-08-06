const cardWidth = 630;
const cardHeight = 880;

figma.showUI(__html__);
figma.ui.resize(500, 500);

figma.ui.onmessage = (msg) => {
    if (msg.type === 'card') {
        console.log('connection!');

        const image = figma.createImage(new Uint8Array(msg.data));
        const newPaint = {
            type: 'IMAGE',
            scaleMode: 'FIT',
            imageHash: image.hash,
        };
        const shape = figma.createRectangle();
        shape.resize(cardWidth, cardHeight);
        shape.x = figma.viewport.center.x - cardWidth / 2;
        shape.y = figma.viewport.center.y - cardHeight / 2;
        const newFills = [];
        newFills.push(newPaint);
        shape.fills = newFills;

        figma.currentPage.appendChild(shape);

        figma.currentPage.selection = [shape];
    } else if (msg.type === 'cardDrag') {
        const image = figma.createImage(new Uint8Array(msg.data));
        const newPaint = {
            type: 'IMAGE',
            scaleMode: 'FIT',
            imageHash: image.hash,
        };
        const shape = figma.createRectangle();
        shape.resize(cardWidth, cardHeight);

        shape.x = figma.viewport.bounds.x + msg.pos[0] / figma.viewport.zoom - cardWidth / 2;
        shape.y = figma.viewport.bounds.y + (msg.pos[1] - 48) / figma.viewport.zoom - cardHeight / 2;
        const newFills = [];
        newFills.push(newPaint);
        shape.fills = newFills;

        figma.currentPage.appendChild(shape);

        figma.currentPage.selection = [shape];
    } else if (msg.type === 'zoomRequest') {
        figma.ui.postMessage({
            zoom: figma.viewport.zoom,
            size: {width: cardWidth, height: cardHeight},
        });
    }
};
