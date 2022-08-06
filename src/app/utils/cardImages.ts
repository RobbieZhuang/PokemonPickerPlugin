async function getCardImageSmall(cardId) {
    const response = await fetch('https://api.pokemontcg.io/v2/cards/' + cardId, {method: 'GET'});
    const data = await response.json();
    const imageResponse = await fetch(data.data.images.small, {});
    const imageBlob = await imageResponse.blob();
    return URL.createObjectURL(imageBlob);
}

async function getCardImageForFigma(url) {
    console.log(url);
    const imageResponse = await fetch(url, {});
    return await new Response(imageResponse.body).arrayBuffer();
}

async function getCardImage(url) {
    const imageResponse = await fetch(url, {});
    const imageBlob = await imageResponse.blob();
    return URL.createObjectURL(imageBlob);
}

export {getCardImageSmall, getCardImageForFigma, getCardImage};
