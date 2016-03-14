ZombieDice = {};

ZombieDice.ROLL_COUNT = 3;
ZombieDice.SHOT_COUNT = 3;

ZombieDice.DiceFace = {
	Brain: "brain",
	Shotgun: "shotgun",
	Footprints: "footprints"
};

ZombieDice.DiceColor = {
	Green: "green",
	Yellow: "yellow",
	Red: "red"
};

ZombieDice.Dice = function(diceColor) {
	this.color = diceColor;
	switch (diceColor) {
		case ZombieDice.DiceColor.Green:
			this.faces = [
				ZombieDice.DiceFace.Brain, ZombieDice.DiceFace.Brain, ZombieDice.DiceFace.Brain,
				ZombieDice.DiceFace.Shotgun,
				ZombieDice.DiceFace.Footprints, ZombieDice.DiceFace.Footprints
			];
			break;
		case ZombieDice.DiceColor.Yellow:
			this.faces = [
				ZombieDice.DiceFace.Brain, ZombieDice.DiceFace.Brain,
				ZombieDice.DiceFace.Shotgun, ZombieDice.DiceFace.Shotgun,
				ZombieDice.DiceFace.Footprints, ZombieDice.DiceFace.Footprints
			];
			break;
		case ZombieDice.DiceColor.Red:
			this.faces = [
				ZombieDice.DiceFace.Brain,
				ZombieDice.DiceFace.Shotgun, ZombieDice.DiceFace.Shotgun, ZombieDice.DiceFace.Shotgun,
				ZombieDice.DiceFace.Footprints, ZombieDice.DiceFace.Footprints
			];
			break;
	}
};

ZombieDice.Dice.prototype.roll = function() {
	return this.faces[Math.floor((Math.random() * this.faces.length))];
};

ZombieDice.DiceBag = function() {
	this.dices = [
		new ZombieDice.Dice(ZombieDice.DiceColor.Green),
		new ZombieDice.Dice(ZombieDice.DiceColor.Green),
		new ZombieDice.Dice(ZombieDice.DiceColor.Green),
		new ZombieDice.Dice(ZombieDice.DiceColor.Green),
		new ZombieDice.Dice(ZombieDice.DiceColor.Green),
		new ZombieDice.Dice(ZombieDice.DiceColor.Green),
		new ZombieDice.Dice(ZombieDice.DiceColor.Yellow),
		new ZombieDice.Dice(ZombieDice.DiceColor.Yellow),
		new ZombieDice.Dice(ZombieDice.DiceColor.Yellow),
		new ZombieDice.Dice(ZombieDice.DiceColor.Yellow),
		new ZombieDice.Dice(ZombieDice.DiceColor.Red),
		new ZombieDice.Dice(ZombieDice.DiceColor.Red),
		new ZombieDice.Dice(ZombieDice.DiceColor.Red)
	];
};

ZombieDice.DiceBag.prototype.shake = function() {
	for (var i = this.dices.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = this.dices[i];
        this.dices[i] = this.dices[j];
        this.dices[j] = temp;
    }
    return this.dices;
};

ZombieDice.DiceBag.prototype.diceCount = function() {
	return this.dices.length;
};

ZombieDice.DiceBag.prototype.putDice = function(dice) {
	return this.dices.push(dice);
};

ZombieDice.DiceBag.prototype.takeDice = function() {
	return this.dices.pop();
};

ZombieDice.Game = function() {
	this.diceBag = new ZombieDice.DiceBag();
	this.brains = 0;
	this.shots = 0;
	this.footprintDices = [];
	this.brainDices = [];
	this.shotgunDices = [];
	this.lastRoll = [];
};

ZombieDice.Game.prototype.play = function() {
	
	if (this.shots >= ZombieDice.SHOT_COUNT)
		return false;
	
	while (this.lastRoll.length) {
		var diceRoll = this.lastRoll.shift();
		switch (diceRoll.roll) {
			case ZombieDice.DiceFace.Brain:		
				this.brainDices.push(diceRoll.dice);
				break;
			case ZombieDice.DiceFace.Shotgun:
				this.shotgunDices.push(diceRoll.dice);
				break;
			case ZombieDice.DiceFace.Footprints:
				this.footprintDices.push(diceRoll.dice);
				break;
		}
	}
	
	var dicesInHand = [];
	
	while (this.footprintDices.length) {
		dicesInHand.push(this.footprintDices.shift());
	}
	
	if (dicesInHand.length < ZombieDice.ROLL_COUNT) {
		if (this.diceBag.diceCount() < ZombieDice.ROLL_COUNT) {
			for (var i = 0; i < this.brainDices.length; i++) {
				this.diceBag.putDice(this.brainDices.shift());
			}
		}
	
		this.diceBag.shake();
		for (var i = dicesInHand.length; i < ZombieDice.ROLL_COUNT; i++) {
			dicesInHand.push(this.diceBag.takeDice());
		}
	}
	
	for (var i = 0; i < dicesInHand.length; i++) {
		var dice = dicesInHand[i];
		var diceRoll = dice.roll();		

		this.lastRoll.push({ dice: dice, roll: diceRoll });
		
		switch (diceRoll) {
			case ZombieDice.DiceFace.Brain:		
				this.brains++;
				break;
			case ZombieDice.DiceFace.Shotgun:
				this.shots++;
				break;
		}
	}
	
	return this.shots < ZombieDice.SHOT_COUNT;
};

ZombieDice.GameUI = function() {
	this.game = new ZombieDice.Game();
	this.score = document.getElementById("score");
	this.brainDices = document.getElementById("brain-dices");
	this.shotgunDices = document.getElementById("shotgun-dices");
	this.lastRollDices = document.getElementById("last-roll-dices");
	this.rollButton = document.getElementById("button-roll");
	this.rollButton.addEventListener("click", this.roll.bind(this));
	
	this.resetButton = document.getElementById("button-reset");
	this.resetButton.addEventListener("click", this.reset.bind(this));
	
	this.refreshUI();
}

ZombieDice.GameUI.prototype.createDice = function (color, face) {
	var div = document.createElement("div");
	div.className  = "dice" + " dice-" + color + " dice-" + face;
	return div;
};

ZombieDice.GameUI.prototype.refreshUI = function () {
	this.score.innerText = "Brains: " + this.game.brains + " Shots: " + this.game.shots;
	
	this.brainDices.innerHTML = "";
	for (var i = 0; i < this.game.brainDices.length; i++) {
		this.brainDices.appendChild(this.createDice(this.game.brainDices[i].color, ZombieDice.DiceFace.Brain));
	}
	
	this.shotgunDices.innerHTML = "";
	for (var i = 0; i < this.game.shotgunDices.length; i++) {
		this.shotgunDices.appendChild(this.createDice(this.game.shotgunDices[i].color, ZombieDice.DiceFace.Shotgun));
	}
	
	this.lastRollDices.innerHTML = "";
	for (var i = 0; i < this.game.lastRoll.length; i++) {
		this.lastRollDices.appendChild(this.createDice(this.game.lastRoll[i].dice.color, this.game.lastRoll[i].roll));
	}
}

ZombieDice.GameUI.prototype.roll = function() {
	this.game.play();
	this.refreshUI();
}

ZombieDice.GameUI.prototype.reset = function () {
	this.game = new ZombieDice.Game();
	this.refreshUI();
}

var gameUI = new ZombieDice.GameUI();