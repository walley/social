// navigation.js - Full navigation for openstreetmap.social (fixed 2026 version)

var navigationMarkers = L.layerGroup().addTo(map);
var routingControl = null;

// Navigation UI HTML
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
        <input id="nav-start" class="nav-input" type="text" placeholder="Starting point (click map)">
        <input id="nav-end"   class="nav-input" type="text" placeholder="Destination (click map)">

        <div class="nav-buttons">
            <button id="nav-go-btn" class="nav-btn nav-btn-go">Get Route</button>
            <button id="nav-clear-btn" class="nav-btn nav-btn-clear">Clear All</button>
        </div>

        <div id="nav-status" class="nav-status"></div>
    </div>
`;

// Add new Navigation pane to sidebar
var navPanel = {
    id: 'navigation',
    tab: '<i class="fa fa-directions"></i>',
    title: 'Navigation',
    pane: navigationHTML,
    position: 'top'
};

sidebar.addPanel(navPanel);   // ← change to your sidebar variable name if different

// Create routing control (free OSRM)
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
        lineOptions: { styles: [{ color: '#3388ff', weight: 6, opacity: 0.9 }] },
        createMarker: function() { return null; }
    }).addTo(map);
}

// Clear everything
function clearNavigation() {
    if (routingControl) {
        routingControl.remove();
        routingControl = null;
    }
    navigationMarkers.clearLayers();
    document.getElementById('nav-start').value = '';
    document.getElementById('nav-end').value = '';
    document.getElementById('nav-status').innerHTML = '';
}

// Click on map to set start / end points
map.on('click', function(e) {
    if (!routingControl) createRoutingControl();

    var latlng = e.latlng;
    var waypoints = routingControl.getWaypoints();

    if (waypoints.length === 0 || !waypoints[0].latLng) {
        routingControl.spliceWaypoints(0, 1, latlng);
        document.getElementById('nav-start').value = latlng.lat.toFixed(5) + ', ' + latlng.lng.toFixed(5);
    } else {
        routingControl.spliceWaypoints(1, 1, latlng);
        document.getElementById('nav-end').value = latlng.lat.toFixed(5) + ', ' + latlng.lng.toFixed(5);
        document.getElementById('nav-status').innerHTML = 'Route calculated!';
    }
});

// Button listeners
setTimeout(() => {
    document.getElementById('nav-go-btn').addEventListener('click', function() {
        document.getElementById('nav-status').innerHTML = 'Route ready (click map to set points)';
    });

    document.getElementById('nav-clear-btn').addEventListener('click', clearNavigation);
}, 300);

// Initialize
createRoutingControl();
