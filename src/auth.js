import axios from 'axios';

export async function isAuthenticated() {
    // const mainURL = window.location.protocol + '//' + window.location.hostname;
    const response = await axios.get(`http://localhost:3000/api/db/session`, {withCredentials: true});
    const user = response.data.user;
    return user;
}