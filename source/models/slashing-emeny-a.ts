import { createBaseObject } from "./helpers";
import { createObjectCollisionManager } from "./managers";
import { createSlashingElement } from "./weapon-slashing";
import { getSoundProperties, playSound } from "services/audio";
import {
  createObjectMovementManager,
  createObjectHealthManager,
} from "services/state";
import {
  createObjectShieldManager,
  createShield,
} from "services/state/objectShieldManager";
import { vector, type Vector } from "services/vector";
import type { SlashingElement } from "./weapon-slashing";
import type { State } from "services/state";

export type SlashingEnemyA = ReturnType<typeof createSlashingEnemyA>;

const ATTACK_MS = 800;

export const createSlashingEnemyA = (position: Vector) => {
  let slashingElement: SlashingElement | null = null;
  const attackMS = ATTACK_MS;
  let attackMSLeft = attackMS;
  const attackRechargeMS = 400;
  let targetEnemyId: string | undefined;
  const maxAttackRange = 80;
  let attackFinished = true;

  return {
    ...createBaseObject(position),
    type: "slashing_enemy_a" as const,
    color: "black",
    collision: createObjectCollisionManager({
      circleRadius: 10,
    }),
    movement: createObjectMovementManager({
      maxSpeed: 0.09,
    }),
    health: createObjectHealthManager({
      maxHealth: 100,
      selfHealing: true,
    }),
    shield: createShield(),

    update(delta: number, state: State) {
      this.movement.update(delta, state, this);
      this.health.update(delta, state, this);

      // Create weapon slashing element
      (() => {
        if (!slashingElement) {
          slashingElement = createSlashingElement(this, this);
          state.gameObjectsManager.addObject(slashingElement);
        }
      })();

      const { gameObjectsManager } = state;

      const targetEnemy =
        (targetEnemyId && gameObjectsManager.objects[targetEnemyId]) ||
        gameObjectsManager.findClosestObjectByType(this, "stranger_a") ||
        gameObjectsManager.findClosestObjectByType(this, "shooting_enemy_a") ||
        gameObjectsManager.findClosestObjectByType(this, "tower");

      targetEnemyId = targetEnemy?.id;

      (() => {
        if (targetEnemy) {
          this.movement.setTargetPoint(targetEnemy);
        } else {
          this.movement.setTargetPoint(null);
        }
      })();

      // Attack
      const animateSword = () => {
        if (!slashingElement) return;
        if (!targetEnemy) return;

        if (attackFinished) {
          playSound(
            "sword swing",
            getSoundProperties(this, state.cameraManager),
          );
        }

        attackFinished = false;

        const reach = Math.min(
          maxAttackRange,
          vector.distance(this, targetEnemy),
        );

        // Swing the slashing element
        // Calculate angle based on attackMSLeft
        const angle =
          this.movement.angle +
          ((attackMS - attackMSLeft) / attackMS) * Math.PI * 2 -
          Math.PI;

        // Calculate distance based on attackMSLeft
        // 0 at start, 1 in the middle, 0 at the end
        const distance =
          1 - Math.abs(attackMSLeft - attackMS / 2) / (attackMS / 2);

        // Swing 90 degrees, using delta
        slashingElement.x = this.x + Math.cos(angle) * distance * reach;
        slashingElement.y = this.y + Math.sin(angle) * distance * reach;
      };

      // Attempt to attack
      (() => {
        slashingElement.setPosition(this);

        // Always finish the attack if it's started

        if (attackMSLeft > 0) {
          if (
            (targetEnemy &&
              vector.distanceSquared(this, targetEnemy) <
                maxAttackRange ** 2) ||
            !attackFinished
          ) {
            animateSword();
          }
        } else {
          attackFinished = true;
        }

        attackMSLeft -= delta;

        if (attackMSLeft <= -attackRechargeMS) {
          attackMSLeft = attackMS;
        }
      })();

      // After death
      this.health.afterDeath(() => {
        if (slashingElement) {
          state.gameObjectsManager.removeObject(slashingElement);
        }
      });
    },
  };
};
