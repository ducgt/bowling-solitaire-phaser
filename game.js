var game = new Phaser.Game(720, 480, Phaser.AUTO, null, {
  preload: preload, create: create, update: update
});

var NUM_PINS = 10,
    STACK1 = 5,
    STACK2 = 3,
    deck,
    selectedCard,
    debug = true,
    flippedDirty = true,
    cardImgPrefix = 'card',
    cardPool = [
      {suit:'Spades', val:'A'},
      {suit:'Spades', val:'2'},
      {suit:'Spades', val:'3'},
      {suit:'Spades', val:'4'},
      {suit:'Spades', val:'5'},
      {suit:'Spades', val:'6'},
      {suit:'Spades', val:'7'},
      {suit:'Spades', val:'8'},
      {suit:'Spades', val:'9'},
      {suit:'Spades', val:'10'},

      {suit:'Clubs', val:'A'},
      {suit:'Clubs', val:'2'},
      {suit:'Clubs', val:'3'},
      {suit:'Clubs', val:'4'},
      {suit:'Clubs', val:'5'},
      {suit:'Clubs', val:'6'},
      {suit:'Clubs', val:'7'},
      {suit:'Clubs', val:'8'},
      {suit:'Clubs', val:'9'},
      {suit:'Clubs', val:'10'},
    ],
    cardPositionText,
    cardLocations = [
      // ------------------- pins ---------------------------
      {x:670,y:60}, {x:590,y:60}, {x:510,y:60}, {x:430,y:60},
               {x:630,y:160}, {x:550,y:160}, {x:470,y:160},
                     {x:590,y:260}, {x:510,y:260},
                          {x:550,y:360},
      // stack 1
      {x:130,y:60,f:1}, {x:110,y:60,f:1}, {x:90,y:60,f:1}, {x:70,y:60,f:1}, {x:50,y:60},
      // stack 2
      {x:90,y:160,f:1}, {x:70,y:160,f:1}, {x:50,y:160},
      // stack 3
      {x:70,y:260,f:1}, {x:50,y:260}
    ];

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.stage.backgroundColor = '#093';

  game.load.image('cardBackBlue', 'res/img/Cards/cardBack_blue2.png');
  for(var i = 0; i < cardPool.length; i++) {
      var imgName = cardImgPrefix + cardPool[i].suit + cardPool[i].val;
      game.load.image(imgName, 'res/img/Cards/' + imgName + '.png');
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
    flippedDirty = true;
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

  if(flippedDirty) {
    handleFlipped();
    flippedDirty = false;
  }
}

function initDeck() {
  // shuffle card pool (Fisher-Yates shuffle)
  var i, j, k, temp,
      n = 5;
  for (i = 0; i < n; i++) {
    for (j = 0; j < cardPool.length; j++) {
      k = Math.floor(Math.random() * cardPool.length);
      temp = cardPool[j];
      cardPool[j] = cardPool[k];
      cardPool[k] = temp;
    }
  }

  deck = game.add.group();
  for(var cIndex = 0; cIndex < cardPool.length; cIndex++) {
    var info = cardLocations[cIndex],
        card = cardPool[cIndex];
    deck.add(createCard(card.suit, card.val, info.x, info.y, info.f));
  }
}

function createCard(suit, value, cardX, cardY, flipped) {
  var imgName = cardImgPrefix + suit + value,
      newCard = game.add.sprite(cardX, cardY, imgName);

  // card attributes
  newCard.faceUp = !(typeof flipped !== 'undefined' && flipped === 1);
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

function handleFlipped() {
  deck.forEach(function(card) {
    if(card.faceUp) {
      card.loadTexture(card.imgName);
    } else {
      card.loadTexture('cardBackBlue');
    }
  });
}
