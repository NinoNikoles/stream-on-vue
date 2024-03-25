<script>
import langSnippet from './language.vue';
import axios from 'axios';

export default {
    name: 'MainFunctions',
    mixins: [langSnippet],
    emits: ['data-fetched'],
    methods: {
        async get(query, like = null) {
            try {
                var request = `${this.$mainURL}:3000/api/db/getQuery?query=${query}`;
                if (like) request += `&like=${like}`;

                var response = await axios.get(request);
                return response.data;
            } catch (err) {
                return err;
            }            
        },
        async fetchDB(request, values = {}, credentials = {}) {
            try {
                var response = await axios.get(`${this.$mainURL}:3000/api/db/${request}`, values, credentials);
                return new Promise((resolve) => {
                    resolve(response);
                });
            } catch(err) {
                return err;
            }
        },
        async postDB(request, values = {}, credentials = {}) {
            await axios.post(`${this.$mainURL}:3000/api/db/${request}`, values, credentials);
        },
        tmdbIDinArray(element, arr) {
            var equal = false;

            if ( arr.length > 0 ) {
                for (let i = 0; i < arr.length; i++) {
                    if ( element === arr[i].tmdbID ) {
                        equal = true;
                        return equal;
                    }
                }
            }
            return false;
        },
        async getSeasons(showID) {
            try {
                const response = await this.fetchDB(`getSeasons?showID=${showID}`);
                return response.data;                
            } catch (error) {
                // Benutzer ist nicht angemeldet, leiten Sie ihn zur Login-Seite weiter
                console.log(error);
            }
        },
        async getEpisodes(showID) {
            try {
                const response = await this.fetchDB(`getEpisodes?showID=${showID}`);
                return response.data;                
            } catch (error) {
                // Benutzer ist nicht angemeldet, leiten Sie ihn zur Login-Seite weiter
                console.log(error);
            }
        },
        async getAllMediaInfos(orderBy = null, orderType = null, ids = null, type = null, userID = null, watchlist = null, mediaWatched = null) {
            var mediaInfos = [];
            let query =
            `SELECT media.*, json_group_array(genre.genre_name) AS genre_names,
                CASE WHEN watchlist.user_id IS NOT NULL THEN 1 ELSE 0 END AS in_watchlist,
                media_watched.watched_seconds,
                media_watched.total_length,
                media_watched.watched,
                media_watched.last_watched`;

            query +=
            ` FROM media
            LEFT JOIN watchlist ON media.tmdbID = watchlist.media_id AND watchlist.user_id = ${userID}
            LEFT JOIN genre ON EXISTS (
                SELECT 1
                FROM json_each(media.genres) AS json_genre
                WHERE json_genre.value = genre.genre_id
            )`;

            if (this.$data.userID && !userID) userID = this.$data.userID;
            if (!this.$data.userID && !userID && this.$data.currentUser.id) userID = this.$data.currentUser.id;
            // Wenn nicht alle Medien ausgegeben werden sollen
            if ( !mediaWatched ) query += `
            LEFT JOIN media_watched ON media.tmdbID = media_watched.media_id AND media_watched.user_id = ${userID}`;
            
            // Wenn NUR geschaute Medien ausgegeben werden sollen
            if ( mediaWatched === 1 ) query += `
            INNER JOIN media_watched ON media.tmdbID = media_watched.media_id AND media_watched.user_id = ${userID}`;

            // Wenn bestimmte Medien ausgewählt werden sollen
            if ( type || ids || watchlist === 1 ) query += `
            WHERE`;

            if ( type ) query += ` media.media_type = '${type}'`; // Wenn nur Filme ODER Serien ausgewählt werden sollen
            if ( type && ids ) { // Wenn nur bestimmte Filme ODER bestimmte Serien ausgewählt werden sollen
                query += `
                AND media.tmdbID IN (${ids.join(', ')})`;
            } else if ( !type && ids ) { // Wenn nur bestimmte Filme UND bestimmte Serien ausgewählt werden sollen
                query += ` media.tmdbID IN (${ids.join(', ')})`;
            }

            if ( type && ids && watchlist === 1 ) {
                query += `
                AND in_watchlist = 1`;
            } else if ( !type && ids && watchlist === 1 ) {
                query += `
                AND in_watchlist = 1`;
            } else if ( !type && !ids && watchlist === 1 ) {
                query += ` in_watchlist = 1`;
            }

            query += `
            GROUP BY media.tmdbID`;

            if (orderBy) query += `
            ORDER BY ${orderBy}`;
            if (orderType) query += ` ${orderType}`;

            try {
                mediaInfos = await this.get(query);
            } catch (err) {
                console.log(err);
            }

            for (let i = 0; i < mediaInfos.length; i++) {
                // Gets all seasons and episodes if media is show
                if (mediaInfos[i].media_type === "show") {
                    try {                                    
                        mediaInfos[i]['seasons'] = await this.getSeasons(mediaInfos[i].tmdbID);
                        mediaInfos[i]['episodes'] = await this.getEpisodes(mediaInfos[i].tmdbID);                      
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
            return mediaInfos;
        },
        async getGenre() {
            const response = await this.fetchDB(`allGenre`);
            return response.data;
        },
        async getGenreName(genreID) {
            const response = await this.fetchDB(`genreNameByID?id=${genreID}`);
            return response.data[0].genre_name;
        },
        toggleMainMenu(event) {
            event.preventDefault();
            var menuBtn = document.getElementById('menu-button');
            document.body.classList.toggle('active-menu');
            menuBtn.classList.toggle('active-button');
        },
        closeMainMenu() {
            var menuBtn = document.getElementById('menu-button');
            document.body.classList.remove('active-menu');
            menuBtn.classList.remove('active-button');
        },
        openMediaPopUp(data) {
            var media = data[0],
                e = data[1];
            this.$emit('mediaPopUp', media);
            this.openPopUp(e);
        },
        openPopUp(event) {
            event.preventDefault();
            var body = document.body;
            var modal = document.getElementById('media-content');
            
            body.classList.add('active-modal');
            modal.classList.add('active');
        },
        async closePopUp(event) {
            event.preventDefault();
            this.$emit('data-fetched', null);
            var modal = document.getElementById('media-content');

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
                const response = await this.fetchDB(`session`, { withCredentials: true });
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
                const response = await this.fetchDB(`session`, { withCredentials: true });
                const userID = response.data.user.id;
                const newResponse = await this.fetchDB(`getFromWatchlist?userID=${userID}&mediaID=${mediaID}`);
                var status = newResponse.data;
                return status;
            } catch(err) {
                console.log(err);
                return 0;
            }
        },
        async watchListTrigger(userID, mediaID, buttonID) {
            var button = document.getElementById(buttonID);

            try {
                const response = await this.fetchDB(`updateWatchlist?userID=${userID}&mediaID=${mediaID}`);
                var status = response.data;
                button.setAttribute('data-status', status);
            } catch(err) {
                console.log(err);
            }
        },
        filterByGenre(event) {
            var $this = document.getElementById(event.target.id);
            var selectedGenre = $this.value;
            var mediaList = document.querySelectorAll('#media-list .media');

            for (var i = 0; i < mediaList.length; i++) {
                if ( selectedGenre === 'all' ) {
                    mediaList[i].classList.remove('hidden-by-genre');
                } else {
                    var mediaGenres = JSON.parse(mediaList[i].getAttribute('data-genre'));
                    if ( !mediaGenres.includes(parseInt(selectedGenre)) ) {
                        mediaList[i].classList.add('hidden-by-genre');
                    } else {
                        mediaList[i].classList.remove('hidden-by-genre'); 
                    }
                }
            }
        },
        filterBySetting(event) {
            var $this = document.getElementById(event.target.id);
            var selectedFilter = $this.value.slice(1, -1).split(",");
            var filter = selectedFilter[0];
            var order = selectedFilter[1];
            var mediaList = Array.from(document.querySelectorAll('#media-list .media'));
            var itemA, itemB;

            mediaList.sort((a, b) => {
                if ( filter === 'title' ) {
                    itemA = a.dataset.title.toUpperCase();
                    itemB = b.dataset.title.toUpperCase();
                } else if ( filter === 'rating' ) {
                    itemA = parseFloat(a.dataset.rating);
                    itemB = parseFloat(b.dataset.rating);
                }

                if (order === 'ASC') {
                    if (itemA < itemB) return -1;
                    if (itemA > itemB) return 1;
                } else if (order === 'DESC') {
                    if (itemA < itemB) return 1;
                    if (itemA > itemB) return -1;
                }
                return 0;
            });

            const container = document.getElementById('media-list');
            container.innerHTML = '';
            mediaList.forEach(item => container.appendChild(item));
        },


        //-- API --
        async fetchUserSession() {
            try {
                const response = await this.fetchDB(`session`, { withCredentials: true });
                if ( response.data.user ) {
                    const userData = {
                        isLoggedIn: response.data.user.isLoggedIn,
                        id: response.data.user.id,
                        username: response.data.user.name,
                        role: response.data.user.role
                    }
                    return userData;
                }               
            } catch (error) {
                return error;
            }
        },
        async logout_function() {
            try {
                await this.postDB(`logout`, { username: '', role: ''}, { withCredentials: true })
                .then(() => {
                    window.location.href = '/';               
                })
                .catch((error) => {
                    // Fehler bei der Anmeldung
                    console.error('Logout failed', error);
                });
            } catch(err) {
                console.log(err);
            }
        },
        themeChange(e) {
            e.preventDefault();
            const html = document.documentElement;
            const pageTheme = 'pageTheme';
            
            
            if (html.getAttribute('data-theme') !== 'light') {
                localStorage.setItem(pageTheme, 'light');
                html.setAttribute('data-theme', 'light');
            } else {
                localStorage.setItem(pageTheme, 'dark');
                html.setAttribute('data-theme', 'dark');
            }
        },
        async getDesign() {
            try {
                var response = await this.get(`SELECT * FROM settings WHERE setting_name ='design'`);
                if ( response[0].setting_option ) document.getElementById('main').classList.add('is-rounded');
            } catch(err) {
                console.log(err);
            }
        },
    }
};
</script>