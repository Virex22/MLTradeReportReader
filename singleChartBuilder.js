function generateSingleChart(data) {
	const container = document.getElementById("container");
	container.innerHTML = "";
	generateParametersTable(data);
	generateGlobalStatistics(data);
	generateProfitChart(data);
	generateBalanceChart(data);
}
function calculateProfitFactor(trades) {
	const winningTrades = trades.filter((trade) => trade.ProfitLoss > 0);
	const losingTrades = trades.filter((trade) => trade.ProfitLoss < 0);

	const totalWinningAmount = winningTrades.reduce(
		(acc, trade) => acc + trade.ProfitLoss,
		0
	);
	const totalLosingAmount = Math.abs(
		losingTrades.reduce((acc, trade) => acc + trade.ProfitLoss, 0)
	);

	if (totalLosingAmount === 0) {
		return "Infinity";
	}

	const profitFactor = totalWinningAmount / totalLosingAmount;
	return profitFactor.toFixed(2);
}

function generateGlobalStatistics(data) {
	const statisticsContainer = document.createElement("div");
	statisticsContainer.classList.add("statistics-container");

	const trades = data.Trades;

	const startDate = new Date(trades[0].EntryTime);
	const endDate = new Date(trades[trades.length - 1].CloseTime);
	const diffTime = Math.abs(endDate - startDate);
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	createStatisticElement(
		statisticsContainer,
		"Number of Days",
		diffDays,
		" days"
	);
	createStatisticElement(
		statisticsContainer,
		"Profit Factor",
		calculateProfitFactor(trades)
	);
	let container = document.getElementById("container");
	container.appendChild(statisticsContainer);
}
function createStatisticElement(statisticsContainer, label, value, unit = "") {
	const statisticElement = document.createElement("p");
	statisticElement.classList.add("statistic");

	// Créer un élément <span> pour la valeur
	const valueElement = document.createElement("span");
	valueElement.textContent = value + unit;
	valueElement.classList.add("statistic-value");

	statisticElement.innerHTML = `${label}: `;
	statisticElement.appendChild(valueElement);

	statisticsContainer.appendChild(statisticElement);
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
	const platformFeePercentage = data.PlateformFeePercentage;

	// Calcul du profit/loss en tenant compte des frais de la plateforme
	const profitValues = trades.map((trade) => {
		const profitLoss = trade.ProfitLoss;
		const platformFee = Math.abs(profitLoss) * (platformFeePercentage / 100);
		return profitLoss - platformFee;
	});
	const profitLabels = trades.map((_, index) => `Trade ${index + 1}`);
	const platformFees = profitValues.map(
		(profit) => Math.abs(profit) * (platformFeePercentage / 100)
	);
	const platformFeeColor = "orange";

	const profitColors = profitValues.map((profit) =>
		profit >= 0 ? "green" : "red"
	);

	const container = document.getElementById("container");

	// Crée l'élément canvas dans la div avec l'ID "container"
	const canvas = createCanvasElement("profit-chart", container, "Profit/Loss");

	const ctx = canvas.getContext("2d");
	const chart = new Chart(ctx, {
		type: "bar",
		data: {
			labels: profitLabels,
			datasets: [
				{
					label: "Profit/Loss",
					data: profitValues,
					backgroundColor: profitColors,
					stack: "stack1",
				},
				{
					label: "Platform Fees",
					data: platformFees,
					backgroundColor: platformFeeColor,
					stack: "stack1",
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
			plugins: {
				tooltip: {
					mode: "x", // Afficher toutes les informations pour la position horizontale du curseur
				},
			},
		},
	});

	// Calcul des statistiques
	const totalTrades = trades.length;
	const winningTrades = trades.filter((trade) => trade.ProfitLoss >= 0);
	const losingTrades = trades.filter((trade) => trade.ProfitLoss < 0);
	const winningPercentage = (winningTrades.length / totalTrades) * 100;
	const averageWin = calculateAverageProfit(winningTrades);
	const averageLoss = calculateAverageProfit(losingTrades);
	const totalFee = platformFees.reduce((sum, fee) => sum + fee, 0);

	// Création des éléments de statistiques
	const statisticsContainer = document.createElement("div");
	statisticsContainer.classList.add("statistics-container");

	createStatisticElement(statisticsContainer, "Total Trades", totalTrades);
	createStatisticElement(
		statisticsContainer,
		"Winning Trades",
		winningTrades.length
	);
	createStatisticElement(
		statisticsContainer,
		"Losing Trades",
		losingTrades.length
	);
	createStatisticElement(
		statisticsContainer,
		"Winning Percentage",
		winningPercentage.toFixed(2),
		"%"
	);
	createStatisticElement(
		statisticsContainer,
		"Average Win",
		averageWin.toFixed(2),
		"€"
	);
	createStatisticElement(
		statisticsContainer,
		"Average Loss",
		averageLoss.toFixed(2),
		"€"
	);
	createStatisticElement(
		statisticsContainer,
		"Total Fee",
		totalFee.toFixed(2),
		"€"
	);

	// Ajout du conteneur de statistiques sous le graphique
	container.appendChild(statisticsContainer);
}

function calculateAverageProfit(trades) {
	const totalProfit = trades.reduce((sum, trade) => sum + trade.ProfitLoss, 0);
	return totalProfit / trades.length;
}
function calculatePercentChange(values) {
	const firstValue = values[0];
	const lastValue = values[values.length - 1];
	return ((lastValue - firstValue) / firstValue) * 100;
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

	const statisticsContainer = document.createElement("div");
	statisticsContainer.classList.add("statistics-container");

	// Calcul des statistiques supplémentaires
	const balanceChange = balanceData[balanceData.length - 1] - initialBalance;
	const lowestBalance = Math.min(...balanceData);
	const highestBalance = Math.max(...balanceData);
	const balancePercentChange = calculatePercentChange(balanceData);
	const lowestPercentBalance =
		((lowestBalance - initialBalance) / initialBalance) * 100;
	const highestPercentBalance =
		((highestBalance - initialBalance) / initialBalance) * 100;

	// Création des éléments de statistiques
	createStatisticElement(
		statisticsContainer,
		"Percent Balance Change",
		balancePercentChange.toFixed(2),
		"%"
	);
	createStatisticElement(
		statisticsContainer,
		"Percent Lowest Balance Change",
		lowestPercentBalance.toFixed(2),
		"%"
	);
	createStatisticElement(
		statisticsContainer,
		"Percent Highest Balance Change",
		highestPercentBalance.toFixed(2),
		"%"
	);
	createStatisticElement(
		statisticsContainer,
		"Lowest Balance",
		lowestBalance.toFixed(2),
		"€"
	);
	createStatisticElement(
		statisticsContainer,
		"Highest Balance",
		highestBalance.toFixed(2),
		"€"
	);
	let sign = balanceChange >= 0 ? "+" : "";
	createStatisticElement(
		statisticsContainer,
		"Balance Change",
		sign + balanceChange.toFixed(2),
		"€"
	);

	container.appendChild(statisticsContainer);
}

function generateParametersTable(data) {
	var parameterVariations = data.StrategyParameters.ParameterVariations;
	var parametersContainer = document.createElement("div");
	parametersContainer.id = "parameters-container";

	var title = document.createElement("h2");
	title.textContent = "Parametres utilisée";
	parametersContainer.appendChild(title);

	for (var key in parameterVariations) {
		var parametersList = document.createElement("div");
		parametersList.className = "parameters-list";

		var parameter = parameterVariations[key];

		var parameterTitle = document.createElement("h3");
		parameterTitle.textContent = key;
		parametersContainer.appendChild(parameterTitle);

		for (var prop in parameter) {
			var parameterDiv = document.createElement("div");
			parameterDiv.className = "parameter";

			var propTitle = document.createElement("h4");
			propTitle.textContent = prop;
			parameterDiv.appendChild(propTitle);

			var propValue = document.createElement("p");
			propValue.textContent = parameter[prop];
			parameterDiv.appendChild(propValue);

			parametersList.appendChild(parameterDiv);
		}

		parametersContainer.appendChild(parametersList);
	}

	var container = document.getElementById("container");
	container.appendChild(parametersContainer);
}
