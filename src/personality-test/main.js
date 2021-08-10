function _shuffle(arr) {
	var i = arr.length, j, temp;
	if (i == 0) return;
	while (--i) {
		j = Math.floor(Math.random() * (i + 1));
		temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
}

class Question {
	constructor(pce, sheetData) {
		this.pce = pce;
		this.img = sheetData[0][1];
		this.text = sheetData[1][1];
		this.randomizeAnswers = sheetData[2][1].trim().toLowerCase() == 'yes';
		let skipped = 3
		this.answers = [];
		for (let i = skipped; i < sheetData.length; i++) {
			this.answers.push({ result: (i - skipped), text: sheetData[i][1] });
		}
	}
	show() {
		this.pce.holder.innerHTML = "";
		let ele = document.createElement('div');
		let img = document.createElement('img');
		img.src = this.img;
		img.className = 'header';
		this.pce.holder.appendChild(ele);
		ele.appendChild(img);
		let p = document.createElement('p');
		p.innerHTML = this.text;
		ele.appendChild(p);
		if (this.randomizeAnswers) _shuffle(this.answers);
		for (let a of this.answers) {
			let btn = document.createElement('a');
			btn.className = 'btn';
			btn.setAttribute('data-result', a.result);
			btn.innerHTML = a.text;
			ele.appendChild(btn);
			btn.addEventListener('click', evt => this.pce.answerSelected(evt.target));
		}
	}
}

class Result {
	constructor(pce, sheetData) {
		this.pce = pce;
		this.img = sheetData[0][1];
		this.text = sheetData[1][1];
		this.btnText = sheetData[2][1];
		this.tweetText = sheetData[3][1].replace('[[WEBSITE-LINK]]', document.location.href);
		this.selected = 0;
	}
	show() {
		this.pce.holder.innerHTML = '';
		let ele = document.createElement('div');
		let img = document.createElement('img');
		img.src = this.img;
		img.className = 'header';
		this.pce.holder.appendChild(ele);
		ele.appendChild(img);
		let p = document.createElement('p');
		p.innerHTML = this.text;
		ele.appendChild(p);
		let btn = document.createElement('a');
		btn.className = 'btn';
		btn.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(this.tweetText);
		btn.innerHTML = this.btnText;
		ele.appendChild(btn);
	}
}

class PersonalityTest {'
	constructor() {
		this.questionIndex = -1;
		this.randomizeQuestions = true;
		this.userAnswers = [];
		this.questions = [];
		this.results = [];
		for (let sheet of DATA) {
			let name = sheet.name.toLowerCase().trim();
			if (name == 'settings') {
				this.randomizeQuestions = sheet.values[3][1].toLowerCase().trim() == 'yes';
			} else if (name.match(/question \d+/i)) {
				this.questions.push(new Question(this, sheet.values));
			} else if (name.match(/result \d+/i)) {
				this.results.push(new Result(this, sheet.values));
			}
		}
		this.holder = document.createElement('div');
		this.holder.className = "main";
		document.body.appendChild(this.holder);
		if (this.randomizeQuestions) _shuffle(this.questions);

		this.nextQuestion();
	}
	nextQuestion() {
		this.questionIndex++;
		if (this.questionIndex < this.questions.length) {
			ga(`question ${this.questionIndex}/${this.questions.length}`);
			this.questions[this.questionIndex].show();
		} else {
			ga('result');
			this.showResult();
		}
	}

	answerSelected(btn) {
		let n = parseInt(btn.getAttribute('data-result'));
		this.results[n].selected++;
		this.nextQuestion();
	}

	showResult() {
		let maxCount = 0;
		let result;
		let index = 0;
		for (let r of this.results) {
			index++;
			if (r.selected > maxCount) {
				maxCount = r.selected;
				result = r;
			}
		}
		gaResult('result-' + index);
		result.show();
	}
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


window.pce = new PersonalityTest();