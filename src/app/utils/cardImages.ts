async function getCardImageForFigma(url) {
    const imageResponse = await fetch(url, {});
    return await new Response(imageResponse.body).arrayBuffer();
}

function getCardImageForFigmaWorker() {
    async function loadHiResCard(e) {
        console.log('data', e);
        const {cardUrl} = e.data;
        const imageResponse = await fetch(cardUrl, {});
        const fullCardData = await new Response(imageResponse.body).arrayBuffer();
        self.postMessage({imgBuffer: fullCardData});
    }
    addEventListener('message', loadHiResCard);
}

async function getCardImage(request) {
    const imageResponse = await fetch(request);
    const imageUrl = URL.createObjectURL(await imageResponse.clone().blob());
    const imageBuffer = await new Response(imageResponse.body).arrayBuffer();
    return {imageUrl, imageBuffer};
}

export {getCardImageForFigma, getCardImageForFigmaWorker, getCardImage};
