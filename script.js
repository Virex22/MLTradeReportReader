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
	getJsonData()
		.then((data) => {
			generateChart(data);
		})
		.catch((error) => {
			alert(error);
		});
}

async function getJsonData(inString = false) {
	return new Promise((resolve, reject) => {
		let file = input.files[0];
		let reader = new FileReader();
		reader.onload = () => {
			if (reader.result) {
				if (reader.result == "") {
					reject("Le fichier est vide.");
					return;
				}
				try {
					let data = JSON.parse(reader.result);
					if (inString) {
						resolve(JSON.stringify(data, null, 4));
					} else {
						resolve(data);
					}
				} catch (error) {
					reject("Erreur lors de l'analyse des données JSON : " + error);
				}
			} else {
				reject("Aucune donnée n'a été lue à partir du fichier.");
			}
		};
		reader.onerror = () => {
			reject("Erreur lors de la lecture du fichier.");
		};
		reader.readAsText(file);
	});
}

function generateChart(data) {
	if (data.DataType != "SINGLE") return;
	data = data.Data;

	generateSingleChart(data);
	return;
}

function viewJSON() {
	getJsonData(true).then((jsonData) => {
		var popupWindow = window.open("", "_blank");
		popupWindow.document.write("<pre>" + jsonData + "</pre>");
	});
}
