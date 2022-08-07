import * as React from 'react';
import '../styles/ui.css';
import {getCardImageForFigma, getCardImage} from '../utils/cardImages';
import SquareLoader from 'react-spinners/SquareLoader';
import {searchCards} from '../utils/cardQueries';

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
    div.style.left = '-1000000px';

    document.querySelector('body').appendChild(div);

    return div;
}

const CardThumbnail = ({
    card,
    canvasZoomLevel,
    canvasCardWidth,
    canvasCardHeight,
    cardsLoaded,
    setCardsLoaded,
    droppedInIFrame,
    setDroppedInIFrame,
}) => {
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
        setDroppedInIFrame(false);
        const width = canvasCardWidth * canvasZoomLevel;
        const height = canvasCardHeight * canvasZoomLevel;
        e.dataTransfer.setDragImage(CardThumbnailDragged(loadedSrc, width, height), width / 2, height / 2);
    };

    const onDragEnd = async (e) => {
        if (droppedInIFrame) {
            return;
        }
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
    const [cardInfos, setCardInfos] = React.useState([]);
    const [cardsLoaded, setCardsLoaded] = React.useState(0);
    const [canvasZoomLevel, setCanvasZoomLevel] = React.useState(0);
    const [canvasCardWidth, setCanvasCardWidth] = React.useState(0);
    const [canvasCardHeight, setCanvasCardHeight] = React.useState(0);
    const [statusMessage, setStatusMessage] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [droppedInIFrame, setDroppedInIFrame] = React.useState(false);
    const [showChewtle, setShowChewtle] = React.useState(false);
    const [query, setQuery] = React.useState('');

    const windowRef = React.useRef();

    const enterSearch = async (k) => {
        if (k.keyCode === 13) {
            var results = [];
            setShowChewtle(false);
            setLoading(true);
            if (query.trim().length !== 0) {
                results = await searchCards(query.trim());
            }
            setCardInfos(() => results);
            setCardsLoaded(0);
            setLoading(false);
        }
    };

    React.useEffect(() => {
        window.onmessage = (event) => {
            const {zoom, size} = event.data.pluginMessage;
            setCanvasZoomLevel(zoom);
            setCanvasCardWidth(size.width);
            setCanvasCardHeight(size.height);
        };
    }, []);

    React.useEffect(() => {
        if (showChewtle) {
            setQuery('leaf energy');
            setStatusMessage('');
        } else if (cardInfos.length === 0) {
            setStatusMessage('No results found.');
        } else {
            setStatusMessage(`${cardsLoaded} out of ${cardInfos.length} cards loaded`);
        }
    }, [cardInfos, cardsLoaded, showChewtle]);

    React.useEffect(() => {
        setStatusMessage('Drag and drop a card to the canvas');
    }, []);

    const onClick = (e) => {
        if (e.detail === 5) {
            setShowChewtle(true);
        }
    };

    const onMouseEnter = () => {
        // Get current zoom level on the screen
        window.parent.postMessage({pluginMessage: {type: 'zoomRequest'}}, '*');
    };

    return (
        <div
            onDragOver={(e) => {
                e.dataTransfer.dropEffect = 'move';
                e.preventDefault();
            }}
            onDrop={() => {
                setDroppedInIFrame(true);
            }}
            className="window"
            ref={windowRef}
            onMouseEnter={onMouseEnter}
        >
            <input
                autoFocus
                className="searchInput"
                type="text"
                value={query}
                placeholder="Search card names"
                onChange={(e) => setQuery(e.target.value)}
                onKeyUp={enterSearch}
                onClick={onClick}
            ></input>
            <div className="searchStatus">
                <label>{statusMessage}</label>
            </div>
            {!showChewtle ? (
                loading ? (
                    <div className="loading">
                        <SquareLoader color="#b3b3b3" size={24} />
                    </div>
                ) : (
                    <div className="results">
                        {cardInfos.map((card) => (
                            <React.Fragment key={card.cardId}>
                                <CardThumbnail
                                    card={card}
                                    canvasZoomLevel={canvasZoomLevel}
                                    canvasCardWidth={canvasCardWidth}
                                    canvasCardHeight={canvasCardHeight}
                                    cardsLoaded={cardsLoaded}
                                    setCardsLoaded={setCardsLoaded}
                                    droppedInIFrame={droppedInIFrame}
                                    setDroppedInIFrame={setDroppedInIFrame}
                                />
                            </React.Fragment>
                        ))}
                    </div>
                )
            ) : (
                <div style={{display: `${showChewtle ? 'block' : 'none'}`}} className="chewtleDiv">
                    <button className="chewtleButton" onClick={insertChewtle} />
                </div>
            )}
        </div>
    );
};

export default App;
