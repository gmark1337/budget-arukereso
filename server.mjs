import express from "express";
import { filters, Search } from "./ImageScraperService.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';
import { render } from "ejs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)
const app = express();
const PORT = 8080;
const resultsTemplate = readFileSync("views/results.ejs", "utf-8")

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static("static"));

app.get("/", async (_, res) => {
    res.render("index");
});

app.get("/search", async (req, res) => {
    filters.minPrice = req.query.minPrice || "0";
    filters.maxPrice = req.query.maxPrice || "5000";
    filters.size = req.query.size || "M";
    filters.numberOfPagesToFetch.hervis = parseInt(req.query.count);
    filters.numberOfPagesToFetch.sinsay = parseInt(req.query.count);
    filters.numberOfPagesToFetch.sportissimo = parseInt(req.query.count);
    filters.blackListedWebsite = [];
    if (req.query.hervis != "true") {
        filters.blackListedWebsite.push("hervis");
    }
    if (req.query.sinsay != "true") {
        filters.blackListedWebsite.push("sinsay");
    }
    if (req.query.sportissimo != "true") {
        filters.blackListedWebsite.push("sportissimo");
    }
    const r = await Search(req.query.searchword)
    for (let i = 0; i < r.length; i ++) {
        r[i].FoundImages.sort((a, b) => {
            if (req.query.order == "asc") {
                return parseInt(a.price) - parseInt(b.price);
            }
            if (req.query.order == "desc") {
                return parseInt(b.price) - parseInt(a.price);
            }
        })
    }
    res.end(render(resultsTemplate, {
        results: r
    }))
});

app.listen(PORT, () => {
    console.log(`running on: http://localhost:${PORT}`);
});
