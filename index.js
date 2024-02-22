function isValidURL(url) {
  const pattern =
    /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g;
  return pattern.test(url);
}

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const { URL } = require("url");

let urls = [];

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;
  if (!isValidURL(url)) {
    res.json({ error: "invalid url" });
  } else {
    dns.lookup(new URL(url).hostname, (err, address) => {
      if (err) {
        res.json({ error: "invalid url" });
      } else {
        const lookup = urls.filter((data) => data.original_url === url);
        if (lookup.length) {
          res.json(lookup[0]);
        } else {
          const newUrl = {
            original_url: url,
            short_url: urls.length,
          };
          urls.push(newUrl);
          res.json(newUrl);
        }
      }
    });
  }
});

app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id;
  if (id >= 0 || id < urls.length) {
    res.redirect(urls[id].original_url);
  } else {
    res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
