import fs from 'fs';
import MongoDB from './db';

const database = new MongoDB()

export async function blockUser(user: string, commands: string) {
    // check if user has been blocked to use commands.
    try {
        const result = await database.findOne('blockedUser', {
            _id: user,
        });
        if (result?.commands.includes(commands)) return null;
        // block user
        if (result) {
            await database.updateOne('blockedUser', { _id: user }, {
                commands,
            });
            return true;
        }
        else {
            await database.insertOne('blockedUser', {
                '_id': user,
                'commands': [
                    commands,
                ],
            });
            return true;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            return error.message;
        } else {
            return error
        }
    }
}

/**
 * Get list of block user
 * Example: {
    "<@744184015522889820>": [
        "gm",
        "ask"
    ]
}
* to :
* <@744184015522889820> : gm, ask
 */
export async function listBlockedUser() {
    // Check if the file exists
    let blockedUsers;
    if (fs.existsSync('./src/blockedUser.json')) {
        // Read the json
        const json = fs.readFileSync('./src/blockedUser.json', 'utf8');
        // Parse the json
        blockedUsers = JSON.parse(json);
    }
    else {
        // Create the json
        blockedUsers = {};
    }
    // Return the list
    return blockedUsers;
}