require("dotenv").config();
const { google } = require("googleapis");
const express = require("express");
const moment = require("moment");
const apiKey = process.env.API_KEY;
const youtube = google.youtube({
  version: "v3",
  auth: apiKey,
});

const app = express();
const port = process.env.PORT || 8000;

app.use(express.static("public/"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/search", async (req, res, next) => {
  try {
    const searchQuery = req.query.search_query;
    const response = await youtube.search.list({
      part: "snippet",
      q: searchQuery,
      type: "video",
      maxResults: 25,
    });
    const titles = response.data.items.map((item) => item.snippet.title);
    const date = response.data.items.map((item) =>
      moment(item.snippet.publishedAt).fromNow()
    );
    const descriptions = response.data.items.map(
      (item) => item.snippet.description
    );
    const thumbnails = response.data.items.map(
      (item) => item.snippet.thumbnails.medium.url
    );
    const videoIds = response.data.items.map((item) => item.id.videoId);
    res.render("searches", {
      titles: titles,
      descriptions: descriptions,
      thumbnails: thumbnails,
      videoIds: videoIds,
      date: date,
    });
  } catch (e) {
    next(e);
  }
});

app.get("/search/:id", async (req, res, next) => {
  try {
    const vidId = req.params.id;
    const response = await youtube.videos.list({
      part: ["snippet", "player"],
      id: vidId,
      //how do we get id? when we have id, we can find the player and embed html
    });

    const videoPlayer = response.data.items.map(
      (item) => item.player.embedHtml
    );
    const videotitle = response.data.items.map((item) => item.snippet.title);
    res.render("video", {
      videoPlayer: videoPlayer,
      videotitle: videotitle,
    });
  } catch (e) {
    next(e);
  }
});

app.listen(port, () => {
  console.log("app listening...");
});
