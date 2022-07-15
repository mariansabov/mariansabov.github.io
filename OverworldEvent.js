class OverworldEvent {
  constructor({ map, event }) {
    this.map = map;
    this.event = event;
  }

  stand(resolve) {
    const who = this.map.gameObjects[ this.event.who ];
    
    who.startBehavior({
      map: this.map
    }, {
      type: "stand",
      direction: this.event.direction,
      time: this.event.time
    })
  

    //Set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonStandComplete", completeHandler);
        resolve();
      }
    }

    document.addEventListener("PersonStandComplete", completeHandler)
  }

  walk(resolve) {
    const who = this.map.gameObjects[ this.event.who ];
    who.startBehavior({
      map: this.map
    }, {
      type: "walk",
      direction: this.event.direction,
      retry: true
    })

    //Set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonWalkingComplete", completeHandler);
        resolve();
      }
    }

    document.addEventListener("PersonWalkingComplete", completeHandler)
  }

  textMessage(resolve) {

    if(this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
    }

    const message = new TextMessage({
      text: this.event.text,
      who: this.event.who,
      onComplete: () => resolve()
    })
    message.init(document.querySelector(".game-container"));
  }

  changeMap(resolve) {
    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector(".game-container"), () => {
      this.map.overworld.startMap( 
        this.event.map1 
          ? window.OverworldMaps[this.event.map][this.event.map1][this.event.map2] 
          : window.OverworldMaps[this.event.map], { //My change
        x: this.event.x,
        y: this.event.y,
        direction: this.event.direction,
      });

      //It's fix fome bag with behaviorLoop, but need learn more about async/await and promise
      //becose i senk it's do some another error what no so eazy to cath ...
      //Coment this for fix --> resolve();

      sceneTransition.fadeOut();
      
    })
  }

  battle(resolve) {
    const battle = new Battle({
      enemy: Enemies[this.event.enemyId],
      onComplete: (didWin) => {
        resolve(didWin ? "WON_BATTLE" : "LOST_BATTLE") ;
      }
    })
    battle.init(document.querySelector(".game-container"));
  }

  pause(resolve) {
    this.map.isPaused = true;
    const menu = new PauseMenu({
      progress: this.map.overworld.progress,
      onComplete: () => {
        resolve();
        this.map.isPaused = false;
        this.map.overworld.startGameLoop();
      }
    });
    menu.init(document.querySelector(".game-container"));
  }

  addStoryFlag(resolve) {
    window.playerState.storyFlags[this.event.flag] = true;
    resolve()
  }

  craftingMenu(resolve) {
    const menu = new CraftingMenu({
      pizzas: this.event.pizzas,
      onComplete: () => {
        resolve();
      }
    });
    menu.init(document.querySelector(".game-container"));
  }

  showItem(resolve) {
    const item = new ShowItem({
      name: this.event.name,
      grade: this.event.grade,
      onComplete: () => {
        resolve();
      }
    })
    item.init(document.querySelector(".game-container"))
  }

  showMap(resolve) {
    const map = new ShowMap({
      name: this.event.name,
      onComplete: () => {
        resolve();
      }
    })
    map.init(document.querySelector(".game-container"))
  }

  placeGameObject(resolve) {

    this.object = this.event.object
    
    this.mapForPlaced = this.object.map;
    this.newObject = this.object.objectName;
    this.id = this.object.objectName;
    this.x = this.object.x;
    this.y = this.object.y;
    this.src = this.object.src || "";
    this.objectType = this.object.objectType;
    this.storyFlag = this.object.storyFlag || "";
    this.talking = this.object.talking || [];

    this.parameters = {
      id: this.id,
      x: this.x,
      y: this.y,
      src: this.src,
      storyFlag: this.storyFlag,
      talking:  this.talking,
    }

    switch (this.objectType) {
      case "Chest":
        window.OverworldMaps[this.mapForPlaced].gameObjects[this.newObject] = new Chest({
          ...this.parameters
        })
        break
    }

    window.OverworldMaps[this.mapForPlaced].gameObjects[this.newObject].mount(this.map);

    resolve()
  }

  addWeapon(resolve) {
    playerState.addWeapon(this.event.weapon);
    resolve();
  }

  //TODO: update and debag this event
  deleteObject(resolve) {
    this.object = this.event.name;
    this.map = this.event.map;
    delete window.OverworldMaps[this.map].gameObjects[this.object];
    resolve();
  }

  //TODO: update and debag this event
  dialogue(resolve) {

    const message = new Dialogue({
      dialogueArray: this.event.dialogueArray,
      onComplete: () => resolve()
    })
    message.init(document.querySelector(".game-container"));
  }

  init() {
    return new Promise(resolve => {
      this[this.event.type](resolve)
    })
  }
}