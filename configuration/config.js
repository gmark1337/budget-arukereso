import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const configJSON = JSON.parse(fs.readFileSync('./configuration/config.json', 'utf-8'));
const languageJSON = JSON.parse(fs.readFileSync('./configuration/languages.json', 'utf-8'));

export const config = {
    mongo_uri: process.env.MONGO_URI,
    websites: configJSON.websites,
    tests: configJSON.tests,
    filters: configJSON.filters,
    allowedConsoleLogs: configJSON.allowedConsoleLogs,
    placeHolders: languageJSON.placeholders
}