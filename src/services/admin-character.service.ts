import BaseService from './base.service';

export interface GameCharacter {
    id: number;
    name: string;
    description: string;
    persona: string;
    speakingStyle: string;
    avatar: string;
    avatarLocked?: string;
    avatarUnlocked?: string;
    personaAmnesia?: string;
    personaRestored?: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    origin: string;
    isCollectible: boolean;
}

class AdminCharacterService extends BaseService<GameCharacter> {
    constructor() {
        super('/admin/characters');
    }
}

export default new AdminCharacterService();
