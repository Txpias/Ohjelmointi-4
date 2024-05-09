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
const form = document.getElementById('triviaForm');

//Open settings page
function openSettingsPage() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('settings').classList.remove('hidden');
}

//Reset everything and go back to main menu page
function backToMainMenuPage() {
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
    form.reset();
}


//Show popup and confirm that player really wants to leave the game
function confirmAndReturnToMainMenu() {
    if (confirm('Are you sure you wanna leave  the game?')) {
        backToMainMenuPage();
    }
}

//Reset stats and questions and go back to settings page
function resetGameAndOpenSettings() {
    document.getElementById('gameScreen').classList.add('hidden');
    openSettingsPage();
    clearTimeout(question_delay);
    question_count = 0;
    score = 0;
    current_streak = 0;
    streaks = [];
    trivialData = null;
}

//Show popup and confirm that player really wants to leave game and go back to settings
function confirmAndReturnToSettings() {
    if (confirm('Are you sure you wanna go back to settings?')) {
        resetGameAndOpenSettings();
    }
}

//Start game
function startGame() {
    document.getElementById('settings').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    document.getElementById('questionCount').innerHTML = 'Question: ' + (question_count + 1) + '/' + question_amount;
    document.getElementById('streak').innerHTML = 'Streak: ' + current_streak;
    document.getElementById('gameScore').innerHTML = 'Score: ' + score;
    nextQuestion();
}

//Go to ending screen
function endGame() {
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('endScreen').classList.remove('hidden');
    document.getElementById('endScore').innerHTML = 'Score: ' + score + '/' + question_amount +
        '<br><br>Highest streak:' + (streaks.length === 0 ? 0 : (streaks.length === 1 ? streaks[0] : Math.max(...streaks)))
        + '<br><br>' + scoreAnalysis();
    trivial = null;
}

//Give feedback to player when game ends
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

//Reset stats and get new questions with same settings and start game again
async function playAgain() {
    trivialData = await fetchQuestionData(question_amount, difficulty, category, type);
    if (trivialData === null || trivialData === -1) {
        alert('There was an error getting new questions, pls try again');
        return;
    }
    question_count = 0;
    score = 0;
    current_streak = 0;
    streaks = [];
    document.getElementById('endScreen').classList.add('hidden');
    startGame();

}

//Get next question
function nextQuestion() {
    document.getElementById('question').innerHTML = trivialData.results[question_count].question;
    document.getElementById('questionCount').innerHTML = 'Question: ' + (question_count + 1) + '/' + question_amount;
    getAnswers();
}

//Function gets answers from trivial data variable which is json object. Function creates answer buttons depending on question type. If multiple choice question there will be 4 buttons and else 2 buttons.
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

//Listener for settings page
document.addEventListener('DOMContentLoaded', function () {
    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        question_amount = document.getElementById('trivia_amount').value;
        if (question_amount.length === 0) {
            alert('Please fill number of questions');
            return;
        }
        difficulty = document.getElementsByName('trivia_difficulty')[0].value;
        category = document.getElementsByName('trivia_category')[0].value;
        type = document.getElementsByName('trivia_type')[0].value;
        trivialData = await fetchQuestionData(question_amount, difficulty, category, type);
        if (trivialData === null) {
            alert('There was not enough questions in the database with these settings unfortunately, pls change your settings');
        } else if (trivialData === -1) {
            alert("There was an error uploading questions, pls try again");
        }
        else {
            startGame();
        }
    });
});

//Get questions from the database
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
        return -1;
    }
}

//helper function for fetchQuestionData: decodes html encoding
function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}
