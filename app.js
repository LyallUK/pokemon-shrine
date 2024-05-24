const pokemonCache = {};

function checkCache(searchValue) {
	const matchingPokemon = [];

	const arrOfValues = Object.values(pokemonCache);

	// Loop through each cached Pokemon and check if its name contains the search value
	arrOfValues.forEach((pokemon) => {
		if (pokemon.name.includes(searchValue)) {
			matchingPokemon.push(pokemon);
		}
	});

	return matchingPokemon;
}

async function getPokemonData(idOrName, withCache) {
	try {
		if (withCache && pokemonCache[idOrName]) {
			return pokemonCache[idOrName];
		}

		const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${idOrName}/`);
		const speciesData = await speciesResponse.json();

		const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}/`);
		const pokemonData = await pokemonResponse.json();

		const pokemonObject = {
			id: speciesData.id,
			name: speciesData.name,
			generation: speciesData.generation,
			sprite: pokemonData.sprites.other["official-artwork"].front_default,
			legendary: speciesData.is_legendary,
			mythic: speciesData.is_mythical,
			type: pokemonData.types.map((type) => type.type.name),
		};

		if (withCache && !pokemonCache[pokemonObject.id]) {
			pokemonCache[pokemonObject.id] = pokemonObject;
		}
		return pokemonObject;
	} catch (error) {
		console.error("Error fetching data:", error);
		throw error;
	}
}

function applyFadeInEffect(element, delay) {
	setTimeout(() => {
		element.style.opacity = 1;
	}, 20 * delay);
}

async function createPokemonData(pokemonObject, renderDelay = 1) {
	const rootStyles = getComputedStyle(document.documentElement);
	const pokemonContainer = document.getElementById("pokemon-container");

	const pokemonDiv = document.createElement("div");
	pokemonDiv.id = pokemonObject.name;
	pokemonDiv.classList = "pokemon-tile";

	const typeColor = rootStyles.getPropertyValue(`--${pokemonObject.type[0]}`);
	pokemonDiv.style.background = typeColor;

	const pokemonID = document.createElement("span");
	pokemonID.classList = "pokemon-number";
	pokemonID.innerText = `#${pokemonObject.id}`;

	const pokemonName = document.createElement("span");
	pokemonName.classList = "pokemon-name";
	pokemonName.innerText = pokemonObject.name;

	const pokemonGen = document.createElement("span");
	pokemonGen.classList = "pokemon-gen";
	pokemonGen.innerText = pokemonObject.generation.name.replace("generation-", "");

	const pokemonSprite = document.createElement("img");
	pokemonSprite.classList = "pokemon-sprite";
	pokemonSprite.src = pokemonObject.sprite;

	const pokemonTypes = document.createElement("div");
	pokemonTypes.classList = "pokemon-types";

	pokemonObject.type.forEach((typeName) => {
		const pokemonType = document.createElement("span");
		pokemonType.classList.add("pokemon-type", `${typeName.toLowerCase()}`);
		pokemonType.innerText = typeName;
		pokemonTypes.appendChild(pokemonType);
	});

	// Append elements to DOM
	pokemonDiv.appendChild(pokemonID);
	pokemonDiv.appendChild(pokemonName);
	pokemonDiv.appendChild(pokemonGen);
	pokemonDiv.appendChild(pokemonTypes);
	pokemonDiv.appendChild(pokemonSprite);
	pokemonContainer.appendChild(pokemonDiv);

	// Apply fade-in effect
	applyFadeInEffect(pokemonDiv, renderDelay);
}

// REVIEW: do i need idOrName arg anymore?
async function displayPokemonData(idOrName) {
	const pokemonContainer = document.getElementById("pokemon-container");
	pokemonContainer.innerHTML = "";
	const displayAmount = 1025;

	if (!idOrName) {
		for (let i = 1; i < displayAmount + 1; i++) {
			try {
				const pokemon = await getPokemonData(i, true);
				await createPokemonData(pokemon, i);
			} catch (error) {
				console.error("Error displaying Pokemon:", error);
			}
		}
	} else {
		// REVIEW: delete me?
		// Fetch and display data for the searched Pokémon
		try {
			const pokemon = await getPokemonData(idOrName, true);
			await createPokemonData(pokemon);
		} catch (error) {
			console.error("Error displaying Pokemon:", error);
		}
	}
}

function isNumber(value) {
	return value == Number.parseInt(value);
}

displayPokemonData();

const searchBar = document.getElementById("search-bar");

searchBar.addEventListener("keydown", async function (event) {
	if (event.key === "Enter") {
		const searchValue = event.target.value.trim().toLowerCase();
		const pokemonContainer = document.getElementById("pokemon-container");

		pokemonContainer.innerHTML = "";

		if (searchBar.value === "") {
			displayPokemonData();
		} else {
			try {
				const cachedPokemon = checkCache(searchValue);
				if (cachedPokemon.length > 0) {
					// If partial matches found in cache, create data for each matching Pokemon
					cachedPokemon.forEach(async (pokemon) => {
						await createPokemonData(pokemon);
					});
				} else {
					// If no partial matches found in cache, fetch data from API
					const pokemon = await getPokemonData(searchValue, true);
					await createPokemonData(pokemon);
				}
			} catch (error) {
				console.error("Error displaying Pokemon:", error);
				pokemonContainer.innerHTML = `<p class="error">Pokémon not found!</p>`;
			}
		}
	}
});
