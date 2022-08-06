import * as React from 'react';
import '../styles/ui.css';
import {getCardImageForFigma, getCardImage} from '../utils/cardImages';

async function searchCards(cardName: string) {
    const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:"${cardName}*"`, {method: 'GET'});

    // todo: display error message if response is not ok
    if (response.status != 200 || response.ok === false) {
        console.log('Error: ' + response);
        return [];
    }
    const data = await response.json();
    console.log('response', response);
    console.log('No Error', data);
    return data.data.map((card) => {
        return {
            cardId: card.id,
            smallUrl: card.images.small,
            largeUrl: card.images.large,
        };
    });
}

const insertChewtle = async () => {
    const image = await getCardImageForFigma('https://images.pokemontcg.io/swsh45/26_hires.png');
    window.parent.postMessage({pluginMessage: {type: 'card', data: image}}, '*');
};

function CardThumbnailDragged(cardImg, width, height): Element {
    const img = document.createElement('img');
    img.src = cardImg;
    img.style.width = `${width}px`;
    img.style.height = `${height}px`;

    const div = document.createElement('div');
    div.appendChild(img);
    div.style.position = 'absolute';
    div.style.top = '0px';
    div.style.left = '-10000px';

    document.querySelector('body').appendChild(div);

    return div;
}

const CardThumbnail = ({card, canvasZoomLevel, canvasCardWidth, canvasCardHeight, cardsLoaded, setCardsLoaded}) => {
    const [loadedSrc, setLoadedSrc] = React.useState(null);
    React.useEffect(() => {
        const fetchImage = async () => {
            const imageObjectUrl = await getCardImage(card.smallUrl);
            setLoadedSrc(imageObjectUrl);
        };
        fetchImage();
    }, [card]);

    React.useEffect(() => {
        if (loadedSrc !== null) {
            setCardsLoaded(cardsLoaded + 1);
        }
    }, [loadedSrc]);

    const onClick = async () => {
        window.parent.postMessage(
            {
                pluginMessage: {
                    type: 'card',
                    data: await getCardImageForFigma(card.largeUrl),
                },
            },
            '*'
        );
    };

    const onDragStart = async (e) => {
        const width = canvasCardWidth * canvasZoomLevel;
        const height = canvasCardHeight * canvasZoomLevel;
        e.dataTransfer.setDragImage(CardThumbnailDragged(loadedSrc, width, height), width / 2, height / 2);
    };

    const onDragEnd = async (e) => {
        window.parent.postMessage(
            {
                pluginMessage: {
                    type: 'cardDrag',
                    data: await getCardImageForFigma(card.largeUrl),
                    pos: [e.pageX, e.pageY],
                },
            },
            '*'
        );
    };

    return (
        <img className="thumbnail" src={loadedSrc} onClick={onClick} onDragStart={onDragStart} onDragEnd={onDragEnd} />
    );
};

const App = ({}) => {
    let [cardInfos, setCardInfos] = React.useState([]);
    let [cardsLoaded, setCardsLoaded] = React.useState(0);
    const [canvasZoomLevel, setCanvasZoomLevel] = React.useState(0);
    const [canvasCardWidth, setCanvasCardWidth] = React.useState(0);
    const [canvasCardHeight, setCanvasCardHeight] = React.useState(0);
    const [statusMessage, setStatusMessage] = React.useState('');

    const [query, setQuery] = React.useState('');

    const enterSearch = async (k) => {
        if (k.keyCode === 13) {
            const results = await searchCards(query);
            setCardInfos(() => results);
            setCardsLoaded(0);
        }
    };

    React.useEffect(() => {
        // Read messages sent from the plugin controller
        window.onmessage = (event) => {
            const {zoom, size} = event.data.pluginMessage;
            setCanvasZoomLevel(zoom);
            setCanvasCardWidth(size.width);
            setCanvasCardHeight(size.height);
        };
    }, []);

    React.useEffect(() => {
        if (cardInfos.length === 0) {
            setStatusMessage('No results found.');
        } else {
            setStatusMessage(`${cardsLoaded} out of ${cardInfos.length} cards loaded.`);
        }
    }, [cardInfos, cardsLoaded]);

    React.useEffect(() => {
        setStatusMessage("Drag'n'Drop a card to the canvas to add it to the deck");
    }, []);

    const onMouseEnter = () => {
        // Get current zoom level on the screen
        window.parent.postMessage({pluginMessage: {type: 'zoomRequest'}}, '*');
    };

    // todo: make chewtle button more awesome
    return (
        <div className="window" onMouseEnter={onMouseEnter}>
            <input
                autoFocus
                className="searchInput"
                type="text"
                value={query}
                placeholder="Search card names"
                onChange={(e) => setQuery(e.target.value)}
                onKeyUp={enterSearch}
            ></input>
            <div id="searchStatus">
                <label>{statusMessage}</label>
            </div>
            <div id="results">
                {cardInfos.map((card) => (
                    <React.Fragment key={card.cardId}>
                        <CardThumbnail
                            card={card}
                            canvasZoomLevel={canvasZoomLevel}
                            canvasCardWidth={canvasCardWidth}
                            canvasCardHeight={canvasCardHeight}
                            cardsLoaded={cardsLoaded}
                            setCardsLoaded={setCardsLoaded}
                        />
                    </React.Fragment>
                ))}
            </div>
            <div id="chewtleDiv">
                <button id="insertChewtle" onClick={insertChewtle}>
                    Insert Grass Energy
                </button>
            </div>
        </div>
    );
};

export default App;
