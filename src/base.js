class BaseAnswer {
	constructor(text, result, index) {
		this.text = text;
		this.result = result ? result.trim().toLowerCase() : 'na';
		this.index = index;
	}
	show(holder, pce) {
		let btn = document.createElement('a');
		btn.className = 'btn';
		btn.setAttribute('data-result', this.result);
		btn.setAttribute('data-index', this.index);
		btn.innerHTML = this.text;
		holder.appendChild(btn);
		btn.addEventListener('click', evt => pce.answerSelected(evt.target));
		return btn;
	}
}
class BaseQuestion {
	constructor(pce, sheetData, sheetName, answerCls) {
		this.pce = pce;
		this.name = sheetName;
		this.img = _extract_data(/^header/i, sheetData);
		this.text = _extract_data(/^question/i, sheetData);
		this.randomizeAnswers = _extract_data(/^randomize/i, sheetData).match(/yes/i);
		let answersData = _extract_data(/^answer/i, sheetData, true);
		this.answers = [];
		for (let i = 0; i < answersData.length; i++) {
			this.answers[i] = new answerCls(answersData[i][0], answersData[i][1], i + 1);
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
		this.answers.forEach(a => a.show(ele, this.pce));
		return ele;
	}
}

class BaseResult {
	constructor(quiz, sheetData, sheetName) {
		this.templates = { 'WEBSITE-LINK': document.location.href }
		this.quiz = quiz;
		this.name = sheetName;
		this.img = _extract_data(/^header/i, sheetData);
		this.text = _extract_data(/^summary/i, sheetData).split("\n").join("<br/>");
		this.btnText = _extract_data(/^tweet button/i, sheetData);
		this.tweetText = _extract_data(/^tweet text/i, sheetData).replace('[[WEBSITE-LINK]]', document.location.href);
	}
	_replaceText(input) {
		let output = input;
		for (let k in this.templates) {
			output = output.replace(new RegExp('\\[\\[' + k + '\\]\\]', 'g'), this.templates[k]);
		}
		return output;
	}
	show() {
		this.quiz.holder.innerHTML = '';
		let ele = document.createElement('div');
		let img = document.createElement('img');
		img.src = this.img;
		img.className = 'header';
		img.style.minHeight = this.quiz.headerHeight + 'px';
		this.quiz.holder.appendChild(ele);
		ele.appendChild(img);
		if (this.text) {
			let p = document.createElement('p');
			p.innerHTML = this._replaceText(this.text);
			ele.appendChild(p);
		}
		if (this.btnText) {
			let btn = document.createElement('a');
			btn.className = 'btn';
			btn.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(this._replaceText(this.tweetText));
			btn.innerHTML = this.btnText;
			ele.appendChild(btn);
		}
		return ele;
	}
}

class BaseQuiz {
	constructor(questionCls, answerCls, resultCls) {
		this.questionIndex = -1;
		this.userAnswers = {};
		this.questions = [];
		this.results = {};
		this.headerHeight = 20;
		let footer = "";
		for (let sheet of DATA) {
			let name = sheet.name.toLowerCase().trim();
			if (name == 'settings') {
				this.randomizeQuestions = _extract_data(/^randomize/i, sheet.values).match(/yes/i);
				footer = _extract_data(/^footer/i, sheet.values);
			} else if (name.match(/^question/i)) {
				this.questions.push(new questionCls(this, sheet.values, name, answerCls));
			} else if (name.match(/^result/i)) {
				this.results[name] = new resultCls(this, sheet.values, name);
			}
		}
		this.holder = document.createElement('div');
		this.holder.className = "main";
		document.body.appendChild(this.holder);
		if (footer) {
			let ele = document.createElement('div');
			ele.innerHTML = footer;
			ele.className = 'footer';
			document.body.append(ele);
		}
		this.reset();
	}

	reset(label) {
		this.questionIndex = -1;
		this.userAnswers = [];
		if (this.randomizeQuestions) _shuffle(this.questions);
		if (label) gtag('event', 'button click', { label: label });
		this.nextQuestion();
	}

	nextQuestion() {
		if (this.questionIndex == 0) {
			this.headerHeight = this.holder.querySelector('img').offsetHeight;
		}
		this.questionIndex++;
		let question = this.questions[this.questionIndex];
		if (this.questionIndex < this.questions.length) {
			gtag('event', 'question', { label: `${this.questionIndex + 1} / ${this.questions.length}`, value: question.name });
			this.questions[this.questionIndex].show();
		} else {
			this.showResult();
		}
		let footer = document.querySelector('.footer');
		if (footer) {
			footer.style.top = Math.max(this.holder.offsetHeight, window.innerHeight - footer.offsetHeight - 5) + 'px';
			footer.style.width = this.holder.offsetWidth + 'px';
		}
		twemoji.parse(this.holder);
	}

	answerSelected(btn) {
		let r = btn.getAttribute('data-result');
		this.userAnswers.push(r);
		let question = this.questions[this.questionIndex];
		gtag('event', 'answer', { label: question.name + ':' + btn.getAttribute('data-index'), value: r });
		this.nextQuestion();
	}

	_countAnswers() {
		let maxCount = 0;
		let result;
		let cache = {};
		for (let r of this.userAnswers) {
			cache[r] = cache[r] ? cache[r] + 1 : 1;
			if (cache[r] > maxCount) {
				maxCount = cache[r];
				result = r;
			}
		}
		return { result: result, score: maxCount };
	}

	showResult() {
		let r = this._countAnswers();
		gtag('event', 'result', { label: r.result, value: r.score });
		this.results[r.result].show();
		twemoji.parse(this.holder);
	}
}