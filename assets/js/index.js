import Player  from "./player.js";
import Ghost  from "./ghost.js";
        
let width = 800;
let height = 625;
let gridSize = 32;
let offset=parseInt(gridSize/2);
let config = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {
                x: 0,
                y: 0
            }            
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);
let cursors;
let player;
let ghosts=[];
let pills;
let pillsCount=0;
let pillsAte=0;
let map;
let layer1;
let layer2;
let graphics;
let scoreText;
let livesImage=[];
let tiles = "pacman-tiles";
let spritesheet = 'pacman-spritesheet';
let spritesheetPath = 'assets/images/pacmansprites.png';
let tilesPath = 'assets/images/background.png';
let mapPath = 'assets/levels/codepen-level.json';
let Animation= {
    Player : {
        Eat: 'player-eat',
        Stay: 'player-stay',
        Die: 'player-die'
    },
    Ghost :{
        Blue : {
            Move: 'ghost-blue-move',
        },

        Orange : {
            Move: 'ghost-orange-move',
        },

        White : {
            Move: 'ghost-white-move',
        },

        Pink : {
            Move: 'ghost-pink-move',
        },

        Red : {
            Move: 'ghost-red-move',
        },
    }
};

function preload ()
{
    this.load.spritesheet(spritesheet, spritesheetPath, { frameWidth: gridSize, frameHeight: gridSize });
    this.load.tilemapTiledJSON("map", mapPath);
    this.load.image(tiles, tilesPath);
    this.load.image("pill", "assets/images/pac man pill/spr_pill_0.png");
    this.load.image("lifecounter", "assets/images/pac man life counter/spr_lifecounter_0.png");
}

function create ()
{    
    this.anims.create({
            key: Animation.Player.Eat,
            frames: this.anims.generateFrameNumbers(spritesheet, { start: 9, end: 13 }),
            frameRate: 10,
            repeat: -1
        });

    this.anims.create({
        key: Animation.Player.Stay,
        frames: [ { key: spritesheet, frame: 9 } ],
        frameRate: 20
    });

    this.anims.create({
        key: Animation.Player.Die,
        frames: this.anims.generateFrameNumbers(spritesheet, { start: 6, end: 8 }),
        frameRate: 1
    });

    this.anims.create({
            key: Animation.Ghost.Blue.Move,
            frames: this.anims.generateFrameNumbers(spritesheet, { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1
        });

    this.anims.create({
            key: Animation.Ghost.Orange.Move,
            frames: this.anims.generateFrameNumbers(spritesheet, { start: 4, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

    this.anims.create({
            key: Animation.Ghost.White.Move,
            frames: this.anims.generateFrameNumbers(spritesheet, { start: 4, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

    this.anims.create({
            key: Animation.Ghost.Pink.Move,
            frames: this.anims.generateFrameNumbers(spritesheet, { start: 14, end: 15 }),
            frameRate: 10,
            repeat: -1
        });

    this.anims.create({
            key: Animation.Ghost.Red.Move,
            frames: this.anims.generateFrameNumbers(spritesheet, { start: 16, end: 17 }),
            frameRate: 10,
            repeat: -1
        });

    map = this.make.tilemap({ key: "map", tileWidth: gridSize, tileHeight: gridSize });
    const tileset = map.addTilesetImage(tiles);
    
    layer1 = map.createStaticLayer("Layer 1", tileset, 0, 0);
    layer1.setCollisionByProperty({ collides: true});

    layer2 = map.createStaticLayer("Layer 2", tileset, 0, 0);
    layer2.setCollisionByProperty({ collides: true});
    
    let spawnPoint = map.findObject("Objects", obj => obj.name === "Player");  
    let position = new Phaser.Geom.Point(spawnPoint.x + offset, spawnPoint.y - offset);
    player = new Player(this, position, Animation.Player, function() {
        if(player.life <= 0) {
            newGame();
        }
        else {
            respawn();
        }
    });

    let scene = this;

    pills = this.physics.add.group();
    map.filterObjects("Objects", function (value, index, array) {
        if(value.name == "Pill") {
            let pill=scene.physics.add
                .sprite(value.x + offset, value.y - offset, "pill");
            pills.add(pill);
            pillsCount++;
        }
    });

    
    let ghostsGroup = this.physics.add.group();
    let i=0;
    let skins=[Animation.Ghost.Blue, Animation.Ghost.Red, Animation.Ghost.Orange , Animation.Ghost.Pink];
     map.filterObjects("Objects", function (value, index, array) {        
        if(value.name == "Ghost") {
            let position = new Phaser.Geom.Point(value.x + offset, value.y - offset);
            let ghost = new Ghost(scene, position, skins[i]);
            ghosts.push(ghost);    
            ghostsGroup.add(ghost.sprite);
            i++;
        }
     });

    this.physics.add.collider(player.sprite, layer1);
    this.physics.add.collider(player.sprite, layer2);
    this.physics.add.collider(ghostsGroup, layer1);
    this.physics.add.overlap(player.sprite, pills, function(sprite, pill) {        
        pill.disableBody(true, true);
        pillsAte++;
        player.score+=10;
        if(pillsCount==pillsAte) {
            reset();
        }
    }, null, this);

    this.physics.add.overlap(player.sprite, ghostsGroup, function(sprite, ghostSprite) {
        if(player.active) {
            player.die();
            for(let ghost of ghosts) {
                ghost.freeze();
            }   
        }
    }, null, this);

    cursors= this.input.keyboard.createCursorKeys();

    graphics = this.add.graphics();

    scoreText =  this.add.text(25, 595, 'Score: '+player.score).setFontFamily('Arial').setFontSize(18).setColor('#ffffff');
    this.add.text(630, 595, 'Lives:').setFontFamily('Arial').setFontSize(18).setColor('#ffffff');
    for (let i =  0; i < player.life; i++) {
        livesImage.push(this.add.image(700 + (i * 25), 605, 'lifecounter'));
    }
}

function respawn() {
    player.respawn();
    for(let ghost of ghosts) {
            ghost.respawn();
        }    
}

function reset() {
    respawn();
    for (let child of pills.getChildren()) {
            child.enableBody(false, child.x, child.y, true, true);
        }
    pillsAte=0;
    
}

function newGame() {
    reset();
    player.life=3;
    player.score=0;
    for (let i = 0; i < player.life; i++) {
        let image = livesImage[i];
        if(image) {
            image.alpha=1;
        }
    }
}

function update()
{
    player.setDirections(getDirection(map, layer1, player.sprite));

    if(!player.playing) {
        for(let ghost of ghosts) {
            ghost.freeze();
        }        
    }

    for(let ghost of ghosts) {
        ghost.setDirections(getDirection(map, layer1, ghost.sprite));
    }

    player.setTurningPoint(getTurningPoint(map, player.sprite));

    for(let ghost of ghosts) {
        ghost.setTurningPoint(getTurningPoint(map, ghost.sprite));
    }

    if (cursors.left.isDown)
    {
        player.setTurn(Phaser.LEFT);
    }
    else if (cursors.right.isDown)
    {
        player.setTurn(Phaser.RIGHT);
    }   
    else if (cursors.up.isDown)
    {
        player.setTurn(Phaser.UP);
    }
    else if (cursors.down.isDown)
    {
        player.setTurn(Phaser.DOWN);
    }
    else
    {
        player.setTurn(Phaser.NONE);   
    }

    player.update();  

    for(let ghost of ghosts) {
        ghost.update();
    }

    scoreText.setText('Score: '+player.score);

    for (let i = player.life; i < 3; i++) {
        let image = livesImage[i];
        if(image) {
            image.alpha=0;
        }
    }

    if(player.active) {
        if(player.sprite.x < 0 - offset ) {            
            player.sprite.setPosition(width + offset, player.sprite.y);
        }
        else if(player.sprite.x> width + offset) {
            player.sprite.setPosition(0 - offset, player.sprite.y);
        }
    }
    

    //drawDebug();
}

function drawDebug() {
    graphics.clear();
    player.drawDebug(graphics);
    for(let ghost of ghosts) {
            ghost.drawDebug(graphics);
        }
}

function getDirection(map, layer, sprite) {
    let directions = [];
    let sx=Phaser.Math.FloorTo(sprite.x);
    let sy=Phaser.Math.FloorTo(sprite.y);
    let currentTile = map.getTileAtWorldXY(sx, sy, true);  
    if(currentTile) {

        var x = currentTile.x;
        var y = currentTile.y;

        directions[Phaser.LEFT]     =   map.getTileAt(x-1, y, true, layer);
        directions[Phaser.RIGHT]    =   map.getTileAt(x+1, y, true, layer);
        directions[Phaser.UP]       =   map.getTileAt(x, y-1, true, layer);
        directions[Phaser.DOWN]     =   map.getTileAt(x, y+1, true, layer);

    }

    return directions;
}

function getTurningPoint(map, sprite) {
    let turningPoint = new Phaser.Geom.Point();
    let sx=Phaser.Math.FloorTo(sprite.x);
    let sy=Phaser.Math.FloorTo(sprite.y);
    let currentTile = map.getTileAtWorldXY(sx, sy, true);  
    if(currentTile) {    
        turningPoint.x = currentTile.pixelX + offset;
        turningPoint.y = currentTile.pixelY + offset;
    }

    return turningPoint;
}


      