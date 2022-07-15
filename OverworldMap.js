class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
    this.isPaused = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(this.lowerImage, utils.withGrid(14.5) - cameraPerson.x, utils.withGrid(8) - cameraPerson.y);
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(this.upperImage, utils.withGrid(14.5) - cameraPerson.x, utils.withGrid(8) - cameraPerson.y);
  }

  isSpaceTaken(currentX, currentY, direction) {
    const {x, y} = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach(key => {

      let object = this.gameObjects[key];
      object.id = key;

      //TODO: determone if this object should actually mount
      object.mount(this);
    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    //Start a loop of async events
    //await each one
    for (let i=0; i<events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      
      const result = await eventHandler.init();

      if (result === "LOST_BATTLE") {
        break;
      }
    }

    this.isCutscenePlaying = false;
    
    //Reset NPCs to do their idle behavior
    Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this))
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {

      const relevantScenario = match.talking.find(scenario => {
        return (scenario.required || []).every(sf => {
          return playerState.storyFlags[sf]
        })
      })
      relevantScenario && this.startCutscene(relevantScenario.events)
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
    if (!this.isCutscenePlaying && match) {

      const relevantScenario = match.find(scenario => {
        return (scenario.required || []).every(sf => {
          return playerState.storyFlags[sf]
        })
      })
      relevantScenario && this.startCutscene( relevantScenario.events)
    }
  }

  addWall(x,y) {
    this.walls[`${x},${y}`] = true;
  }

  removeWall(x,y) {
    delete this.walls[`${x},${y}`];
  }

  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const {x,y} = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x,y);
  }

}

window.OverworldMaps = {
  SmallIsland: {
    id: "SmallIsland",
    lowerSrc: "/images/SmallIsland.png",
    upperSrc: "/images/SmallIslandUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(20),
        y: utils.withGrid(14),
      }),
      npcAA: new Person({
        x: utils.withGrid(23),
        y: utils.withGrid(18),
        src: "/images/characters/people/npcA.png",
        behaviorLoop: [
          { type: "stand", direction: "down", time: 300 },
        ],
        talking: [
          {
            required: ["CAN_LEVE_ISLAND"],
            events: [
              { who: "Дід", type: "textMessage", text: "Бережи себе, Арго!", faceHero: "npcAA" },
            ]
          },
          {
            required: ["TAKE_SWORD"],
            events: [
              { who: "Дід", type: "textMessage", text: "Ти знайшов мій старий меч, можеш взяти його з собою.", faceHero: "npcAA" },
              { who: "Дід", type: "textMessage", text: "Човен пришвартований в доках, Китовий острів знаходиться на сході, плити декілька годин.", faceHero: "npcAA" },
              { who: "Арго", type: "textMessage", text: "Зрозумів, дякую Дідуль!", faceHero: "npcAA" },
              { who: "Дід", type: "textMessage", text: "Бережи себе.", faceHero: "npcAA" },
              { type: "addStoryFlag", flag: "CAN_LEVE_ISLAND" },
            ]
          },
          {
            required: ["FIRST_TOLK"],
            events: [
              { who: "Дід", type: "textMessage", text: "Спочатку знайди мій меч.", faceHero: "npcAA" },
            ]
          },
          {
            events: [
              { who: "Дід", type: "textMessage", text: "Добрий ранок Арго!", faceHero: "npcAA" },
              { who: "Арго", type: "textMessage", text: "Добрий ранок Дідуль!", faceHero: "npcAA" },
              { who: "Дід", type: "textMessage", text: "Вранці на рибальці я спіймав пляшку, в ній була карта. Подивись:", faceHero: "npcAA" },
              { type: "showMap", name: "treasure-map" },
              { type: "textMessage", text: "* Натисніть клавішу 'М' щоб знову відкрити карту *", faceHero: "npcAA" },
              { who: "Дід", type: "textMessage", text: "Острів на карті схожий на Китовий острів, в юності я туди плавав.", faceHero: "npcAA" },
              { who: "Дід", type: "textMessage", text: "На карті є червоний хрестик, думаю там можна щось знайти.", faceHero: "npcAA" },
              { who: "Арго", type: "textMessage", text: "Я хочу сходити туди!", faceHero: "npcAA" },
              { who: "Дід", type: "textMessage", text: "Це може бути небезпечно, спочатку знайди мій старий меч.", faceHero: "npcAA" },
              { who: "Дід", type: "textMessage", text: "Він має бути в скрині за будинком, тримай ключ.", faceHero: "npcAA" },

              { type: "addStoryFlag", flag: "KEY_CHEST" },
              { type: "addStoryFlag", flag: "FIRST_TOLK" },
            ]
          },
        ],
      }),
      doorAA: new Person({
        x: utils.withGrid(20),
        y: utils.withGrid(13),
        useShadow: false,
        src: "/images/characters/empty.png",
        talking: [
          {
            events: [
              { 
                type: "changeMap", 
                map: "SmallIsland",
                map1: "houses",
                map2: "demoHouse",
                x: utils.withGrid(5),
                y: utils.withGrid(13),
                direction: "up"
              },
            ]
          }
        ],
      }),
      chestAA: new Chest({
        x: utils.withGrid(17),
        y: utils.withGrid(9),
        src: "/images/characters/wooden-chest.png",
        storyFlag: "OPEN_CHEST",
        pizzas: ["f001"],
        talking:  [
          {
            required: ["TAKE_SWORD"],
            events: [
              { type: "textMessage", text: "Скриня пуста."},
            ]
          },
          {
            required: ["KEY_CHEST"],
            events: [
              { type: "addStoryFlag", flag: "OPEN_CHEST" },
              { type: "textMessage", text: "*На дні скрині валяється покритий пилом старий ржавий меч*"},
              { type: "showItem", grade: "common", name: "sword" },
              { type: "addWeapon", weapon: "w001" },
              { who: "Арго", type: "textMessage", text: "Знайшов! Більше тут нічого немає."},

              { type: "addStoryFlag", flag: "TAKE_SWORD" },
            ]
          },
          {
            events: [
              { type: "textMessage", text: "Скриня закрита."},
            ]
          }
        ]
      }),
    },
    walls: utils.collisionsMap(SmallIslandCollisions, SmallIslandWidth), //"x,y": true
    cutsceneSpaces: {
      //Docks lock
      [utils.asGridCoords(30,15)]: [
        {
          required: ["LIVE_SMALL_ISLAND"],
          events: []
        },
        {
          required: ["CAN_LEVE_ISLAND"],
          events: [
            { who: "Арго", type: "textMessage", text: "Самий час відпливати!"},
            { type: "addStoryFlag", flag: "LIVE_SMALL_ISLAND"},
          ]
        },
        {
          events: [
            { who: "Арго", type: "textMessage", text: "Поки я не можу піти звідси!"},
            { who: "hero", type: "walk", direction: "left" },
          ]
        }
      ],
      //Change map to DemoIsland
      [utils.asGridCoords(33,15)]: [
        {
          events: [
            { 
              type: "changeMap", 
              map: "DemoIsland",
              x: utils.withGrid(15),
              y: utils.withGrid(20),
              direction: "right"
            },
          ]
        }
      ],
      
    },
    houses: {
      demoHouse: {
        id: "DemoHouse",
        lowerSrc: "/images/demo-room.png",
        upperSrc: "/images/demo-room_upper.png",
        gameObjects: {
          hero: new Person({
            isPlayerControlled: true,
            x: utils.withGrid(1),
            y: utils.withGrid(1),
          }),
          npcAAA: new Person({
            x: utils.withGrid(5),
            y: utils.withGrid(5),
            src: "/images/characters/people/npcA.png",
            behaviorLoop: [
              { type: "stand", direction: "down", time: 1000 },
              { type: "stand", direction: "left", time: 1300 },
              { type: "stand", direction: "right", time: 1300 },
            ],
            talking: [
              {
                events: [
                  { who: "Сітріпіо", type: "textMessage", text: "Привіт.", faceHero: "npcAAA" },
                  // { 
                  //   type: "dialogue", 
                  //   dialogueArray: [
                  //     { who: "who", text: "some text" },
                  //     { who: "who", text: "some text" },
                  //     { who: "who", text: "some text" },
                  //     { who: "who", text: "some text" },
                  //   ]
                  // },
                ]
              },
            ],
          }),
          doorAAA: new Person({
            x: utils.withGrid(7),
            y: utils.withGrid(4),
            useShadow: false,
            src: "/images/characters/empty.png",
            talking: [
              {
                events: [
                  { type: "textMessage", text: "Двері закриті."},
                ]
              }
            ],
          }),
        },
        walls: utils.collisionsMap(DemoRoomCollisions, DemoRoomWidth), //"x,y": true,
        cutsceneSpaces: {
          //Go back to SmallIsland
          [utils.asGridCoords(5,13)]: [
            {
              events: [
                { 
                  type: "changeMap", 
                  map: "SmallIsland",
                  x: utils.withGrid(20),
                  y: utils.withGrid(14),
                  direction: "down"
                },
              ]
            }
          ],
        },
      }
    }
  },
  DemoIsland: {
    id: "DemoIsland",
    lowerSrc: "/images/DemoIsland.png",
    upperSrc: "/images/DemoIslandUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(27),
        y: utils.withGrid(19),
      }),
      npcBA: new Person({
        x: utils.withGrid(32),
        y: utils.withGrid(18),
        src: "/images/characters/people/npcA.png",
        behaviorLoop: [
          { type: "stand", direction: "right", time: 1500 },
          { type: "stand", direction: "down", time: 1200 },
          { type: "stand", direction: "left", time: 1400 },
          { type: "stand", direction: "down", time: 1200 },
        ],
        talking: [
          {
            required: ["TALK_WITH_MARKO"],
            events: [
              { who: "Марко", type: "textMessage", text: "Доброї тобі прогулки Арго!", faceHero: "npcBA" },
            ]
          },
          {
            events: [
              { who: "Марко", type: "textMessage", text: "Привіт, ніколи тебе тут не бачив, я Марко.", faceHero: "npcBA" },
              { who: "Арго", type: "textMessage", text: "Привіт, мене звати Арго, я тільки причалив, хочу тут трохи погуляти.", faceHero: "npcBA" },
              { who: "Марко", type: "textMessage", text: "В нас тут красиво, тільки не турбуй рибака, а то його легко розізлити.", faceHero: "npcBA" },
              { who: "Арго", type: "textMessage", text: "... добре, дякую за підсказку.", faceHero: "npcBA" },
              { type: "addStoryFlag", flag: "TALK_WITH_MARKO" },
            ]
          }
        ]
      }),
      npcBB: new Person({
        x: utils.withGrid(49),
        y: utils.withGrid(18),
        src: "/images/characters/people/npcB.png",
        behaviorLoop: [
          { type: "stand", direction: "down", time: 1000 },
        ],
        talking: [
          {
            required: ["OPEN_CHEST_BA"],
            events: [
              { who: "Еріо", type: "textMessage", text: "...", faceHero: "npcBB" },
            ]
          },
          {
            required: ["HELP_ERIO"],
            events: [
              { who: "Еріо", type: "textMessage", text: "Можеш прогулятися по моєму плато, але нічого там не чіпай.", faceHero: "npcBB" },
            ]
          },
          {
            required: ["DEFEAT_BANDIT"],
            events: [
              { who: "Еріо", type: "textMessage", text: "Це ж моя лопатка!", faceHero: "npcBB" },
              { who: "Еріо", type: "textMessage", text: "Дякую! Якщо хочешь можеш прогулятися по моєму плато.", faceHero: "npcBB" },

              { type: "addStoryFlag", flag: "HELP_ERIO" },
            ]
          },
          {
            required: ["TALK_WITH_ERIO"],
            events: [
              { who: "Еріо", type: "textMessage", text: "Якщо принесеш мені лопатку тоді я дозволю тобі війти на моє плато.", faceHero: "npcBB" },
            ]
          },
          {
            events: [
              { who: "Еріо", type: "textMessage", text: "Привіт, я Еріо, мій будинок на плато, це приватна територія, просто так шастати там не можна.", faceHero: "npcBB" },
              { who: "Еріо", type: "textMessage", text: "Але якщо ти мені допоможешь то я тебе впущу.", faceHero: "npcBB" },
              { who: "Еріо", type: "textMessage", text: "Один бандіт забрав мою лопатку для саду... він зазвичай ошивається біля пірсу.", faceHero: "npcBB" },
              { who: "Еріо", type: "textMessage", text: "Буду вдячний якщо ти мені її повернеш!", faceHero: "npcBB" },

              { type: "addStoryFlag", flag: "TALK_WITH_ERIO" },
            ]
          }
        ]
      }),
      npcBC: new Person({
        x: utils.withGrid(52),
        y: utils.withGrid(14),
        src: "/images/characters/people/npcB.png",
        talking: [
          {
            required: ["DEFEAT_BANDIT"],
            events: [
              { who: "Бандіт", type: "textMessage", text: "Йди звідси...", faceHero: "npcBC" },
            ]
          },
          {
            required: ["TALK_WITH_ERIO"],
            events: [
              { who: "Бандіт", type: "textMessage", text: "Йди звідси, пірс під моїм захистом!", faceHero: "npcBC" },
              { who: "Арго", type: "textMessage", text: "Це ти забрал лопатку у Еріо?", faceHero: "npcBC" },
              { who: "Бандіт", type: "textMessage", text: "Може й так, а шо?!", faceHero: "npcBC" },
              { who: "Арго", type: "textMessage", text: "Поверни йому!", faceHero: "npcBC" },
              { who: "Бандіт", type: "textMessage", text: "Ахахаха!!", faceHero: "npcBC" },
              { type: "textMessage", text: "*battle* //TODO: new battle sistem", faceHero: "npcBC" },
              //{ type:"battle", enemyId: "beth" },
              //{ type: "deleteObject", name: "npcBC", map: "DemoIsland" },
              { type: "showItem", grade: "rare", name: "trowel" },
              { who: "Бандіт", type: "textMessage", text: "... забирай її і вали!", faceHero: "npcBC" },

              { type: "addStoryFlag", flag: "DEFEAT_BANDIT" },
            ]
          },
          {
            events: [
              { who: "Бандіт", type: "textMessage", text: "Йди звідси, пірс під моїм захистом!", faceHero: "npcBC" },
            ]
          }
        ]
      }),
      npcBD: new Person({
        x: utils.withGrid(32),
        y: utils.withGrid(29),
        src: "/images/characters/people/npcB.png",
        talking: [
          {
            required: ["ANGRY!!!"],
            events: [
              { type: "textMessage", text: "*Краще його не чіпати...*"},
            ]
          },
          {
            required: ["ANGRY!"],
            events: [
              { who: "Дуже злий Рибак", type: "textMessage", text: "Я Ж СКАЗАВ - Я ЗАЙНЯТИЙ, НЕ ВІДВОЛІКАЙ!!!"},
              { type: "textMessage", text: "*battle* //TODO: new battle sistem" },
              //{ type: "battle", enemyId: "beth"}, //He kill me
              //titres
              { type: "addStoryFlag", flag: "ANGRY!!!"}
            ]
          },
          {
            required: ["ANGRY"],
            events: [
              { who: " Злий Рибак", type: "textMessage", text: "Я зайнятий.. не відволікай!"},
              { type: "addStoryFlag", flag: "ANGRY!"}
            ]
          },
          {
            events: [
              { who: "Рибак", type: "textMessage", text: "Я зайнятий, не відволікай."},
              { type: "addStoryFlag", flag: "ANGRY"}
            ]
          }
        ]
      }),
      doorBA: new Person({
        x: utils.withGrid(27),
        y: utils.withGrid(18),
        useShadow: false,
        src: "/images/characters/empty.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Двері закриті."},
            ]
          }
        ],
      }),
      doorBB: new Person({
        x: utils.withGrid(41),
        y: utils.withGrid(25),
        useShadow: false,
        src: "/images/characters/empty.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Двері закриті."},
            ]
          }
        ],
      }),
      doorBC: new Person({
        x: utils.withGrid(46),
        y: utils.withGrid(13),
        useShadow: false,
        src: "/images/characters/empty.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Двері закриті."},
            ]
          }
        ],
      }),

      // TODO: create some smithy object 
      // pizzaStone: new PizzaStone({
      //   x: utils.withGrid(27),
      //   y: utils.withGrid(22),
      //   storyFlags: "USED_PIZZA_STONE",
      //   pizzas: ["v001", "f001"],
      // })
    },
    walls: utils.collisionsMap(DemoIslandCollisions, DemoIslandWidth), //"x,y": true
    cutsceneSpaces: {
      //Don't go in platoue
      [utils.asGridCoords(46,16)]: [
        {
          required: ["ERIO_SAY_ABOUT_TREASURE"],
          events: []
        },
        {
          required: ["OPEN_CHEST_BA"],
          events: [
            { who: "npcBB", type: "stand", direction: "left", time: 10 },
            { who: "Еріо",  type: "textMessage", text: "Стій!" },
            { who: "npcBB", type: "walk", direction: "left" },
            { who: "npcBB", type: "walk", direction: "left" },
            { who: "npcBB", type: "walk", direction: "left" },
            { who: "npcBB", type: "walk", direction: "up" },
            { who: "npcBB", type: "stand", direction: "up", time: 10 },
            { who: "Еріо",  type: "textMessage", text: "Ти це знайшов на моему участку?!" },
            { who: "Еріо",  type: "textMessage", text: "Ех.. так як ти мені допоміг то можешь залишити її собі." },
            { who: "Еріо",  type: "textMessage", text: "З східного пірса можно відправитись на Дикий острів, там нема поселень людей." },
            { who: "Еріо",  type: "textMessage", text: "І там багато монстрів, але в центі острову є розвалини старого храму." },
            { who: "Еріо",  type: "textMessage", text: "Там можна знайти скарби, з такою зброєю в тебе не має бути проблем." },
            { who: "Арго",  type: "textMessage", text: "Дякую за підсказку, відправлюсь туди!" },
            { who: "Еріо",  type: "textMessage", text: "Дикий острів знаходиться на північному-сході, в пів дня шляху звідси." },
            { who: "Еріо",  type: "textMessage", text: "Якщо щось знайдеш то і про мене не забудь. Щасливої дороги!" },
            { who: "Арго",  type: "textMessage", text: "Добре, дякую!" },
            { who: "npcBB", type: "walk", direction: "down" },
            { who: "npcBB", type: "walk", direction: "right" },

            { who: "npcBB", type: "walk", direction: "right" },
            { who: "npcBB", type: "walk", direction: "right" },
            { who: "npcBB", type: "stand", direction: "down", time: 10 },

            { type: "addStoryFlag", flag: "ERIO_SAY_ABOUT_TREASURE"}
          ]
        },
        {
          required: ["HELP_ERIO"],
          events: []
        },
        {
          events: [
            { who: "npcBB", type: "stand", direction: "left", time: 10 },
            { who: "Еріо",  type: "textMessage", text: "Ей! Туди не можна!" },
            { who: "npcBB", type: "walk", direction: "left" },
            { who: "npcBB", type: "walk", direction: "left" },
            { who: "npcBB", type: "walk", direction: "left" },
            { who: "npcBB", type: "walk", direction: "up" },
            { who: "npcBB", type: "stand", direction: "up", time: 10 },
            { who: "Еріо",  type: "textMessage", text: "Це мій будинок, тобі туди не можна!" },
            { who: "npcBB", type: "walk", direction: "down" },
            { who: "npcBB", type: "walk", direction: "right" },
            { who: "npcBB", type: "stand", direction: "left", time: 100 },

            { who: "hero", type: "walk", direction: "down" },
            { who: "hero", type: "walk", direction: "down" },
            { who: "hero", type: "walk", direction: "down" },
            { who: "hero", type: "walk", direction: "down" },

            { who: "npcBB", type: "walk", direction: "right" },
            { who: "npcBB", type: "walk", direction: "right" },
            { who: "npcBB", type: "stand", direction: "down", time: 100 },

            
            { who: "hero", type: "stand", direction: "right", time: 400 },
            { who: "hero", type: "stand", direction: "left", time: 400 },
            { who: "hero", type: "stand", direction: "down", time: 200 },
          ]
        }
      ], 
      //Change map to SmallIsland
      [utils.asGridCoords(15,20)]: [
        // {
        //   required: ["CAN_LEVE_ISLAND"],
        //   events: [
        //     { who: "Арго", type: "textMessage", text: "Мені поки непотрібно повертатися додому."},
        //   ]
        // },
        {
          events: [
            { 
              type: "changeMap", 
              map: "SmallIsland",
              x: utils.withGrid(33),
              y: utils.withGrid(15),
              direction: "left" 
            },
          ]
        }
      ],
      [utils.asGridCoords(18,20)]: [
        {
          required: ["DEMO_HELLO_ISLAND"],
          events: []
        },
        {
          events: [
            { who: "Арго", type: "textMessage", text: "А вот і Китовий острів! Потрібно добре його вивчити."},
            { type: "addStoryFlag", flag: "DEMO_HELLO_ISLAND"}
          ]
        }
      ],
      [utils.asGridCoords(39,15)]: [
        {
          required: ["DEMO_FIND_CHEST_BA"],
          events: []
        },
        {
          events: [
            { type: "textMessage", text: "Здається тут місце позначене на карті.", who: "Арго",},
            { type: "showMap", name: "treasure-map" },
            { type: "textMessage", text: "Потрібно копати.", who: "Арго",},
            { type: "placeGameObject", object: objectsForPlace.DemoIsland.chestBA},
            { who: "Арго", type: "textMessage", text: "Щось є.. ЦЕ Ж СКРИНЯ!",},
            { type: "addStoryFlag", flag: "DEMO_FIND_CHEST_BA"}
          ]
        }
      ],
      //DOTO: Change map to NewIsland
      [utils.asGridCoords(56,16)]: [
        {
          events: [
            { type: "textMessage", text: "TODO: Change map to NewIsland"},
          ]
        }
      ],
      [utils.asGridCoords(53,16)]: [
        {
          required: ["ERIO_SAY_ABOUT_TREASURE"],
          events: []
        },
        {
          required: ["DEFEAT_BANDIT"],
          events: [
            { who: "Арго", type: "textMessage", text: "Я поки нікуди плити не збираюсь."},
            { who: "hero", type: "walk", direction: "left"},
          ]
        },
        {
          events: [
            { who: "Бандіт", type: "textMessage", text: "Пірс закритий, йди звідси!!"},
            { who: "hero", type: "walk", direction: "left"},
          ]
        }
      ],
    },
  },
  
}