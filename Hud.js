class Hud { 
  constructor() {
    this.scoreboards = [];
  }

  update() {
    this.scoreboards.forEach(s => {
      s.update(window.playerState.weapons[s.id])
    })
  }

  createElement() {

    if (this.element) {
      this.element.remove();
      this.scoreboards = [];
    }

    this.element = document.createElement("div");
    this.element.classList.add("Hud");
    const {playerState} = window;
    playerState.lineup.forEach(key => {
      const weapon = playerState.weapons[key];
      const scoreboard = new Combatant({
        id: key,
        ...Weapons[weapon?.weaponId],
        ...weapon,
      }, null)
      scoreboard.createElement();
      scoreboard.hudElement.classList.add(Weapons[weapon?.weaponId]?.grade)
      this.scoreboards.push(scoreboard);
      this.element.appendChild(scoreboard.hudElement);
    });
    this.update();
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);

    document.addEventListener("PlayerStateUpdate", () => {
      this.update();
    })

    document.addEventListener("LineupChanged", () => {
      this.createElement();
      container.appendChild(this.element);
    })
  }
}