import express from "express";
import { filters, Search } from "./ImageScraperService.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static("static"));

app.get("/", (_, res) => {
    res.render("search");
})

app.get("/results", async (req, res) => {
    filters.minPrice = req.query.minPrice || "0";
    filters.maxPrice = req.query.maxPrice || "5000";
    filters.numberOfPagesToFetch.hervis = parseInt(req.query.count);
    filters.numberOfPagesToFetch.sinsay = parseInt(req.query.count);
    filters.numberOfPagesToFetch.sportissimo = parseInt(req.query.count);
    filters.blackListedWebsite = [];
    if (req.query.hervis != "on") {
        filters.blackListedWebsite.push("hervis");
    }
    if (req.query.sinsay != "on") {
        filters.blackListedWebsite.push("sinsay");
    }
    if (req.query.sportissimo != "on") {
        filters.blackListedWebsite.push("sportissimo");
    }
    res.render("results", {
        results: await Search(req.query.searchword)
    })
})

app.listen(PORT, () => {
    console.log(`running on: http://localhost:${PORT}`);
})
