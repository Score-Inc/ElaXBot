import { Message } from 'discord.js';
import { OWNER_ID } from '../../../config.json';
import { MessageCreateInformation } from '../../interface/MessageCreate'

export const command: MessageCreateInformation = {
    name: 'helper',
    enable: true,
    permissions: 'everyone',
    isCommand: false,
}


export async function execute(message: Message) {
    if (!OWNER_ID.includes(message.author.id)) return;
    if (!message.content.startsWith('$error')) return;
    const args = message.content.slice(6).trim();
    let messageResults = '';
    switch (args) {
    case '4214':
        messageResults = 'For PCs:\nIf you\'re encountering Error 4214, it\'s likely because you haven\'t patched your game yet. You can download the patch from here: <https://github.com/34736384/RSAPatch/releases>. To install it, you can either refer to this video tutorial: <https://cdn.discordapp.com/attachments/1097172738659074048/1097172922025660546/patch.mp4>, or simply move the RSAPatch into your game folder.\n\nFor Android:\nIf you\'re receiving an error message similar to this on your Android device, it\'s possible that you\'re trying to connect to the Official Server instead of the Private Server. You can resolve this by reopening the game until you\'re able to enter the Private Server.\n\nAlternatively, if you\'re attempting to play on the Official Server and encountering the same error, you can try deleting the "version.dll" file and attempting again.';
        break;
    case '4206':
        messageResults = 'If you encounter this error, it may be because the server is currently down. You can check the <#1051149545779777586> channel for more information. Alternatively, your device may not be connecting to the server using YuukiPS Launcher, Fiddler, or Mitmproxy.';
        break;
    default:
        return;
    }
    // check if bot has permisison to send a message, if not then return
    if (!message.guild?.members.me?.permissions.has('SendMessages')) return;
    message.channel.send(messageResults);
};