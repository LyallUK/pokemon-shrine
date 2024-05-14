// Function to fetch and render Pokemon data in batches
function fetchAndRenderPokemonInBatch(startIndex, batchSize) {
	const promises = [];

	// Loop through the batch size and fetch/render Pokemon data
	for (let i = startIndex; i < startIndex + batchSize; i++) {
		const promise = new Promise((resolve, reject) => {
			fetchPokemonData(i)
				.then(() => {
					resolve(); // Resolve the promise once the element is rendered
				})
				.catch((error) => {
					reject(error); // Reject the promise if there's an error
				});
		});
		promises.push(promise);
	}

	// Return a promise that resolves when all elements are rendered
	return Promise.all(promises);
}

// Function to fetch Pokemon data by ID
function fetchPokemonData(pokemonID) {
	return new Promise((resolve, reject) => {
		// Construct the URL with the provided ID
		var url = `https://pokeapi.co/api/v2/pokemon/${pokemonID}`;

		// Make a GET request to the PokeAPI
		fetch(url)
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}

				return response.json();
			})
			.then((data) => {
				renderPokemon(data);
				resolve(); // Resolve the promise once the element is rendered
			})
			.catch((error) => {
				reject(error); // Reject the promise if there's an error
			});
	});
}

// Function to render Pokemon data
async function renderPokemon(data) {
	const rootStyles = getComputedStyle(document.documentElement);
	const container = document.getElementById("pokemon-container");
	const pokemonID = data.id;
	const pokemonName = data.species.name;
	const pokemonGen = await findPokemonGeneration(pokemonName);
	const pokemonsSprite = data.sprites.other["official-artwork"];
	const pokemonTypes = data.types.map((i) => i.type.name);

	const tileDiv = document.createElement("div");
	tileDiv.id = pokemonName;
	tileDiv.className = "pokemon-tile";
	const typeColor = rootStyles.getPropertyValue(`--${pokemonTypes[0]}`);
	tileDiv.style.background = typeColor;

	const tileNumber = document.createElement("span");
	tileNumber.className = "pokemon-number";
	tileNumber.innerText = `#${pokemonID}`;
	tileDiv.appendChild(tileNumber);

	const tileGen = document.createElement("span");
	tileGen.className = "pokemon-gen";
	tileGen.innerText = pokemonGen;
	tileDiv.appendChild(tileGen);

	const tileName = document.createElement("span");
	tileName.className = "pokemon-name";
	tileName.innerText = pokemonName;
	tileDiv.appendChild(tileName);

	const tileType = document.createElement("div");
	tileType.className = "type-container";
	tileDiv.appendChild(tileType);

	pokemonTypes.forEach((typeName) => {
		const span = document.createElement("span");
		span.classList.add("pokemon-type", `${typeName.toLowerCase()}`);
		span.innerText = typeName;
		tileType.appendChild(span);
	});

	const tileSprite = document.createElement("img");
	tileSprite.src = pokemonsSprite.front_default;
	tileSprite.draggable = false;
	tileSprite.className = "pokemon-sprite";
	tileDiv.appendChild(tileSprite);

	// Apply fade-in effect with a delay
	setTimeout(function () {
		tileDiv.style.opacity = 1;
	}, 20 * pokemonID); // Adjust the delay as needed

	container.appendChild(tileDiv);
}

// Define batch size
const batchSize = 1;

// Define total number of Pokemon to display (Max 1025)
const displayAmount = 1025;

// Fetch and render Pokemon data in batches
function fetchAndRenderInBatches(startIndex) {
	if (startIndex >= displayAmount + 1) {
		return;
	}

	fetchAndRenderPokemonInBatch(startIndex, batchSize)
		.then(() => {
			fetchAndRenderInBatches(startIndex + batchSize);
		})
		.catch((error) => {
			console.error("Error fetching and rendering batch:", error);
		});
}

fetchAndRenderInBatches(1); // Start fetching and rendering from index 1

async function findPokemonGeneration(pokemonName) {
	try {
		// Fetching the list of all generations
		const response = await fetch("https://pokeapi.co/api/v2/generation/");
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.json();

		// Iterate over each generation
		for (const generation of data.results) {
			const generationResponse = await fetch(generation.url);
			if (!generationResponse.ok) {
				throw new Error(
					`HTTP error! Status: ${generationResponse.status}`
				);
			}
			const generationData = await generationResponse.json();

			// Check if the given Pokémon is found in the current generation
			const foundPokemon = generationData.pokemon_species.find(
				(pokemon) => pokemon.name === pokemonName
			);
			if (foundPokemon) {
				return generation.name.replace("generation-", "");
			}
		}
	} catch (error) {
		console.error("Error:", error);
	}
}
