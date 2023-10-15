import Notiflix from "notiflix";
import { throttle } from "lodash";
import { images } from "./images-arrays";
import { serviceImagesSearch } from "./pixabay-api";

const notiflixParams = {
  width: '400px',
  position: 'center-center',
  fontSize: '24px',
  cssAnimationStyle: 'from-bottom',
  backOverlay: true,
  useIcon: false,
  failure: {
    background: '#7f52b3',
    textColor: '#fff',
  },
}

const refs = {
  themeChoice: document.querySelector(".navigation"),
  cards: document.querySelectorAll(".card"),
  startBtn: document.querySelector(".start-btn"),
  restartBtn: document.querySelector(".restart-btn"),
  cardsBack: document.querySelectorAll(".card__face--back"),
  cardsList: document.querySelector(".cards-list"),
  userTheme: document.querySelector(".searchQuery"),
  radio1: document.querySelector("#radio1"),
  timerBest: document.querySelector(".timer-best"),
  minutesBest: document.querySelector("span[data-b-minutes]"),
  secondsBest: document.querySelector("span[data-b-seconds]"),
  timer: document.querySelector(".timer"),
  minutes: document.querySelector("span[data-minutes]"),
  seconds: document.querySelector("span[data-seconds]"),
}

let currentGameTheme = "animals";
let currentGameCardset = [];
let chosenCardsIds = [];
let chosenCardsIndexes = [];
let solvedCards = [];
let intervalId = null;
let msTime = 0;
const BEST_TIME_KEY = "best-time";
const bestTime = JSON.parse(localStorage.getItem(BEST_TIME_KEY));

refs.themeChoice.addEventListener("click", handleThemeChoice);
refs.startBtn.addEventListener("click", handleStartGame);
refs.restartBtn.addEventListener("click", handleRestartGame);

if (bestTime) {
  refs.timerBest.classList.remove("invisible");
  renderGameTime(bestTime, refs.minutesBest, refs.secondsBest);
}

function handleRestartGame() {
  location.reload();
}

function handleStartGame() {
  if (currentGameTheme === "choice") {
    const searchQuery = refs.userTheme.value;
    if (!searchQuery) {
        Notiflix.Notify.failure("Please, enter your theme or choose one of standart", notiflixParams);
        return;
    }
    serviceImagesSearch(searchQuery)
      .then(({ hits }) => {
        if (hits.length < 9) {
        Notiflix.Notify.failure(`We're sorry, but there are not enough pictures on ${searchQuery.toUpperCase()}`, notiflixParams);
        return;
      }
        currentGameCardset = createGameCardset(hits);

        for (let i = 0; i < 18; i += 1) {
          refs.cardsBack[i].innerHTML = `<img src=${currentGameCardset[i].largeImageURL}>`;
          refs.cards[i].setAttribute("data-id", currentGameCardset[i].id);
        }

        startNewGame();
        startFlippingCards();
      })
      .catch((err) => console.log(err));
  } else {
    currentGameCardset = createGameCardset(images[currentGameTheme]);
    
    for (let i = 0; i < 18; i += 1) {
      refs.cardsBack[i].innerHTML = `<img src=${Object.values(currentGameCardset[i].img)[0]}>`;
      refs.cards[i].setAttribute("data-id", currentGameCardset[i].id)
    }

    startNewGame();
    startFlippingCards();
  }

}

function startNewGame() {
  refs.startBtn.classList.add("invisible");
  refs.restartBtn.classList.remove("invisible");
  refs.timer.classList.remove("invisible");
  setTimer();
}

function startFlippingCards() {
  flipAllCards();
  setTimeout(() => {
    flipAllCards();
  }, 5000);

  refs.cardsList.addEventListener("click", throttle(handleCardClick,500));
}


function handleCardClick(event) {
  if (!event.target.classList.contains("card__face--front")) {
    return;
  }

  if (chosenCardsIds.length < 2) {
    const currentCard = event.target.closest(".card");
    currentCard.classList.add("is-flipped");
    chosenCardsIds.push(currentCard.dataset.id);
    chosenCardsIndexes.push([...refs.cards].indexOf(currentCard));
  } 

  if (chosenCardsIds.length >= 2) {
      checkForEquality(chosenCardsIds, chosenCardsIndexes)
      chosenCardsIds = [];
      chosenCardsIndexes = [];
  }
}

function checkForEquality(chosenCardsIds, chosenCardsIndexes) {
  if (chosenCardsIds[0] === chosenCardsIds[1]) {
    solvedCards.push(chosenCardsIds[0]);
    if (solvedCards.length === 9) {
      setTimeout(() => {
        Notiflix.Notify.failure("Congratulations!!! You solved it!", notiflixParams);
        refs.restartBtn.textContent = "TO THE NEW START";
        clearInterval(intervalId);
        if (msTime < bestTime || !bestTime) {
          localStorage.setItem(BEST_TIME_KEY, JSON.stringify(msTime));
        }
      }, 1000)
    }
  } else {
    setTimeout(() => {
      refs.cards[chosenCardsIndexes[0]].classList.remove("is-flipped");
      refs.cards[chosenCardsIndexes[1]].classList.remove("is-flipped"); 
    }, 1000)
  }
}

function setTimer() {
  const startTime = Date.now();
  intervalId = setInterval(() => {
    const currentTime = Date.now();
    msTime = currentTime - startTime;
  
    renderGameTime(msTime, refs.minutes, refs.seconds);
    }, 1000)
}

function convertMs(ms) {
  const second = 1000;
  const minute = second * 60;
  const minutes = Math.floor(ms / minute);
  const seconds = Math.floor((ms  % minute) / second);

  return { minutes, seconds };
}

function renderGameTime(msTime, fieldMin, fieldSec) {
  const gameTime = convertMs(msTime);
  fieldMin.textContent = addLeadingZero(gameTime.minutes);
  fieldSec.textContent = addLeadingZero(gameTime.seconds);
}

function addLeadingZero(value) {
    return value.toString().padStart(2, "0");
}

function handleThemeChoice(event) {
  if (!event.target.classList.contains("navigation-btn")) {
    return;
  }
  currentGameTheme = event.target.dataset.value;
  if (currentGameTheme === "choice") {
    refs.userTheme.classList.remove("invisible");
  } else {
    refs.userTheme.classList.add("invisible");
  }
}

function flipAllCards() {
  [...refs.cards].forEach((card) => card.classList.toggle("is-flipped"));
}

function createGameCardset(arr) {
  return [...arr, ...arr].sort(() => 0.5 - Math.random());
}