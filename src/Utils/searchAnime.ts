import fetch from 'node-fetch';
import { logger } from './logger';

interface searchAnimeReturn {
    title?: string,
    images?: string,
    background?: string,
    genres?: string,
    episodes?: string,
    status?: string,
    ageRating?: string,
    type?: string,
    nsfw?: string,
    streaming?: string,
    score?: string,
    next: number | null,
    previous?: number | null
}

export async function search(anime: string, page: number = 0): Promise<searchAnimeReturn> {
    try {
        const result = await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${anime}`);
        const json = await result.json();
        const data = json.data[page];
        const genre = await fetch(data.relationships.genres.links.related);
        const genreJson = await genre.json();
        const genreData = genreJson.data[page] || 'No Genres Found';
        const streaming = await fetch(data.relationships.streamingLinks.links.related);
        const streamingJson = await streaming.json();
        const streamingData = streamingJson.data[page] || 'No Streaming Found';
        if (!data) {
            return {
                next: null,
            };
        }
        return {
            title: data.attributes.canonicalTitle || 'No title found',
            images: data.attributes.posterImage.original || 'No image found',
            background: data.attributes.synopsis || 'No background found',
            genres: genreData.attributes ? genreData.attributes.name : 'No Genres Found',
            episodes: data.attributes.episodeCount || 'No episodes found',
            status: data.attributes.status || 'No status found',
            ageRating: data.attributes.ageRatingGuide || 'No age rating found',
            type: data.attributes.showType || 'No type found',
            nsfw: data.attributes.nsfw ? 'Yes' : 'No' || 'No nsfw found',
            streaming: streamingData.attributes ? streamingData.attributes.url : 'No Streaming Found',
            score: data.attributes.averageRating || 'No score found',
            next: json.data.length > page + 1 ? page + 1 : null,
            previous: page > 0 ? page - 1 : null,
        };
    }
    catch (error) {
        logger.error(error);
        return {
            next: null
        }
    }
}
