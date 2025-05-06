
/**
 * Error used when a target tries to attack themselves
 * @extends Error
 */
export class CombatSelfError extends Error { }

/**
 * Error used when a combat target is invalid for some reason (doesn't have a health attribute/whatever)
 */
export class CombatInvalidTargetError extends Error { }


/**
 * Error used when trying to attack a pacifist flagged NPC
 * @property {Npc} target
 * @extends Error
 */
export class CombatPacifistError extends Error {
    constructor(message, target) {
        super(message);

        this.target = target;
    }
}
/**
 * Error used when trying to attack a non-pvp flagged player
 * @property {Player} target
 * @extends Error
 */
export class CombatNonPvpError extends Error {
    constructor(message, target) {
        super(message);

        this.target = target;
    }
}