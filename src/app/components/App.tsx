import * as React from 'react';
import '../styles/ui.css';
import {getCardImageForFigma, getCardImage} from '../utils/cardImages';
import SquareLoader from 'react-spinners/SquareLoader';
import {searchCards} from '../utils/cardQueries';

const insertChewtle = async () => {
    const image = await getCardImageForFigma('https://images.pokemontcg.io/swsh4/38_hires.png');
    window.parent.postMessage({pluginMessage: {type: 'card', data: image}}, '*');
};

function CardThumbnailDragged(cardImg, width, height, draggedThumbnailImage): Element {
    draggedThumbnailImage.src = cardImg;
    draggedThumbnailImage.style.width = `${width}px`;
    draggedThumbnailImage.style.height = `${height}px`;

    return draggedThumbnailImage.parentNode;
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
    draggedThumbnailRef,
}) => {
    const [loadedSrc, setLoadedSrc] = React.useState(null);
    const [isDragging, setIsDragging] = React.useState(false);

    React.useEffect(() => {
        const controller = new AbortController();
        const fetchImage = async () => {
            const imageObjectUrl = await getCardImage(new Request(card.smallUrl, {signal: controller.signal}));
            setLoadedSrc(imageObjectUrl);
        };
        fetchImage();
        return () => {
            controller.abort();
        };
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
        setIsDragging(true);
        const width = canvasCardWidth * canvasZoomLevel;
        const height = canvasCardHeight * canvasZoomLevel;
        // loadedSrc depends on the cache being enabled
        e.dataTransfer.setDragImage(
            CardThumbnailDragged(loadedSrc, width, height, draggedThumbnailRef.current),
            width / 2,
            height / 2
        );
    };

    const onDragEnd = async (e) => {
        setIsDragging(false);
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
        <img
            className={`thumbnail ${isDragging ? 'thumbnailDrag' : ''}`}
            src={loadedSrc}
            onClick={onClick}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        />
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
    const draggedThumbnailImgRef = React.useRef();

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
            setQuery('grass energy');
            setStatusMessage('');
        } else if (cardInfos.length === 0) {
            setStatusMessage('No results found');
        }
    }, [cardInfos, cardsLoaded, showChewtle]);

    React.useEffect(() => {
        setStatusMessage('');
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
        <>
            <div
                className="window"
                onDragOver={(e) => {
                    e.dataTransfer.dropEffect = 'move';
                    e.preventDefault();
                }}
                onDrop={() => {
                    setDroppedInIFrame(true);
                }}
                ref={windowRef}
                onMouseEnter={onMouseEnter}
            >
                <div className="search">
                    <input
                        autoFocus
                        className="searchInput"
                        type="text"
                        value={query}
                        placeholder="Search card name"
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyUp={enterSearch}
                        onClick={onClick}
                    ></input>
                </div>
                {!showChewtle ? (
                    loading ? (
                        <div className="loading">
                            <SquareLoader color="#b3b3b3" size={24} />
                        </div>
                    ) : cardInfos.length === 0 ? (
                        <div className="error">{statusMessage}</div>
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
                                        draggedThumbnailRef={draggedThumbnailImgRef}
                                    />
                                </React.Fragment>
                            ))}
                        </div>
                    )
                ) : (
                    <div className={`chewtleDiv ${showChewtle ? '' : 'hide'}`}>
                        <button className="chewtleButton" onClick={insertChewtle} />
                    </div>
                )}
            </div>
            <div id="draggedThumbnail">
                <img id="draggedThumbnailImg" ref={draggedThumbnailImgRef}></img>
            </div>
        </>
    );
};

export default App;
