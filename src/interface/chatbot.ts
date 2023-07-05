export interface isAIKnowAnswerReturn {
    query: string[],
    search: boolean,
    getText: string[],
    webScraping: boolean,
    element: string
}

export interface resultWebScrapingReturn {
    text: string,
    url: string
}

export interface searchOnInternetResult {
    link: string | undefined,
    title: string | undefined,
    snippet: string | undefined
}

export interface convertConversationReturn {
    text: string | undefined
}