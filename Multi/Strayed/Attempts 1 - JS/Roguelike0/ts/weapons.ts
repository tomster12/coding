
// Contains necessary functions
abstract class Weapon {

  // #region - Setup

  // Declare main variables
  protected user: Entity;
  private name: string;

  // Declare positioning variables
  protected _pos: Vec2;
  protected movementVel: Vec2;
  protected movementVelFriction: number;
  protected dir: number;
  protected dirVel: number;
  protected dirVelFriction: number;


  constructor(name: string) {
    // Initialize main variables and setup weapon
    this.user = null;
    this.name = name;
    groundWeapons.push(this);

    // Initialize positioning variables
    this._pos = new Vec2(0, 0);
    this.movementVel = new Vec2(0, 0);
    this.movementVelFriction = 0.9;
    this.dir = 0;
    this.dirVel = 0;
    this.dirVelFriction = 0.85;
  }


  // Read-only outside class
  get pos(): Vec2 { return this._pos; }

  // #endregion


  // #region - Main

  public setUser(user: Entity): void {
    if (user) {
      // Update groundWeapons
      groundWeapons.splice(groundWeapons.indexOf(this), 1);

      // Sets the person using this
      this.user = user;
    }
  }


  public drop(): void {
    // Can only drop if has a user
    if (this.user != null) {

      // Update groundWeapons
      groundWeapons.push(this);

      // Set position
      this._pos = this.user.pos.copy();

      // Remove the user from this weapon
      this.user = null;
    }
  }


  public applyVel(movementVelDif: Vec2, dirVelDif: number): void {
    // Apply velocity differences to movement and direction
    if (movementVelDif) this.movementVel.ipAdd(movementVelDif);
    if (dirVelDif) this.dirVel += dirVelDif;
  }


  public show(): void {
    // Called to show
    if (this.user == null) {
      this.showOnGround();
    } else this.showHeld();
  }


  // Abstract methods to be implemented
  abstract update(): void;
  abstract showOnGround(): void;
  abstract showHeld(): void;
  abstract tryAttack(): void;

  // #endregion
}


class Fists extends Weapon {

  // #region - Main

  // Declare cooldown variables
  private cooldown: number;
  private timer: number;

  // Declare combo variables
  private currentCombo: number;
  private comboIndex: number;
  private comboTimer: number;
  private comboTimerMax: number;
  private combos: {
    cooldownMax: number,
    timerMax: number,
    offsets: Polar[],
    func: () => void
  }[][];


  constructor() {
    // Super constructor
    super("Fists");

    // Initialize cooldown variables
    this.cooldown = 0;
    this.timer = 0;

    // Initialize combo variables
    this.currentCombo = 0;
    this.comboIndex = 0;
    this.comboTimer = 0;
    this.comboTimerMax = 0.2;
    this.combos = [
      // 2 standard with 1 long
      [ {cooldownMax: 0.05, timerMax: 0.20, offsets: [new Polar(PI * 0.50, 25), new Polar(PI * 0.20,  0)], func: () => this.user.knockback(1.5)},
        {cooldownMax: 0.05, timerMax: 0.20, offsets: [new Polar(PI *-0.20,  0), new Polar(PI *-0.50, 25)], func: () => this.user.knockback(1.5)},
        {cooldownMax: 0.45, timerMax: 0.30, offsets: [new Polar(PI * 0.50, 35), new Polar(PI * 0.30,  0)], func: () => this.user.knockback(3)} ],

      // 2 quick small
      [ {cooldownMax: 0.05, timerMax: 0.05, offsets: [new Polar(PI * 0.60, 25), new Polar(PI * 0.20,  0)], func: () => this.user.knockback(0.3)},
        {cooldownMax: 0.05, timerMax: 0.05, offsets: [new Polar(PI *-0.20,  0), new Polar(PI *-0.60, 25)], func: () => this.user.knockback(0.3)} ],

      // 2 long
      [ {cooldownMax: 0.15, timerMax: 0.25, offsets: [new Polar(PI * 0.55, 35), new Polar(PI * 0.30,  0)], func: () => this.user.knockback(2)},
        {cooldownMax: 0.15, timerMax: 0.25, offsets: [new Polar(PI *-0.30,  0), new Polar(PI *-0.55, 35)], func: () => this.user.knockback(2)} ],

      // 1 wind up, 1 very long
      [ {cooldownMax: 0.00, timerMax: 0.40, offsets: [new Polar(PI *-0.40, 10), new Polar(PI *-0.30,  0)], func: null},
        {cooldownMax: 0.10, timerMax: 0.50, offsets: [new Polar(PI * 0.50, 45), new Polar(PI * 0.30,  0)], func: () => this.user.knockback(10)} ]
    ];
  }


  public drop(): void {
    // Fists cannot go on ground
    // Can only drop if has user
    if (this.user != null) {

      // Remove the user from this weapon
      this.user = null;
    }
  }


   public update(): void {
    // Check user exists - Fists rely on users
    if (this.user != null) {


      // Is attacking
      if (this.timer > 0) {
        this.timer = max(this.timer - dt, 0);

        // End of attack
        if (this.timer == 0) {
          this.user.lHand.gotoOffset.set(0, 0);
          this.user.rHand.gotoOffset.set(0, 0);
        }


      // Is not attacking
      } else {

        // On cooldown
        if (this.cooldown > 0) {
          this.cooldown = max(this.cooldown - dt, 0);

        // Not on cooldown
        } else {

          // Update combo time
          if (this.comboTimer > 0)
            this.comboTimer = max(this.comboTimer - dt, 0);
          else this.comboIndex = 0;
        }
      }
    }
  }


  // Private abstract
  showOnGround(): void {
    // Check user doesn't exist
    if (this.user == null) {}
  }


  // Private abstract
  showHeld(): void {
    // Check user exists and has hands
    if (this.user != null
    && this.user.lHand != null
    && this.user.rHand != null) {}
  }


  public tryAttack(): void {
    // Check user exists - Fists rely on users
    if (this.user != null) {

      // Check users hands exists and not on cooldown
      if (this.user.lHand != null
      && this.user.rHand != null
      && this.timer == 0
      && this.cooldown == 0) {
        let curCombo = this.combos[this.currentCombo][this.comboIndex];

        // Enemy or player and left click
        if (this.user != player || (this.user == player && mouseInput == LEFT)) {

          // Update main timers
          this.cooldown = curCombo.cooldownMax;
          this.timer = curCombo.timerMax;
          this.comboTimer = this.comboTimerMax;

          // Move hands
          this.user.lHand.gotoOffset = curCombo.offsets[0].copy();
          this.user.rHand.gotoOffset = curCombo.offsets[1].copy();
          if (curCombo.func != null) curCombo.func();

          // Update combo index
          this.comboIndex++;
          if (this.comboIndex >= this.combos[this.currentCombo].length)
            this.comboIndex = 0;
        }
      }

      // Change current combo as player
      if (this.user == player && (mouseInputPressed == CENTER || mouseInputPressed == RIGHT)) {
        let comboDir = (mouseInputPressed == CENTER ? 1 : -1);
        let nextCombo = (this.currentCombo + comboDir + this.combos.length) % this.combos.length;
        this.currentCombo = nextCombo;
      }
    }
  }

  // #endregion
}


class MultiWeapon extends Weapon {

  // #region - Main

  // Declare cooldown variables
  private primaryTimer: number;
  private primaryTimerMax: number;
  private secondaryTimer: number;
  private secondaryTimerMax: number;
  private tertiaryTimer: number;
  private tertiaryTimerMax: number;

  // Declare recoil variables
  private recoil: number;
  private primaryRecoilMax: number;
  private secondaryRecoilMax: number;
  private tertiaryRecoilMax: number;
  private currentRecoilMax: number;


  constructor() {
    // Super constructor
    super("MultiWeapon");

    // Initialize cooldown variables
    this.primaryTimer = 0;
    this.primaryTimerMax = 0.1;
    this.secondaryTimer = 0;
    this.secondaryTimerMax = 0.4;
    this.tertiaryTimer = 0;
    this.tertiaryTimerMax = 0.8;

    // Initialize recoil variables
    this.recoil = 0;
    this.primaryRecoilMax = 0.1;
    this.secondaryRecoilMax = 0.2;
    this.tertiaryRecoilMax = 0.4;
    this.currentRecoilMax = this.primaryRecoilMax;
  }


  public update(): void {
    // Update timers
    if (this.primaryTimer > 0)
      this.primaryTimer = max(this.primaryTimer - dt, 0);
    if (this.secondaryTimer > 0)
      this.secondaryTimer = max(this.secondaryTimer - dt, 0);
    if (this.tertiaryTimer > 0)
      this.tertiaryTimer = max(this.tertiaryTimer - dt, 0);

    // Update recoil
    if (this.recoil > 0)
      this.recoil = max(this.recoil - dt, 0);


    // Being held
    if (this.user != null) {

      // Set users hands
      if (this.user.lHand != null
      && this.user.rHand != null) {
        let recoilPercent = (this.recoil / this.currentRecoilMax);
        this.user.lHand.gotoOffset.set(PI * 0.50, 10 - recoilPercent * 20);
        this.user.rHand.gotoOffset.set(PI *-0.50, 20 - recoilPercent * 20);
      }


    // On ground
    } else {

      // Update pos
      this.pos.ipAdd(this.movementVel);
      this.movementVel.ipMult(this.movementVelFriction);

      // Update dir
      this.dir += this.dirVel;
      this.dirVel *= this.dirVelFriction;
    }
  }


  // private abstract
  showOnGround(): void {
    // Check user doesn't exist
    if (this.user == null) {

      // Show body using shape
      let start = this.getGunStart();
      let angle = this.getGunDirection();
      let recoilPercent = (this.recoil / this.currentRecoilMax);
      shapes.MultiWeapon(start.x, start.y, 1, angle, recoilPercent);
    }
  }


  // private abstract
  showHeld(): void {
    // Check user exists and has hands
    if (this.user != null) {

      // Show body using shape
      let start = this.getGunStart();
      let angle = this.getGunDirection();
      let recoilPercent = (this.recoil / this.currentRecoilMax);
      shapes.MultiWeapon(start.x, start.y, 1, angle, recoilPercent);
    }
  }


  public tryAttack(): void {
    // Primary fire when player and left click or enemy or on ground
    if ((this.user == player && mouseInput == LEFT
      || this.user != player) && this.primaryTimer == 0) {

      // Update main timers
      this.primaryTimer = this.primaryTimerMax;

      // Shoot bullet
      let end = this.getGunEnd();
      let angle = this.getGunDirection() + (random(PI * 0.1) - PI * 0.05);
      new Bullet(end.copy(), Vec2.fromDir(angle).mult(14 + random(2) - 1));
      this.currentRecoilMax = this.primaryRecoilMax;
      this.recoil = this.currentRecoilMax;
      if (this.user != null) this.user.knockback(1.5);
      else this.knockback(1.5);


    // Secondary fire as player
    } else if (mouseInput == CENTER && this.secondaryTimer == 0) {

      // Update main timers
      this.secondaryTimer = this.secondaryTimerMax;

      // Shoot bullet
      let end = this.getGunEnd();
      for (let i = 0; i < 5; i++) {
        let angle = this.getGunDirection() + (random(PI * 0.1) - PI * 0.05);
        new Bullet(end.copy(), Vec2.fromDir(angle).mult(10 + random(2) - 1));
      }
      this.currentRecoilMax = this.secondaryRecoilMax;
      this.recoil = this.currentRecoilMax;
      this.user.knockback(6);


    // Tertiary fire as player
    } else if (mouseInput == RIGHT && this.tertiaryTimer == 0) {

      // Update main timers
      this.tertiaryTimer = this.tertiaryTimerMax;

      // Shoot bullet
      let end = this.getGunEnd();
      let angle = this.getGunDirection() + (random(PI * 0.1) - PI * 0.05);
      new Bullet(end.copy(), Vec2.fromDir(angle).mult(20 + random(2) - 1));
      this.currentRecoilMax = this.tertiaryRecoilMax;
      this.recoil = this.currentRecoilMax;
      this.user.knockback(10);
    }
  }


  private getGunStart(): Vec2 {
    // If is held by user
    if (this.user != null) {

      // Start of gun is left hand
      return this.user.lHand.getPos();

    // On ground
    } else {

      // Start of gun is pos
      return this.pos.copy();
    }
  }


  private getGunEnd(): Vec2 {
    // If is held by user
    if (this.user != null) {

      // End of gun is towards right hand
      let dir = this.user.rHand.getPos().sub(this.user.lHand.getPos());
      return this.getGunStart().add(dir.ipSetMag(20));

    // On ground
    } else {

      // Start of gun is pos
      let dir = Vec2.fromDir(this.dir);
      return this.getGunStart().add(dir.ipSetMag(20));
    }
  }


  private getGunDirection(): number {
    // Returns the angle that this is facing in
    return this.getGunEnd().ipSub(this.getGunStart()).getAngle();
  }


  private knockback(mag: number): void {
    // If is on ground
    if (this.user == null && mag) {

      // Push backwards
      let dir = new Polar(this.dir, 1).ipAddAngle(PI);
      let velDelta = Vec2.fromPolar(dir).ipMult(mag);
      this.movementVel.ipAdd(velDelta);
    }
  }

  // #endregion
}


abstract class Projectile {

  // #region - Main

  // Declare main variables
  protected pos: Vec2;
  protected vel: Vec2;
  protected time: number;
  protected timeMax: number;


  constructor(pos_: Vec2, vel_: Vec2, timeMax_: number) {
    // Initialize main variables and setup projectile
    this.pos = pos_;
    this.vel = vel_;
    this.time = 0;
    this.timeMax = timeMax_;
    projectiles.push(this);
  };


  update() {
    // Called to update
    this.time++;
    this.pos.ipAdd(this.vel);
    if (this.time > this.timeMax)
      projectiles.splice(projectiles.indexOf(this), 1);
  }


  // To be implemented
  abstract show(): void;

  // #endregion
}


class Bullet extends Projectile {

  // #region - Main

  constructor(pos: Vec2, vel: Vec2) {
    // Super constructor
    super(pos, vel, 600);
  }


  show() {
    // Show as ellipse
    noStroke();
    fill(0);
    ellipse(this.pos.x, this.pos.y, 5, 5);
  }

  // #endregion
}
