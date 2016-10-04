// ==UserScript==
// @name        Playrust Zoom
// @namespace   measlytwerp
// @include     http://playrust.io/map/*
// @version     0.2.0
// @run-at      document-start
// @grant       GM_log
// ==/UserScript==

function appendStylesheet(selector, styles) {
    var styleElement = document.createElement('style');
    var stylesheet = selector + ' {';

    for (var property in styles) {
        stylesheet += ' ' + property + ': ' + styles[property] + ';';
    }

    stylesheet += ' }';

    styleElement.textContent = stylesheet;
    document.head.appendChild(styleElement);
}

var controlButtons,
    isMapZoomed = false,
    mapZoomScale = 3,
    mapZoomIconSize = 8,
    mapZoomButton,
    isFollowing = false,
    followingButton,
    followingTarget;

var redButtonColor = 'ac3935',
    redButtonImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoAAAAaCAYAAACeqEG/AAAAzUlEQVR4nO3OS0pCAQCF4bMT79Xr23ykVm5IIoRAcCA4cCA2aBA0aCA4CIIgoo20qOMqIjj8g2/+6fe4N4Bs+u8AgL+nn8WNAWTT92JuANn0dTczgGz6vJ0aQDZ9zK8NIJveZxMDyKbzdGwA2XSajAwgm97GQwPIptfRlQFk08twYADZ9DzoG0A2PfW6BpBNh27HALJp324bQDbtWi0DyKZts2kA2bSpKgPIpnWjMoBseqw3DCCbVmVpANn0UJQGkE33tcIAsmlZKwwg2wXyXUkimcrJvwAAAABJRU5ErkJggg==';

var greenButtonColor = '78ac35',
    greenButtonImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAp0lEQVRIib3NywYCAQAF0Psn0/uh9/MTRkkiiUhERmVUyhiTFrOIWcwiWrSIFhEx0o/0Ube/uIuzPoh+PhUgi47fNhXgfVpUgBs1qQDn3aACDq86FbB71qiAzaNKBdj3ChWwupWpAOtaogIWlyIVMA8LVMAsyFMB03OOCpj4WSpgfMpQASMvTQUMnRQVMNgnqYD+NkEF9Ow4FdBdx6iAztKgAkzLoMIfYRumpve0eSwAAAAASUVORK5CYII=';

var waitForReady = function(callback) {
    var ticker = setInterval(function() {
        if (!!document.body && document.body.classList.contains('is-signedin')) {
            clearInterval(ticker);
            callback();
        }
    }, 100);
};

var init = function() {
    initDeleteWM();
    initHeaderStyles();
    initControlButtons();
    initMapZoom();
    initFollowing();

    console.log('--- ready');
};

var initDeleteWM = function() {
    var wm = document.querySelector('#wm');

    wm.parentNode.removeChild(wm);
};

var initHeaderStyles = function() {
    appendStylesheet('#header', {
        'height':           '30px',
    });
    appendStylesheet('#container', {
        'top':              '30px',
    });
    appendStylesheet('#header td', {
        'background':       '#1a1819',
        'font-size':        '10pt',
        'line-height':      '15pt',
    });
    appendStylesheet('#header td.title', {
        'padding-left':     '10px',
    });
    appendStylesheet('#signin, #signout', {
        'font-size':        '1em',
        'padding':          '0 5px',
    });
};

var initControlButtons = function() {
    controlButtons = document.createElement('nav');
    controlButtons.setAttribute('id', 'control-buttons');
    document.body.appendChild(controlButtons);

    initControlButtonStyles();
};

var initControlButtonStyles = function() {
    appendStylesheet('#control-buttons', {
        'font-size':        '10pt',
        'line-height':      '15pt',
        'position':         'fixed',
        'right':            '10px',
        'top':              '40px',
    });
    appendStylesheet('#control-buttons a', {
        'background':       '#1a1819',
        'border-radius':    '5px',
        'color':            '#ffffff',
        'cursor':           'pointer',
        'display':          'inline-block',
        'margin-left':      '10px',
        'padding':          '0 5px',
    });
    appendStylesheet('body.is-map-zoomed #map-zoom-button', {
        'background':       '#' + redButtonColor + ' url(' + redButtonImage + ')',
    });
    appendStylesheet('body.is-following #following-button', {
        'background':       '#' + redButtonColor + ' url(' + redButtonImage + ')',
    });
    appendStylesheet('body.is-not-map-zoomed #map-zoom-button', {
        'background':       '#' + greenButtonColor + ' url(' + greenButtonImage + ')',
    });
    appendStylesheet('body.is-not-following #following-button', {
        'background':       '#' + greenButtonColor + ' url(' + greenButtonImage + ')',
    });
};

var initMapZoom = function() {
    initMapZoomStyles();
    initMapZoomButton();
};

var initMapZoomStyles = function() {
    var size = mapZoomScale * parseInt(document.querySelector('#map').style.width);

    appendStylesheet('body.is-map-zoomed #map', {
        'background-size':  size + 'px ' + size + 'px !important',
        'height':           size + 'px !important',
        'width':            size + 'px !important',
    });
    appendStylesheet('body.is-map-zoomed #grid', {
        'transform':        'scale(' + mapZoomScale + ')',
        'transform-origin': '0 0',
    });
    appendStylesheet('body.is-map-zoomed #buildings', {
        'transform':        'scale(' + mapZoomScale + ')',
        'transform-origin': '0 0',
    });
    appendStylesheet('body.is-map-zoomed #mortality', {
        'transform':        'scale(' + mapZoomScale + ')',
        'transform-origin': '0 0',
    });
    appendStylesheet('body.is-map-zoomed #deposits', {
        'transform':        'scale(' + mapZoomScale + ')',
        'transform-origin': '0 0',
    });
    appendStylesheet('body.is-map-zoomed #landmarks', {
        'transform':        'scale(' + mapZoomScale + ')',
        'transform-origin': '0 0',
    });
    appendStylesheet('body.is-map-zoomed #loot', {
        'transform':        'scale(' + mapZoomScale + ')',
        'transform-origin': '0 0',
    });
    appendStylesheet('body.is-map-zoomed #landmarks img', {
        'width':            mapZoomIconSize + 'px !important',
    });
    appendStylesheet('body.is-map-zoomed #landmarks img', {
        'width':            mapZoomIconSize + 'px !important',
    });
};

var initMapZoomButton = function() {
    mapZoomButton = document.createElement('a');
    controlButtons.appendChild(mapZoomButton);

    mapZoomButton
        .setAttribute('id', 'map-zoom-button');
    mapZoomButton
        .addEventListener("click", toggleMapZoom);

    disableMapZoom();
};

var toggleMapZoom = function() {
    if (isMapZoomed) {
        disableMapZoom();
    }

    else {
        enableMapZoom();
    }
};

var enableMapZoom = function() {
    isMapZoomed = true;

    if (document.body.classList.contains('is-not-map-zoomed')) {
        document.body.classList.remove('is-not-map-zoomed');
    }

    document.body.classList.add('is-map-zoomed');

    mapZoomButton.textContent = 'Zoom Out';

    if (!followingTarget) {
        selectPlayerAsFollowingTarget();
    }
};

var disableMapZoom = function() {
    isMapZoomed = false;

    if (document.body.classList.contains('is-map-zoomed')) {
        document.body.classList.remove('is-map-zoomed');
    }

    document.body.classList.add('is-not-map-zoomed');

    mapZoomButton.textContent = 'Zoom In';
};

var initFollowing = function() {
    initFollowingButton();
    initFollowingTicker();
};

var initFollowingButton = function() {
    followingButton = document.createElement('a');
    controlButtons.appendChild(followingButton);

    followingButton
        .setAttribute('id', 'following-button');
    followingButton
        .addEventListener("click", toggleFollowing);
    document.querySelector('#landmarks')
        .addEventListener('click', selectClickedIconAsFollowingTarget);

    disableFollowing();
};

var toggleFollowing = function() {
    if (isFollowing) {
        disableFollowing();
    }

    else {
        enableFollowing();
    }
};

var enableFollowing = function() {
    isFollowing = true;

    if (document.body.classList.contains('is-not-following')) {
        document.body.classList.remove('is-not-following');
    }

    document.body.classList.add('is-following');

    followingButton.textContent = 'Stop Following';

    if (!followingTarget) {
        selectPlayerAsFollowingTarget();
    }
};

var disableFollowing = function() {
    isFollowing = false;

    if (document.body.classList.contains('is-following')) {
        document.body.classList.remove('is-following');
    }

    document.body.classList.add('is-not-following');

    followingButton.textContent = 'Start Following';
};

var initFollowingTicker = function() {
    var container = document.querySelector('#container');

    container.addEventListener("mousedown", disableFollowing);

    setInterval(function() {
        if (!isFollowing || !followingTarget) return;

        var targetX, targetY, target = followingTarget;

        if (target.style.top && target.style.left) {
            targetX = parseFloat(target.style.left);
            targetY = parseFloat(target.style.top);
        }

        else {
            targetX = parseFloat(/translateX\(([^\)]+)px\)/.exec(target.style.transform)[1]);
            targetY = parseFloat(/translateY\(([^\)]+)px\)/.exec(target.style.transform)[1]);
        }

        if (isMapZoomed) {
            container.scrollLeft = (targetX - (container.clientWidth / (2 * mapZoomScale)) + target.clientWidth) * mapZoomScale;
            container.scrollTop = (targetY - (container.clientHeight / (2 * mapZoomScale)) + target.clientHeight) * mapZoomScale;
        }

        else {
            container.scrollLeft = (targetX - (container.clientWidth / 2) + target.clientWidth);
            container.scrollTop = (targetY - (container.clientHeight / 2) + target.clientHeight);
        }
    }, 100);
};

var selectPlayerAsFollowingTarget = function() {
    var player = document.querySelector('#landmarks img[src="img/self.png"]');

    if (!!player) {
        followingTarget = player;
        enableFollowing();
    }
};

var selectClickedIconAsFollowingTarget = function(event) {
    if ('IMG' == event.target.tagName || 'img' == event.target.tagName) {
        followingTarget = event.target;
        enableFollowing();
    }
};

waitForReady(init);
