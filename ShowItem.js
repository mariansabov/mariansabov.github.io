class ShowItem {
  constructor(config) {
    this.onComplete = config.onComplete;
    this.name = config.name;
    this.grade = config.grade;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("ShowItem");
    this.element.innerHTML = (`
      <img class="ShowItem_svg" src="/images/svg/item-${this.grade}.svg" />
      <img class="ShowItem_img" src="/images/items/${this.name}.png" />
    `)

    this.element.querySelector(".ShowItem_img").addEventListener("animationend", () => {
      this.actionListener = new KeyPressListener("Enter", () => {
        this.done();
      })
    })
  }

  done() {
    //Remove listener animationend
    this.element.querySelector(".ShowItem_img").removeEventListener("animationend", () => {
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