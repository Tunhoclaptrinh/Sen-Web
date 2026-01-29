

export type SenChibiOutfit = 'normal' | 'ao_dai';
export type SenChibiGesture = 'normal' | 'hello' | 'point' | 'like' | 'flag' | 'hand_back';
export type SenChibiMouthState = 'smile' | 'smile_2' | 'sad' | 'open' | 'close' | 'half' | 'tongue';
export type SenChibiEyeState = 'normal' | 'blink' | 'close' | 'half' | 'like' | 'sleep';

export interface SenChibiProps {
    x?: number;
    y?: number;
    scale?: number;
    origin?: 'torso' | 'head' | 'feet';
    visible?: boolean;

    // Customization
    showHat?: boolean;
    showGlasses?: boolean;
    showCoat?: boolean;
    outfit?: SenChibiOutfit;
    gesture?: SenChibiGesture;

    // Expression
    mouthState?: SenChibiMouthState;
    eyeState?: SenChibiEyeState;

    // Animation States
    isTalking?: boolean;
    /**
     * Whether the character should blink automatically.
     * Default: true
     */
    isBlinking?: boolean;

    // Interaction
    onClick?: () => void;
    interactive?: boolean;
}
