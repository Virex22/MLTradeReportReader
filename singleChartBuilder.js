function generateSingleChart(data) {
	const container = document.getElementById("container");
	container.innerHTML = "";
	generateProfitChart(data);
	generateBalanceChart(data);
	generateParametersTable(data);
}

function createCanvasElement(id, container, title) {
	const canvasContainer = document.createElement("div");
	canvasContainer.classList.add("chart-container");

	const titleElement = document.createElement("h2");
	titleElement.textContent = title;
	canvasContainer.appendChild(titleElement);

	const canvas = document.createElement("canvas");
	canvas.id = id;
	canvasContainer.appendChild(canvas);

	container.appendChild(canvasContainer);

	return canvas;
}

function generateProfitChart(data) {
	const trades = data.Trades;
	const profitValues = trades.map((trade) => trade.ProfitLoss);
	const profitLabels = trades.map((_, index) => `Trade ${index + 1}`);

	const profitColors = profitValues.map((profit) =>
		profit >= 0 ? "green" : "red"
	);

	const container = document.getElementById("container");

	// Crée l'élément canvas dans la div avec l'ID "container"
	const canvas = createCanvasElement("profit-chart", container, "Profit/Loss");

	const ctx = canvas.getContext("2d");
	new Chart(ctx, {
		type: "bar",
		data: {
			labels: profitLabels,
			datasets: [
				{
					label: "Profit/Loss",
					data: profitValues,
					backgroundColor: profitColors,
				},
			],
		},
		options: {
			scales: {
				y: {
					beginAtZero: true,
					ticks: {
						callback: function (value, index, values) {
							return value.toFixed(2); // Afficher les valeurs avec 2 décimales
						},
					},
				},
			},
			maintainAspectRatio: true,
		},
	});
}
function generateBalanceChart(data) {
	const trades = data.Trades;
	const initialBalance = data.InitialBalance;

	// Calcul du solde du compte
	const balanceData = trades.reduce(
		(acc, trade, index) => {
			const tradeProfitLoss = trade.ProfitLoss;
			const previousBalance =
				acc.length > 0 ? acc[acc.length - 1] : initialBalance;
			const currentBalance = previousBalance + tradeProfitLoss;
			acc.push(currentBalance);
			return acc;
		},
		[initialBalance]
	);

	// Préparation des libellés pour l'axe x du graphique
	const tradeLabels = trades.map((_, index) => `Trade ${index + 1}`);

	// Préparation des données pour le graphique
	const chartData = {
		labels: tradeLabels,
		datasets: [
			{
				label: "Solde du compte",
				data: balanceData,
				backgroundColor: "rgba(54, 162, 235, 0.5)",
				borderColor: "rgba(54, 162, 235, 1)",
				borderWidth: 1,
				fill: true,
			},
		],
	};

	// Configuration du graphique
	const chartOptions = {
		responsive: true,
		maintainAspectRatio: true,
		scales: {},
	};

	// Création du canvas pour le graphique
	const canvasId = "balance-chart";
	const container = document.getElementById("container");
	createCanvasElement(canvasId, container, "Évolution du solde du compte");

	// Génération du graphique
	const ctx = document.getElementById(canvasId).getContext("2d");
	new Chart(ctx, {
		type: "line",
		data: chartData,
		options: chartOptions,
	});
}
