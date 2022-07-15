class Sprite {
  constructor(config) {

    //Set up hte image
    this.image = new Image();
    this.image.src = config.src;
    this.image.onload = () => {
      this.isLoaded = true;
    }

    //Shadow
    this.shadow = new Image();
    this.shadow.src;
    this.useShadow = config.useShadow === false  ? false : true
    if (this.useShadow){
      this.shadow.src = "images/characters/shadow.png";
    }
    this.shadow.onload = () => {
      this.isShadowLoaded = true;
    }
    

    //Configure Animation & Initial State
    this.animations = config.animations || {
      "idle-down": [ [0,0] ],
      "idle-left": [ [0,1] ],
      "idle-right": [ [3,2] ],
      "idle-up": [ [0,3] ],
      "walk-down": [ [1,0], [0,0], [3,0], [0,0] ],
      "walk-left": [ [1,1], [0,1], [3,1], [0,1] ],
      "walk-right": [ [1,2], [0,2], [3,2], [0,2] ],
      "walk-up": [ [1,3], [0,3], [3,3], [0,3] ],
    }
    this.currentAnimation = config.currentAnimation || "idle-down"
    this.currentAnimationFrame = 0;

    this.animationFrameLimit = config.animationFrameLimit || 8;
    this.animationFrameProgress = this.animationFrameLimit;

    //Reference the game object
    this.gameObject = config.gameObject;
  }

  get frame() {
    return this.animations[this.currentAnimation][this.currentAnimationFrame];
  }

  setAnimation(key) {
    if (this.currentAnimation != key) {
      this.currentAnimation = key;
      this.currentAnimationFrame = 0;
      this.animationFrameProgress = this.animationFrameLimit;
    }
  }

  updateAnimationProgress() {
    //Downtick frame progress
    if(this.animationFrameProgress > 0) {
      this.animationFrameProgress -= 1;
      return;
    }

    //Reset the counter
    this.animationFrameProgress = this.animationFrameLimit;
    this.currentAnimationFrame += 1;

    if (this.frame === undefined) {
      this.currentAnimationFrame = 0;
    }
  }

  draw(ctx, cameraPerson) {
    const x = this.gameObject.x - 6 + utils.withGrid(14.5) - cameraPerson.x;
    const y = this.gameObject.y - 12 + utils.withGrid(8) - cameraPerson.y;

    this.isShadowLoaded && ctx.drawImage(this.shadow, x, y)

    const [frameX, frameY] = this.frame;

    this.isLoaded && ctx.drawImage(
      this.image,
      frameX * 24,frameY * 24,
      24,24,
      x,y,
      24,24  
    )
    
    this.updateAnimationProgress();
  }
}