
// Creates random letters for game
function letterGenerator(){
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
}



function createGame(playerID, letters){
	
	firebaseObj.ref().onDisconnect().remove();
	
	var promise = firebaseObj.ref().set({
		host : playerID,
		gameLetters : letters,
		gameState : "inactive",
	});
	
	
	return promise;
}

function createPlayer(ID){
	firebaseObj.ref("players/" + ID).onDisconnect().remove();
	
	var promise = firebaseObj.ref("players/" + ID).set({
		
		hasRegistered: false,
		score: 0,
		
	});
	
	return promise;
}

function registerPlayer(playerID, userName){
	
	var updates = {};
	updates["players/" + playerID + "/name"] = userName;
	updates["players/" + playerID + "/hasRegistered"] = true;
	
	var promise = firebaseObj.ref().update(updates);
	return promise;
}

function addWord(word, gameLetters){
	
	let validEntry = true;
	
	const wordArry = word.toLowerCase().slice();
	let letterArr = gameLetters.slice();
	
	for(let i = 0; i < wordArry.length; i++){
	
		const index = letterArr.indexOf(wordArry[i]);
		if(index < 0){
			validEntry = false;
			break;
		}
		else{
			letterArr.splice(index, 1);
		}
	}
	
	if(wordArry === ""){
		alert("Can't enter nothing!");
	}
	
	else if(validEntry){ // submits word if valid and returns promise
		var updates = {};
		updates.correctAnswer = word.toLowerCase();
		return firebaseObj.ref().update(updates);
	}
	else{
		alert(word + " is not valid!");
	}
}

function addDesc(desc){
	
	var promise = firebaseObj.ref().update({answerDescription: desc});
	return promise;
}

function showTime(endTime){ //incomplete
	
	const now = new Date().getTime();
	timeLeft = endTime - now;
	
}

function checkTime(endTime){ //incomplete
	
	const now = new Date().getTime();
	if(now >= endTime){
		firebaseObj.ref().update({gameState : "complete"});
	}
	
}



function renderHostWelcome(gameLetters, userName){
	
	renderDiv.innerHTML =
		`<h1>The Game?</h1>
		
		<h2>Hello ${userName}!</h2>
		
		<p>Here are 9 random letters</p>	
		<div id="game_letters"></div>
		<p>
			Make a word using these letters. You can only use each letter once.
			Others will try to guess this word.
		</p>
		
		<input id="word" type="text">
		
		
		<textarea id="description" rows="4" cols="40">Give a description of your word
		</textarea>
		<button id="word_desc_btn">Start a new game</button>
		
		
		<div id="other_players"></div>`;
		
	document.getElementById("game_letters").innerHTML = gameLetters.join(" ");
		
}


function renderHostView(){
	
	firebaseObj.ref().once("value").then(snap => {
		
		const word = snap.child("correctAnswer").val();
		const desc = snap.child("answerDescription").val();
		
		renderDiv.innerHTML =
			`<p>Time remaining</p>
			<div id="timer"></div>
			
			<p>Your word is:</p>
			<h2 id="host_word">${word}</h2>
			<p><i>${desc}</i></p>
			
			<p>Here's what people are guessing</p>
			<div id="player_guesses"></div>`;
	});
}

function renderPlayerView(){
	
	firebaseObj.ref().once("value").then(snap => {
		
		const desc = snap.child("answerDescription").val();
		const letters = Object.values(snap.child("gameLetters").val());
	
	
		renderDiv.innerHTML =
		`<h2>Can you guess the word?</h2>
		<p>Time remaining</p>
		<div id="timer"></div>
		
		
		<p>You have nine letters</p>
		<h2>${letters}</h2>
		
		<p>Hint:</p>
		<h2 id="host_desc">${desc}</h2>
		
		<input id="answer_input" type="text">
		<button id="answer_btn">Try</button>
		
		<div id="guesses"></div>
		<div id="other_players"></div> `;

	});
	
}
	
	




//------------------------------------------------------------------------------------------------
const firebaseObj = firebase.database();

const nameInput = document.getElementById("name_box");


const playerID = createID();
const letters = letterGenerator();

const renderDiv = document.getElementById("render_div");
const playersDiv = document.getElementById("render_players_div");

function createID(){
	return '_' + Math.random().toString(36).substr(2, 9);
}


// Setting up game
// First check if game has been created

firebaseObj.ref("gameState").once("value")

.then((snap)=>{ 
	
	const isFirstPlayer = (snap.val() === null);
	
	if(isFirstPlayer){
		createGame(playerID, letters)
		.then(createPlayer(playerID));
	}
	else{
		createPlayer(playerID);
	}
});

// This checks to see if a game has officially started or finished
firebaseObj.ref("gameState").on("value", snap => {
	
	// if game has been started
	if(snap.val() === "active"){ 
		
		firebaseObj.ref("host").once("value")
		.then(snap => {
			if(snap.val() === playerID){
				renderHostView();
			}
			else{
				renderPlayerView();
			}
		});
	
	}
	
	
	// if game is finished
	if(snap.val() === "finished"){
		
		
		
		
	}
});


// See other players

firebaseObj.ref("players").on("value", snap => {
	
	playersDiv.innerHTML = "";
	
	snap.forEach(player => {
	
		const playerName = player.child("name").val();
	
		if(playerName !== null){
			let node = document.createElement("div");
			const nameText = document.createTextNode(playerName.toUpperCase());
			node.appendChild(nameText);
			playersDiv.appendChild(node);
		}
		
	});
	
	if(playersDiv.innerHTML === ""){
		playersDiv.innerHTML = "<p><i>No one's here yet...</i></p>";
	}

});


//Event Listeners

//Submit user name and register player
const nameBtn = document.getElementById("btn_submit_user");

nameBtn.addEventListener("click", ()=>{
	
	const userName = nameInput.value;
	registerPlayer(playerID, userName)
	.then(()=>{
		firebaseObj.ref("host").once("value")
	.then(snap=> { //Check if user is the game's host
		const gameHost = snap.val();
		if(gameHost === playerID){
			renderHostWelcome(letters, userName);			
		}
	});	
	});
});

//function checkWord(word){
//	
//	
//	
//	let correctWord = false;
//	
//	
//	
//	
//	
//	return correctWord;
//}


//Submit host word and description
renderDiv.addEventListener("click",

	(e)=>{
		if(e.target && e.target.id === "word_desc_btn"){
			
			const word = document.getElementById("word").value;
			const desc = document.getElementById("description").value;
			
			addWord(word, letters)
			.then(addDesc(desc))
			.then(()=>{
				firebaseObj.ref().update({gameState: "active"});
			});
		}
		
		if(e.target && e.target.id === "answer_btn"){
			
			const guess = document.getElementById("answer_input").value;
			
			
			
			firebaseObj.ref().once("value")
			.then(snap => {
				
				const answer = snap.child("correctAnswer").val();
				
				if(answer === guess){
					let updates = {};
					updates.winner = snap.child("players/" + playerID + "/name").val();
					updates.gameState = "finished";
					console.log(updates.winner);
					firebaseObj.ref().update(updates);
					
				}
			});
		}
	}					   
);








