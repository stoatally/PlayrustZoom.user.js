// ==UserScript==
// @name        Playrust Zoom
// @namespace   measlytwerp
// @include     http://playrust.io/map/*
// @version     0.1.1
// @run-at      document-start
// @grant       GM_log
// ==/UserScript==

function appendStylesheet(stylesheet) {
  var styleElement = document.createElement('style');
  styleElement.textContent = stylesheet;
  document.head.appendChild(styleElement);
}

// Reduce font size:
appendStylesheet("body, td, th, input { font-size: 4pt; }");

// Reduce header size:
appendStylesheet("#header { background: #1a1819; height: 10px; } #header td.title { padding-left: 10px; }");
appendStylesheet('#signin, #signout { border-radius: 2px; padding: 2px; }');
appendStylesheet("#container { top: 10px; }");

// Recude icon size:
appendStylesheet("#landmarks img { width: 10px !important; }");

// Reduce friends list size:
appendStylesheet("#friends { padding: 3px; width: 100px; }");
appendStylesheet("#friends .icon { width: 8px; }");
appendStylesheet("#friends-minmax { margin-top: -1px; margin-right: -1px;  }");
appendStylesheet("#friends h2 { padding-bottom: 3px; }");
appendStylesheet("#friends .list { clear: both; margin-bottom: 6px; }");
appendStylesheet("#friends .list a.player { padding: 2px; }");
appendStylesheet('#allieslist { max-height: 25vh; } #friends #allieslist a.player { background-size: 8px; padding-left: 13px; }')
appendStylesheet('#recentlist { max-height: 25vh; }')
appendStylesheet('#recent-filter { padding: 2px; }')

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
  player = document.querySelector('#landmarks img[src="img/self.png"]');

  if (!!player) {
    container = document.querySelector('#container');

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
