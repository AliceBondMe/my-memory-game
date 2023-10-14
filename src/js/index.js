import Notiflix from "notiflix";
import { images } from "./images-arrays";
import { serviceImagesSearch } from "./pixabay-api";

const notiflixParamsFailure = {
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
  cardsBack: document.querySelectorAll(".card__face--back"),
  cardsList: document.querySelector(".cards-list"),
  userTheme: document.querySelector(".searchQuery"),
}

let currentGameTheme = "animals";
let currentGameCardset = [];
let chosenCardsIds = [];
let chosenCardsIndexes = [];
let solvedCards = [];
let clickDisabled = false;


refs.themeChoice.addEventListener("click", handleThemeChoice);
refs.startBtn.addEventListener("click", handleStartGame);

function handleStartGame () {
  if (currentGameTheme === "choice") {
    const searchQuery = refs.userTheme.value;
    if (!searchQuery) {
        Notiflix.Notify.failure("Please, enter your theme or choose one of standart", notiflixParamsFailure);
        return;
    }
    serviceImagesSearch(searchQuery)
      .then(({ hits }) => {
        if (hits.length < 9) {
        Notiflix.Notify.failure(`We're sorry, but there are not enough pictures on ${searchQuery.toUpperCase()}`, notiflixParamsFailure);
        return;
      }
        currentGameCardset =
        [...hits, ...hits]
          .sort(() => 0.5 - Math.random());
        for (let i = 0; i < 18; i += 1) {
          refs.cardsBack[i].innerHTML = `<img src=${currentGameCardset[i].largeImageURL}>`;
          refs.cards[i].setAttribute("data-id", currentGameCardset[i].id);
        }
      })
      .catch((err) => console.log(err));
  } else {
    currentGameCardset =
      [...images[currentGameTheme], ...images[currentGameTheme]]
      .sort(() => 0.5 - Math.random());
    for (let i = 0; i < 18; i += 1) {
      refs.cardsBack[i].innerHTML = `<img src=${Object.values(currentGameCardset[i].img)[0]}>`;
      refs.cards[i].setAttribute("data-id", currentGameCardset[i].id)
    }
  }

  flipAllCards();
  setTimeout(() => {
    flipAllCards();
  }, 5000);

  refs.cardsList.addEventListener("click", handleCardClick);

}


function handleCardClick(event) {
  if (!event.target.classList.contains("card__face--front") || clickDisabled) {
    return;
  }

  if (chosenCardsIds.length < 2) {
    console.log(event.target);
    const currentCard = event.target.closest(".card");
    currentCard.classList.add("is-flipped");
    chosenCardsIds.push(currentCard.dataset.id);
    chosenCardsIndexes.push([...refs.cards].indexOf(currentCard));
    console.log(chosenCardsIds);
    console.log(chosenCardsIndexes);
  } 

  if (chosenCardsIds.length === 2) {
    setTimeout(() => {
      checkForEquality(chosenCardsIds, chosenCardsIndexes)
      chosenCardsIds = [];
      chosenCardsIndexes = [];
      clickDisabled = false;
    }, 1000)
  }

  

}

function checkForEquality(chosenCardsIds, chosenCardsIndexes) {
  clickDisabled = true;
  if (chosenCardsIds[0] === chosenCardsIds[1]) {
    solvedCards.push(chosenCardsIds[0]);
    console.log(solvedCards);
    if (solvedCards.length === 9) {
      Notiflix.Notify.failure("Congratulations!!! You solved it!", notiflixParamsFailure);
    }
  } else {
      refs.cards[chosenCardsIndexes[0]].classList.remove("is-flipped");
      refs.cards[chosenCardsIndexes[1]].classList.remove("is-flipped"); 
  }

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


// function createMarkup(arr) {
//   return arr.map((item) => 
//   `<li class="cards-item">
//         <div class="card" data-id="${item.id}">
//           <div class="card__face card__face--front"></div>
//           <div class="card__face card__face--back">
//             <img src=${item.img}>
//           </div>
//         </div>
//       </li>`
//   ).join("");
// }

// var cards = document.querySelectorAll('.card');

// [...cards].forEach((card)=>{
//   card.addEventListener( 'click', function() {
//     card.classList.toggle('is-flipped');
//   });
// });