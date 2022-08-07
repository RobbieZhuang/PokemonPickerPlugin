async function searchCards(query: string) {
    const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:"${query}*"`, {method: 'GET'});

    if (response.status != 200 || response.ok === false) {
        return [];
    }
    const data = await response.json();
    return data.data.map((card) => {
        return {
            cardId: card.id,
            smallUrl: card.images.small,
            largeUrl: card.images.large,
        };
    });
}

export {searchCards};
