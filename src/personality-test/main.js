function initLandingPage() {

	let qContainer = document.getElementById('questions-container');

	for (let i = 0; i < questions.length; i++) {

		let qDiv = '<div id="question-' + (i + 1) + '" style="display:none;">';
		qDiv += '<img id="q' + (i + 1) + '-img" class="header unselectable" src="img/q' + (i + 1) + '.jpg"/>';
		qDiv += '<p"></p>';
		// qDiv += '<p id="q' + (i+1) + ' class="unselectable">' + questions[i].question + '</p>';

		let toShuffle = [];
		for (let j = 0; j < questions[i].answers.length; j++) {
			toShuffle[j] = '<a id="q' + (i + 1) + '-o' + (j + 1) + '" class="btn" onclick="answered(this);" >' + questions[i].answers[j] + '</a>';
		}

		let shuffled = shuffle(toShuffle);
		for (let k = 0; k < questions[i].answers.length; k++) {
			qDiv += shuffled[k];
		}

		qDiv += '</div>';
		qContainer.innerHTML += qDiv;
		answersGiven[i] = 0;
	}

	document.getElementById('question-1').style.display = "block";
	ga('question-1');

	addFooter(qContainer);
}

function answered(answer) {

	let q = parseInt(answer.id.toString().substring(1, 2));
	let a = parseInt(answer.id.toString().substring(4, 5));
	document.getElementById('question-' + q).style.display = "none";
	answersGiven[q - 1] = a;

	if (q < questions.length) {
		document.getElementById('question-' + (q + 1)).style.display = "block";
		ga('question-' + (q + 1));
	}
	else {

		removeFooter();

		let resultId = getResult(answersGiven);

		if (resultId == 0) // If all answers are different
			resultId = 0; // Set default result
		else
			resultId -= 1;

		ga('result-' + resultId);
		let rDiv = '<img class="header unselectable" src="img/' + results[resultId].img + '"/>';
		rDiv += '<p class="unselectable">' + results[resultId].copy + '</p>';
		rDiv += '<a class="btn" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(results[resultId].tweet + appUrl) + '">' + results[resultId].cta + '</a>';
		let resultContainer = document.getElementById('result');
		resultContainer.innerHTML += rDiv;
		resultContainer.style.display = "block";

		addFooter(resultContainer);
	}
}

function addFooter(ele) {
	let fDiv = '<div id="footer">';
	fDiv += '<p class="footer unselectable"><a href="' + privacyPolicyUrl + '" target="_blank"> Kebijakan Privasi</a> | <a href="' + termsOfUseUrl + '" target="_blank">Syarat Penggunaan</a> </br>'
	fDiv += '*Perlu berlangganan. &#169; 2021 Disney </p>'
	ele.innerHTML += fDiv;
}

function removeFooter() {
	let footerEle = document.getElementById('footer')
	footerEle.parentNode.removeChild(footerEle);
}

function shuffle(arr) {

	let ctr = arr.length, temp, index;

	while (ctr > 0) {
		index = Math.floor(Math.random() * ctr);
		ctr--;
		temp = arr[ctr];
		arr[ctr] = arr[index];
		arr[index] = temp;
	}

	return arr;
}

function getResult(arr) {

	if (arr.length == 0)
		return 0;

	let modeMap = {};
	let maxEl = 0, maxCount = 1;

	for (let i = 0; i < arr.length; i++) {
		let el = arr[i];
		if (modeMap[el] == null)
			modeMap[el] = 1;
		else
			modeMap[el]++;
		if (modeMap[el] > maxCount) {
			maxEl = el;
			maxCount = modeMap[el];
		}
	}

	return maxEl;
};