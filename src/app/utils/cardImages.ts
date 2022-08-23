async function getCardData(request) {
    const imageResponse = await fetch(request);
    const imageUrl = URL.createObjectURL(await imageResponse.clone().blob());
    const imageBuffer = await new Response(imageResponse.body).arrayBuffer();
    return {imageUrl, imageBuffer};
}

function getCardImageForFigmaWorker() {
    async function loadHiResCard(e) {
        const {cardUrl} = e.data;
        const imageResponse = await fetch(cardUrl, {});
        const fullCardData = await new Response(imageResponse.body).arrayBuffer();
        self.postMessage({imgBuffer: fullCardData});
    }
    addEventListener('message', loadHiResCard);
}

export {getCardData, getCardImageForFigmaWorker};
