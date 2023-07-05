export interface MessageCreateInformation {
    name: string;
    permissions: 'owner' | 'everyone' | 'certain';
    enable: boolean;
    reason?: string;
    isCommand: boolean;
}