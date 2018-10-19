export default class Player {
    constructor(scene, spritesheet, position)
    {       
        this.spawnPoint=position;
        this.sprite=scene.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, 'pacman')
            .setScale(0.9)
            .setOrigin(0.5);
        this.speed = 90;
        this.moveTo = new Phaser.Geom.Point();
        this.sprite.angle = 180;
        this.safetile = -1;

        this.directions = [];
        this.opposites = [ null, null, null, null, null, Phaser.DOWN, Phaser.UP, Phaser.RIGHT, Phaser.LEFT ];        
        this.turning=Phaser.NONE;
        this.turningPoint = new Phaser.Geom.Point();
        this.threshold = 3;


        scene.anims.create({
            key: 'moveRight',
            frames: scene.anims.generateFrameNumbers(spritesheet, { start: 9, end: 13 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'faceRight',
            frames: [ { key: spritesheet, frame: 9 } ],
            frameRate: 20
        });

        this.sprite.anims.play('faceRight', true);
        
    }

    moveLeft()
    {
        this.moveTo.x=-1;
        this.moveTo.y=0;
        this.sprite.anims.play('moveRight', true);
        this.sprite.angle = 180;
    }

    moveRight()
    {
        this.moveTo.x=1;
        this.moveTo.y=0;
        this.sprite.anims.play('moveRight', true);
        this.sprite.angle = 0;
    }

    moveUp()
    {
        this.moveTo.x=0;
        this.moveTo.y=-1;
        this.sprite.anims.play('moveRight', true);
        this.sprite.angle = 270;
    }

    moveDown()
    {
        this.moveTo.x=0;
        this.moveTo.y=1;
        this.sprite.anims.play('moveRight', true);
        this.sprite.angle = 90;
    }

    update()
    {
        this.sprite.setVelocity(this.moveTo.x * this.speed,  this.moveTo.y * this.speed);
        this.turn();
        if(this.directions[this.current] && this.directions[this.current].index!==this.safetile) {
            this.sprite.anims.play('faceRight', true);
        }
    }

    setDirections(directions)
    {
        this.directions = directions;
    }


    setTurn(turnTo, turningPoint)
    {
        if (!this.directions[turnTo] || this.turning === turnTo || this.current === turnTo || this.directions[turnTo].index !== this.safetile) {
            return false;
        }

        if(this.opposites[turnTo] && this.opposites[turnTo] === this.current) {
            this.move(turnTo);
            this.turning = Phaser.NONE;
            this.turningPoint = new Phaser.Geom.Point();
        }
        else {
            this.turning = turnTo;
            this.turningPoint = turningPoint;    
        }
    }


    turn()
    {
        if(this.turning === Phaser.NONE) {
            return false;
        }

        //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
        if (!Phaser.Math.Within(this.sprite.x, this.turningPoint.x, this.threshold) || !Phaser.Math.Within(this.sprite.y, this.turningPoint.y, this.threshold))
        {
            return false;
        }        
        
        this.sprite.setPosition(this.turningPoint.x, this.turningPoint.y);
        this.move(this.turning);
        this.turning = Phaser.NONE;
        this.turningPoint = new Phaser.Geom.Point();
        return true;
    }

    move(direction)
    {
        this.current=direction;

        switch(direction)
        {
            case Phaser.LEFT:
            this.moveLeft();
            break;

            case Phaser.RIGHT:
            this.moveRight();
            break;

            case Phaser.UP:
            this.moveUp();
            break;

            case Phaser.DOWN:
            this.moveDown();
            break;
        }
    }
}