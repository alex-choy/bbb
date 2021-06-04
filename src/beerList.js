import * as Beer from './beers';
import { breweryAPIKey } from "./config/keys_dev";

const READY = 4;
const beerDb = require('./beerDB.json');
const displayedBeers = require('./beers.json');

/**
 * Delete a beer from the current list
 * @param {string} beerId 
 */
const deleteBeerFromList = (beerId) => {
    const beer = document.getElementById(beerId);
    beer.className = "delete-beer";
    // Let the .delete-beer class fade the beer name away, then remove from list
    setTimeout(() => beer.parentNode.removeChild(beer), 1000);
    Beer.deleteBeer(beerId);
}

/**
 * Always keep beer list sorted alphabetically
 */
export const sortBeerList = () => {
    const ul = document.getElementById('beer-list');
    const newUl = document.createElement('ul', false);
    newUl.id = 'beer-list';
    const lis = [];
    ul.childNodes.forEach(li => {
        lis.push(li);
    })

    lis.sort(function (li1, li2){
        const text1 =  li1.childNodes[1].textContent.toUpperCase();
        const text2 = li2.childNodes[1].textContent.toUpperCase();
        if(text1 < text2) {
            return -1
        } else if (text1 > text2) {
            return 1
        }
        return 0;
    });
    lis.forEach(li => {
        newUl.appendChild(li);
    })
    ul.parentNode.replaceChild(newUl, ul);
};

/**
 * Create a beer HTML element and return it
 * @param {object} beer 
 * @param {function} updateBeerBarChart 
 */
const createBeerElement = (beer, updateBeerBarChart) => {
    // Add beer to our 'Beer DB' (JSON file)
    Beer.addBeer(beer);

    // Create new <li> for beer
    const beerEle = document.createElement('li');
    beerEle.className = "beer-item";
    beerEle.id = beer.id;

    // Text for the beer name
    const beerName = document.createElement("span");
    beerName.innerText = beer.name;

    // Add delete icon to remove beer from list
    const deleteEle = document.createElement("i");
    deleteEle.className = "fas fa-minus-circle";
    deleteEle.addEventListener("click", () => {
        deleteBeerFromList(beerEle.id);
        updateBeerBarChart();
    });

    // Add delete button in front of name
    beerEle.appendChild(deleteEle);
    beerEle.appendChild(beerName);

    return beerEle;
};

/**
 * Initialize the #beer-list
 * @param {object} beers 
 * @param {function} updateBeerBarChart 
 */
const setInitBeerList = (beers, updateBeerBarChart) => {
    const beerListUl = document.getElementById("beer-list");
    // Create artificial delay, give D3 time to process the data
    setTimeout(function() {
      // IDs start at 1
      for(let i = 1; i <= 4; i++) {
          const beerEle = createBeerElement(beers[i], updateBeerBarChart);
          beerListUl.appendChild(beerEle);
      };
      updateBeerBarChart();
      sortBeerList();
    }, 0);
    
};

/**
 * Get a random beer that isn't on display
 * @returns A random beer that is currently not displayed
 */
const getRandomBeer = () => {
    let possibleNumberOfBeers = Object.keys(beerDb).length;
    const displayedBeerIds = new Set();
    displayedBeers.forEach((beer) => {
      displayedBeerIds.add(beer.id);
    });

    let currentId = parseInt(Math.random() * possibleNumberOfBeers + 1);
    while(displayedBeerIds.has(currentId)) {
      currentId = parseInt(Math.random() * possibleNumberOfBeers + 1);
    }
    return beerDb[currentId];
};


const insertNewBeer = (updateBeerBarChart) => {
    const newBeer = getRandomBeer();
    // New beer
    const beerEle = createBeerElement(newBeer, updateBeerBarChart);
    beerEle.className = "new-beer";
    const newBeerName = beerEle.childNodes[1].innerText;

    // Beer List
    const beerList = document.getElementById("beer-list");
    const beerListLis = beerList.childNodes;

    // Check if beer belongs at end of the list
    const lastBeer = beerListLis[beerListLis.length - 1];
    if(beerListLis.length < 1 || newBeerName >= lastBeer.childNodes[1].innerText) {
        beerList.appendChild(beerEle);
    } else {
        // Find the correct index to place the new beer
        for(let i = 0; i <= beerListLis.length; i++) {
            const beerLi = beerListLis[i];
            const currBeerName = beerLi.childNodes[1].innerText;
            if(newBeerName < currBeerName) {
                beerList.insertBefore(beerEle, beerListLis[i]);
                break;
            } 
        }
    }
    updateBeerBarChart();
};

/**
 * 
 * @param {function} updateBeerBarChart function to call after we get a beer
 * @param {number} numBeers number of beers to get  
 */
export const getRandomBeers = (updateBeerBarChart, numBeers = 1) => {
  // add artificial delay, gives time for D3 to load the bars on screen
  // setTimeout(function() {
  //   for(let beer in beerDb) {
  //     insertNewBeer(beerDb[beer], updateBeerBarChart);
  //   }
  // }, 0);

  if(numBeers == 1) {
    insertNewBeer(updateBeerBarChart);
  } else {
    setInitBeerList(beerDb, updateBeerBarChart);
  }

  
};

// TODO: change the above funciton
// Add 20 beers to a json file
// Limit amount of beers to 10 on the graph
// How to format the beer json? 
/**
 * beer: {
 *    srm: '30',
 *    abv: '20',
 *    ibu: '100',
 *    name: 'Arrogant Bastard'
 *    id: 1
 * }
 */

export const initBeerList = (updateBeerBarChart) => {
    getRandomBeers(updateBeerBarChart, 4);
    const beerBtn = document.getElementById("beer-btn");
    beerBtn.addEventListener("click", () => {
        getRandomBeers(updateBeerBarChart);
    });
};
