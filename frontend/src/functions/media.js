import { fetchDB } from './database';

export async function getSeasons(showID) {
    const response = await fetchDB(`getSeasons?showID=${showID}`);
    return new Promise((resolve) => {
        resolve(response.data);
    });
}

export async function getEpisodes(showID) {
    const response = await fetchDB(`getEpisodes?showID=${showID}`);
    return new Promise((resolve) => {
        resolve(response.data);
    });
}

export async function getAllMediaInfos(orderBy = null, orderType = null, ids = null, type = null, watchlist = null, mediaWatched = null) {
    var mediaInfos = [];
    let query =
        `SELECT media.*, 
                json_group_array(genre.genre_name) AS genre_names,
                CASE WHEN watchlist.user_id IS NOT NULL THEN 1 ELSE 0 END AS in_watchlist,
                media_watched.watched_seconds,
                media_watched.total_length,
                media_watched.watched,
                media_watched.last_watched,
                CASE 
                    WHEN media_watched.show_id IS NOT NULL THEN media_watched.media_id
                    ELSE NULL
                END AS episode_id
        FROM media
        LEFT JOIN watchlist ON media.tmdbID = watchlist.media_id AND watchlist.user_id = ${this.$globalState.user.id}
        LEFT JOIN genre ON EXISTS (
            SELECT 1
            FROM json_each(media.genres) AS json_genre
            WHERE json_genre.value = genre.genre_id
        )`;

    if (!mediaWatched) query += `
    LEFT JOIN media_watched ON media.tmdbID = COALESCE(media_watched.show_id, media_watched.media_id) AND media_watched.user_id = ${this.$globalState.user.id}
    AND media_watched.last_watched = (
        SELECT MAX(mw2.last_watched)
        FROM media_watched mw2
        WHERE mw2.user_id = ${this.$globalState.user.id}
        AND media.tmdbID = COALESCE(mw2.show_id, mw2.media_id)
    )`;
    
    if (mediaWatched === 1) query += `
    INNER JOIN media_watched ON media.tmdbID = COALESCE(media_watched.show_id, media_watched.media_id) AND media_watched.user_id = ${this.$globalState.user.id}
    AND media_watched.last_watched = (
        SELECT MAX(mw2.last_watched)
        FROM media_watched mw2
        WHERE mw2.user_id = ${this.$globalState.user.id}
        AND media.tmdbID = COALESCE(mw2.show_id, mw2.media_id)
    )`;

    if (type || ids || watchlist === 1) query += ` WHERE`;

    if (type) query += ` media.media_type = '${type}'`; 
    if (type && ids) { 
        query += ` AND media.tmdbID IN (${ids.join(', ')})`;
    } else if (!type && ids) { 
        query += ` media.tmdbID IN (${ids.join(', ')})`;
    }

    if (type && ids && watchlist === 1) {
        query += ` AND in_watchlist = 1`;
    } else if (!type && ids && watchlist === 1) {
        query += ` AND in_watchlist = 1`;
    } else if (!type && !ids && watchlist === 1) {
        query += ` in_watchlist = 1`;
    }

    query += ` GROUP BY media.tmdbID`;

    if (orderBy) query += ` ORDER BY ${orderBy}`;
    if (orderType) query += ` ${orderType}`;

    try {
        mediaInfos = await this.get(query);
    } catch (err) {
        console.log(err);
    }

    for (let i = 0; i < mediaInfos.length; i++) {
        if (mediaInfos[i].media_type === "show") {
            try {
                mediaInfos[i]['seasons'] = await this.getSeasons(mediaInfos[i].tmdbID);
                mediaInfos[i]['episodes'] = await this.getEpisodes(mediaInfos[i].tmdbID);                      
            } catch (error) {
                console.log(error);
            }
        }
    }
    return new Promise((resolve) => {
        resolve(mediaInfos);
    });
}

export async function getGenre() {
    const response = await fetchDB(`allGenre`);
    return new Promise((resolve) => {
        resolve(response.data);
    });
}

export async function getGenreName(genreID) {
    const response = await fetchDB(`genreNameByID?id=${genreID}`);
    return new Promise((resolve) => {
        resolve(response.data[0].genre_name);
    });
}

export function runtime(time) {
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
}

export function filterByGenre(event) {
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
}

export function filterBySetting(event) {
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
}