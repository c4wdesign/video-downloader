document
  .getElementById("download-btn")
  .addEventListener("click", async function () {
    const videoUrl = document.getElementById("video-url").value.trim();
    const resultDiv = document.getElementById("result");
    const linksList = document.getElementById("download-links");
    const loader = document.getElementById("loader");
    const select = document.getElementById("format-select-container");
    const downloadSelectedBtn = document.getElementById("download-selected");

    if (!videoUrl) {
      alert("Please enter a video URL.");
      return;
    }

    resultDiv.style.display = "block";
    linksList.innerHTML = "";
    select.innerHTML = '<option value="">Select a format</option>'; // Clear existing options
    downloadSelectedBtn.classList.add("hidden");
    loader.style.display = "block";

    try {
      const response = await fetch(
        `https://video-downloader-backend-xt2o.onrender.com/download?url=${encodeURIComponent(videoUrl)}`
      );
      const data = await response.json();
      loader.style.display = "none";

      if (data.success && data.links.length > 0) {
        linksList.innerHTML = "";

        data.links.forEach((format) => {
          const option = document.createElement("option");
          option.style.color = "#12229d";
          option.value = format.url;
          option.textContent = `${format.quality} (${format.format})`;
          select.appendChild(option);
        });

        downloadSelectedBtn.classList.remove("hidden");

        downloadSelectedBtn.addEventListener("click", function () {
          const selectedValue = select.value;
          if (selectedValue) {
            window.open(selectedValue, "_blank");
          }
        });
      } else {
        linksList.innerHTML = `<li>${
          data.message || "No formats available. Try another URL."
        }</li>`;
      }
    } catch (error) {
      console.error("Error:", error);
      linksList.innerHTML = "<li>An error occurred. Please try again.</li>";
      loader.style.display = "none";
    }
  });
