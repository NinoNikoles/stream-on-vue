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
            const callout = document.getElementById('callout'),
                success = 'success',
                warning = 'warning',
                alert = 'alert';

            function clearCallout() {
                if ( !callout.classList.contains('hidden') ) {
                    callout.classList.add('hidden');

                    setTimeout(() => {
                        if ( callout.classList.contains(success) ) callout.classList.remove(success);
                        if ( callout.classList.contains(warning) ) callout.classList.remove(warning);
                        if ( callout.classList.contains(alert) ) callout.classList.remove(alert);
                        callout.innerHTML = "";
                    }, 1000);
                } else {
                    if ( callout.classList.contains(success) ) callout.classList.remove(success);
                    if ( callout.classList.contains(warning) ) callout.classList.remove(warning);
                    if ( callout.classList.contains(alert) ) callout.classList.remove(alert);
                    callout.innerHTML = "";
                }
            }

            function setCallout() {
                callout.classList.add(type);
                callout.innerHTML = '<p id="callout-content">'+message+'</p>';
                callout.classList.remove('hidden');
            }

            clearCallout();

            setTimeout(() => {
                if ( type === success ) {
                    setCallout();
                    setTimeout(() => {
                        clearCallout();
                    }, 5000);
                } else {
                    setCallout();
                }
            }, 500);
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