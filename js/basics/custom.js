function forEach(ctn, callback) {
    return Array.prototype.forEach.call(ctn, callback);
}

// $(document).ready(function() {
//     page = {
//         $window: $(window),
//         $html: $('html'),
//         $body: $('body'),
//         $header: $('header'),
//         $masterWrap: $('#masterWrap'),
//         $menuButton: $('.menu-button'),

//         mobileSize: 1080,
//         tabletSize: 1600,
//         activeClass: 'is-active',
//         activeMenu: 'active-menu',
//         activeButton:'active-button',
//         src: "data-desktop-src",
//         videosrc: "desktop-src",

//         init: function () {
//             var self = this;

//             // self.initApp();
//             // self.bindHandlers();
//             self.themeChange();
//             // self.desktopViewportCheck();
//             //self.fixedHeader();
//             //self.navMobile();
//             self.pageReady();
//         },

//         bindHandlers: function () {
//             var self = this;

//             //window.addEventListener('resize', debounce);
//             // window.addEventListener('scroll', debounceScroll);
//         },

//         pageReady: function() {
//             var self = this;
//             // $('#loader').addClass('hidden');
//             $("body").removeClass('loading');
            
//             // self.fancyLoad();
//         },

//         initPlayer: function() {
//             var self = this;
//                 if ( $('#player').length > 0 ) {
//                     var player = videojs('player');
//                     video = $('video')[0];
    
//                     // Warten Sie auf das "loadedmetadata"-Ereignis, um sicherzustellen, dass das Video geladen ist
//                     video.addEventListener("loadedmetadata", function() {
//                         $('#player-back-btn').appendTo(".video-js");
//                         $('#player-session-btn').appendTo(".video-js");
//                         $('#chat-open').appendTo(".video-js");
//                         $('#player-sek-forward').appendTo(".video-js .vjs-control-bar");
//                         $('#player-sek-back').appendTo(".video-js .vjs-control-bar");
                        
//                         if ( $('#next-episode-btn').length > 0 ) {
//                             $('#next-episode-btn').appendTo(".video-js");
//                         }
//                         if ( $('#show-container').length > 0 ) {
//                             $('#show-container').appendTo(".video-js");
//                         }
//                         if ( $('#show-eps-btn').length > 0 ) {
//                             $('#show-eps-btn').appendTo(".video-js .vjs-control-bar");
//                         }
                        
//                     });
    
//                     player.on('play', function() {
//                         self.repositionPlayerButtons();
//                     });                
    
//                     $nextEpisodeBtn = $("#next-episode-btn");
    
//                     if ( $nextEpisodeBtn ){
//                         video.addEventListener("timeupdate", function() {
//                             const currentTime = video.currentTime;
//                             const duration = video.duration;
//                             const last20Seconds = duration - 20;
    
//                             if (currentTime >= last20Seconds) {
//                                 $nextEpisodeBtn.addClass("visible");
//                             }
    
//                             if (currentTime <= last20Seconds && $nextEpisodeBtn.hasClass("visible") ) {
//                                 $nextEpisodeBtn.removeClass("visible");
//                             }
//                         });
//                     }
    
//                     showContainer = '#show-container';
    
//                     $(showContainer+' .menu li>a').on('click', function(e) {
//                         e.preventDefault();
    
//                         $(showContainer).addClass('active-submenu');
//                         listID = $(this).attr('data-id');
    
//                         $(showContainer+' ul.sub-menu#'+listID).addClass('active');
//                     });
    
//                     $(showContainer+' .sub-menu .back').on('click', function(e) {
//                         e.preventDefault();
    
//                         $(showContainer).removeClass('active-submenu');
    
//                         $(showContainer+' ul.sub-menu').removeClass('active');
//                     });
    
//                     $('a#show-eps-btn').on('click', function(e) {
//                         e.preventDefault();
    
//                         $(showContainer).toggleClass('visible');
//                     });
    
//                     $('#player-sek-forward').on('click', function(e) {
//                         e.preventDefault();
    
//                         player.currentTime(player.currentTime() + 10);
//                     });
    
//                     $('#player-sek-back').on('click', function(e) {
//                         e.preventDefault();
    
//                         player.currentTime(player.currentTime() - 10);
//                     });
    
//                     $('#chat-open').on('click', function(e) {
//                         e.preventDefault();
//                         $('#chat').toggleClass('hidden');
//                     });
    
//                     $('#chat-close').on('click', function() {
//                         $('#chat').toggleClass('hidden');
//                     });
//                 }
//         },

//         repositionPlayerButtons: function() {
//             $fullscreen = $('.vjs-fullscreen-control');
//             $currTime = $('.vjs-current-time');
//             $divider = $('.vjs-time-divider');
//             $duration = $('.vjs-duration');

//             if ( $('#show-eps-btn').length > 0 ) {
//                 $epsBtnWidth = $('#show-eps-btn').outerWidth();
//                 $('#show-eps-btn').css('right', $fullscreen.outerWidth());
//             } else {
//                 $epsBtnWidth = 0;
//             }

//             $duration.css('right', ( $fullscreen.outerWidth() + $epsBtnWidth ));
//             $divider.css('right', ( $fullscreen.outerWidth() + $epsBtnWidth + $duration.outerWidth() ));
//             $currTime.css('right', ( $fullscreen.outerWidth() + $epsBtnWidth + $duration.outerWidth() + $divider.outerWidth() ));
//         },
//     }

//     page.init();
// });

// var resizeTimer,
// debounce = function(e) {
//     clearTimeout(resizeTimer);
//     resizeTimer = setTimeout(function() {
//         page.resizeHook();
//     }, 50);
// };

var resizeTimerScroll,
debounceScroll = function(e){
	clearTimeout(resizeTimerScroll);
	resizeTimerScroll = setTimeout(function() {
		checkPosition();
        scrollTrigger();
	}, 10);
};

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

function initSliders() {
    // Slider
    sliderNumber = 0;
    $(".swiper").each(function () {
        var $el = $(this);
        const sliderClass = 'swiper-' + sliderNumber;
        const slider = '.swiper-' + sliderNumber;

        $el.addClass(sliderClass);
        var itemsMobile = 2;
        var itemsSmallTablet = 3;
        var itemsTablet = 4;
        var itemsDesktop = 6;

        const swiper = new Swiper(slider, {
            // Optional parameters
            loop: true,
            //effect: effect,
            slidesPerView: itemsMobile,
            slidesPerGroup: itemsMobile,
            spaceBetween: 16,
            allowTouchMove: true,
            breakpoints: {
                // when window width is >= 320px
                720: {
                    slidesPerView: itemsSmallTablet,
                    slidesPerGroup: Math.ceil(itemsSmallTablet/2),
                },
                1080: {
                    slidesPerView: itemsTablet,
                    slidesPerGroup: Math.ceil(itemsTablet/2),
                },
                1400: {
                    slidesPerView: itemsDesktop,
                    slidesPerGroup: Math.ceil(itemsDesktop/2),
                }
            },
            
            pagination: {
                el: '.swiper-pagination',
                // clickable: true
            },

            // Navigation arrows
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });

        // swiper.on('resize', function() {
        //     setTimeout(() => {
        //         var self = this;
        //         swiperLoopCheck(self);
        //     }, 1000);
        // });

        $el.find('[data-fancybox="gallery"]').each(function() {
            var $this = $(this);
            $this.attr('data-fancybox', sliderClass);
        })
        
        sliderNumber++;
    });
}

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
    })
}

function initCustomJS() {
    document.body.classList.remove('loading');

    checkPosition();
    initSliders();
    initTabs();
    scrollTrigger();
    formLabels();


    // window.addEventListener('resize', debounce);
    window.addEventListener('scroll', debounceScroll);
    window.scrollTo({
       behavior: 'instant' 
    });
}

window.initCustomJS = initCustomJS;