class TextMessage {
  constructor({ text, who, onComplete }) {
    this.text = text;
    this.who = who || null
    this.onComplete = onComplete;
    this.element = null;
    this.characterName = who === "Арго" ? "hero-name" : "npc-name";
  }

  createElement() {
    
    //Create the element
    this.element = document.createElement("div");
    this.element.classList.add("TextMessage");

    this.element.innerHTML = (`
      <p class="TextMessage_p">
        <span class="${this.characterName} revealed">
          ${ this.who ? this.who+": " : ""}
        </span>
      </p>
      <button class="TextMessage_button">Next</button>
    `)

    //Init the typewriter effect
    this.revealingText = new RevealingText({
      element: this.element.querySelector(".TextMessage_p"),
      text: this.text
    })

    this.element.querySelector("button").addEventListener("click", () => {
      //Close the text message
      this.done();
    });

    this.actionListener = new KeyPressListener("Enter", () => {
      this.done();
    })
  }

  done() {
    if (this.revealingText.isDone) {
      this.element.remove();
      this.actionListener.unbind();
      this.onComplete();
    } else {
      this.revealingText.warpToDone();
    }
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);
    this.revealingText.init();
  }
}