

function openSettings(){
    document.getElementById('homepage').classList.add('hidden');
    document.getElementById('settings').classList.remove('hidden');
}

function backToMainMenu(){
    document.getElementById('settings').classList.add('hidden');
    document.getElementById('homepage').classList.remove('hidden');
}
