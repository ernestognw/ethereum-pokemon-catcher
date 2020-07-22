const Web3 = require('web3');
const contract = require('./build/PokeCatcher.json');

let web3;
let PokeCatcher;

const renderPokemons = async (page, pageSize) => {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${pageSize}&offset=${(page - 1) *
      pageSize}`
  );

  const { results } = await res.json();

  const container = document.getElementById('pokemons');
  container.innerHTML = '';

  const ownedQueries = [];
  for (let i = 0; i < results.length; i++) {
    ownedQueries.push(checkOwnership(results[i].name));
  }

  const ownedDictionary = await Promise.all(ownedQueries);

  console.log(ownedDictionary);

  for (let i = 0; i < results.length; i++) {
    const imgIndex = (i + (page - 1) * pageSize + 1).toString();
    const pad = '000';
    const formattedIndex =
      pad.substring(0, pad.length - imgIndex.length) + imgIndex;

    container.insertAdjacentHTML(
      'beforeend',
      `
      <div class="col">
        <div class="card mt-4" style="width: 18rem;">
          <img 
            src="https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${formattedIndex}.png"
            class="card-img-top" 
            alt=${results[i].name}>
          <div class="card-body">
            <h5 class="card-title">${results[i].name}</h5>
            <button 
              ${ownedDictionary[i] ? 'disabled' : ''}
              id="${results[i].name}" 
              onclick="capture('${results[i].name}')" 
              class="btn btn-primary">
              ${ownedDictionary[i] ? 'Capturado' : 'Capturar'}
            </button>
          </div>
        </div>
      </div>
    `
    );
  }
};

const connectWeb3 = async () => {
  let web3Provider;

  // Modern dapp browsers...
  if (window.ethereum) {
    web3Provider = window.ethereum;
    try {
      // Request account access
      await window.ethereum.enable();
    } catch (error) {
      // User denied account access...
      console.error('User denied account access');
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    web3Provider = window.web3.currentProvider;
  }
  // If no injected web3 instance is detected, fall back to Ganached
  else {
    web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
  }

  web3 = new Web3(web3Provider);
};

window.checkOwnership = async pokemonName => {
  const accounts = await web3.eth.getAccounts();
  return PokeCatcher.methods.isOwned(pokemonName).call({
    from: accounts[0]
  });
};

window.capture = async pokemonName => {
  const accounts = await web3.eth.getAccounts();
  if (
    await PokeCatcher.methods.isOwned(pokemonName).call({
      from: accounts[0]
    })
  ) {
    alert('Este pokemon ya ha sido tomado');
  } else {
    try {
      await PokeCatcher.methods
        .capture(pokemonName)
        .send({ from: accounts[0] });
      alert(`Listo, ahora eres dueño de ${pokemonName}`);
      const pokeButton = document.getElementById(pokemonName);
      pokeButton.innerText = 'Capturado';
      pokeButton.disabled = true;
    } catch (err) {
      alert(err.message);
    }
  }
};

window.onload = async () => {
  await connectWeb3();
  PokeCatcher = new web3.eth.Contract(
    contract.abi,
    contract.networks[5777].address
  );

  console.log(PokeCatcher);

  // State variables
  let pokemonFilters = {
    page: 1,
    pageSize: 20
  };

  // Initial render
  renderPokemons(pokemonFilters.page, pokemonFilters.pageSize);

  // Listeners
  const pokemonPage = document.getElementById('pokemon-page');
  pokemonPage.onchange = ({ target: { value } }) => {
    pokemonFilters.page = Number(value);
  };

  const updatePokemonsButton = document.getElementById('update-pokemons');
  updatePokemonsButton.addEventListener('click', () =>
    renderPokemons(pokemonFilters.page, pokemonFilters.pageSize)
  );
};
