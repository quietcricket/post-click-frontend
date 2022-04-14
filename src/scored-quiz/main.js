class SQResult extends BaseResult {
	constructor(pce, sheetData, sheetName) {
		super(pce, sheetData, sheetName);
		this.againBtn = _extract_data(/^try again/i, sheetData);
		this.maxScore = parseInt(_extract_data(/^max/i, sheetData));
		this.minScore = parseInt(_extract_data(/^min/i, sheetData));

	}
	show() {
		let ele = super.show();
		if (!this.againBtn) return ele;

		let btn = document.createElement('a');
		btn.className = 'btn';
		btn.innerHTML = this.againBtn;
		ele.appendChild(btn);
		btn.addEventListener('click', evt => this.quiz.reset(this.againBtn));
	}
}



class ScoredQuiz extends BaseQuiz {
	constructor() {
		super(BaseQuestion, BaseAnswer, SQResult);
	}
	answerSelected(btn) {
		let r = btn.getAttribute('data-result');
		this.userAnswers.push(r);
		let question = this.questions[this.questionIndex];
		gtag('event', 'answer', { label: question.name + ':' + btn.getAttribute('data-index'), value: r });
		document.querySelectorAll('a.btn').forEach(ele => {
			if (ele.getAttribute('data-result') == 'correct') {
				ele.classList.add('correct');
			}
			ele.classList.add('disabled');
		});
		if (r != 'correct') {
			btn.classList.add('wrong');
		}
		setTimeout(() => {
			this.nextQuestion();
		}, r == 'correct' ? 700 : 2000);
	}

	showResult() {
		let score = 0;
		for (let a of this.userAnswers) {
			if (a == 'correct') score++;
		}
		for (let key in this.results) {
			let r = this.results[key];
			if (score >= r.minScore && score <= r.maxScore) {
				gtag('event', 'result', { label: key, value: score });
				r.templates['SCORE'] = score + '';
				r.show();
				break;
			}
		}
		twemoji.parse(this.holder);
	}
}

window.quiz = new ScoredQuiz();