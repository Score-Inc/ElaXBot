import axios, { AxiosError } from 'axios';
import { returnApplyTheCommand } from '../interface/api'

export async function apply(uid: any, code: string | number | undefined, server: any, cmd: string): Promise<returnApplyTheCommand> {
    try {
        let param: { uid: any, code?: any, cmd: string };
        if (server === 'eu2-gio1') {
            param = {
                uid: uid,
                cmd: cmd
            }
        } else {
            param = {
                uid: uid,
                code: code,
                cmd: cmd
            };
        }
        const resultFromAPI = await axios.get('https://ps2.yuuki.me/api/server/' + server + '/command', {
            params: param,
            timeout: 1000 * 60,
        });
        if (resultFromAPI.data) {
            const status = resultFromAPI.data;
            return status
        } else {
            return { msg: 'Can\'t Access to the server', code: 404 }
        }
    } catch (error) {
        console.log(error);
        if (error instanceof AxiosError) {
            return { msg: `There was an error while sending request command to <https://ps2.yuuki.me/command>\n${error.response?.statusText} | ${error.response?.status}`, code: error.response?.status || 502 }
        } else {
            return { msg: 'There was an error\n'+ error, code: 500 }
        }
    }
}