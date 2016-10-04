// ==UserScript==
// @name        Playrust Zoom
// @namespace   measlytwerp
// @include     http://playrust.io/map/*
// @version     0.2.2
// @run-at      document-start
// @grant       GM_log
// ==/UserScript==

function appendStylesheet(groups) {
    var styleElement = document.createElement('style');
    var stylesheet = '';

    for (var selector in groups) {
        stylesheet += selector + ' {';

        for (var property in groups[selector]) {
            stylesheet += ' ' + property + ': ' + groups[selector][property] + ';';
        }

        stylesheet += ' } ';
    }

    styleElement.textContent = stylesheet;
    document.head.appendChild(styleElement);

    return styleElement;
}

var controlButtons,
    isMapZoomed = false,
    mapZoomStylesheet = null,
    mapZoomSize = 0,
    mapZoomScale = 3,
    mapZoomIconSize = 20,
    mapZoomButton1x,
    mapZoomButton2x,
    mapZoomButton3x,
    mapZoomButton4x,
    isFollowing = false,
    followingButton,
    followingTarget;

var buttonColor = 'ac3935',
    buttonImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoAAAAaCAYAAACeqEG/AAAAzUlEQVR4nO3OS0pCAQCF4bMT79Xr23ykVm5IIoRAcCA4cCA2aBA0aCA4CIIgoo20qOMqIjj8g2/+6fe4N4Bs+u8AgL+nn8WNAWTT92JuANn0dTczgGz6vJ0aQDZ9zK8NIJveZxMDyKbzdGwA2XSajAwgm97GQwPIptfRlQFk08twYADZ9DzoG0A2PfW6BpBNh27HALJp324bQDbtWi0DyKZts2kA2bSpKgPIpnWjMoBseqw3DCCbVmVpANn0UJQGkE33tcIAsmlZKwwg2wXyXUkimcrJvwAAAABJRU5ErkJggg==';

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
    initDeletePlayrustBranding();
    initHeaderStyles();
    initControlButtons();
    initMapZoom();
    initFollowing();
};

var initDeleteWM = function() {
    document.querySelector('#wm').remove();
};

var initDeletePlayrustBranding = function() {
    document.querySelector('#header td.title a + span').remove();
    document.querySelector('#header td.title a').remove();
};

var initHeaderStyles = function() {
    appendStylesheet({
        '#header': {
            'height':           '40px',
        },
        '#container': {
            'top':              '40px',
        },
        '#header td': {
            'background':       '#1a1819',
            'font-size':        '10pt',
            'line-height':      '15pt',
            'padding':          '0 10px 0 0',
        },
        '#header td.title': {
            'padding':          '0 10px',
        },
        '#signin, #signout': {
            'font-size':        '1em',
            'padding':          '0 5px',
        }
    });
};

var initControlButtons = function() {
    var before = document.querySelector('#header tr td.info').nextSibling;

    controlButtons = document.createElement('td');
    controlButtons.setAttribute('id', 'control-buttons');
    before.parentNode.insertBefore(controlButtons, before);

    initControlButtonStyles();
};

var initControlButtonStyles = function() {
    appendStylesheet({
        '#control-buttons a': {
            'background':       '#' + buttonColor + ' url(' + buttonImage + ')',
            'border-radius':    '5px',
            'box-shadow':       '0 0 3px hsla(0, 0%, 0%, 0.5)',
            'color':            '#ffffff',
            'cursor':           'pointer',
            'display':          'inline-block',
            'filter':           'hue-rotate(220deg) saturate(25%)',
            'margin-left':      '10px',
            'padding':          '0 5px',
        }
    });
};

var initMapZoom = function() {
    initMapZoomStyles();
    initMapZoomButton();
};

var initMapZoomStyles = function() {
    mapZoomSize = parseInt(document.querySelector('#map').style.width);
};

var initMapZoomButton = function() {
    controlButtons.appendChild(createMapZoomButton(1, disableMapZoom));
    controlButtons.appendChild(createMapZoomButton(2, createMapZoomCallback(2)));
    controlButtons.appendChild(createMapZoomButton(3, createMapZoomCallback(3)));
    controlButtons.appendChild(createMapZoomButton(5, createMapZoomCallback(5)));
    controlButtons.appendChild(createMapZoomButton(8, createMapZoomCallback(8)));
    controlButtons.appendChild(createMapZoomButton(13, createMapZoomCallback(13)));

    disableMapZoom();
};

var createMapZoomButton = function(scale, callback)
{
    var button = document.createElement('a');

    button.addEventListener('click', callback);
    button.textContent = scale + 'x';

    return button;
}

var createMapZoomCallback = function(scale) {
    return function() {
        enableMapZoom();
        setMapZoom(scale);
    };
};

var enableMapZoom = function() {
    isMapZoomed = true;

    if (document.body.classList.contains('is-not-map-zoomed')) {
        document.body.classList.remove('is-not-map-zoomed');
    }

    document.body.classList.add('is-map-zoomed');
    document.body.setAttribute('scale', mapZoomScale);

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
    document.body.removeAttribute('scale');
};

var setMapZoom = function(scale) {
    var size = scale * mapZoomSize;
    mapZoomScale = scale;

    if (!!mapZoomStylesheet) {
        document.head.removeChild(mapZoomStylesheet);
    }

    mapZoomStylesheet = appendStylesheet({
        'body.is-map-zoomed #map': {
            'background-size':  size + 'px ' + size + 'px !important',
            'height':           size + 'px !important',
            'width':            size + 'px !important',
        },
        'body.is-map-zoomed #grid': {
            'transform':        'scale(' + mapZoomScale + ')',
            'transform-origin': '0 0',
        },
        'body.is-map-zoomed #buildings': {
            'transform':        'scale(' + mapZoomScale + ')',
            'transform-origin': '0 0',
        },
        'body.is-map-zoomed #mortality': {
            'transform':        'scale(' + mapZoomScale + ')',
            'transform-origin': '0 0',
        },
        'body.is-map-zoomed #deposits': {
            'transform':        'scale(' + mapZoomScale + ')',
            'transform-origin': '0 0',
        },
        'body.is-map-zoomed #landmarks': {
            'transform':        'scale(' + mapZoomScale + ')',
            'transform-origin': '0 0',
        },
        'body.is-map-zoomed #loot': {
            'transform':        'scale(' + mapZoomScale + ')',
            'transform-origin': '0 0',
        },
        'body.is-map-zoomed #landmarks img': {
            'margin':           ((20 - (20 / mapZoomScale)) / 2) + 'px !important',
            'width':            (20 / mapZoomScale) + 'px !important',
        },
        'body.is-map-zoomed #landmarks img': {
            'margin':           ((20 - (20 / mapZoomScale)) / 2) + 'px !important',
            'width':            (20 / mapZoomScale) + 'px !important',
        }
    });
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

    followingButton.textContent = 'Free';

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

    followingButton.textContent = 'Follow';
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
