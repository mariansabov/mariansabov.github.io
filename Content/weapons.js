window.WeaponTypes = {
  normal: "normal",
  spicy: "spycy",
  veggie: "veggie",
  fungi: "fungi",
  chill: "chill",
}

window.Weapons = {
  "w001": {
    name: "Ржавий меч",
    description: "Pizza desc here",
    grade: "common",
    type: WeaponTypes.spicy,
    src: "/images/items/sword.png", //"/images/characters/pizzas/s001.png",
    icon: "/images/icons/spicy.png",
    actions: ["damage1", "saucyStatus","clumsyStatus"],
  },
  "w002": {
    name: "Коса Жатви",
    description: "A salty warrior who fears nothing",
    grade: "legendary",
    type: WeaponTypes.spicy,
    src: "/images/items/scythe.png",
    icon: "/images/icons/spicy.png",
    actions: ["damage1", "saucyStatus", "clumsyStatus"],
  },
}