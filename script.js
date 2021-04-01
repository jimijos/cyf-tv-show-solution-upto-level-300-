//You can edit ALL of the code here
const rootElem = document.getElementById("root");
const container = document.querySelector(".container");
const nav = document.querySelector(".nav");
const selectEpisode = document.getElementById("episodes");
const selectShows = document.getElementById("shows");
const themeSelector = document.querySelector("button");
const title = document.querySelector("#title");
const input = document.querySelector("input");
const titleMount = document.querySelector(".titleMount");
let p = document.createElement("p");
nav.append(p);
let theme;

//theme selection
themeSelector.addEventListener("click", () => {
  theme === ""
    ? localStorage.setItem("theme", "dark")
    : localStorage.setItem("theme", "");
  darkThemeSelector();
});

//run setup
window.onload = setup;

async function setup() {
  //setup selected theme
  theme = localStorage.getItem("theme");
  if (theme === "dark") {
    darkThemeSelector();
  }
  //load show on setup
  const allShows = await getShows();
  const sortedShowsList = [...allShows].sort(compare);

  makePageForShows(sortedShowsList);
  title.addEventListener("click", () => {
    container.innerText = "";
    titleMount.innerText = "";
    selectEpisode.selectedIndex = 0;
    selectShows.selectedIndex = 0;
    input.value = "";
    makePageForShows(sortedShowsList);
  });
}
//display shows page for each show and populate show selector
async function makePageForShows(showList) {
  let showCard;
  p.innerText = `Got ${showList.length} Show${showList.length > 1 ? "s" : ""}`;
  p.style.marginLeft = "4%";
  p.style.fontWeight = "bold";
  container.innerText = "";

  input.addEventListener("input", (e) => {
    inputSearch(e, showList, "show");
  });

  for (let show of showList) {
    let card = makeEpisodeCard(show, selectShows);
    let episodes;

    selectShows.addEventListener("change", async ({ target: { value } }) => {
      if (show.id === parseInt(value)) {
        container.innerText = "";
        episodes = await getAllEpisodes(show.id);
        if (episodes.length) {
          container.innerText = "";
          makePageForEpisodes(episodes, show);
          let showCard = makeEpisodeCard(show);
          input.removeEventListener("input", (e) =>
            inputSearch(e, showList, "show")
          );
          input.addEventListener("input", (e) =>
            inputSearch(e, episodes, "episode")
          );
        }
        container.append(card);
      }
    });
    container.append(card);
  }
}

function inputSearch({ target: { value } }, showList, type) {
  let filteredList = showList.filter((episode) => {
    if (
      episode.name.toLocaleLowerCase().includes(value.toLowerCase()) ||
      episode.summary.toLocaleLowerCase().includes(value.toLowerCase())
    ) {
      return episode;
    }
  });
  console.log(showList);
  makePageForEpisodes(filteredList, "", type, showList);
}

function makeEpisodeCard(item, select = null) {
  let card = createAndAppendElement("section", "", "", "card");
  createAndAppendElement("h2", item.name, card);
  createAndAppendElement("img", item.image?.medium, card);
  let paddedContent =
    item.season && item.number ? namePadding(item.season, item.number) : "";
  createAndAppendElement("p", paddedContent, card, "season-data");
  createAndAppendElement("div", truncate(item.summary), card);

  card.setAttribute("id", `${item.id}`);
  if (select) {
    let padding =
      select.name === "shows"
        ? item.name
        : `${namePadding(item.season, item.number)} - ${item.name}`;
    createAndAppendElement("option", padding, select, "", item.id);
  }

  return card;
}
//Create elements with optional content, classname addition  and append to a parent
function createAndAppendElement(
  tag,
  content,
  parent,
  className = null,
  value = null
) {
  let element = document.createElement(`${tag}`);
  if (element) {
    if (tag === "img") {
      element.src = content || "";
      element.alt = "image";
    } else if (content[0] === "<") {
      element.innerHTML = content;
    } else {
      element.innerText = content;
    }
  }
  if (tag === "option") {
    element.value = value;
  }

  if (className) {
    element.classList.add(`${className}`);
  }
  if (parent) {
    parent.append(element);
  }
  return element;
}
//display episodes page for each show and populate episode selector
function makePageForEpisodes(episodeList, card = null, type, showList) {
  p.innerText = `Got ${episodeList.length} ${
    type === "show" ? "Show" : "Episode"
  }${episodeList.length > 1 ? "s" : ""}`;
  if (card) {
    titleMount.innerText = "";
    showCard = makeEpisodeCard(card);
    showCard.classList.add("showCard");
    titleMount.append(showCard);
  }
  p.style.marginLeft = "4%";
  p.style.fontWeight = "bold";
  container.innerText = "";
  selectEpisode.innerHTML = "";
  createAndAppendElement("option", "Show Episode", selectEpisode);

  selectEpisode.selectedIndex = 0;
  for (let episode of episodeList) {
    let card = makeEpisodeCard(episode, selectEpisode);

    selectEpisode.addEventListener("change", ({ target: { value } }) => {
      if (episode.id === parseInt(value)) {
        container.innerText = "";
        card.classList.add("selected-episode");
        let button = createAndAppendElement("a", "back", card);
        button.classList.add("btn");
        p.innerText = `Got 1 episode`;
        button.addEventListener("click", () => {
          container.innerText = "";
          makePageForEpisodes(episodeList);
        });
        container.append(card);
      }
    });
    container.append(card);
  }
}

//give padding to the season and episode numbers
function namePadding(seasonNum, episodeNum) {
  let seasonName = seasonNum < 10 ? `S0${seasonNum}` : `S${seasonNum}`;
  let episodeName = episodeNum < 10 ? `E0${episodeNum}` : `E${episodeNum}`;
  return `${seasonName}${episodeName}`;
}

//truncate text
function truncate(str) {
  return str.length > 100 ? `${str.slice(0, 100)}...` : str;
}

//comparison function to sort showlist alphabetically
function compare(a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

function darkThemeSelector() {
  nav.classList.toggle("dark");
  rootElem.classList.toggle("dark");
  themeSelector.classList.toggle("dark");
}
