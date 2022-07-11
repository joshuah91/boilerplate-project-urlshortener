require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const urlExists = require("url-exists");
const shortId = require("shortid");
const e = require("express");
const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://joshuah91:JOSEphine@cluster0.5ppqk2h.mongodb.net/cluster0?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const WebsiteSchema = mongoose.Schema;

const webSchema = new WebsiteSchema({
  longUrl: { type: String, required: true },
  shortCode: { type: String, required: true },
});

const Website = mongoose.model("Website", webSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
// app.get("/api/hello", function (req, res) {
//   res.json({ greeting: "hello API" });
// });

app.post("/api/shorturl", (req, res) => {
  const sentUrl = req.body.url;
  console.log(sentUrl);
  // if (validUrl.isUri(longUrl)) {
  //   res.json({
  //     error: "Invalid Hostname",
  //   });
  // }
  const urlCode = shortId.generate();

  urlExists(sentUrl, async (err, exist) => {
    if (exist) {
      console.log(exist);
      try {
        let url = await Website.findOne({
          longUrl: sentUrl,
          // shortCode: urlCode,
        });
        if (url) {
          console.log(url);
          res.json({
            original_url: url.longUrl,
            short_url: url.shortCode,
          });
        } else {
          var newWebsite = new Website({
            longUrl: sentUrl,
            shortCode: urlCode,
          });
          newWebsite.save((err, data) => {
            if (err) {
              return console.error(err);
            } else {
              console.log(data);
            }
          });
          res.json({
            original_url: sentUrl,
            short_url: urlCode,
          });
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log(err);
      res.json({
        error: "Invalid URL",
      });
    }
  });
});

app.get("/api/shorturl/:code", async (req, res) => {
  const code = req.params.code;
  try {
    let url = await Website.findOne({
      shortCode: code,
    });
    if (url) {
      return res.redirect(url.longUrl);
    } else {
      res.json({
        error: "Invalid URL",
      });
    }
  } catch (err) {
    console.error(err);
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
