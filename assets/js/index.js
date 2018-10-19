import Player  from "./player.js";
        
let width = 800;
let height = 600;
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
let map;
let wallsLayer;
let directions=[];
let turningPoint = new Phaser.Geom.Point();
let graphics;
const spritesheetPath = 'assets/images/pacmansprites.png';
const tilesPath = 'assets/images/background.png';
const mapPath = 'assets/levels/codepen-level.json';

function preload ()
{
    this.load.spritesheet('pacman-spritesheet', spritesheetPath, { frameWidth: gridSize, frameHeight: gridSize });
    this.load.tilemapTiledJSON("map", mapPath);
    this.load.image("pacman-tiles", tilesPath);
    this.load.image("pill", "assets/images/pac man pill/spr_pill_0.png");
}

function create ()
{
    map = this.make.tilemap({ key: "map", tileWidth: gridSize, tileHeight: gridSize });
    const tileset = map.addTilesetImage("pacman-tiles");
    
    wallsLayer = map.createStaticLayer("Walls", tileset, 0, 0);
    wallsLayer.setCollisionByProperty({ collides: true});

    
    const spawnPoint = map.findObject("Objects", obj => obj.name === "Player");  
    spawnPoint.x += offset;
    spawnPoint.y -= offset;
    player = new Player(this, 'pacman-spritesheet', spawnPoint);

    let pills = this.physics.add.group();
    map.forEachTile((value, index, array) => {
        if(value.index===-1 && value.x>0 && value.x<24)
        {
            let pill=this.physics.add
                .sprite(value.pixelX + offset, value.pixelY + offset, "pill");
            pills.add(pill);
        }
    });


    this.physics.add.collider(player.sprite, wallsLayer);
    this.physics.add.overlap(player.sprite, pills, function(sprite, pill) {        
        pill.destroy();
    }, null, this);

    cursors= this.input.keyboard.createCursorKeys();

     graphics = this.add.graphics();
}

function update()
{
    let currentTile = map.getTileAtWorldXY(player.sprite.x, player.sprite.y, true);  
    if(currentTile) {

        var x = currentTile.x;
        var y = currentTile.y;

        directions[Phaser.LEFT]     =   map.getTileAt(x-1, y, true, wallsLayer);
        directions[Phaser.RIGHT]    =   map.getTileAt(x+1, y, true, wallsLayer);
        directions[Phaser.UP]       =   map.getTileAt(x, y-1, true, wallsLayer);
        directions[Phaser.DOWN]     =   map.getTileAt(x, y+1, true, wallsLayer);

        player.setDirections(directions);

        turningPoint.x = currentTile.pixelX + offset;
        turningPoint.y = currentTile.pixelY + offset;

        if (cursors.left.isDown)
        {
            player.setTurn(Phaser.LEFT, turningPoint);
        }
        else if (cursors.right.isDown)
        {
            player.setTurn(Phaser.RIGHT, turningPoint);
        }   
        else if (cursors.up.isDown)
        {
            player.setTurn(Phaser.UP, turningPoint);
        }
        else if (cursors.down.isDown)
        {
            player.setTurn(Phaser.DOWN, turningPoint);
        }
        else
        {
            player.setTurn(Phaser.None);   
        }

        player.update();  
    }

    //drawDebug();
}

function drawDebug() {

    graphics.clear();

    let thickness = 4;
    let alpha = 1;
    let color = 0x00ff00;

    for (var t = 0; t < 9; t++)
    {
        if (directions[t] === null || directions[t] === undefined)
        {
            continue;
        }

        if (directions[t].index !== -1)
        {
            color = 0xff0000;
        }
        else
        {
            color = 0x00ff00;
        }

        graphics.lineStyle(thickness, color, alpha);
        graphics.strokeRect(directions[t].pixelX, directions[t].pixelY, 32, 32);
    }

    color = 0x00ff00;
    graphics.lineStyle(thickness, color, alpha);
    graphics.strokeRect(player.turningPoint.x, player.turningPoint.y, 1, 1);

}
      