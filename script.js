let trivialData;
let score = 0;
let question_count = 0;
let question_delay;
let question_amount;
let difficulty;
let category;
let type;
let current_streak = 0;
let streaks = [];


function openSettings() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('settings').classList.remove('hidden');
}

function backToMainMenu() {
    document.getElementById('settings').classList.add('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('endScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
    clearTimeout(question_delay);
    question_count = 0;
    score = 0;
    current_streak = 0;
    streaks = [];
    trivialData = null;
}

function backToSettings() {
    if (confirm('Are you sure you wanna go back to settings?')){
        document.getElementById('gameScreen').classList.add('hidden');
        openSettings();
        clearTimeout(question_delay);
        question_count = 0;
        score = 0;
        current_streak = 0;
        streaks = [];
        trivialData = null;
    }
}

function startGame() {
    document.getElementById('settings').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    document.getElementById('questionCount').innerHTML = 'Question: ' + (question_count + 1) + '/' + question_amount;
    document.getElementById('streak').innerHTML = 'Streak: ' + current_streak;
    document.getElementById('gameScore').innerHTML = 'Score: ' + score;
    nextQuestion();
}

function endGame() {
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('endScreen').classList.remove('hidden');
    document.getElementById('endScore').innerHTML = 'Score: ' + score + '/' + question_amount +
        '<br><br>Highest streak:' + (streaks.length === 0 ? 0 : (streaks.length === 1 ? streaks[0] : Math.max(...streaks)))
        + '<br><br>' + scoreAnalysis();
    trivial = null;
}

function scoreAnalysis() {
    const succes = score / question_amount;
    let feedBack = '';
    if (succes <= 0.25) {
        feedBack = 'Did you even try :D';
    } else if (succes <= 0.50) {
        feedBack = 'Good effort, but you can do better!';
    } else if (succes <= 0.75) {
        feedBack = 'Well done! You did decently, but there is still potential for improvement';
    } else {
        feedBack = 'Excellent performance! You are a true trivia guru!';
    }
    return feedBack;
}

async function playAgain() {
    trivialData = await fetchQuestionData(question_amount, difficulty, category, type);
    question_count = 0;
    score = 0;
    current_streak = 0;
    streaks = [];
    document.getElementById('endScreen').classList.add('hidden');
    if (trivialData === null) {
        backToSettings();
    } else {
        startGame();
    }
}

function nextQuestion() {
    document.getElementById('question').innerHTML = trivialData.results[question_count].question;
    document.getElementById('questionCount').innerHTML = 'Question: ' + (question_count + 1) + '/' + question_amount;
    getAnswers();
}

function getAnswers() {
    const answerBtnContainer = document.querySelector('.answerBtns');
    answerBtnContainer.innerHTML = '';
    const buttons = [];
    const buttonCount = trivialData.results[question_count].type === 'multiple' ? 4 : 2;
    let answers;
    if (buttonCount === 4) {
        answers = trivialData.results[question_count].incorrect_answers;
        answers.push(trivialData.results[question_count].correct_answer);
        answers = answers.sort(() => Math.random() - 0.5);
    } else {
        answers = ["True", "False"];
    }

    for (let i = 0; i < buttonCount; i++) {
        const button = document.createElement('button');

        button.textContent = answers[i];

        button.classList.add('answerBtn')

        button.addEventListener('click', function () {
            if (button.textContent === trivialData.results[question_count].correct_answer) {
                button.style.backgroundColor = 'hsl(187, 98%, 50%)';
                score++;
                current_streak++;
                document.getElementById('gameScore').innerHTML = 'Score: ' + score;
            } else {
                button.style.backgroundColor = "#FF69B4";
                if (current_streak > 0) {
                    streaks.push(current_streak);
                    current_streak = 0;
                }
            }

            document.getElementById('streak').innerHTML = 'Streak: ' + current_streak;

            //change all correct answers to green and incorrects to red
            buttons.forEach(btn => {
                if (btn.textContent === trivialData.results[question_count].correct_answer) {
                    btn.style.backgroundColor = 'hsl(187, 98%, 50%)';
                } else {
                    btn.style.backgroundColor = "#FF69B4";
                }
                btn.disabled = true
            });
            question_count++;

            //disable buttons for 3 seconds after answerBtn clicked
            question_delay = setTimeout(function () {
                buttons.forEach(btn => {
                    btn.disabled = false
                    button.style.backgroundColor = '';
                });
                if (question_count < question_amount) {
                    nextQuestion();
                } else {
                    if (current_streak > 0) {
                        streaks.push(current_streak);
                    }
                    endGame();
                }
            }, 3000);
        });
        answerBtnContainer.appendChild(button);
        buttons.push(button);
    }
}


document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('triviaForm');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        question_amount = document.getElementById('trivia_amount').value;
        if (question_amount.length === 0){
            alert('Please fill number of questions');
            return;
        }
        difficulty = document.getElementsByName('trivia_difficulty')[0].value;
        category = document.getElementsByName('trivia_category')[0].value;
        type = document.getElementsByName('trivia_type')[0].value;
        trivialData = await fetchQuestionData(question_amount, difficulty, category, type);
        if (trivialData === null) {
            backToSettings();
        }
        else {
            startGame();
        }
    });
});

async function fetchQuestionData(amount, difficulty, category, type) {
    let apiUrl = "https://opentdb.com/api.php?amount=".concat(amount);
    if (difficulty !== 'any') {
        apiUrl += '&difficulty=' + difficulty;
    }
    if (category !== 'any') {
        apiUrl += '&category=' + category;
    }
    if (type !== 'any') {
        apiUrl += '&type=' + type;
    }
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        if (data.response_code === 1) {
            alert('There was not enough questions in the database with these settings unfortunately, pls change your settings')
            return null;
        }

        data.results.forEach(question => {
            question.question = decodeHTML(question.question);
            question.correct_answer = decodeHTML(question.correct_answer);
            question.incorrect_answers = question.incorrect_answers.map(answer => decodeHTML(answer));
        });

        return data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        alert("There was an error uploading questions, pls try again");
        return null;
    }
}

function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}
