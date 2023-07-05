export interface InteractionCreateInformation {
    name: string;
    permissions: 'owner' | 'everyone' | 'certain';
    enable: boolean;
    reason?: string;
    example: string;
    command: string;
}