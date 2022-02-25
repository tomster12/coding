
async function loadAseSpritesheet(out, path, name) {
  // Load files
  loadImage(path + name + ".png", spriteSheet => {
    loadJSON(path + name + ".json", spriteData => {

      // For each animation
      for (let animationTag of spriteData.meta.frameTags) {
        out[animationTag.name] = new Animation(spriteSheet, animationTag.name, animationTag.type ? animationTag.type : "loop");

        // Calculate frame data
        for (let i = 0; i <= animationTag.to - animationTag.from; i++) {
          let frameName = "#" + animationTag.name + " " + i + ".aseprite";
          let frameData = spriteData.frames[frameName];

          // Parse slices for frame
          slices = {};
          for (let slice of spriteData.meta.slices) {
            let foundBounds = null;
            for (let o = 0; o < slice.keys.length; o++) {
              if (slice.keys[o].frame <= (animationTag.from + i) && slice.keys[o].active) foundBounds = slice.keys[o].bounds;
              if ((slice.keys[o].frame > (animationTag.from + i) || o == slice.keys.length - 1) && foundBounds != null) {
                slices[slice.name] = foundBounds;
                break;
              }
            }
          }

          // Move origin center
          if (slices["Origin"] == null)
            slices["Origin"] = { "x": 0, "y": 0 };
          slices["Origin"] = {
            x: slices["Origin"].x + 0.5,
            y: slices["Origin"].y + 1
          };

          // Add to current animation
          out[animationTag.name].addFrame(frameData.duration, frameData.frame, slices);
        }
      }
    });
  });
}


class Frame {

  // #region - Main

  constructor(duration_, bounds_, slices_) {
    // Declare and initialize variables
    this.duration = duration_;
    this.bounds = bounds_;
    this.slices = slices_;
    this.origin = slices_["Origin"];
  }

  // #endregion
}


class Animation {

  // #region - Main

  constructor(sheet_, name_, type_) {
    // Declare and initialize variables
    this.sheet = sheet_;
    this.name = name_;
    this.type = type_;
    this.frames = [];
  }


  addFrame(duration_, bounds_, origin_) {
    // Add a new frame
    this.frames.push(new Frame(duration_, bounds_, origin_));
  }

  // #endregion
}


class Animator {

  // #region - Setup

  constructor(animations_) {
    // Declare and initialize variables
    this.animations = animations_;
    this.animation = null;
    this.frame = 0;
    this.time = 0;
    this.ended = false;
    this.endCallback = null;
  }

  // #endregion


  // #region - Main

  play(animationName, callback) {
    // Play if it is a different animation which exists
    if ((this.animation == null
      || this.animation.name != animationName)
    && this.animations[animationName] != null) {

      // Setup animation
      this.animation = this.animations[animationName];
      this.frame = 0;
      this.time = 0;
      this.ended = false;

      // Handle callbacks
      this.callEndCallback(false);
      this.endCallback = callback;

      // Played successful
      return true;

    // Unsuccessful
    } else return false;
  }


  callEndCallback(result) {
    // Call the end callback safely
    if (this.endCallback) {
      let toCall = this.endCallback;
      this.endCallback = null;
      toCall(result);
    }
  }


  update(dt) {
    // Update current animation
    if (this.animation != null) {
      let currentFrame = this.animation.frames[this.frame];
      this.time += dt * 1000;

      // Next frame
      if (this.time > currentFrame.duration && !this.ended) {
        this.time = this.time - currentFrame.duration;
        this.frame++;

        // End of frame
        if (this.frame == this.animation.frames.length) {
          this.callEndCallback(true);

          // End of single
          if (this.animation.type == "single") {
            this.ended = true;
            this.frame--;

            // End of loop
          } else this.frame = 0;
        }
      }
    }
  }


  show(px, py, pixelSize, flipped) {
    // Show current frame
    if (this.animation != null) {
      let currentFrame = this.animation.frames[this.frame];
      push();
      translate(px, py);
      scale(pixelSize * (flipped ? -1 : 1), pixelSize);
      image(this.animation.sheet.get(
          currentFrame.bounds.x, currentFrame.bounds.y,
          currentFrame.bounds.w, currentFrame.bounds.h),
        -currentFrame.origin.x, -currentFrame.origin.y,
        currentFrame.bounds.w, currentFrame.bounds.h);
      pop();
    }
  }

  // #endregion
}


class StateManager {

  // #region - Setup

  constructor() {
    // Declare and initialize variables
    this.states = {};
    this.connections = [];
    this.currentState = null;
    this.currentConnection = null;
    this.connectionPriority = -1;
    this.targetState = null;
  }


  addState(state) {
    // Add a state
    this.states[state.name] = state;
  }


  addConnection(connection) {
    // Add if states exist and connection doesnt
    if (this.getState(connection.from) != null
    && this.getState(connection.to) != null
    && this.getConnection(connection) == null) {
      this.connections.push(connection);
    }
  }

  // #endregion


  // #region - Main

  static compareStates(state1, state2) {
    // Catch case
    if (state1 === null) {
      if (state2 === null) return true;
      else return false;
    }

    // Check names match
    if (state1.name != undefined) {
      if (state1.name != state2.name) return false;
    }

    // Check all tags in 1 are in 2
    if (state1.tags != undefined) {
      for (let tag of state1.tags) {
        if (state2.tags == undefined) return false;
        if (state2.tags.indexOf(tag) == -1) return false
      }
    }

    // Return true if both checks succeed
    return true;
  }


  getState(checkState) {
    // Returns whether has a specific state
    for (let stateName in this.states) {
      if (StateManager.compareStates(checkState, this.states[stateName])) {
        return this.states[stateName];
      }
    }
    return null;
  }


  getConnection(checkConnection) {
    // Returns whether has a specific connection
    for (let connection of this.connections) {
      if (StateManager.compareStates(connection.from, checkConnection.from)
      && StateManager.compareStates(connection.to, checkConnection.to)) {
        return connection;
      }
    }
    return null;
  }


  _setState(toState) {
    // Set set to a specific state irregardless of connections
    this.currentState = toState;
    this.currentConnection = null;
    this.connectionPriority = -1;
    this.targetState = null;
    toState.trigger();
    return true;
  }


  gotoState(toStateName, priority = 0) {
    // Check state exists
    if (this.states[toStateName] == null) return false;
    let toState = this.states[toStateName];

    // Instantly connection if not in a state
    if (this.currentState == null) return this._setState(toState);

    // Currently on connection with higher priority
    if (this.currentConnection != null && priority < this.connectionPriority) return false;

    // New connection and going to a different state
    else if ((this.currentConnection == null
      || toStateName != this.targetState.name)
    && toStateName != this.currentState.name) {

      // Check if connection exists from currentState to toState
      let connection = this.getConnection({ from: this.currentState, to: toState });
      if (connection) {
        this.currentConnection = connection;
        this.connectionPriority = priority;
        this.targetState = toState;

        // Run connection then set state
        connection.transition((result) => {
          if (result) {
            this._setState(this.targetState);
          } else {
            this.currentConnection = null;
            this.connectionPriority = -1;
            this.targetState = null;
          }
        });
      }
    }
  }


  checkState(currentState, targetState) {
    // Returns whether states match
    return (currentState === undefined || StateManager.compareStates(currentState, this.currentState))
    && (targetState === undefined || StateManager.compareStates(targetState, this.targetState));
  }

  // #endregion
}


class AnimationManager extends StateManager {

  // #region - Main

  constructor(animations_) {
    // Call super
    super();

    // Declare and initialize variables
    this.animator = new Animator(animations_);
  }


  addAnimatedState(state) {
    // Add the state with an animation trigger
    let stateInfo = {
      name: state.name || "",
      tags: state.tags || [],
      trigger: (() => {
        this.animator.play(state.name);
      })};
    this.addState(stateInfo);
  }


  addAnimatedConnection(connection) {
    // For each direction on the connection
    let endStates = [connection.from, connection.to];
    for (let i = 0; i < 2; i++) {
      if (connection.directions[i] !== undefined) {

        // Add a connection between with am animated transition
        let connectionInfo = {
          from: endStates[i],
          to: endStates[1 - i],
          transition: ((callback) => {
            if (connection.directions[i] === null) callback(true);
            else this.animator.play(conn.directions[i], callback);
          })};
        this.addConnection(connectionInfo);
      }
    }
  }

  // #endregion


  // #region - Main

  update(dt) {
    // Update animator
    this.animator.update(dt);
  }


  show(px, py, pixelSize, flipped) {
    // Show animator
    this.animator.show(px, py, pixelSize, flipped);
  }

  // #endregion
}