const POKEMON = [
  "bidoof",
  "caterpie",
  "darumaka",
  "ditto",
  "magikarp",
  "ninetales",
  "silveon",
  "sneasel",
];

const TOTAL_PAIRS = POKEMON.length;
const CARD_BACK = "url(imagenes/pball.png)";
const CARD_COMPLETE = "url(imagenes/poke2.png)";

const board = document.querySelector("#tablero");
const endGameMessage = document.querySelector("#fin-juego");
const turnsDisplay = document.querySelector("#turnos");
const pairsDisplay = document.querySelector("#pares");
const bestDisplay = document.querySelector("#mejor");
const finalTurnsDisplay = document.querySelector("#turnos-final");
const restartButton = document.querySelector("#reiniciar");
const playAgainButton = document.querySelector("#jugar-otra-vez");

let turns = 0;
let pairs = 0;
let firstCard = null;
let boardLocked = false;

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getBestScore() {
  return Number(localStorage.getItem("pokememo-best-turns")) || null;
}

function setBestScore(score) {
  const bestScore = getBestScore();

  if (!bestScore || score < bestScore) {
    localStorage.setItem("pokememo-best-turns", score.toString());
  }
}

function updateStats() {
  turnsDisplay.textContent = turns.toString();
  pairsDisplay.textContent = pairs.toString();
  bestDisplay.textContent = getBestScore()?.toString() || "-";
}

function createCard(pokemon) {
  const card = document.createElement("button");
  card.className = `cuadro ${pokemon}`;
  card.type = "button";
  card.dataset.pokemon = pokemon;
  card.setAttribute("aria-label", "Hidden Pokemon card");
  card.style.backgroundImage = CARD_BACK;
  return card;
}

function setupGame() {
  turns = 0;
  pairs = 0;
  firstCard = null;
  boardLocked = false;
  board.innerHTML = "";
  endGameMessage.classList.remove("visible");

  const cards = shuffle([...POKEMON, ...POKEMON]).map(createCard);
  cards.forEach((card) => board.appendChild(card));
  updateStats();
}

function revealCard(card) {
  card.classList.add("revelado");
  card.style.backgroundImage = `url(imagenes/${card.dataset.pokemon}.png)`;
  card.setAttribute("aria-label", `${card.dataset.pokemon} card`);
}

function hideCard(card) {
  card.classList.remove("revelado");
  card.style.backgroundImage = CARD_BACK;
  card.setAttribute("aria-label", "Hidden Pokemon card");
}

function completeCard(card) {
  card.classList.remove("revelado");
  card.classList.add("completo");
  card.style.backgroundImage = CARD_COMPLETE;
  card.setAttribute("aria-label", `Matched ${card.dataset.pokemon} card`);
}

function resolveMismatch(secondCard) {
  boardLocked = true;

  setTimeout(() => {
    hideCard(firstCard);
    hideCard(secondCard);
    firstCard = null;
    boardLocked = false;
  }, 650);
}

function resolveMatch(secondCard) {
  boardLocked = true;

  setTimeout(() => {
    completeCard(firstCard);
    completeCard(secondCard);
    firstCard = null;
    pairs++;
    boardLocked = false;
    updateStats();
    evaluateEndGame();
  }, 450);
}

function handleCardClick(card) {
  if (boardLocked || card === firstCard || card.classList.contains("completo")) {
    return;
  }

  revealCard(card);

  if (!firstCard) {
    firstCard = card;
    return;
  }

  turns++;
  updateStats();

  if (firstCard.dataset.pokemon === card.dataset.pokemon) {
    resolveMatch(card);
  } else {
    resolveMismatch(card);
  }
}

function evaluateEndGame() {
  if (pairs !== TOTAL_PAIRS) {
    return;
  }

  setBestScore(turns);
  updateStats();
  finalTurnsDisplay.textContent = turns.toString();
  endGameMessage.classList.add("visible");
}

board.addEventListener("click", (event) => {
  const card = event.target.closest(".cuadro");

  if (card) {
    handleCardClick(card);
  }
});

restartButton.addEventListener("click", setupGame);
playAgainButton.addEventListener("click", setupGame);

setupGame();
