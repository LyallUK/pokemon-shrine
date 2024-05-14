async function getPokemonData(idOrName) {
	try {
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

async function displayPokemonData() {
	const displayAmount = 100;

	for (let i = 1; i < displayAmount + 1; i++) {
		try {
			const pokemonObject = await getPokemonData(i);
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
			applyFadeInEffect(pokemonDiv, i);
		} catch (error) {
			console.error("Error displaying Pokemon:", error);
		}
	}
}

displayPokemonData();
