const app = {};

app.renderBasicMapExample = function (elmId) {
    // source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
    const COUNTRIES =
        'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'; //eslint-disable-line
    const AIR_PORTS =
        'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

    const INITIAL_VIEW_STATE = {
        latitude: 51.47,
        longitude: 0.45,
        zoom: 1,
        bearing: 0,
        pitch: 30
    };

    return new deck.DeckGL({
        initialViewState: INITIAL_VIEW_STATE,
        controller: true,
        container: elmId,
        layers: [
            new GeoJsonLayer({
                id: 'base-map',
                data: COUNTRIES,
                // Styles
                stroked: true,
                filled: true,
                lineWidthMinPixels: 2,
                opacity: 0.4,
                getLineDashArray: [3, 3],
                getLineColor: [60, 60, 60],
                getFillColor: [200, 200, 200]
            }),
            new GeoJsonLayer({
                id: 'airports',
                data: AIR_PORTS,
                // Styles
                filled: true,
                pointRadiusMinPixels: 2,
                opacity: 1,
                pointRadiusScale: 2000,
                getRadius: f => 11 - f.properties.scalerank,
                getFillColor: [200, 0, 80, 180],
                // Interactive props
                pickable: true,
                autoHighlight: true,
                onClick: info =>
                    // eslint-disable-next-line
                    info.object && alert(`${info.object.properties.name} (${info.object.properties.abbrev})`)
            }),
            new ArcLayer({
                id: 'arcs',
                data: AIR_PORTS,
                dataTransform: d => d.features.filter(f => f.properties.scalerank < 4),
                // Styles
                getSourcePosition: f => [-0.4531566, 51.4709959], // London
                getTargetPosition: f => f.geometry.coordinates,
                getSourceColor: [0, 128, 200],
                getTargetColor: [200, 0, 80],
                getWidth: 1
            })
        ]
    });
}

app.renderHelloWorldExample = function (elmId) {
    const viewState = {
        longitude: -122.45,
        latitude: 37.8,
        zoom: 12,
        maxZoom: 12,
        minZoom: 12,
    };
    return new deck.DeckGL({
        container: elmId,
        initialViewState: viewState,
        layers: [
            new deck.TextLayer({
                data: [
                    { position: [-122.45, 37.8], text: 'Hello World' },
                    { position: [-122.45, 37.796], text: 'Drag me :)' }
                ]
            })
        ]
    });
}

app.goToHash = function (hsh) {
    location.hash = "#" + hsh;
}

app.renderHexagonLayerExample = function (elmId) {
    const { DeckGL, HexagonLayer } = deck;
    const COUNTRIES =
        'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson';

    const deckgl = new DeckGL({
        container: elmId,
        longitude: -1.4157,
        latitude: 52.2324,
        zoom: 5,
        minZoom: 5,
        maxZoom: 15,
        pitch: 40.5
    });

    let data = null;

    const COLOR_RANGE = [
        [1, 152, 189],
        [73, 227, 206],
        [216, 254, 181],
        [254, 237, 177],
        [254, 173, 84],
        [209, 55, 78]
    ];

    function renderLayer() {
        const hexagonLayer = new HexagonLayer({
            id: 'heatmap',
            colorRange: COLOR_RANGE,
            data,
            elevationRange: [0, 1000],
            elevationScale: 250,
            extruded: true,
            getPosition: d => d,
            opacity: 1,
            radius: 1000,
            coverage: 1,
            upperPercentile: 100,
        });

        const mapLayer = new GeoJsonLayer({
            id: 'base-map',
            data: COUNTRIES,
            stroked: true,
            filled: true,
            lineWidthMinPixels: 2,
            opacity: 0.4,
            getLineDashArray: [3, 3],
            getLineColor: [60, 60, 60],
            getFillColor: [200, 200, 200]
        });

        deckgl.setProps({
            layers: [hexagonLayer, mapLayer]
        });
    }

    d3.csv('https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv')
        .then(response => {
            data = response.map(d => [Number(d.lng), Number(d.lat)]);
            renderLayer();
        });

    return deckgl;
}

app.renderTransitionExample = function(controlsElmId, elmId) {
    const { DeckGL, ScatterplotLayer, FlyToInterpolator } = deck;

    // Data
    const CITIES = [
        { "city": "San Francisco", "state": "California", "latitude": 37.7751, "longitude": -122.4193 },
        { "city": "New York", "state": "New York", "latitude": 40.6643, "longitude": -73.9385 },
        { "city": "Los Angeles", "state": "California", "latitude": 34.051597, "longitude": -118.244263 },
        { "city": "London", "state": "United Kingdom", "latitude": 51.5074, "longitude": -0.1278 },
        { "city": "Hyderabad", "state": "India", "latitude": 17.3850, "longitude": 78.4867 }
    ];

    const COUNTRIES =
        'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson';

    const deckgl = new DeckGL({
        container: elmId,
        viewState: {
            longitude: CITIES[0].longitude,
            latitude: CITIES[0].latitude,
            zoom: 4
        },
        layers: [
            new ScatterplotLayer({
                data: CITIES,
                getPosition: d => [d.longitude, d.latitude],
                getColor: [255, 180, 0],
                radiusMinPixels: 10
            }),
            new GeoJsonLayer({
                id: 'base-map',
                data: COUNTRIES,
                stroked: true,
                filled: true,
                lineWidthMinPixels: 2,
                opacity: 0.4,
                getLineDashArray: [3, 3],
                getLineColor: [60, 60, 60],
                getFillColor: [200, 200, 200]
            })
        ]
    });

    // Create radio buttons
    const inputs = d3.select('#' + controlsElmId).selectAll('div')
        .data(CITIES)
        .enter().append('div');

    inputs.append('input')
        .attr('type', 'radio')
        .attr('name', 'city')
        .attr('id', (d, i) => 'city-' + i)
        .on('change', d => {
            deckgl.setProps({
                viewState: {
                    longitude: d.longitude,
                    latitude: d.latitude,
                    zoom: 4,
                    transitionInterpolator: new FlyToInterpolator(),
                    transitionDuration: 2000
                }
            })
        });

    inputs.append('label')
        .attr('for', (d, i) => 'city-' + i)
        .text(d => d.city + ', ' + d.state);

    // Default select the first city
    inputs.select('input').node().checked = true;
    return deckgl;
}