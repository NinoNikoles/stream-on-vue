import { fetchDB, postDB } from './database';

export async function sessionUser() {
    try {
        const response = await fetchDB(`session`, { withCredentials: true });
        return new Promise((resolve) => {
            resolve(response.data.user.id);
        });
    } catch (err) {
        console.log(err);
        return 0;
    }
}

export async function getCurrentUserInfos() {
    try {
        var response = await fetchDB(`getUser?userID=${this.$globalState.user.id}`);
        const user = response.data[0];

        this.$globalState.user.activeImg = `/media/avatar.webp`;
        if (user.img !== '-1') this.$globalState.user.activeImg = user.img;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function logout_function() {
    await postDB(`logout`, { username: '', role: '' }, { withCredentials: true })
        .then(() => {
            this.$globalState.user.username = null;
            this.$globalState.user.role = null;
            this.$globalState.user.isLoggedIn = false;
            window.location.href = '/';
        });
}

export async function checkWatchlist(mediaID) {
    try {
        const response = await fetchDB(`session`, { withCredentials: true });
        const userID = response.data.user.id;
        const newResponse = await fetchDB(`getFromWatchlist?userID=${userID}&mediaID=${mediaID}`);
        var status = newResponse.data;
        return new Promise((resolve) => {
            resolve(status);
        });
    } catch (err) {
        console.log(err);
        return 0;
    }
}

export async function watchListTrigger(e, mediaID) {
    const userID = this.$globalState.user.id;
    const button = e.target;
    this.disableButton(button);

    try {
        var response = await fetchDB(`updateWatchlist?userID=${userID}&mediaID=${mediaID}`);
        var result = response.data;

        button.setAttribute('data-status', result);
        button.textContent = result === 1 ? this.langSnippet('remove_from_list') : this.langSnippet('add_to_list');    
        button.classList.toggle('icon-heart');            
        button.classList.toggle('icon-remove');            
    } catch (error) {
        console.error('Es gab einen Fehler!', error);
    }

    this.enableButton(button);
}