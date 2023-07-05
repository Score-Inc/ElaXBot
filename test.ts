import { resultWebScrapingReturn } from './src/interface/chatbot'
import cheerio from 'cheerio'
import axios from 'axios'
import natural from 'natural'

const test = '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'

const results = async (question: string, url: string): Promise<resultWebScrapingReturn> => {
    const timeoutPromise = new Promise<resultWebScrapingReturn>((resolve) => {
        setTimeout(() => {
            resolve({
                text: 'Failed: Timeout exceeded while scraping ' + url,
                url
            });
        }, 5000); // Timeout set to 5 seconds
    });
    const scrapingPromise = new Promise<resultWebScrapingReturn>(async (resolve) => {
        try {
            const response = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
                }
            });
            
            const $ = cheerio.load(response.data);
            const tokenizer = new natural.WordTokenizer();
            const importantText: string[] = [];

            const extractText = (element: cheerio.Cheerio) => {
                const text = $(element).text().trim();
                return text.replace(/\s+/g, ' '); // Remove multiple consecutive spaces
            };

            $('code').each((index, element) => {
                const text = extractText($(element));
                const textTokens = tokenizer.tokenize(text.toLowerCase());
                const queryTokens = tokenizer.tokenize(question.toLowerCase());
                const matchingTokens = textTokens?.filter(token => queryTokens?.includes(token));
                if (matchingTokens?.length === queryTokens?.length) {
                    importantText.push(text);
                }
            });

            if (importantText.length === 0) {
                resolve({
                    text: 'No results were found at ' + url,
                    url
                });
            } else {
                resolve({
                    text: importantText.join('\n').trim(),
                    url
                });
            }
        } catch (error) {
            if (error instanceof Error) {
                resolve({
                    text: 'Failed to fetch data from ' + url + ': ' + error.message,
                    url
                });
            } else {
                resolve({
                    text: 'Failed to fetch data from ' + url + ': ' + error,
                    url
                })
            }
        }
    });
    return Promise.race([scrapingPromise, timeoutPromise]);
};

async function main() {
    const webScrapingResult = await results('Langchain', 'https://github.com/hwchase17/langchain')
    console.log(webScrapingResult)
}

main()