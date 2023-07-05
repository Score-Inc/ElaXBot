import { Message } from "discord.js";
import { MessageCreateInformation } from '../../interface/MessageCreate'

export const command: MessageCreateInformation = {
    name: 'speedtest',
    permissions: "owner",
    enable: true,
    isCommand: true,
    reason: 'There is no command installed to run speedtest in Windows.'
}

export async function execute(message: Message) {
    const { exec } = require('child_process');
    message.reply('Running speedtest...').then(async (msg) => {
        exec('speedtest --simple', (error: { message: any; }, stdout: any, stderr: any) => {
            if (error) {
                msg.edit({ content: `\`\`\`bash\nerror:\n${error.message}\`\`\`` });
                return;
            }
            if (stderr) {
                msg.edit({ content: `\`\`\`bash\nstderr:\n${stderr}\`\`\`` });
                return;
            }
            msg.edit({ content: `\`\`\`${stdout}\`\`\`` }).catch(console.error);
        });
    });
};