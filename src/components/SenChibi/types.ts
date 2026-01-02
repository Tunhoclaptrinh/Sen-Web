

export interface SenChibiProps {
    x?: number;
    y?: number;
    scale?: number;
    visible?: boolean;

    // Customization
    showHat?: boolean;
    showGlasses?: boolean;
    showCoat?: boolean;
    outfit?: 'normal' | 'ao_dai';
    gesture?: 'normal' | 'hello' | 'point' | 'like' | 'flag' | 'hand_back';

    // Expression
    mouthState?: 'smile' | 'smile_2' | 'sad' | 'open' | 'close' | 'half' | 'tongue';
    eyeState?: 'normal' | 'blink' | 'close' | 'half' | 'like' | 'sleep';

    // Animation States
    isTalking?: boolean;
    isBlinking?: boolean;

    // Interaction
    onClick?: () => void;
    interactive?: boolean;
}
