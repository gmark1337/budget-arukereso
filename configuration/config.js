import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const configJSON = JSON.parse(fs.readFileSync('./configuration/config.json', 'utf-8'));

export const config = {
    websites: configJSON.websites
}