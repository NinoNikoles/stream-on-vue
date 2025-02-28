import axios from 'axios';

export async function get(query, like = null) {
    var request = `${window.location.protocol}//${window.location.hostname}:3000/api/db/getQuery?query=${query}`;
    if (like) request += `&like=${like}`;

    var response = await axios.get(request);
    return new Promise((resolve) => {
        resolve(response.data);
    });
}

export async function fetchDB(request, values = {}, credentials = {}) {
    var response = await axios.get(`${window.location.protocol}//${window.location.hostname}:3000/api/db/${request}`, values, credentials);
    return new Promise((resolve, reject) => {
        if (response.name === 'AxiosError') {
            reject(response);
        }
        resolve(response);
    });
}

export async function postDB(request, values = {}, credentials = {}) {
    var response = await axios.post(`${window.location.protocol}//${window.location.hostname}:3000/api/db/${request}`, values, credentials);
    return new Promise((resolve) => {
        resolve(response);
    });
}