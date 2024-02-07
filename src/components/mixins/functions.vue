<script>
import langSnippet from './language.vue';
import axios from 'axios';

export default {
    name: 'MainFunctions',
    mixins: [langSnippet],
    emits: ['data-fetched'],
    methods: {
        toggleMainMenu(event) {
            event.preventDefault();
            var menuBtn = document.getElementById('menu-button');
            document.body.classList.toggle('active-menu');
            menuBtn.classList.toggle('active-button');
        },
        userBtnTrigger() {
            var userBtn = document.getElementById('user-menu-btn');

            if (userBtn.classList.contains('active')) {
                userBtn.classList.remove('active');
            } else {
                userBtn.classList.add('active');
            }
        },

        async createContent(media) {
            var newMedia = {
                'genre': [],
                'mediaDetails': {},
                'seasons': [],
                'episodes': []
            }

            var genre = null;

            for (let x = 0; x < media['genre'].length; x++) {
                genre = media['genre'][x];
                newMedia['genre'].push(genre);
            }

            Object.entries(media['mediaDetails']).forEach(([key, value]) => {
                newMedia['mediaDetails'][key] = value;
            });

            if (media['seasons']) {
                Object.entries(media['seasons']).forEach(([key, value]) => {
                    newMedia['seasons'][key] = value;
                });
            }
            if (media['episodes']) {
                Object.entries(media['episodes']).forEach(([key, value]) => {
                    newMedia['episodes'][key] = value;
                });
            }
            
            return newMedia;
        },
        async openMediaPopUp(media, event) {
            this.createContent(media).then((newMedia) => {
                this.$emit('data-fetched', newMedia);
                this.openPopUp('media-content', event); 
            });                       
        },

        openPopUp(popUpID, event) {
            event.preventDefault();
            var modal = document.getElementById(popUpID);
            
            document.body.classList.add('active-modal');
            modal.classList.add('active');
        },
        closePopUp(popUpID, event) {
            event.preventDefault();
            this.$emit('data-fetched', null);
            var modal = document.getElementById(popUpID);

            document.body.classList.remove('active-modal');
            modal.classList.remove('active');
        },
        disableButton(button) {
            button.disabled = true;
            button.classList.add('is-loading');
        },
        enableButton(button) {
            setTimeout(() => {
                button.classList.remove('is-loading');
                button.classList.add('saved');

                setTimeout(() => {
                    button.disabled = false;
                    button.classList.remove('saved');
                }, 1000);
            }, 1000);
        },
        runtime(time) {
            var hours = Math.floor(time/60);
            var restMinutes = parseInt(time % 60);
            var minutesText = '';
            var hourText = '';

            if ( !(restMinutes <= 1) ) {
                minutesText = this.langSnippet('minutes');
            } else if ( restMinutes < 1 ) {
                restMinutes = '';
                minutesText = '';
            } else {
                minutesText = this.langSnippet('minute');
            }

            if ( hours > 0 ) {
                if ( hours <= 1 ) {
                    hourText = this.langSnippet('hour');
                } else {
                    hourText = this.langSnippet('hours');
                }

                var finalRuntime = hours+' '+hourText+' '+restMinutes+' '+minutesText;
            } else {
                finalRuntime = restMinutes+' '+minutesText;
            }

            return finalRuntime;
        },
        SelectTabs(event) {
            event.preventDefault();
            var selectID = event.target.id;
            var selectValue = event.target.value;
            document.querySelectorAll(`.${selectID}.is-active`)[0].classList.remove('is-active');
            document.querySelectorAll(`.${selectID}[data-select-tab="${selectValue}`)[0].classList.add('is-active');
        },
        callout(type, message) {
            const callout = document.getElementById('callout');
            const calloutText = document.getElementById('callout-content');
            const active = 'active';
            const calloutID = parseInt(callout.getAttribute('data-id'));
            var i = 0;
            var intervalID;
            var animationTime;
            var newCalloutID;

            callout.setAttribute('data-time', 0);

            function setCallout() {
                newCalloutID = parseInt(callout.getAttribute('data-id'));

                if ( (newCalloutID-1) !== calloutID ) {
                    i = 5000;
                    animationTime = 5000;
                    callout.classList.remove('active');
                    clearInterval(intervalID);
                }

                animationTime = parseInt(callout.getAttribute('data-time'));

                if ( !callout.classList.contains(active) && i === 0 ) {
                    callout.setAttribute('data-type', type);
                    calloutText.textContent = message;
                    callout.classList.add(active);
                }
                if ( animationTime !== i ) {
                    i = 0;
                    animationTime = 0;
                    callout.setAttribute('data-time', i);               
                }
                if ( i >= 5000 ) {
                    callout.classList.remove('active');
                    clearInterval(intervalID);
                } else {
                    i = i+500;
                    callout.setAttribute('data-time', i);
                }                
            }

            callout.setAttribute('data-id', calloutID+1);
            intervalID = setInterval(setCallout, 500);
        },
        async sessionUser() {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/session`, { withCredentials: true });
                return new Promise((resolve) => {
                    resolve(response.data.user.id);
                });
            } catch(err) {
                console.log(err);
                return 0;
            }
        },
        async checkWatchlist(mediaID) {
            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/session`, { withCredentials: true });
                const userID = response.data.user.id;
                const newResponse = await axios.get(`${this.$mainURL}:3000/api/db/getFromWatchlist?userID=${userID}&mediaID=${mediaID}`);
                const status = newResponse.data;
                return status;
            } catch(err) {
                console.log(err);
                return 0;
            }
        },
        async watchListTrigger(userID, mediaID, buttonID) {
            var button = document.getElementById(buttonID);

            try {
                const response = await axios.get(`${this.$mainURL}:3000/api/db/updateWatchlist?userID=${userID}&mediaID=${mediaID}`);
                var trigger = response.data;
                if (trigger === 1) {
                    button.classList.add('liked');
                } else {
                    button.classList.remove('liked');
                }
            } catch(err) {
                console.log(err);
            }
        }
    }
};
</script>