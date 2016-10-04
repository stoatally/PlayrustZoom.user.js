// ==UserScript==
// @name        Playrust Zoom
// @namespace   measlytwerp
// @include     http://playrust.io/map/*
// @version     0.1.0
// @run-at      document-start
// @grant       GM_log
// ==/UserScript==

function appendStylesheet(stylesheet) {
  var styleElement = document.createElement('style');
  styleElement.textContent = stylesheet;
  document.head.appendChild(styleElement);
}

// Reduce font size:
appendStylesheet("body, td, th, input { font-size: 5pt; }");

// Reduce header size:
appendStylesheet("#header { height: 20px; }");
appendStylesheet("#container { top: 20px; }");

// Recude icon size:
appendStylesheet("#landmarks img { width: 10px !important; }");

// Reduce friends list size:
appendStylesheet("#friends { padding: 5px; width: 125px; }");
appendStylesheet("#friends .icon { width: 10px; }");
appendStylesheet('#allieslist a { background-size: 10px; padding-left: 19px; }')

// Hide the options:
appendStylesheet("#options { display: none; }");

appendStylesheet("#map-zoom-toggle { position: fixed; top: 25px; right: 5px; background: hsl(0, 0%, 15%); color: white; opacity: 0.8; padding: 5px; cursor: pointer; border-radius: 3px; }");
appendStylesheet("#map-zoom-toggle.on { background: hsl(0, 60%, 15%); }");

var container,
    player,
    toggle,
    isEnabled = true;

var followPlayer = function() {
  if (!isEnabled) return;

  var playerX = parseFloat(/translateX\(([^\)]+)px\)/.exec(player.style.transform)[1]);
  var playerY = parseFloat(/translateY\(([^\)]+)px\)/.exec(player.style.transform)[1]);

  container.scrollLeft = (playerX - (container.clientWidth / 2) + player.clientWidth);
  container.scrollTop = (playerY - (container.clientHeight / 2) + player.clientHeight);
};

var enableMapZoom = function() {
  isEnabled = true;
  toggle.textContent = 'Disable';
};

var disableMapZoom = function() {
  isEnabled = false;
  toggle.textContent = 'Enable';
};

var toggleMapZoom = function() {
  if (isEnabled) {
    disableMapZoom();
  }

  else {
    enableMapZoom();
  }
};

// Wait for the player icon to be created:
var waitForPlayer = setInterval(function() {
  container = document.querySelector('#container');
  player = document.querySelector('#landmarks img[src="img/self.png"]');

  if (!!player) {
    clearInterval(waitForPlayer);

    document.querySelector('#friends-toggle').style.display = "none";

    toggle = document.createElement('a');
    toggle.setAttribute('id', 'map-zoom-toggle');
    document.body.appendChild(toggle);

    enableMapZoom();

    toggle.addEventListener("click", toggleMapZoom);
    container.addEventListener("mousedown", disableMapZoom);

    setInterval(followPlayer, 100);
  }
}, 100);
