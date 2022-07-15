class ShowMap {
  constructor(config) {
    this.onComplete = config.onComplete;
    this.name = config.name;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("ShowMap");
    this.element.innerHTML = (`
      <img class="ShowMap_img" src="/images/items/${this.name}.png" />
    `)

    this.element.querySelector(".ShowMap_img").addEventListener("animationend", () => {
      this.actionListener = new KeyPressListener("Enter", () => {
        this.done();
      })
    })
  }

  done() {
    //Remove listener animationend
    this.element.querySelector(".ShowMap_img").removeEventListener("animationend", () => {
      this.actionListener = new KeyPressListener("Enter", () => {
        this.done();
      })
    })

    //Remove keyPress listener
    this.actionListener.unbind();
    this.element.remove();
    this.onComplete();
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);
  }
}