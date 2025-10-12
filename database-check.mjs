import mongoose, { mongo } from "mongoose";
import { config } from "./configuration/config.js";
import {user} from './schemas/user.js';
import { history } from "./schemas/history.js";


await mongoose.connect(config.mongo_uri).catch(err => console.error(`Failed to connect to the database... ${err.message}`));


const testData1 = {
    websiteName: 'Sinsay',
    FoundImages: [
        {
            href: 'https://www.sinsay.com/hu/hu/szivarnadrag-095ep-05x',
            href: 'https://www.sinsay.com/hu/hu/szivarnadrag-095ep-05x',
            src: 'https://static.sinsay.com/media/catalog/product/cache/850/a4e40ebdc3e371adff845072e1c73f37/0/9/095EP-05X-001-1-961146_1.jpg',
            price: '4595',
            title: 'Szivarnadrág'
        }
    ]
};

const testData2 = {
    websiteName: 'Sportisimo',
    FoundImages: [
        {
            href: 'https://www.sportisimo.hu/fundango/sahara/1687833/',
            src: 'https://i.sportisimo.com/products/images/2367/2367751/450x450/fundango-sahara_5.jpg',
            price: '4990',
            title: 'FUNDANGO SAHARA'
        },
        {
            href: 'https://www.sportisimo.hu/lotto/auronsa/1395604/',
            src: 'https://i.sportisimo.com/products/images/2200/2200125/450x450/lotto-auronsa_0.jpg',
            price: '4490',
            title: 'Lotto AURONSA'
        },
        {
            href: 'https://www.sportisimo.hu/loap/anezka/1114130/',
            src: 'https://i.sportisimo.com/products/images/1835/1835198/450x450/loap-anezka-damske-tilko_0.jpeg',
            price: '4990',
            title: 'LOAP ANEZKA'
        }
    ]
};
//const testUser = await user.create({ username: 'Capy Bara', email: 'capybara123@example.com', password: "123456789" });

//const history1 = await history.create({ websiteName: testData1.websiteName, product: testData1.FoundImages, user: testUser._id });
//const history2 = await history.create({ websiteName: testData2.websiteName, product: testData2.FoundImages, user: testUser._id });


//TEST TO SEE

const users = await user.find();
const capyUser = await user.findOne({ username: 'Capy Bara' });

console.log(capyUser);



await mongoose.disconnect();
