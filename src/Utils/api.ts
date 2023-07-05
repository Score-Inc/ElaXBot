import axios from 'axios';
import { Result } from '../interface/api'

export async function apiRequest(endpoint: string, content: object) {
    const request = await axios.post('http://127.0.0.1:5050/' + endpoint, content)
        .then((response) => {
            return response.data
        }).catch((error) => {
            // Do nothing for now
        })
    return request;
}
//
export async function apiGenshin(endpoint: string) {
    const request = await axios.get('https://127.0.0.1:5000/' + endpoint)
        .then((response) => {
            return response.data
        }).catch((error) => {
            // Do nothing for now
        })
    return request;
}