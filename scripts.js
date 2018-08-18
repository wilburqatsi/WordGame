let Player = class{
	constructor(role){
		this.name = "unknown";
		this.role = role;
		this.score = 0;
	}
};

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

const databaseRef = firebase.database().ref();

var pushUser = () =>{
	player = new Player("host");
	const userKey = databaseRef.child("players").push(player).key;
	
	return userKey;
	
};

userKey = pushUser();
firebase.database().ref("players/" + userKey).onDisconnect().remove();

//Add User's name to firebase player object

const userNameBox = document.getElementById("name_box");
const userSubmit = document.getElementById("btn_submit_user");

userSubmit.addEventListener("click", ()=> {
	
	const userName = userNameBox.value;
	var updates = {};
	updates["/players/" + userKey + "/name"] = userName;
	
	firebase.database().ref().update(updates);
	
});



const gameLetters = letterGenerator();
console.log(gameLetters.toString());



