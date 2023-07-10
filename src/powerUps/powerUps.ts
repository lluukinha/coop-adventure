import { Player } from '../actors/players/Player';

export enum PowerUpTypes {
  AutoAttack = 'AutoAttack',
  IncreaseSpeed = 'IncreaseSpeed',
  IncreaseAttackSpeed = 'IncreaseAttackSpeed',
}

export interface PlayerPowerUps {
  [key: string]: number;
}

const autoAttack = {
  name: 'Auto attack',
  type: PowerUpTypes.AutoAttack,
  description: 'Player attacks automatically',
  method: (player: Player) => {
    player.autoAttack = true;
  },
  maxStack: 1,
};

const increaseSpeed = {
  name: 'Increase speed',
  type: PowerUpTypes.IncreaseSpeed,
  description: 'Player movement speed will be increased',
  method: (player: Player) => {
    player.walkingSpeed += 50;
  },
  maxStack: 5,
};

const increaseAttackSpeed = {
  name: 'Increase attack speed',
  description: 'Player attack speed will be increased',
  type: PowerUpTypes.IncreaseAttackSpeed,
  method: (player: Player) => {
    player.attackSpeed -= 50;
  },
  maxStack: 5,
};

export const powerUps = [autoAttack, increaseSpeed, increaseAttackSpeed];
