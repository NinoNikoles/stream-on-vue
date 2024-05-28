function forEach(ctn, callback) {
    return Array.prototype.forEach.call(ctn, callback);
}

var resizeTimer,
debounce = function(e) {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        resizeElementHeight();
    }, 50);
};

var resizeTimerScroll,
debounceScroll = function(e){
	clearTimeout(resizeTimerScroll);
	resizeTimerScroll = setTimeout(function() {
		checkPosition();
        scrollTrigger();
	}, 10);
};

function domObserver() {
    function observeDOMChanges(targetNode, callback) {
        // Erstellen eines MutationObservers mit einer Callback-Funktion
        const observer = new MutationObserver((mutationsList, observer) => {
            // Durchlaufe jede Mutation in der Liste
            for (const mutation of mutationsList) {
                // Führe die Callback-Funktion aus, wenn sich die Struktur des Zielknotens ändert
                if (mutation.type === 'childList') {
                    callback();
                    break; // Beende die Schleife, sobald eine Änderung festgestellt wurde
                }
            }
        });
      
        // Konfigurationsoptionen für den Observer
        const config = { childList: true, subtree: true };
      
        // Starte die Überwachung des Zielknotens mit den angegebenen Konfigurationsoptionen
        observer.observe(targetNode, config);
      
        // Rückgabe des Observers für spätere Verwendung oder Anhalten der Überwachung
        return observer;
    }

    // Beispielaufruf der Funktion
    // Zielknoten, dessen Struktur überwacht werden soll
    const ambientNode = document.getElementById('media-content');

    const ambientCallback = () => {
        ambientInit();
    }
    
    observeDOMChanges(ambientNode, ambientCallback);  
}

const resizeElementHeight = () => {
    var loginWrap = document.getElementById('loginWrap');
    if (loginWrap) {
        const windowHeight = window.innerHeight;
        loginWrap.style.height = `${windowHeight}px`;
    }

    var body = document.body;
    var navMain = document.getElementById('navMain');
    
    if (body.classList.contains('active-menu') || body.classList.contains('active-modal') || body.classList.contains('active-search')) {
        const windowHeight = window.innerHeight;
        body.style.height = `${windowHeight}px`;
        if(navMain && body.classList.contains('active-menu')) navMain.style.height = `${windowHeight-50}px`;
    } else {
        body.style.height = '';
        if(navMain) navMain.style.height = '';
    }
};

var mobileBodyHeightFix = function() {
    var body = document.body;
    var navMain = document.getElementById('navMain');

    const observer = new MutationObserver((mutations) => {
        // Überprüfen, ob sich die Klassen geändert haben
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (body.classList.contains('active-menu') || body.classList.contains('active-modal') || body.classList.contains('active-search')) {
                    const windowHeight = window.innerHeight;
                    body.style.height = `${windowHeight}px`;
                    if(navMain && body.classList.contains('active-menu')) navMain.style.height = `${windowHeight-50}px`;
                } else {
                    body.style.height = '';
                    if(navMain) navMain.style.height = '';
                }
            }
        });
    });
    const config = { attributes: true };

    // Observer starten und das Ziel-Element und die Konfiguration übergeben
    observer.observe(body, config);
}

var checkPosition = function(e) {
    var header = document.querySelector('header'),
        top = window.scrollY;

    if ( header !== null ) {
    // Überprüfe, ob der Benutzer 50 Pixel nach unten gescrollt hat
        if ( top > 50 ) {
            header.classList.add('fluid');
        } else {
            header.classList.remove('fluid');
        }
    }
};

function initTabs() {
    // Tabs
    $tabTitleLink = $('.tabs .tabs-title > a');

    $tabTitleLink.on('click', function (e) {
        e.preventDefault();

        var $this = $(this),
            panelID = $this.attr('href'),
            $tabTitle = $this.parent(),
            $tab = $tabTitle.parent(),
            tabID = $tab.attr('id');

        if ( !$tabTitle.hasClass('is-active') ) {
            //-- Tabs --
            $tab.children('.tabs-title').removeClass('is-active').children('a').attr('aria-selected', 'false');
            $tabTitle.addClass('is-active');
            $this.attr('aria-selected', 'true');

            //-- Content --
            var $tabsContent = $('[data-tabs-content="' + tabID + '"]'),
                $tabPanel = $tabsContent.find(panelID);
            $tabsContent.find('.tabs-panel').removeClass('is-active');
            $tabPanel.addClass('is-active');
        }
    });
}

function userMenuBtn() {
    //-- User Menu Btn --
    $menuBtn = $('#user-menu-btn');

    $menuBtn.on('click', function(e) {
        var $this = $(this);

        if ( $this.hasClass('active') && ! $(e.target).is('.user-menu') ) {
            $this.removeClass('active');
        } else {
            $this.addClass('active');
        }
    });

    $menuBtn.on('blur', function() {
        var $this = $(this);

        if ( !$this.is(':hover') && $this.hasClass('active') ) {
            $this.removeClass('active');
        }
    });
}

function scrollTrigger() {

    function checkVisibility(className, offset = 100) {
        var elements = document.querySelectorAll('.' + className);

        elements.forEach(function(element) {
            var rect = element.getBoundingClientRect();
            var windowHeight = window.innerHeight || document.documentElement.clientHeight;
            var topThreshold = offset;
            var bottomThreshold = windowHeight - offset;

            if ( rect.top >= topThreshold && rect.top <= bottomThreshold || rect.bottom >= topThreshold && rect.bottom <= bottomThreshold ) {
                
                if (!element.classList.contains('visible')) {
                    element.classList.add('visible');
                }
            }
        });
    }

    checkVisibility('currentWatch-slider'); // Überprüfe beim Laden der Seite
    checkVisibility('genre-slider'); // Überprüfe beim Laden der Seite
    checkVisibility('scroller'); // Überprüfe beim Laden der Seite
}

function formLabels() {
    var inputs = [];
    const inputTypes = [
        'input[type="text"]',
        'input[type="number"]',
        'input[type="email"]',
        'input[type="tel"]',
        'input[type="password"]',
        'select',
        'textarea'
    ];    

    inputTypes.forEach(function(type) {
        inputs.push(...document.querySelectorAll(type));
    });

    function labelBorderColor(input, state = 'normal') {
        const inputID = input.getAttribute('id');
        const label = document.querySelector(`label[for="${inputID}"]`);
        if (!label) return;

        const colors = {
            normal: '--input-bg',
            hover: '--input-bg-hover',
            focus: '--input-bg-focus'
        };
   
        label.style.borderColor = `var(${colors[state]})`;
    }

    function labelFloat(input, state = 'normal') {
        const inputID = input.getAttribute('id');
        const label = document.querySelector(`label[for="${inputID}"]`);//.textContent
        if ( !label ) return;

        if (input.value !== '') {
            if (!label.classList.contains('filled')) label.classList.add('filled');
            if (label.classList.contains('filled') && state === 'unset') state = 'normal';
            else if (label.classList.contains('filled') && label.classList.contains('focus')) state = 'focus';            
        } else {
            if (state === 'unset') {
                label.classList.remove('filled');
                state = 'normal';
            }
            if (!label.classList.contains('filled') && state === 'focus') {
                label.classList.add('filled');
                state = 'focus';
            }
            if (!label.classList.contains('filled') && state !== 'focus') {
                label.classList.remove('filled');
            }
            if (label.classList.contains('filled') && label.classList.contains('focus')) state = 'focus';
        }

        if (state !== 'unset') {
            label.classList.remove('hover', 'focus');
            if (state !== 'normal') label.classList.add(state);
            
            labelBorderColor(input, state);
        }
    }
            
    inputs.forEach((input) => {
        labelFloat(input);

        input.addEventListener('mouseenter', function() {
            labelFloat(input, 'hover');
        });
        input.addEventListener('mouseout', function() {
            labelFloat(input);
        });
        input.addEventListener('focus', function() {
            labelFloat(input, 'focus');
        });
        input.addEventListener('blur', function() {
            labelFloat(input, 'unset');
        });
        input.addEventListener('input', function() {
            labelFloat(input, 'focus');
        });
    });

    var passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach((input) => {
        const parentElement = input.parentElement;
        const existingCheckbox = parentElement.querySelector('input[type="checkbox"]');
        parentElement.classList.add('password-wrap');

        if (!existingCheckbox) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('show-psswd');
    
            input.insertAdjacentElement('afterend', checkbox);
    
            checkbox.addEventListener('change', function(event) {
                if (input.type === "password") {
                    input.type = "text";
                } else {
                    input.type = "password";
                }
            });
        }
    });
}

function YTplayer() {
    var playerIframe = document.getElementById('player');
    var highlight = document.getElementById('highlight');

    if (playerIframe) {
        var videoID = playerIframe.getAttribute('data-trailer-id');
        const muteBtn = document.getElementById('player-btn');

        const player = new YT.Player('player', {
            height: '1920',
            width: '1080',
            videoId: videoID,
            playerVars: {
                'enablejsapi': 1,
                'controls': 0, // Steuerelemente deaktivieren
                'disablekb': 1, // Tastatursteuerung deaktivieren
                'modestbranding': 1, // YouTube-Logo im Player deaktivieren
                'rel': 0, // Verwandte Videos am Ende deaktivieren
                'showinfo': 0, // Videoinformationen beim Start deaktivieren
                'autoplay': 1, // Autoplay aktivieren
                'loop': 0,
                'cc_load_policy': 0,
                'iv_load_policy': 3, // Video wiederholen
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });

        function startVideo() {
            player.playVideo();
        }

        function onPlayerReady(event) {
            // player.mute();
            if (event.data == null) {
                setTimeout(function() {
                    event.target.startVideo();
                }, 1000);
            }
        }

        var done = false;
        function onPlayerStateChange(event) {
            if (player.isMuted()) {
                muteBtn.classList.remove('unmute');
                muteBtn.classList.add('mute');
            } else {
                muteBtn.classList.remove('mute');
                muteBtn.classList.add('unmute');
            }

            if (event.data == YT.PlayerState.ENDED && !done && highlight) {
                setTimeout(hideVideo, 1000);
                done = true;
            }
        }

        function hideVideo() {
            document.getElementById('player-wrap').style.opacity = '0';
            setTimeout(function() {
                document.getElementById('player-wrap').style.display = 'none';
            }, 350);
        }

        muteBtn.addEventListener('click', function() {
            this.classList.toggle('unmute');
            this.classList.toggle('mute');

            if (this.classList.contains('mute')) {
                player.mute();
            } else {
                player.unMute();
            }
        });
    }
}

function ambientInit() {
    var player = document.querySelector('.modal .player');
    if (player) player.classList.remove('player');
    var ambientlight = document.querySelector('.modal .player-copy');
    if (ambientlight) ambientlight.classList.remove('player-copy');
    const origin = window.location.origin;

    if (player && ambientlight) {
        var videoID = player.id;
        var ambientReady;
        ambientReady = false;

        player = new YT.Player(player, {
            height: '1920',
            width: '1080',
            videoId: videoID,
            playerVars: {
                'enablejsapi': 1,
                'origin': origin
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onPlaybackRateChange': onPlaybackRateChange
            }
        });

        ambientlight = new YT.Player(ambientlight, {
            height: '1920',
            width: '1080',
            videoId: videoID,
            playerVars: {
                'enablejsapi': 1,
                'mute': 1,
                'origin': origin
            },
            events: {
                'onReady': onCopyReady
            }
        });
    }

    function onPlayerReady(event) {
        if (!ambientlight) return;
    }
    
    function onCopyReady(event) {
        ambientReady = true;
        event.target.mute();
        event.target.playVideo();
        event.target.pauseVideo();
        event.target.seekTo(0.0065, true);
    }

    function onPlayerStateChange(event) {
        if (!ambientReady) return;

        switch (event.data) {
            case YT.PlayerState.PLAYING:
            ambientlight.playVideo();
            currentTime = player.getCurrentTime();
            console.log(currentTime);
            ambientlight.seekTo(currentTime+0.0065, true);           
            break;
            case YT.PlayerState.PAUSED:
            ambientlight.pauseVideo();
            break;
            case YT.PlayerState.ENDED:
            ambientlight.seekTo(0, false);
            ambientlight.pauseVideo();
            break;
        }
    }

    function onPlaybackRateChange() {
        if (!ambientlight) return;
        ambientlight.setPlaybackRate(player.getPlaybackRate());
    }
}

function initCustomJS() {
    document.body.classList.remove('loading');

    domObserver();
    checkPosition();
    // initSliders();
    initTabs();
    scrollTrigger();
    formLabels();
    resizeElementHeight();
    mobileBodyHeightFix();

    window.addEventListener('resize', debounce);
    window.addEventListener('scroll', debounceScroll);
    window.scrollTo({
       behavior: 'instant' 
    });
}

window.initCustomJS = initCustomJS;