// Load pokemonCache from local storage if available
const pokemonCache = JSON.parse(localStorage.getItem("pokemonCache")) || {};

// Helper function to save pokemonCache to local storage
function savePokemonCacheToLocalStorage() {
	localStorage.setItem("pokemonCache", JSON.stringify(pokemonCache));
}

// Helper function to fetch data from API
async function fetchData(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		console.error("Error fetching data:", error);
		throw error;
	}
}

// Function to get Pokémon data by ID or name, with optional caching
async function getPokemonData(idOrName, withCache = true) {
	try {
		// Check if data is in cache
		if (withCache && pokemonCache[idOrName]) {
			return pokemonCache[idOrName];
		}

		// Fetch species and Pokémon data from API
		const speciesData = await fetchData(`https://pokeapi.co/api/v2/pokemon-species/${idOrName}/`);
		const pokemonData = await fetchData(`https://pokeapi.co/api/v2/pokemon/${idOrName}/`);

		// Fetch and convert sprite image to base64
		const spriteUrl = pokemonData.sprites.other["official-artwork"].front_default;
		const spriteResponse = await fetch(spriteUrl);
		const spriteBlob = await spriteResponse.blob();
		const spriteBase64 = await new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.readAsDataURL(spriteBlob);
		});

		// Create Pokémon object with relevant details
		const pokemonObject = {
			id: speciesData.id,
			name: speciesData.name,
			generation: speciesData.generation.name.replace("generation-", ""),
			sprite: spriteBase64,
			legendary: speciesData.is_legendary,
			mythic: speciesData.is_mythical,
			type: pokemonData.types.map((type) => type.type.name),
		};

		// Cache the data if caching is enabled
		if (withCache) {
			pokemonCache[idOrName] = pokemonObject;
			savePokemonCacheToLocalStorage(); // Save cache to local storage
		}
		return pokemonObject;
	} catch (error) {
		console.error("Error fetching Pokémon data:", error);
		throw error;
	}
}

// Function to create a Pokémon element for display
function createPokemonElement(pokemonObject, rootStyles) {
	const pokemonDiv = document.createElement("div");
	pokemonDiv.id = pokemonObject.name;
	pokemonDiv.classList = "pokemon-tile";

	// Set background color based on Pokémon type
	const typeColor = rootStyles.getPropertyValue(`--${pokemonObject.type[0]}`);
	pokemonDiv.style.background = typeColor;

	// Create and append Pokémon ID element
	const pokemonID = document.createElement("span");
	pokemonID.classList = "pokemon-number";
	pokemonID.innerText = `#${pokemonObject.id}`;

	// Create and append Pokémon name element
	const pokemonName = document.createElement("span");
	pokemonName.classList = "pokemon-name";
	pokemonName.innerText = pokemonObject.name;

	// Create and append Pokémon generation element
	const pokemonGen = document.createElement("span");
	pokemonGen.classList = "pokemon-gen";
	pokemonGen.innerText = pokemonObject.generation;

	// Create and append Pokémon sprite element
	const pokemonSprite = document.createElement("img");
	pokemonSprite.classList = "pokemon-sprite";
	pokemonSprite.src = pokemonObject.sprite;
	pokemonSprite.loading = "lazy"; // Lazy load the image

	// Create and append Pokémon types element
	const pokemonTypes = document.createElement("div");
	pokemonTypes.classList = "pokemon-types";
	pokemonObject.type.forEach((typeName) => {
		const pokemonType = document.createElement("span");
		pokemonType.classList.add("pokemon-type", `${typeName.toLowerCase()}`);
		pokemonType.innerText = typeName;
		pokemonTypes.appendChild(pokemonType);
	});

	// Add classes for legendary and mythical Pokémon
	if (pokemonObject.legendary) {
		pokemonDiv.classList.add("legendary");
	}
	if (pokemonObject.mythic) {
		pokemonDiv.classList.add("mythic");
	}

	// Append all elements to the Pokémon div
	pokemonDiv.append(pokemonID, pokemonName, pokemonGen, pokemonTypes, pokemonSprite);
	return pokemonDiv;
}

// Function to render a Pokémon card
async function renderPokemonCard(pokemonObject) {
	const rootStyles = getComputedStyle(document.documentElement);
	const pokemonContainer = document.getElementById("pokemon-container");
	const pokemonDiv = createPokemonElement(pokemonObject, rootStyles);

	if (!pokemonContainer) {
		console.error("pokemon-container element not found");
		return;
	}

	// Add click event listener to log Pokémon object
	pokemonDiv.addEventListener("click", () => {
		console.log(pokemonObject);
	});

	// Add delay before appending the Pokémon tile
	await new Promise((resolve) => setTimeout(resolve, 10));

	pokemonContainer.appendChild(pokemonDiv);
}

// Function to display Pokémon data
async function displayPokemonData(idOrName) {
	const pokemonContainer = document.getElementById("pokemon-container");
	pokemonContainer.innerHTML = "";

	const displayAmount = 1025; // Number of Pokémon to display
	if (!idOrName) {
		// Display all Pokémon
		for (let i = 1; i <= displayAmount; i++) {
			try {
				const pokemon = await getPokemonData(i, true);
				await renderPokemonCard(pokemon, i);
			} catch (error) {
				console.error("Error displaying Pokémon:", error);
			}
		}
	} else {
		// Display specific Pokémon
		try {
			const pokemon = await getPokemonData(idOrName, true);
			await renderPokemonCard(pokemon);

			// Scroll to the Pokémon element
			const pokemonElement = document.getElementById(pokemon.name);
			if (pokemonElement) {
				pokemonElement.scrollIntoView({ behavior: "smooth" });
			}
		} catch (error) {
			console.error("Error displaying Pokémon:", error);
			pokemonContainer.innerHTML = `<p class="error">Pokémon not found!</p>`;
		}
	}
}

displayPokemonData();

const searchBar = document.getElementById("search-bar");

document.addEventListener("keypress", function (event) {
	searchBar.focus();
});

searchBar.addEventListener("keyup", function (event) {
	const searchValue = searchBar.value.toLowerCase();
	if (event.key === "Enter") {
		const pokemonElement = document.getElementById(searchValue);
		if (pokemonElement) {
			pokemonElement.scrollIntoView({ behavior: "smooth", block: "center" });

			// Remove the highlight class after the animation ends
			pokemonElement.classList.add("highlight");
			setTimeout(() => {
				pokemonElement.classList.remove("highlight");
			}, 3000); // 3 seconds

			searchBar.value = "";
			searchBar.blur();
		} else {
			console.error("Pokémon not found!");
		}
	}
});
