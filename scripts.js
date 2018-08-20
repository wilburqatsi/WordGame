
// Creates random letters for game
let letterGenerator = ()=>{
	const letters = "abcdefghijklmnopqrstuvwxyz"; //string of possible letters
	
	let randomLetters = []; //random letter array
	
	while(randomLetters.length < 9 ){ //add a random letter while array length less than 9
		randomLetters.push(letters[Math.floor(Math.random() * 25)]);
		
		if(randomLetters.length === 9){ // if array size = 9, then check to see if there's enough consonants & vowels
			let vowels = 0;
			let consonants = 0;
			randomLetters.forEach((letter)=>{
				switch(letter){
					case "a":
					case "e":
					case "i":
					case "o":
					case "u":
						vowels++;
					break;
					default:
						consonants++;
				}
			});
			if(vowels < 2 || consonants < 2){ // erase array if there are not enough vowels/consonants
				randomLetters = [];
			}
			else{
				return randomLetters; // return array if length === 9 and vowels/consonants > 2
			}
		}
	}
};


function createGame(newGame){
	if(newGame){
		
		
		
		firebaseObj.ref().set({
			host : "",
			gameLetters : "",
			gameState : "inactive",
			correctAnswer : "",
			answerDescription : "",
			timeRemaining : 0,
		});
		
		
		firebaseObj.ref().onDisconnect().remove();
		
	}
}

function createPlayer(){
	playerKey = firebaseObj.ref("players").push({
		playerKey: "",
		hasRegistered: false,
		name: "",
		score: 0,
	}).key;
	
	var updates = {};
	updates["players/" + playerKey + "/playerKey"] = playerKey;
	firebaseObj.ref().update(updates);
	
	firebaseObj.ref("players/" + playerKey).onDisconnect().remove();
	
	return playerKey;
}

function registerPlayer(){
	const userName = userNameBox.value;
	var updates = {};
	updates["players/" + playerKey + "/name"] = userName;
	updates["players/" + playerKey + "/hasRegistered"] = true;
	
	firebaseObj.ref().update(updates);
}

function addWord(){
	
	const gameWord = word.value;
	var updates = {};
	updates.correctAnswer = gameWord;
	firebaseObj.ref().update(updates);
	
}


//------------------------------------------------------------------------------------------------
const firebaseObj = firebase.database();

// HTML elements
const userNameBox = document.getElementById("name_box");
const userBtn = document.getElementById("btn_submit_user");

const hostPrompt = document.getElementById("host_prompt");

const letters = document.getElementById("game_letters");
const word = document.getElementById("word");
const wordBtn = document.getElementById("btn_submit_word");
const description = document.getElementById("description");
const descBtn = document.getElementById("btn_submit_desc");



// Setting up game
// First check if game has been created
firebaseObj.ref().once("value").then((snap)=>{ 

	const isNewGame = (snap.val() === null);
	createGame(isNewGame);
	const playerKey = createPlayer();
	
	//Add User's name to firebase player object
	//userBtn.addEventListener("click", registerPlayer);
	
	//If player is the host and creating a new game...
	if(isNewGame){
		hostPrompt.style.display = "block"; //reveal host prompt
		const randomLetters = letterGenerator();
		var updates = {};
		updates.host = playerKey;
		updates.gameLetters = randomLetters;
		
		firebaseObj.ref().update(updates);
		letters.innerHTML = randomLetters.join(" ");
		
		
		
		
		
	}
	
	
	
	
});













