
class Player {

  // #region - Setup

  // Declare preset variables
  public preset: {[propName: string]: number};
  public colors: {[propName: string]: string};

  // Declare positioning variables
  private _pos: Vec2;
  private movementVel: Vec2;
  private otherVel: Vec2;
  private _facingDir: number;
  private _facingDirVel: number;

  // Declare other variables
  private bodySize: number;
  private _lHand: Hand;
  private _rHand: Hand;
  private weapon: Weapon;


  constructor(pos_: Vec2) {
    // Initialize preset variables
    this.preset = {
      movementVelFriction: 0.8,
      movementOtherFriction: 0.9,
      movementAcc: 100,
      handFriction: 0.4,
      handAcc: 0.2,
      facingFriction: 0.6,
      facingAcc: 0.1,
      walkSpeed: 8,
      runSpeed: 10
    };
    this.colors = {
      body: "#6ad979",
      hand: "#3b7d3e",
      arm: "#796d63"
    };

    // Initialize positioning variables
    this._pos = pos_;
    this.movementVel = new Vec2(0, 0);
    this.otherVel = new Vec2(0, 0);
    this._facingDir = 0;
    this._facingDirVel = 0;

    // Initialize other variables
    this.bodySize = 45;
    this._lHand = new Hand(this, 20, new Polar(3 * PI / 2, 20));
    this._rHand = new Hand(this, 20, new Polar(1 * PI / 2, 20));
    this.weapon = null;
    this.equipWeapon(new Fists());
  }


  // Read-only outside class
  get pos(): Vec2 { return this._pos; }
  get facingDir(): number { return this._facingDir; }
  get facingDirVel(): number { return this._facingDirVel; }
  get lHand(): Hand { return this._lHand; }
  get rHand(): Hand { return this._rHand; }

  // #endregion


  // #region - Update

  public update(): void {
    // Main update functions
    this.updateMovement();
    this.updateWeapon();
    this.updateHands();
    this.faceTowardsMouse();
  }


  private updateMovement(): void {
    // Update velocity baseOffsetd on input direction
    let moving = this.isMoving();
    if (moving) {
      let inputDir = this.getInputDirection();
      let movementAcc = inputDir.ipMult(this.preset.movementAcc);
      let movementVelDelta = movementAcc.ipMult(dt);
      this.movementVel.ipAdd(movementVelDelta);
      this.movementVel.ipLimitMag(this.preset.walkSpeed);
    }

    // Update position of body and hands and apply friction
    this._pos.ipAdd(this.movementVel);
    this._pos.ipAdd(this.otherVel);
    if (!moving) this.movementVel.ipMult(this.preset.movementVelFriction);
    this.otherVel.ipMult(this.preset.movementOtherFriction);
  }


  private updateWeapon(): void {
    // Currently attacking
    if (this.weapon != null) {
      this.weapon.update();
      if (mouseInput != 0)
        this.weapon.tryAttack();

      // Update throwing
      if (inputsPressed[81])
        this.dropWeapon();

      // Debug give MultiWeapon
      if (inputsPressed[90])
        this.equipWeapon(new MultiWeapon());

      // Debug pickup closest weapon
      if (inputsPressed[69] && groundWeapons.length > 0) {
        let closest = groundWeapons[0];
        let distance = closest.pos.sub(this._pos).getMagSq();
        for (let weapon of groundWeapons) {
          let newDistance = weapon.pos.sub(this._pos).getMagSq();
          if (newDistance < distance) {
            closest = weapon;
            distance = newDistance;
          }
        }
        this.equipWeapon(closest);
      }

    // Have no weapon
    } else {
      this.equipWeapon(new Fists());
    }
  }


  private updateHands(): void {
    // Update each hand
    this._lHand.update();
    this._rHand.update();
  }


  private faceTowardsMouse(): void {
    // Update facing vel baseOffsetd on mouse
    let dir = getScreenMousePos().ipSub(this._pos);
    let facingDir = Vec2.fromDir(this._facingDir);
    let dif = facingDir.getAngleTo(dir);
    let dirVelDelta = dif * this.preset.facingAcc;
    this._facingDirVel += dirVelDelta;

    // Update facing dir and apply friction
    this._facingDir += this._facingDirVel;
    this._facingDirVel *= this.preset.facingFriction;
    this._facingDir = (this._facingDir + TWO_PI) % TWO_PI;
  }

  // #endregion


  // #region - Show

  public show(): void {
    // Main show
    this.showHands();
    this.showBody();
  }


  private showHands(): void {
    // Show each hand
    this._lHand.show();
    this._rHand.show();

    // Show weapon
    if (this.weapon != null)
      this.weapon.showHeld();
  }


  private showBody(): void {
    // Show body as ellipse
    noStroke();
    fill(this.colors.body);
    ellipse(this._pos.x, this._pos.y,
      this.bodySize, this.bodySize);
  }

  // #endregion


  // #region - Main

  public translateTo(): void {
    // Translate the camera to the player
    translate(this.getTranslateX(), this.getTranslateY());
  }

  public getTranslateX(): number {
    return width / 2 - this._pos.x;
  }

  public getTranslateY(): number {
    return height / 2 - this._pos.y;
  }


  public equipWeapon(weapon: Weapon): void {
    // Drop current weapon if equipped, equip new one
    if (weapon != null) {
      if (this.weapon != null)
      this.dropWeapon();
      this.weapon = weapon;
      weapon.setUser(this);
    }
  }

  public dropWeapon(force = (5 + random(2) - 1)): void {
    // Drop the current weapon
    if (this.weapon != null) {
      this.weapon.drop();
      let velDif = this.getFacingDirectionVec().ipMult(force);
      velDif.ipAdd(this._lHand.getVel().mult(120));
      let angleDif = PI * (random(0.3) -  0.15);
      this.weapon.applyVel(velDif, angleDif);
      this.weapon = null;
      this._lHand.gotoOffset = new Polar(0, 0);
      this._rHand.gotoOffset = new Polar(0, 0);
    }
  }


  public knockback(mag: number): void {
    // Knock the player backwards by a magnitude
    let dir = new Polar(this._facingDir, 1).ipAddAngle(PI);
    let otherVelDelta = Vec2.fromPolar(dir).ipMult(mag);
    this.otherVel.ipAdd(otherVelDelta);
  }


  public getInputDirection(): Vec2 {
    // Returns a vector representing the movement direction
    let inputDir = new Vec2(0, 0);
    if (inputs[65]) inputDir.x--;
    if (inputs[87]) inputDir.y--;
    if (inputs[68]) inputDir.x++;
    if (inputs[83]) inputDir.y++;
    inputDir.ipNormalize();
    return inputDir;
  }

  public isMoving(): boolean {
    // Returns whether player moving
    return (inputs[65] || inputs[87] || inputs[68] || inputs[83]);
  }


  public getFacingDirectionVec(): Vec2 {
    // Returns a vector representing the facing direction
    return Vec2.fromDir(this._facingDir);
  }


  public getFacingDirectionPolar(): Polar {
    // Returns a vector representing the facing direction
    return new Polar(this._facingDir, 1);
  }

  // #endregion
}


class Hand {

  // #region - Setup

  private user: Entity;
  private size: number;

  private baseOffset: Polar;
  private offset: Polar;
  private offsetVel: Polar;
  public gotoOffset: Polar;


  constructor(user: Entity, size: number, offset: Polar) {
    // Initialize variables
    this.user = user || null;
    this.size = size || 0;
    this.baseOffset = offset ? offset.copy() : new Polar(0, 0);
    this.offset = new Polar(0, 0);
    this.offsetVel = new Polar(0, 0);
    this.gotoOffset = new Polar(0, 0);
  }

  // #endregion


  // #region - Main

  public update(): void {
    // Update offset vel
    let offsetDif = this.offset.polarTo(this.gotoOffset);
    let offsetVelDelta = offsetDif.ipMult(this.user.preset.handAcc);
    this.offsetVel.ipAdd(offsetVelDelta);

    // // Update current offset and apply friction
    this.offset.ipAdd(this.offsetVel);
    this.offsetVel.ipMult(this.user.preset.handFriction);
  }


  public show(): void {
    // Calculate positions
    let baseOffsetPos = this.getbaseOffsetPos();
    let pos = this.getPos();

    // Draw arm connecting hand
    stroke(this.user.colors.arm);
    noFill();
    line(baseOffsetPos.x, baseOffsetPos.y, pos.x, pos.y);

    // Show hand at pos
    noStroke();
    fill(this.user.colors.hand);
    ellipse(pos.x, pos.y,
      this.size, this.size);
  }


  public getbaseOffsetPos(): Vec2 {
    // Returns the position of this hands baseOffset
    let posOffset = this.baseOffset.copy();
    posOffset.ipAddAngle(this.user.facingDir);
    return this.user.pos.add(Vec2.fromPolar(posOffset));
  }


  public getPos(): Vec2 {
    // Returns the position of this hand
    let posOffset = this.baseOffset.add(this.offset);
    posOffset.ipAddAngle(this.user.facingDir);
    return this.user.pos.add(Vec2.fromPolar(posOffset));
  }


  public getVel(): Vec2 {
    // Get this hands velocity using player rotation and position
    let dirToHand = this.getPos().ipSub(this.user.pos);
    let angleForward = dirToHand.getAngle() + PI / 2;
    let vel = Vec2.fromDir(angleForward).mult(this.user.facingDirVel);
    return vel;
  }

  // #endregion
}
