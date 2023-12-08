import { GameControlStore } from './logic/gameControl/GameControlStore';
import React from 'react';

class RootStore {
  gameControlStore: GameControlStore;

  constructor() {
    this.gameControlStore = new GameControlStore();
  }
}

const rootStore = new RootStore();

const storesContext = React.createContext(rootStore);
export const useRootStore = () => React.useContext(storesContext);
