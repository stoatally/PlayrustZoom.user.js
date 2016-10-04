// ==UserScript==
// @name        Playrust Zoom
// @namespace   measlytwerp
// @include     http://playrust.io/map/*
// @version     0.1.2
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
appendStylesheet("#landmarks img { width: 8px !important; }");

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

appendStylesheet("#map-zoom-toggle { position: fixed; top: 15px; right: 10px; background: hsl(0, 0%, 15%); color: white; padding: 2px; cursor: pointer; border-radius: 2px; }");
appendStylesheet("#map-zoom-toggle.on { background: hsl(0, 60%, 15%); }");

var container,
    player,
    toggle,
    isEnabled = false;

var followPlayer = function() {
  if (!isEnabled) return;

  var playerX, playerY;

  if (player.style.top && player.style.left) {
    playerX = parseFloat(player.style.left);
    playerY = parseFloat(player.style.top);
  }

  else {
    playerX = parseFloat(/translateX\(([^\)]+)px\)/.exec(player.style.transform)[1]);
    playerY = parseFloat(/translateY\(([^\)]+)px\)/.exec(player.style.transform)[1]);
  }

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

var changeFocus = function(event) {
  if ('IMG' == event.target.tagName || 'img' == event.target.tagName) {
    player = event.target;
    enableMapZoom();
  }
};

// Wait for the player icon to be created:
var waitForContainer = setInterval(function() {
  container = document.querySelector('#container');

  if (!!container) {
    clearInterval(waitForContainer);

    document.querySelector('#friends-toggle').style.display = "none";

    toggle = document.createElement('a');
    toggle.setAttribute('id', 'map-zoom-toggle');
    document.body.appendChild(toggle);

    toggle.addEventListener("click", toggleMapZoom);
    container.addEventListener("mousedown", disableMapZoom);
    document.querySelector('#landmarks').addEventListener('click', changeFocus);

    if (!player) {
      disableMapZoom();
    }
  }
}, 100);

var waitForPlayer = setInterval(function() {
  var checkPlayer = document.querySelector('#landmarks img[src="img/self.png"]');

  if (!!checkPlayer) {
    clearInterval(waitForPlayer);
    player = checkPlayer;
    enableMapZoom();
  }
}, 100);

setInterval(followPlayer, 100);
