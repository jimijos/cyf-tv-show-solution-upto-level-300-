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
    selectEpisode.innerText = "";
    createAndAppendElement("option", "Select Episode", selectEpisode);
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
    let showContainer = createAndAppendElement("section", "", "");
    showContainer.classList.add("showContainer", "card");
    let card = makeCard(show, selectShows);
    let showTitle = card.querySelector(".card h2");
    showTitle.classList.add("showTitle-pointer");
    showTitle.addEventListener("click", async () => {
      container.innerText = "";
      episodes = await getAllEpisodes(show.id);
      makePageForEpisodes(episodes, show);
    });
    let subCard = makesubCard(show);
    subCard.classList.add("subCard");

    let episodes;

    selectShows.addEventListener("change", async ({ target: { value } }) => {
      if (show.id === parseInt(value)) {
        container.innerText = "";
        episodes = await getAllEpisodes(show.id);
        if (episodes.length) {
          container.innerText = "";
          makePageForEpisodes(episodes, show);
          showCard = makeCard(show);
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
    showContainer.append(card, subCard);
    card.append(subCard);
    container.append(card);
    scroll(0, 0);
  }
}

function makesubCard(item) {
  let subCard = createAndAppendElement("div", "", "");
  createAndAppendElement("p", `<p>Rated: ${item.rating.average}</p>`, subCard);
  createAndAppendElement("p", `<p>Genres: ${item.genres}</p>`, subCard);
  createAndAppendElement("p", `<p>Status: ${item.status}</p>`, subCard);
  createAndAppendElement("p", `<p>RunTime: ${item.runtime}</p>`, subCard);
  return subCard;
}

function inputSearch({ target: { value } }, showList, type) {
  let filteredList = showList.filter((listItem) => {
    if (
      listItem.name.toLocaleLowerCase().includes(value.toLowerCase()) ||
      listItem.summary
        .toLocaleLowerCase()
        .includes(
          value.toLowerCase() ||
            listItem?.genres
              .join(" ")
              .toLocaleLowerCase()
              .includes(value.toLowerCase())
        )
    ) {
      return listItem;
    }
  });
  makePageForEpisodes(filteredList, "", type, showList);
}

function makeCard(item, select = null) {
  let summary;
  let card = createAndAppendElement("section", "", "", "card");
  let showTitle = createAndAppendElement("h2", item.name, card);
  if (item.genres) {
    showTitle.addEventListener("click", async (e) => {
      episodes = await getAllEpisodes(item.id);
      selectShows.selectedIndex = selectShows.innerText
        .split("\n")
        .findIndex(
          (show) => show.toLocaleLowerCase() === item.name.toLocaleLowerCase()
        );
      createAndAppendElement("option", item.name, selectShows);
      container.innerText = "";
      makePageForEpisodes(episodes, item);
      scroll(0, 0);
      input.addEventListener("input", (e) =>
        inputSearch(e, episodes, "episode")
      );
    });
  }

  createAndAppendElement("img", item.image?.medium, card);
  let paddedContent =
    item.season && item.number ? namePadding(item.season, item.number) : "";
  createAndAppendElement("p", paddedContent, card, "season-data");
  if (item.summary.length > 250) {
    summary = item.summary;
    createAndAppendElement("div", truncate(item.summary), card);
    let moreButton = createAndAppendElement("a", "click for more", card);
    moreButton.classList.add("btn", "moreButton");
    let truncatedSummary;
    let isMore = false;
    moreButton.addEventListener("click", () => {
      let cardSummary = card.querySelector("div");
      isMore = !isMore;

      if (cardSummary?.innerText?.slice(-3) === "...") {
        truncatedSummary = cardSummary.innerText;
      }
      if (isMore) {
        cardSummary.innerHTML = summary;
        moreButton.innerText = "Show Less";
      } else {
        cardSummary.innerHTML = truncatedSummary;
        moreButton.innerText = "click for more";
      }
    });
  } else {
    createAndAppendElement("div", item.summary, card);
  }

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
    } else if (content?.[0] === "<") {
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
    showCard = makeCard(card);
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
    let card = makeCard(episode, selectEpisode);

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
    scroll(0, 0);
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
  return str.length > 300 ? `${str.slice(0, 300)}...` : str;
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
//darktheme class applied
function darkThemeSelector() {
  nav.classList.toggle("dark");
  rootElem.classList.toggle("dark");
  themeSelector.classList.toggle("dark");
}
