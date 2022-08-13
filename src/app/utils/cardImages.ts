async function getCardImageForFigma(url) {
    const imageResponse = await fetch(url, {});
    return await new Response(imageResponse.body).arrayBuffer();
}

async function getCardImage(request) {
    const imageResponse = await fetch(request);
    const imageBlob = await imageResponse.blob();
    return URL.createObjectURL(imageBlob);
}

export {getCardImageForFigma, getCardImage};
