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

//         themeChange: function () {
//             var self = this,
//                 pageTheme = 'pageTheme',
//                 $themeSwitch = $('#theme-switch');

//             $themeSwitch.on('click', function(e) {
//                 e.preventDefault();

//                 function getCookie(name) {
//                     const value = `; ${document.cookie}`;
//                     const parts = value.split(`; ${name}=`);
//                     if (parts.length === 2) return parts.pop().split(';').shift();
//                 }

//                 expireDate = new Date(Math.floor(new Date().getTime() + (86400000 * 365)));

//                 if( self.$html.attr('data-theme') === 'light' ) {
//                     document.cookie = pageTheme + "=dark; path=/; expires=" + expireDate;
//                     self.$html.attr('data-theme', 'dark');
//                 } else {
//                     document.cookie = pageTheme + "=light; path=/; expires=" + expireDate;
//                     self.$html.attr('data-theme', 'light');
//                 }
//             })
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

//         highlightIFrame: function() {
//             var player;

//             if ( $('#highlightTrailer').length > 0 ) {
//                 // Player erstellen, wenn die API bereit ist
//                 player = new YT.Player('highlightTrailer', {
//                     events: {
//                     'onReady': onPlayerReady,
//                     'onStateChange': onPlayerStateChange
//                     }
//                 });

//                 function onPlayerReady(event) {
//                     // Das Video ist bereit
//                     event.target.playVideo(); // Video abspielen
//                 }

//                 function onPlayerStateChange(event) {
//                     // Wenn das Video beendet ist
//                     if (event.data == YT.PlayerState.ENDED) {
//                         $('.content-wrap.desktop-only').css('opacity', '1');
//                         $('.content-wrap.desktop-only').css('pointer-events', 'all');
//                         player['g'].style.opacity = '0';

//                         setTimeout(function() {
//                             player['g'].style.display = 'none';
//                         }, 300);
//                         // Hier können Sie weitere Aktionen ausführen
//                     }
//                 }
//             }
//         }
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
        var slidesPerViewMobile = 2;
        var slidesPerViewSmallTablet = 3;
        var slidesPerViewTablet = 4;
        var slidesPerViewDesktop = 6;
        var smallTabletBP = 720;
        var tabletBP = 1080;
        var desktopBP = 1400;

        function swiperLoopCheck(swiper) {
            bp = window.innerWidth;

            if ( bp >= desktopBP ) {
                if ( $(slider + ' .swiper-slide').length > slidesPerViewDesktop ) {
                    swiper.loop = true;
                } else {
                    swiper.loop = false;
                }
            } else if ( bp >= tabletBP ) {
                if ( $(slider + ' .swiper-slide').length > slidesPerViewTablet ) {
                    swiper.loop = true;
                } else {
                    swiper.loop = false;
                }
            } else if ( bp >= smallTabletBP ) {
                if ( $(slider + ' .swiper-slide').length > slidesPerViewSmallTablet ) {
                    swiper.loop = true;
                } else {
                    swiper.loop = false;
                }
            } else {
                if ( $(slider + ' .swiper-slide').length > slidesPerViewMobile ) {
                    swiper.loop = true;
                } else {
                    swiper.loop = false;
                }
            }

            swiper.update();
        }


        const swiper = new Swiper(slider, {
            // Optional parameters
            loop: true,
            //effect: effect,
            slidesPerView: slidesPerViewMobile,//itemsMobile,
            slidesPerGroup: slidesPerViewMobile,
            spaceBetween: 16,
            allowTouchMove: true,
            breakpoints: {
                // when window width is >= 320px
                720: {
                    slidesPerView: slidesPerViewSmallTablet,
                    slidesPerGroup: slidesPerViewSmallTablet,
                },
                1080: {
                    slidesPerView: slidesPerViewTablet,
                    slidesPerGroup: slidesPerViewTablet,
                },
                1400: {
                    slidesPerView: slidesPerViewDesktop,
                    slidesPerGroup: slidesPerViewDesktop,
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

function initCustomJS() {
    document.body.classList.remove('loading');

    checkPosition();
    initSliders();
    initTabs();
    scrollTrigger();


    // window.addEventListener('resize', debounce);
    window.addEventListener('scroll', debounceScroll);
    window.scrollTo({
       behavior: 'instant' 
    });
}

window.initCustomJS = initCustomJS;