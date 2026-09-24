import { KeyBindings } from '../types/game';

const SETTINGS_P1_KEY = 'boh_p1_keys';
const SETTINGS_P2_KEY = 'boh_p2_keys';

export const DEFAULT_P1_KEYS: KeyBindings = {
  left: 'KeyA',
  right: 'KeyD',
  jump: 'KeyW',
  block: 'KeyS',
  lightAttack: 'KeyJ',
  heavyAttack: 'KeyK',
  special: 'KeyL',
  dodge: 'Space',
};

export const DEFAULT_P2_KEYS: KeyBindings = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  jump: 'ArrowUp',
  block: 'ArrowDown',
  lightAttack: 'Digit1',
  heavyAttack: 'Digit2',
  special: 'Digit3',
  dodge: 'Digit0',
};

export interface InputState {
  moveLeft: boolean;
  moveRight: boolean;
  jump: boolean;
  block: boolean;
  lightAttack: boolean;
  heavyAttack: boolean;
  special: boolean;
  dodge: boolean;
}

export class InputManager {
  public p1Keys: KeyBindings = { ...DEFAULT_P1_KEYS };
  public p2Keys: KeyBindings = { ...DEFAULT_P2_KEYS };

  private activeKeys: Set<string> = new Set();
  
  // Virtual touch inputs for mobile/touch
  public virtualP1: InputState = {
    moveLeft: false,
    moveRight: false,
    jump: false,
    block: false,
    lightAttack: false,
    heavyAttack: false,
    special: false,
    dodge: false,
  };

  constructor() {
    this.loadKeys();
    this.setupListeners();
  }

  private loadKeys() {
    try {
      const s1 = localStorage.getItem(SETTINGS_P1_KEY);
      if (s1) this.p1Keys = { ...DEFAULT_P1_KEYS, ...JSON.parse(s1) };
      const s2 = localStorage.getItem(SETTINGS_P2_KEY);
      if (s2) this.p2Keys = { ...DEFAULT_P2_KEYS, ...JSON.parse(s2) };
    } catch {
      // fallback
    }
  }

  public saveKeys(p1: KeyBindings, p2: KeyBindings) {
    this.p1Keys = { ...p1 };
    this.p2Keys = { ...p2 };
    try {
      localStorage.setItem(SETTINGS_P1_KEY, JSON.stringify(this.p1Keys));
      localStorage.setItem(SETTINGS_P2_KEY, JSON.stringify(this.p2Keys));
    } catch {
      // fallback
    }
  }

  private setupListeners() {
    window.addEventListener('keydown', (e) => {
      // Prevent scrolling on game control keys
      const gameCodes = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (gameCodes.includes(e.code)) {
        e.preventDefault();
      }
      this.activeKeys.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.activeKeys.delete(e.code);
    });

    window.addEventListener('blur', () => {
      this.activeKeys.clear();
    });
  }

  public getP1Input(): InputState {
    return {
      moveLeft: this.activeKeys.has(this.p1Keys.left) || this.virtualP1.moveLeft,
      moveRight: this.activeKeys.has(this.p1Keys.right) || this.virtualP1.moveRight,
      jump: this.activeKeys.has(this.p1Keys.jump) || this.virtualP1.jump,
      block: this.activeKeys.has(this.p1Keys.block) || this.virtualP1.block,
      lightAttack: this.activeKeys.has(this.p1Keys.lightAttack) || this.virtualP1.lightAttack,
      heavyAttack: this.activeKeys.has(this.p1Keys.heavyAttack) || this.virtualP1.heavyAttack,
      special: this.activeKeys.has(this.p1Keys.special) || this.virtualP1.special,
      dodge: this.activeKeys.has(this.p1Keys.dodge) || this.virtualP1.dodge,
    };
  }

  public getP2Input(): InputState {
    return {
      moveLeft: this.activeKeys.has(this.p2Keys.left),
      moveRight: this.activeKeys.has(this.p2Keys.right),
      jump: this.activeKeys.has(this.p2Keys.jump),
      block: this.activeKeys.has(this.p2Keys.block),
      lightAttack: this.activeKeys.has(this.p2Keys.lightAttack) || this.activeKeys.has('Numpad1'),
      heavyAttack: this.activeKeys.has(this.p2Keys.heavyAttack) || this.activeKeys.has('Numpad2'),
      special: this.activeKeys.has(this.p2Keys.special) || this.activeKeys.has('Numpad3'),
      dodge: this.activeKeys.has(this.p2Keys.dodge) || this.activeKeys.has('Numpad0'),
    };
  }

  public setVirtualInput(control: keyof InputState, active: boolean) {
    this.virtualP1[control] = active;
  }
}

export const inputManager = new InputManager();
