let api_key = "AIzaSyBcYpBETHDL0zQbhHTq_ASTY20Sre96v7g";
// more api -->  AIzaSyBcYpBETHDL0zQbhHTq_ASTY20Sre96v7g
let video_http = "https://www.googleapis.com/youtube/v3/search?";
let channel_http = "https://www.googleapis.com/youtube/v3/channels?";
const parentDiv = document.querySelector(".parent");
const darkModeBtn = document.querySelector(".darkMode");
const darkMode = document.querySelector(".dark-container");

// add event listener

const searchBtn = document.querySelector("#btn_search");
let searchQuery = "cartoon";

// get the search query of the user
searchBtn.addEventListener("click", () => {
  const searchInput = document.querySelector("#myInput");
  searchQuery = searchInput.value;
  fetchData();
});

// fetching data from youtube api
function fetchData() {
  parentDiv.innerHTML = "";
  fetch(
    video_http +
      new URLSearchParams({
        key: api_key,
        part: "snippet",
        q: searchQuery,
        maxResults: 12,
        regionCode: "IN",
      })
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.items.length !== 0) {
        data.items.forEach((item) => {
          getChannelIcon(item);
        });
      }
    })
    .catch((error) => {
      console.log("some error occured");
    });
}

// call the fetch data
fetchData();

// fetching cannel icon because it is not present in first api

const getChannelIcon = (videoData) => {
  fetch(
    channel_http +
      new URLSearchParams({
        key: api_key,
        part: "snippet",
        id: videoData.snippet.channelId,
      })
  )
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      videoData.channelThumbnail = data.items[0].snippet.thumbnails.default.url;
      displayVideoCard(videoData);
    });
};

// display data
const displayVideoCard = async (data) => {
  const stats = await videoStats(data.id.videoId);
  const views =
    stats && stats.items && stats.items[0] && stats.items[0].statistics
      ? formatViews(parseInt(stats.items[0].statistics.viewCount))
      : "N/A";

  const videoCardHTML = `
          <div class="wrap" id="${data.id.videoId}" >
            <div>
              <img class="thumbnail" src="${data.snippet.thumbnails.high.url}">
            </div>
            <div class="prof">
              <img class="profile_pic" src="${data.channelThumbnail}">
            </div>
            <div class="description">
              <h3 class="title">${data.snippet.title}</h3>
              <p class="channel_name">${
                data.snippet.channelTitle
              }<i class="fa-solid fa-circle-check"></i></p>
              <p class="views_info">${views} views - ${formatUploadTime(
    data.snippet.publishedAt
  )}</p>
            </div>
          </div>
        `;
  // Append new video card HTML to parentDiv
  parentDiv.innerHTML += videoCardHTML;
  parentDiv.addEventListener("click", (e) => {
    if (e.target.closest(".wrap")) {
      const clickedVideoId = e.target.closest(".wrap").id;
      playVideo(clickedVideoId);
    }
  });
};

// function to get the videoStats
async function videoStats(videoId) {
  try {
    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/videos?" +
        new URLSearchParams({
          key: api_key,
          part: "statistics",
          id: videoId,
        })
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Function to format view count
function formatViews(viewCount) {
  if (viewCount >= 1000000) {
    return (viewCount / 1000000).toFixed(1) + "M";
  } else if (viewCount >= 1000) {
    return (viewCount / 1000).toFixed(1) + "K";
  } else {
    return viewCount;
  }
}

// function to play video
function playVideo(videoId) {
  const homeBtn = document.createElement("button");
  homeBtn.textContent = "Back to Home";
  homeBtn.classList.add("homeBtn");
  homeBtn.addEventListener("click", () => {
    location.reload();
  });
  const iframe = document.createElement("iframe");
  iframe.classList.add("video-player");
  iframe.width = "560";
  iframe.height = "315";
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  iframe.allowFullscreen = true;

  parentDiv.innerHTML = "";
  parentDiv.appendChild(homeBtn);

  parentDiv.appendChild(iframe);
}

// logic to get id

// time formatter

function formatUploadTime(uploadTime) {
  const now = new Date();
  const uploadedAt = new Date(uploadTime);
  const timeDiff = now - uploadedAt;
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  if (days < 1) {
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (days < 7) {
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  } else {
    const years = Math.floor(days / 365);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  }
}

// final
