// Fonction pour charger le fichier JSON
let input = document.getElementById("file-input");
let label = document.querySelector(".label-file");

(() => {
	refreshFile();

	input.addEventListener("change", () => {
		refreshFile();
	});
})();

function refreshFile() {
	let file = input.files[0];
	if (file) {
		label.innerHTML = file.name;
		loadJSON();
	}
}
function loadJSON() {
	let file = input.files[0];
	let reader = new FileReader();
	reader.onload = () => {
		if (reader.result) {
			if (reader.result == "") {
				console.error("Le fichier est vide.");
				return;
			}
			try {
				let data = JSON.parse(reader.result);
				generateChart(data);
			} catch (error) {
				console.error("Erreur lors de l'analyse des données JSON :", error);
			}
		} else {
			console.error("Aucune donnée n'a été lue à partir du fichier.");
		}
	};
	reader.onerror = () => {
		label.innerHTML = "Choisir un fichier";
	};
	reader.readAsText(file);
}

function generateChart(data) {
	if (data.DataType != "SINGLE") return;
	data = data.Data;

	generateSingleChart(data);
	return;
}
