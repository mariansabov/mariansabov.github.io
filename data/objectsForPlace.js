objectsForPlace = {
  DemoIsland: {
    chestBA: { 
      map: "DemoIsland",
      x: utils.withGrid(38),
      y: utils.withGrid(15), 
      src: "/images/characters/blue-chest.png",
      storyFlag: "OPEN_CHEST_BA",
      objectName: "chestBA",
      objectType: "Chest",
      talking: [
        {
          required: ["OPEN_CHEST_BA"],
          events: [
            { type: "textMessage", text: "Скриня пуста."},
          ]
        },
        {
          events: [
            { type: "addStoryFlag", flag: "OPEN_CHEST_BA" },
            { type: "textMessage", text: "*В скрині гостра коса*"},
            { type: "showItem", grade: "legendary", name: "scythe" },
            { type: "addWeapon", weapon: "w002"},
            { who: "Арго" ,type: "textMessage", text: "Яка гостра коса, вона точно стане в нагоді!"},
          ]
        }
      ],
    },
  },

};