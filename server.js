const express = require("express")
const app = express()
const PORT = 8080

const jsonStr = `{
   "Websites":[
      {
         "WebsiteName":"Website1",
         "FoundImages":[
            {
               "Item":"Blue Adidas",
               "URL":"https://sneakerbardetroit.com/wp-content/uploads/2015/03/adidas-ZX-Flux-Core-Blue.jpg",
               "Price":8500
            },
            {
               "Item":"Blue Adidas",
               "URL":"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.nicekicks.com%2Ffiles%2F2023%2F10%2Fadidas-samba-og-collegiate-blue-gum-hp7901-0.jpg&f=1&nofb=1&ipt=889fea59ab37d120807e4fc2075d7c4488b19ebc5a9af1f8c6208de261dc31a3",
               "Price":9500
            }
         ]
      },
      {
         "WebsiteName":"Website2",
         "FoundImages":[
            {
               "Item":"Black socks",
               "URL":"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.stuartslondon.com%2Fimages%2Fnike-black-everyday-crew-socks-3pk-p41148-369076_medium.jpg&f=1&nofb=1&ipt=18dd73310100612a2e6bfbcd22dade4b38b7e78ceeb73a951b5c12ca13ba837f",
               "Price":3000
            }
         ]
      }
   ]
}
`

app.set("view engine", "ejs")
app.set("views", __dirname + "/views")
app.use(express.static("static"))

app.get("/results", (_, res) => {
    res.render("results", {
        results: JSON.parse(jsonStr)["Websites"]
    })
})

app.listen(PORT, () => {
    console.log(`running on: ${PORT}`)
})
