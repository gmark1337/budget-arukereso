import express from "express";
import { Search } from "./ImageScraperService.js";

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("static"));

app.get("/", (_, res) => {
    res.render("search");
})

app.get("/results", async (req, res) => {
    res.render("results", {
        results: [await Search(req.query.searchword)]
    })
})

app.listen(PORT, () => {
    console.log(`running on: http://localhost:${PORT}`);
})
