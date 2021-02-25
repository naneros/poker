export type Player = {
  hands: number;
  vpip: number;
  pfr: number;
};


export const newPlayer = (): Player => {
    let player: Player = {
        hands: 0,
        vpip: 0,
        pfr: 0
    }
    return player;
}
