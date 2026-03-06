// navigation.js - Full navigation (routing) for openstreetmap.social
// Uses free OSRM demo server (no API key needed)

var navigationMarkers = L.layerGroup().addTo(map);
var routingControl = null;

// Navigation UI HTML (clean, modern look)
var navigationHTML = `
    <style>
        .nav-container { padding: 15px; background: #f8f8f8; }
        .nav-input { width: 100%; padding: 10px; margin-bottom: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; box-sizing: border-box; }
        .nav-buttons { display: flex; gap: 8px; }
        .nav-btn { flex: 1; padding: 10px; font-size: 16px; border: none; border-radius: 4px; cursor: pointer; }
        .nav-btn-go { background: #27ae60; color: white; }
        .nav-btn-clear { background: #e74c3c; color: white; }
        .nav-status { margin-top: 10px; font-size: 14px; color: #555; min-height: 20px; }
    </style>

    <div class="nav-container">
        <input id="nav-start" class="nav-input" type="text" placeholder="Starting point (or click on map)">
        <input id="nav-end"   class="nav-input" type="text" placeholder="Destination">

        <div class="nav-buttons">
            <button id="nav-go-btn" class="nav-btn nav-btn-go">Get Route</button>
            <button id="nav-clear-btn" class="nav-btn nav-btn-clear">Clear All</button>
        </div>

        <div id="nav-status" class="nav-status"></div>
    </div>
`;

// Add new "Navigation" pane to the existing sidebar
var navPanel = {
    id: 'navigation',
    tab: '<i class="fa fa-directions"></i>',   // navigation icon
    title: 'Navigation',
    pane: navigationHTML,
    position: 'top'
};

sidebar.addPanel(navPanel);   // 'sidebar' must be your existing sidebar variable

// === ROUTING LOGIC (free OSRM) ===
function createRoutingControl() {
    if (routingControl) routingControl.remove();

    routingControl = L.Routing.control({
        waypoints: [],
        router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1'
        }),
        routeWhileDragging: true,
        showAlternatives: true,
        fitSelectedRoutes: true,
        lineOptions: { styles: [{ color: '#3388ff', weight: 6 }] },
        createMarker: function() { return null; }   // we use our own markers
    }).addTo(map);
}

// Handle "Get Route" button
function calculateRoute() {
    var startInput = document.getElementById('nav-start').value.trim();
    var endInput   = document.getElementById('nav-end').value.trim();

    document.getElementById('nav-status').innerHTML = 'Calculating route...';

    // For simplicity we use direct lat/lng or let user click map later
    // But to make it useful immediately, we'll add click-to-set later

    if (!startInput || !endInput) {
        document.getElementById('nav-status').innerHTML = '<span style="color:red">Please fill both fields or click map</span>';
        return;
    }

    // You can extend this with Nominatim search if you want text → coords
    // For now we assume user will use the click-on-map feature below
}

// Clear everything
function clearNavigation() {
    if (routingControl) routingControl.remove();
    routingControl = null;
    navigationMarkers.clearLayers();
    document.getElementById('nav-start').value = '';
    document.getElementById('nav-end').value = '';
    document.getElementById('nav-status').innerHTML = '';
}

// Click on map to set start / end
map.on('click', function(e) {
    if (!routingControl) createRoutingControl();

    var latlng = e.latlng;
    var currentWaypoints = routingControl.getWaypoints();

    if (currentWaypoints.length < 2 || currentWaypoints[0].latLng === null) {
        routingControl.spliceWaypoints(0, 1, latlng);
        document.getElementById('nav-start').value = latlng.lat.toFixed(5) + ', ' + latlng.lng.toFixed(5);
    } else {
        routingControl.spliceWaypoints(1, 1, latlng);
        document.getElementById('nav-end').value = latlng.lat.toFixed(5) + ', ' + latlng.lng.toFixed(5);
    }

    // Optional: auto-calculate after second click
    if (routingControl.getWaypoints().length >= 2) {
        setTimeout(() => {
            document.getElementById('nav-status').innerHTML = 'Route found!';
        }, 800);
    }
});

// Button listeners (run after pane is added)
setTimeout(() => {
    document.getElementById('nav-go-btn').addEventListener('click', calculateRoute);
    document.getElementById('nav-clear-btn').addEventListener('click', clearNavigation);
}, 300);

// Create routing control on first use
createRoutingControl();
