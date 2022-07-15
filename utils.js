const utils = {
  withGrid(n) {
    return n * 12;
  },

  asGridCoords(x,y) {
    return `${x*12},${y*12}`
  },

  nextPosition(initialX, initiolY, direction) {
    let x = initialX;
    let y = initiolY;
    const size = 12;
    if (direction === "left") {
      x -= size;
    } else if (direction === "right") {
      x += size;
    } else if (direction === "up") {
      y -= size;
    } else if (direction === "down") {
      y += size;
    }

    return {x,y};
  },

  oppositeDirection(direction) {
    if (direction === "left") { return "right" }
    if (direction === "right") { return "left" }
    if (direction === "up") { return "down" }
    return "up"
  },
  
  collisionsMap(collisions, width) {
    const collisionsMap = [];
    for (let i = 0; i < collisions.length; i += width) {
      collisionsMap.push(collisions.slice(i, width + i));
    }

    const collisionObj = {};
    collisionsMap.forEach((row, i) => {
      row.forEach((symbol, j) => {
        if (symbol != 0)
          collisionObj[utils.asGridCoords(j, i)] = true;
      })
    })

    return collisionObj;
  },

  wait(ms) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, ms)
    })
  },

  randomFromArray(array) {
    return array[ Math.floor(Math.random()*array.length) ]
  },

  emitEvent(name, detail) {
    const event = new CustomEvent(name, {
      detail
    });
    document.dispatchEvent(event)
  }
}