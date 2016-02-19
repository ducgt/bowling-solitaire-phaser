var game = new Phaser.Game(720, 480, Phaser.AUTO, null, {
  preload: preload, create: create, update: update
});

var deck,
    selectedCard,
    pins,
    balls,
    debug = true,
    cardImgPrefix = 'card',
    suits = [ 'Spades', 'Clubs' ],
    values = [ '10', '9', '8', '7', '6', '5', '4', '3', '2', 'A' ],
    cardPositionText;

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.stage.backgroundColor = '#093';

  game.load.image('cardBackBlue', 'res/img/Cards/cardBack_blue2.png');
  for(var val = 0; val < values.length; val++) {
    for(var suit = 0; suit < suits.length; suit++) {
      var imgName = cardImgPrefix + suits[suit] + values[val];
      game.load.image(imgName, 'res/img/Cards/' + imgName + '.png');
    }
  }
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  initDeck();

  if(debug) {
    cardPositionText = game.add.text(5, game.world.height-5, 'Card Position: ');
    cardPositionText.anchor.set(0, 1);
  }

  // prevent normal right click behavior (i.e. context menu)
  game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

  // release selected card
  game.input.onUp.add(function() {
    selectedCard = undefined;
  });

  // flip cards
  this.game.input.keyboard.addKey(Phaser.Keyboard.F).onDown.add(function() {
    if(!selectedCard) { return; }
    selectedCard.faceUp = !selectedCard.faceUp;
    if(selectedCard.faceUp) {
      selectedCard.loadTexture(selectedCard.imgName);
    } else {
      selectedCard.loadTexture('cardBackBlue');
    }
  });
}

function update() {
  if(selectedCard) {
    selectedCard.x = game.input.x;
    selectedCard.y = game.input.y;
    if(debug) {
      cardPositionText.setText('Card Position: ('+selectedCard.x+', '+selectedCard.y+')');
    }
  }
}

function initDeck() {
  var cardX = 0,
      cardY = 0;
  deck = game.add.group();
  for(var val = 0; val < values.length; val++) {
    for(var suit = 0; suit < suits.length; suit++) {
      var randomIndex = Math.floor(Math.random() * Math.max(val*suit-1, 0));
      deck.addChildAt(createCard(suit, val, cardX, cardY), randomIndex);
      cardX += 20;
    }
  }
}

function createCard(suitIndex, valueIndex, cardX, cardY) {
  var imgName = cardImgPrefix + suits[suitIndex] + values[valueIndex],
      newCard = game.add.sprite(cardX, cardY, imgName),
      num = valueIndex*(suitIndex+1);

  // card attributes
  newCard.faceUp = true;
  newCard.imgName = imgName;

  // card physical properties
  newCard.scale.setTo(0.5);
  newCard.anchor.set(0.5);
  game.physics.enable(newCard, Phaser.Physics.ARCADE);
  newCard.body.immovable = true;
  newCard.body.collideWorldBounds = true;

  // handle card inputs
  newCard.inputEnabled = true;
  newCard.events.onInputDown.add(function() {
    deck.bringToTop(newCard);
    selectedCard = newCard;
  }, this);

  return newCard;
}
