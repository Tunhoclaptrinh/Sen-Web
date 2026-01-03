import BaseService from './base.service';

export interface GameCharacter {
    id: number;
    name: string;
    description: string;
    persona: string;
    speaking_style: string;
    avatar: string;
    avatar_locked?: string;
    avatar_unlocked?: string;
    persona_amnesia?: string;
    persona_restored?: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    origin: string;
    is_collectible: boolean;
}

class AdminCharacterService extends BaseService<GameCharacter> {
    constructor() {
        super('/admin/characters');
    }
}

export default new AdminCharacterService();
