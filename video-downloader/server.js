const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/download", (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res
      .status(400)
      .json({ success: false, message: "No video URL provided" });
  }

  exec(
    `./yt-dlp --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" -J --no-check-certificate --extractor-args youtube:player_client=web "${videoUrl}"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${stderr}`);
        return res
          .status(500)
          .json({ success: false, message: "Failed to fetch video details", error: stderr });
      }

      try {
        const videoData = JSON.parse(stdout);

        if (!videoData.formats || videoData.formats.length === 0) {
          return res.json({
            success: false,
            message: "No downloadable formats found.",
          });
        }

        const links = videoData.formats
          .filter(
            (format) => format.vcodec !== "none" && format.acodec !== "none"
          )
          .map((format) => ({
            formatId: format.format_id,
            quality:
              format.format_note && format.format_note !== "none"
                ? format.format_note
                : format.height
                ? `${format.height}p`
                : format.resolution
                ? format.resolution
                : "Standard Quality",
            format: format.ext,
            url: format.url,
          }));

        res.json({ success: true, title: videoData.title, links: links });
      } catch (parseError) {
        console.error("Parsing Error:", parseError);
        res
          .status(500)
          .json({ success: false, message: "Error processing video data", error: parseError.message });
      }
    }
  );
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
