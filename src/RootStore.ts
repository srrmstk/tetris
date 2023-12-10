import { GameControlStore } from './logic/gameControl/GameControlStore';
import React from 'react';
import { P2PStore } from './logic/p2p/P2PStore';

class RootStore {
  gameControlStore: GameControlStore;
  p2pStore: P2PStore;

  constructor() {
    this.gameControlStore = new GameControlStore();
    this.p2pStore = new P2PStore();
  }
}

const rootStore = new RootStore();

const storesContext = React.createContext(rootStore);
export const useRootStore = () => React.useContext(storesContext);
