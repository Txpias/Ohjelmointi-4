let trivialData;


function openSettings(){
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('settings').classList.remove('hidden');
}

function backToMainMenu(){
    document.getElementById('settings').classList.add('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
}

function startGame(){
    document.getElementById('settings').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
}

function backToSettings(){
    document.getElementById('gameScreen').classList.add('hidden');
    openSettings();
    trivialData = null;
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('triviaForm');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Estä lomakkeen oletustoiminto
        
        // Hae lomakkeen tiedot
        let amount = document.getElementById('trivia_amount').value;
        let difficulty = document.getElementsByName('trivia_difficulty')[0].value;
        let category = document.getElementsByName('trivia_category')[0].value;
        let type = document.getElementsByName('trivia_type')[0].value;
        
        //tulosta asetuksien tiedot
        console.log('Amount:', amount);
        console.log('Difficulty:', difficulty);
        console.log('Category:', category);
        console.log('Type:', type);
        
        trivialData = fecthQuestionData(amount, difficulty, category, type);
        
        // Tyhjennä lomake
        // form.reset();
        startGame();
    });
});

async function fecthQuestionData(amount, difficulty, category, type){
    let apiUrl  = "https://opentdb.com/api.php?amount=".concat(amount);
    console.log(apiUrl);
    if (difficulty != 'any'){
        apiUrl = apiUrl.concat('&difficulty=' + difficulty);
    }
    if (category != 'any'){
        apiUrl = apiUrl.concat('&category=' + category);
    }
    if (type != 'any'){
        apiUrl = apiUrl.concat('&type=' + type);
    }
    console.log(apiUrl);
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }


}
