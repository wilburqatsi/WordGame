

let letterGenerator = ()=>{
	const letters = "abcdefghijklmnopqrstuvwxyz";
	
	let randomLetters = [];
	
	while(randomLetters.length < 9 ){
		randomLetters.push(letters[Math.floor(Math.random() * 25)]);
		
		if(randomLetters.length === 9){
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
			if(vowels <= 2 || consonants <= 2){
				randomLetters = [];
			}
			else{
				return randomLetters;
			}
		}
	}
};


function createGame(newGame){
	if(newGame){
		
		const randomLetters = letterGenerator();
		
		firebaseObj.ref().set({
			host : "",
			gameLetters : randomLetters,
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


//------------------------------------------------------------------------------------------------
const firebaseObj = firebase.database();
const userNameBox = document.getElementById("name_box");
const userSubmit = document.getElementById("btn_submit_user");



// Setting up game
// First check if game has been created
firebaseObj.ref().once("value").then((snap)=>{ 

	const newGame = (snap.val() === null);
	createGame(newGame);
	const playerKey = createPlayer();
	
	if(newGame){
		var updates = {};
		updates.host = playerKey;
		firebaseObj.ref().update(updates);
	}
	
	//Add User's name to firebase player object
	userSubmit.addEventListener("click", registerPlayer);
	
	
});













