//You can edit ALL of the code here
const rootElem = document.getElementById("root");
const container = document.querySelector(".container");
const nav = document.querySelector(".nav");
const select = document.getElementById("episodes");
const themeSelector = document.querySelector("button");

themeSelector.addEventListener("click", () => {
  nav.classList.toggle("dark");
  rootElem.classList.toggle("dark");
  themeSelector.classList.toggle("dark");
});

let p = document.createElement("p");
nav.append(p);
//run setup
window.onload = setup;

function setup() {
  const allEpisodes = getAllEpisodes();
  const input = document.querySelector("input");

  makePageForEpisodes(allEpisodes);
  input.addEventListener("input", ({ target: { value } }) => {
    if (value) {
      select.selectedIndex = 0;
    }
    let filteredList = allEpisodes.filter((episode) => {
      if (
        episode.name.toLocaleLowerCase().includes(value.toLowerCase()) ||
        episode.summary.toLocaleLowerCase().includes(value.toLowerCase())
      ) {
        return episode;
      }
    });
    makePageForEpisodes(filteredList);
  });
}

function makeEpisodeCard(item) {
  let card = createAndAppendElement("section", "", "", "card");
  createAndAppendElement("h2", item.name, card);
  createAndAppendElement("img", item.image.medium, card);
  createAndAppendElement(
    "p",
    namePadding(item.season, item.number),
    card,
    "season-data"
  );
  createAndAppendElement("div", truncate(item.summary), card);

  card.setAttribute("id", `${item.id}`);
  createAndAppendElement(
    "option",
    `${namePadding(item.season, item.number)} - ${item.name}`,
    select,
    "",
    item.id
  );

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
      element.src = content;
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

function makePageForEpisodes(episodeList) {
  p.innerText = `Got ${episodeList.length} episode${
    episodeList.length > 1 ? "s" : ""
  }`;
  p.style.marginLeft = "4%";
  p.style.fontWeight = "bold";
  container.innerText = "";

  for (let episode of episodeList) {
    let card = makeEpisodeCard(episode);
    select.addEventListener("change", ({ target: { value } }) => {
      if (episode.id === parseInt(value)) {
        container.innerText = "";
        card.classList.add("selected-episode");
        let button = createAndAppendElement("a", "back", card);
        button.classList.add("btn");
        p.innerText = `Got 1 episode`;
        button.addEventListener("click", () => {
          location.reload();
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
  return str.length > 375 ? `${str.slice(0, 375)}...` : str;
}
