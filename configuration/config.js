import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const configJSON = JSON.parse(fs.readFileSync('./configuration/config.json', 'utf-8'));

export const config = {
    websites: configJSON.websites,
    tests: configJSON.tests,
    filters: configJSON.filters,
    allowedConsoleLogs: configJSON.allowedConsoleLogs
}