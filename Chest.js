class Chest extends GameObject {
  constructor(config) {
    super(config);
    this.src = config.src || "/images/characters/chest1.png";
    this.sprite = new Sprite({
      gameObject: this,
      useShadow: true,
      src: this.src,
      animations: {
        "chest-close": [ [0,0] ],
        "chest-open": [ [1,0] ],
      },
      currentAnimation: "chest-close",
    });
    
    this.storyFlag = config.storyFlag;

    this.talking = config.talking || [];
  }  

  update() {
    this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
      ? "chest-open"
      : "chest-close"
  }
}