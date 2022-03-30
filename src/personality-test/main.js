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
function _extract_data(pattern, sheetData, multipleValues) {
	let arr = []
	for (let i = 0; i < sheetData.length; i++) {
		if (sheetData[i][0].trim().match(pattern)) {
			arr.push(sheetData[i].splice(1));
		}
	}
	if (arr.length == 0) {
		return '';
	}
	if (multipleValues) {
		return arr
	}
	return arr[0][0];
}

class Question {
	constructor(pce, sheetData, sheetName) {
		this.pce = pce;
		this.name = sheetName;
		this.img = _extract_data(/^header/i, sheetData);
		this.text = _extract_data(/^question/i, sheetData);
		this.randomizeAnswers = _extract_data(/^randomize/i, sheetData).match(/yes/i);
		this.answers = _extract_data(/^answer/i, sheetData, true);
		for (let i = 0; i < this.answers.length; i++) {
			let a = this.answers[i];
			this.answers[i] = { text: a[0], result: a[1].toLowerCase().trim() };
		}
	}

	show() {
		this.pce.holder.innerHTML = "";
		let ele = document.createElement('div');
		let img = document.createElement('img');
		img.src = this.img;
		img.className = 'header';
		img.style.minHeight = this.pce.headerHeight + 'px';
		this.pce.holder.appendChild(ele);
		ele.appendChild(img);
		if (this.text) {
			let p = document.createElement('p');
			p.innerHTML = this.text;
			ele.appendChild(p);
		}
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
	validate() {
	}
}

class Result {
	constructor(pce, sheetData, sheetName) {
		this.pce = pce;
		this.name = sheetName;
		this.img = _extract_data(/^header/i, sheetData);
		this.text = _extract_data(/^summary/i, sheetData).split("\n").join("<br/>");
		this.btnText = _extract_data(/^tweet button/i, sheetData);
		this.tweetText = _extract_data(/^tweet text/i, sheetData).replace('[[WEBSITE-LINK]]', document.location.href);
		this.selected = 0;
	}
	show() {
		this.pce.holder.innerHTML = '';
		let ele = document.createElement('div');
		let img = document.createElement('img');
		img.src = this.img;
		img.className = 'header';
		img.style.minHeight = this.pce.headerHeight + 'px';
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

class PersonalityTest {
	constructor() {
		this.questionIndex = -1;
		this.userAnswers = [];
		this.questions = [];
		this.results = {};
		this.headerHeight = 20;
		let footer = "";
		let randomizeQuestions = true;
		for (let sheet of DATA) {
			let name = sheet.name.toLowerCase().trim();
			if (name == 'settings') {
				randomizeQuestions = _extract_data(/^randomize/i, sheet.values) == 'yes';
				footer = _extract_data(/^footer/i, sheet.values);
			} else if (name.match(/^question/i)) {
				this.questions.push(new Question(this, sheet.values, name));
			} else if (name.match(/^result/i)) {
				this.results[name] = new Result(this, sheet.values, name);
			}
		}
		this.holder = document.createElement('div');
		this.holder.className = "main";
		document.body.appendChild(this.holder);
		if (randomizeQuestions) _shuffle(this.questions);
		if (footer) {
			let ele = document.createElement('div');
			ele.innerHTML = footer;
			ele.className = 'footer';
			document.body.append(ele);
		}
		this.nextQuestion();
	}

	nextQuestion() {
		if (this.questionIndex == 0) {
			this.headerHeight = this.holder.querySelector('img').offsetHeight;
		}
		this.questionIndex++;
		if (this.questionIndex < this.questions.length) {
			gtag('event', 'question', { label: `${this.questionIndex + 1} / ${this.questions.length}` });
			this.questions[this.questionIndex].show();
		} else {
			this.showResult();
		}
		let footer = document.querySelector('.footer');
		if (footer) {
			footer.style.top = Math.max(this.holder.offsetHeight, window.innerHeight - footer.offsetHeight - 5) + 'px';
			footer.style.width = this.holder.offsetWidth + 'px';
		}
	}

	answerSelected(btn) {
		let r = btn.getAttribute('data-result');
		this.results[r].selected++;
		gtag('event', 'answer', { label: btn.innerHTML });
		this.nextQuestion();
	}

	showResult() {
		let maxCount = 0;
		let result;
		for (let key in this.results) {
			let r = this.results[key]
			if (r.selected > maxCount) {
				maxCount = r.selected;
				result = r;
			}
		}
		gtag('event', 'result', { label: result.name });
		result.show();
	}
}

window.pce = new PersonalityTest();