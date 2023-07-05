import { MongoClient } from 'mongodb';
import { Database } from '../../config.json';

class DatabaseConnection {
    private uri: string;
    private dbName: string;

    constructor() {
        this.uri = Database.URI;
        this.dbName = Database.dbName;
    }

    async connect() {
        try {
            const client = await MongoClient.connect(this.uri);
            const db = client.db(this.dbName);
            return { client, db };
        } catch (error) {
            console.error(`Error connecting to the database.\n${error}`);
            throw error;
        }
    }

    async insertOne(collectionName: string, body: object) {
        try {
            const { db } = await this.connect();
            const collection = db.collection(collectionName);
            const result = await collection.insertOne(body, { noResponse: true, maxTimeMS: 1000 });
            return result;
        } catch (error) {
            console.error(`Error inserting one document.\n${error}`);
        }
    }

    async read(collectionName: string) {
        try {
            const { db } = await this.connect();
            const collection = db.collection(collectionName);
            const result = await collection.find({}).toArray();
            return result;
        } catch (error) {
            console.error(`Error reading documents.\n${error}`);
        }
    }

    async deleteOne(collection: string, body: object) {
        try {
            const { db } = await this.connect();
            const result = await db.collection(collection).deleteOne(body);
            return result;
        } catch (error) {
            console.error(`Error deleting documents.\n${error}`);
        }
    }

    async dropCollection(collectionName: string) {
        try {
            const { db } = await this.connect();
            const collection = db.collection(collectionName);
            const result = await collection.drop();
            return result;
        } catch (error) {
            console.error(`Error dropping collection.\n${error}`);
        }
    }

    async findOne(collectionName: string, body: object) {
        try {
            const { db } = await this.connect();
            const collection = db.collection(collectionName);
            const result = collection.findOne(body);
            return result;
        } catch (error) {
            console.error(`Error finding one document.\n${error}`);
        }
    }

    async updateOne(collectionName: string, filter: object, body: object) {
        try {
            const { db } = await this.connect();
            const collection = db.collection(collectionName);
            const result = await collection.updateOne(filter, { $addToSet: body }, { upsert: true });
            return result;
        } catch (error) {
            console.error(`Error overwriting document.\n${error}`);
        }
    }

    async newOne(collectionName: string, filter: object, body: object) {
        try {
            const { db } = await this.connect();
            const collection = db.collection(collectionName);
            const result = await collection.findOneAndReplace(filter, body);
            return result;
        } catch (error) {
            console.error(`Error creating new document.\n${error}`);
        }
    }

    async ping() {
        try {
            const { db } = await this.connect();
            const result = await db.command({ ping: 1 });
            return result;
        } catch (error) {
            console.error(`Error pinging database.\n${error}`);
        }
    }
}

export default DatabaseConnection;
