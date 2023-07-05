import { Configuration, OpenAIApi } from 'openai';
import { OPENAI } from '../../config.json';
import fs from 'fs';

const config = new Configuration({
    apiKey: OPENAI.API_KEY
})

const openai = new OpenAIApi(config);

export async function chat(question:string, user: string, bool: boolean, context: string) {
    if (bool) {
        if (fs.existsSync('./src/cache/' + user)) {
            fs.unlinkSync('./src/cache/' + user);
        }
    }
    let previousResponses = '';
    if (fs.existsSync('./src/cache/' + user)) {
        previousResponses = fs.readFileSync('./src/cache/' + user, 'utf-8');
    }
    const completion = await openai.createChatCompletion({
        model: OPENAI.Model,
        messages: [
            {
                content: `${previousResponses}\n${context}\n${user}: ${question}\nTakina: `,
                role: 'user',
            },
        ],
        frequency_penalty: 0,
        stop: ['Takina: ', `${user}: `],
        max_tokens: 100,
        temperature: OPENAI.temperature || 0.5,
        n: 1,
        top_p: 1,
    });
    const resultPrompt = `${context}\n${user}: ${question}\nTakina: ${completion.data.choices[0].message?.content.trim()}`;

    //
    // if not exist, create a file
    if (!fs.existsSync('./src/cache')) {
        fs.mkdirSync('./src/cache');
    }
    // check if the conversation already 5 times with "Takina: "

    const count = (previousResponses.match(/Takina: /g) || []).length;
    if (count > 4) {
        // delete the file
        fs.unlinkSync('./src/cache/' + user);
    }

    // write to file not json
    fs.writeFileSync('./src/cache/' + user, resultPrompt, { flag: 'a+' });

    return {
        answer: completion.data.choices[0].message?.content,
        usage: completion.data.usage,
        id: completion.data.id,
        conversation: count || 0,
    };
}