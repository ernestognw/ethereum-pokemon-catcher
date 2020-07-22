const renderPokemons = async (page, pageSize) => {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${pageSize}&offset=${(page - 1) *
      pageSize}`
  );

  const { results } = await res.json();

  const container = document.getElementById('pokemons');
  container.innerHTML = '';

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
          <img src="https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${formattedIndex}.png" class="card-img-top" alt=${results[i].name}>
          <div class="card-body">
            <h5 class="card-title">${results[i].name}</h5>
            <button class="btn btn-primary">Capture</button>
          </div>
        </div>
      </div>
    `
    );
  }

  console.log(results);
};

window.onload = () => {
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
