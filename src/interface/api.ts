import { AxiosResponse } from 'axios'
import { ApplicationCommandOptionChoiceData } from 'discord.js';

export interface CustomAxiosResponse<T> extends AxiosResponse<T> {
    on(event: string, listener: (...args: any[]) => void): this;
}

export interface returnApplyTheCommand {
    msg: string,
    code: number
}


interface Command {
    name: string;
    value: string;
}

export interface Result {
    result?: {
        id: string;
        name: string;
        category: string;
    } | Array<{ name: string; value: string }> | undefined;
    image?: string;
    commands: {
    gc: {
        commands_1?: Command;
        commands_2?: Command;
        commands_3?: Command;
        commands_4?: Command;
        commands_5?: Command;
    };
    gio: {
        commands_1?: Command;
        commands_2?: Command;
        commands_3?: Command;
        commands_4?: Command;
    };
    };
    slice?(arg0: number, arg1: number): ApplicationCommandOptionChoiceData<string | number>[];
}