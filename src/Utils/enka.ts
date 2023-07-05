import { PlayerData, Wrapper } from 'enkanetwork.js';

const client = new Wrapper({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    cache: true,
    language: 'en',
});

/**
 * @param {number} uid
 * @returns {Promise<import('enkanetwork.js').PlayerData>}
 */
export async function getPlayer(uid: number): Promise<PlayerData> {
    const data = await client.getPlayer(uid);
    return data
}

export function getImage(id: any) {
    return 'https://enka.network/ui/' + id + '.png';
}