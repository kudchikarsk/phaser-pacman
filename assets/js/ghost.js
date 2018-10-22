export default class Ghost {
    constructor(scene, position, anim)
    {       
        this.sprite=scene.physics.add.sprite(position.x, position.y, 'ghost')
            .setScale(0.85)
            .setOrigin(0.5);
        this.spawnPoint=position;
        this.anim=anim;      
        this.speed = 100;
        this.moveTo = new Phaser.Geom.Point();
        this.safetile = [-1, 19];
        this.directions = [];
        this.opposites = [ null, null, null, null, null, Phaser.DOWN, Phaser.UP, Phaser.RIGHT, Phaser.LEFT ];        
        this.turning=Phaser.NONE;
        this.current=Phaser.NONE;
        this.turningPoint = new Phaser.Geom.Point();
        this.threshold = 5;
        this.rnd = new Phaser.Math.RandomDataGenerator();
        this.sprite.anims.play(anim.Move, true);
        this.turnCount=0;
        this.turnAtTime=[4, 8, 16, 32, 64];
        this.turnAt=this.rnd.pick(this.turnAtTime);
        
    }

    freeze() {
        this.moveTo = new Phaser.Geom.Point();
        this.current = Phaser.NONE;
    }

    move() {
        this.move(this.rnd.pick([Phaser.UP, Phaser.DOWN]));        
    }

    respawn() {       
        this.sprite.setPosition(this.spawnPoint.x, this.spawnPoint.y);
        this.move(this.rnd.pick([Phaser.UP, Phaser.DOWN]));
        this.sprite.flipX = false;
    }

    moveLeft()
    {
        this.moveTo.x=-1;
        this.moveTo.y=0;
        this.sprite.flipX = true;
        this.sprite.angle = 0;
    }

    moveRight()
    {
        this.moveTo.x=1;
        this.moveTo.y=0;
        this.sprite.flipX = false;
        this.sprite.angle = 0;
    }

    moveUp()
    {
        this.moveTo.x=0;
        this.moveTo.y=-1;
        this.sprite.angle = 0;
    }

    moveDown()
    {
        this.moveTo.x=0;
        this.moveTo.y=1;
        this.sprite.angle = 0;
    }

    update()
    {
        this.sprite.setVelocity(this.moveTo.x * this.speed,  this.moveTo.y * this.speed);
        this.turn();
        if(this.directions[this.current] && !this.isSafe(this.directions[this.current].index)) {
            this.sprite.anims.play('faceRight', true);  
            this.takeRandomTurn();                  
        }
    }

    setDirections(directions) {
        this.directions = directions;
    }

    setTurningPoint(turningPoint) {
        this.turningPoint=turningPoint;
    }


    setTurn(turnTo)
    {
        if (!this.directions[turnTo] 
            || this.turning === turnTo 
            || this.current === turnTo 
            || !this.isSafe(this.directions[turnTo].index)
            ) {
            return false;
        }

        //console.log("turning:"+this.turning+" current:"+this.current+" turnTo:"+turnTo);

        if(this.opposites[turnTo] && this.opposites[turnTo] === this.current) {
            this.move(turnTo);
            this.turning = Phaser.NONE;
            this.turningPoint = new Phaser.Geom.Point();
        }
        else {
            this.turning = turnTo;
        }
    }

    takeRandomTurn() {

        let turns = [];
        for (let i=0; i < this.directions.length; i++) {
            let direction=this.directions[i];
            if(direction) {
                if(this.isSafe(direction.index)) {
                    turns.push(i);
                    
                }
            }
        }

        if(turns.length >= 2) {
            let index=turns.indexOf(this.opposites[this.current]);
            if(index>-1) {
                turns.splice(index, 1);
            }
        }

        let turn=this.rnd.pick(turns);       
        this.setTurn(turn);

        this.turnCount=0;
        this.turnAt=this.rnd.pick(this.turnAtTime);
    }

    turn()
    {
        if(this.turnCount===this.turnAt) {
            this.takeRandomTurn();            
        }                
        this.turnCount++;

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

    isSafe(index) {
        for (let i of this.safetile) {
            if(i===index) return true;
        }

        return false;
    }

    drawDebug(graphics) 
    {        
        let thickness = 4;
        let alpha = 1;
        let color = 0x00ff00;        
        for (var t = 0; t < 9; t++)
        {
            if (this.directions[t] === null || this.directions[t] === undefined)
            {
                continue;
            }

            if ( !this.isSafe(this.directions[t].index))
            {
                color = 0xff0000;
            }
            else
            {
                color = 0x00ff00;
            }

            graphics.lineStyle(thickness, color, alpha);
            graphics.strokeRect(this.directions[t].pixelX, this.directions[t].pixelY, 32, 32);
        }

        color = 0x00ff00;
        graphics.lineStyle(thickness, color, alpha);
        graphics.strokeRect(this.turningPoint.x, this.turningPoint.y, 1, 1);

    }
}