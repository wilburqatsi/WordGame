
// Create randomized ID for client
function createID(){
	return '_' + Math.random().toString(36).substr(2, 9);
}

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
		gameState : "setup",
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
	
	const wordArr = word.toLowerCase().slice();
	let letterArr = gameLetters.slice();
	
	for(let i = 0; i < wordArr.length; i++){
	
		const index = letterArr.indexOf(wordArr[i]);
		if(index < 0){
			validEntry = false;
			break;
		}
		else{
			letterArr.splice(index, 1);
		}
	}
	
	if(wordArr === ""){
		alert("You have to enter a word!");
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
		
	if(desc !== ""){
		console.log("Here");
		firebaseObj.ref().update({answerDescription: desc});
		
	}
	else{
		alert("You have to cryptically describe your word!");
	}
}

function showTime(){ 
	
	const timeRef = document.getElementById("timer");
	const endTime = new Date().getTime() + 60000;
	
	let interval = setInterval(()=>{
		const now = new Date().getTime();
		const timeLeft = endTime - now;
		timeRef.innerHTML = (Math.round(timeLeft/1000));
		if(now >= endTime){
			clearInterval(interval);
		}
	}, 1000);
}

function checkTime(){
	
	const endTime = new Date().getTime() + 60000;
	
	let interval = setInterval(()=>{
		const now = new Date().getTime();
		if(now >= endTime){
			clearInterval(interval);
			firebaseObj.ref().update({gameState : "finished"});
		}
	}, 1000);
}



function renderHostWelcome(gameLetters, userName){
	
	renderDiv.innerHTML =
		`<h1>Hello ${userName}!</h1>
		
		<p>Here are 9 random letters</p>	
		<div id="game_letters"></div>
		<p>
			Make a word using these letters. You can only use each letter once.
			Others will try to guess this word.
		</p>
		
		<form onsubmit = "return false">
			
			Your secret word:<input id="word" type="text" required>
			<p>Write a cryptic message about your word</p>
			<input id="description" type="text" required>
			<input id="word_desc_btn" type="submit" value="START TIMER">
		</form>`;
		
	document.getElementById("game_letters").innerHTML = gameLetters.join(" ");
		
}

function renderSetup(isFirstPlayer){
	
	if(isFirstPlayer){
		renderDiv.innerHTML =
		`<h1>
			Enter your name:
		</h1>
		
		<form onsubmit = "return false">
			<input type="text" id="name_box" name="usrname" required>
			<input type="submit" id="btn_submit_user" value="TRANSMIT">
		</form>`;
		
	}
	
	else{
		renderDiv.innerHTML =
		`<h1>
			Enter your name:
		</h1>
		
		<form onsubmit = "return false">
			<input id="name_box" type="text" required>
			<input id="btn_submit_user" type="submit" value="TRANSMIT">
		</form>
		
		<div id="wait_msg">
			<h2>Waiting for host to submit secret word</h2>
		</div>`;
	}
}

function renderGameView(snap){
	
	const word = snap.child("correctAnswer").val();
	const desc = snap.child("answerDescription").val();
	const letters = Object.values(snap.child("gameLetters").val());
	const host = snap.child("host").val();
	const isRegistered = snap.child("players/" + playerID + "/hasRegistered").val();
	
	if(host === playerID && isRegistered){
		renderDiv.innerHTML =
		`<p>Time remaining</p>
		<div id="timer"></div>
		
		<p>Your word is:</p>
		<h2 id="host_word">${word}</h2>
		<p><i>${desc}</i></p>
		
		<h2>Spy failures</h2>
		<div id="guesses"></div>`;
	}
	
	else if(isRegistered){
		renderDiv.innerHTML =
		`<h2>Can you guess the word?</h2>
		<p>Time remaining</p>
		<div id="timer"></div>
		
		
		<p>You have nine letters</p>
		<h2>${letters}</h2>
		
		<p>Hint:</p>
		<h2 id="host_desc">${desc}</h2>
		
		<form onsubmit="return false">
			<input id="answer_input" type="text">
			<input id="answer_btn" type="submit" value="Try">
		</form>
		
		<h2>Spy incorrect guesses</h2>
		<div id="guesses"></div>`;
	}
	
	
	else{
		renderDiv.innerHTML = 
		`<h1>Game in session...</h1>
		<h2>Wait around a bit for the next game...</h2>`;
	}
	
	showTime();
	checkTime();
	
}

function renderEnd(snap){
	
	const isRegistered = snap.child("players/" + playerID + "/hasRegistered").val();
	
	const winnerID = snap.child("winnerID").val();
	const hostID = snap.child("host").val();
	
	const word = snap.child("correctAnswer").val();
	const desc = snap.child("answerDescription").val();
	
	const hostName = snap.child("players/" + hostID + "/name").val();
	
	if(isRegistered){
		if(winnerID !== null){
			const gameWinner = snap.child("players/" + winnerID + "/name").val();
			
			renderDiv.innerHTML =
			`<h1>${gameWinner} has intercepted the word!!!</h1>
			<p>The word is ${word}</p>
			<p>${desc}</p>
			<h2>${hostName}'s secret word was discovered!</h2>
			<button id="reset">Start Over?</button>`;
			
			
		}
		
		else{
			renderDiv.innerHTML =
			`<h1>The Spies have failed to intercept the word!!!</h1>
			<p>The word is ${word}</p>
			<p>${desc}</p>
			<h2>${hostName} was able to safeguard world secrets!</h2>
			<button id="reset">Start Over?</button>`;
		}
	}
	else{
		renderDiv.innerHTML = 
		`<h1>Game in session...</h1>
		<h2>Wait around a bit for the next game...</h2>`;
	}
	
}
//
//function renderDisconnect(){
//	
//	renderDiv.innerHTML =
//	`<h1>Looks like the host has disconnected...</h1>
//	<h1>:\(</h1>`;
//}



//------------------------------------------------------------------------------------------------
const firebaseObj = firebase.database();

const playerID = createID();
const letters = letterGenerator();

const renderDiv = document.getElementById("render_div");
const playersDiv = document.getElementById("render_players_div");





// Game SETUP: Things are being set up by the host

firebaseObj.ref("gameState").once("value")

.then((snap)=>{ 
	
	const isFirstPlayer = (snap.val() === null);
	
	if(isFirstPlayer){
		createGame(playerID, letters);
	}
	
	createPlayer(playerID);
	
	renderSetup(isFirstPlayer);
});

// Game START, timer countdown begins
firebaseObj.ref("gameState").on("value", snap => {
	
	
	
	// if game has been started
	if(snap.val() === "active"){ 
		
		firebaseObj.ref().once("value")
		.then(snap => {renderGameView(snap);});
	}
	
	// if game is finished
	if(snap.val() === "finished"){
		
		firebaseObj.ref().once("value")
		.then(snap => {renderEnd(snap);});
	}
	
	if(snap.val() === "reset"){
		location.reload();
	}
	
});


// Display all registered players at bottom of screen

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

// Show failed guesses

firebaseObj.ref("wrongAnswers").on("child_added", (snap) => {
	const guessDiv = document.getElementById("guesses");
	const guess = snap.val();
	let node = document.createElement("p");
	const nodeText = document.createTextNode(guess);
	node.appendChild(nodeText);
	guessDiv.appendChild(node);
});


//Event Listeners

renderDiv.addEventListener("click", (e)=>{
		
	// Add player's name and register them
	if(e.target && e.target.id === "btn_submit_user"){
		
		const nameInput = document.getElementById("name_box");
		const userName = nameInput.value;
			
		registerPlayer(playerID, userName)
		.then(()=>{firebaseObj.ref("host").once("value")
			  
		.then(snap => { //Check if user is the game's host
			const gameHost = snap.val();
			if(gameHost === playerID){
				renderHostWelcome(letters, userName);			
			}
			else{
				const waitMsg = document.getElementById("wait_msg");
				waitMsg.style.display = "block";
			}
		});	
		});
		
	}
	
	// Add words and description
	if(e.target && e.target.id === "word_desc_btn"){
		
		const word = document.getElementById("word").value;
		const desc = document.getElementById("description").value;
		
		addWord(word, letters)
		.then(addDesc(desc))
		.then(()=>{
			firebaseObj.ref().update({gameState: "active"});
		});
	}
	
	// Spies' guess word
	if(e.target && e.target.id === "answer_btn"){
		
		const guessBox = document.getElementById("answer_input");
		const guess = guessBox.value.toLowerCase();
		
		firebaseObj.ref().once("value")
		.then(snap => {
			
			const answer = snap.child("correctAnswer").val();
			
			if(answer === guess){
				let updates = {};
				updates.winnerID = snap.child("players/" + playerID).key;
				updates.gameState = "finished";
				console.log(updates.winner);
				firebaseObj.ref().update(updates);
			}
			else{
				firebaseObj.ref("wrongAnswers").push(guess);
			}
			guessBox.value = "";
		});
	}
	
	if(e.target && e.target.id === "reset"){
		firebaseObj.ref().update({gameState : "reset"});
	}
}					   
);









