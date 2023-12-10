import Peer from 'peerjs';
import { makeAutoObservable } from 'mobx';
import { v4 as uuid } from 'uuid';

export class P2PStore {
  peer: Peer;
  connection: any;

  constructor() {
    makeAutoObservable(this);
    this.peer = new Peer();
  }

  sendMessage = (data: any) => {
    this.connection?.send(data);
  };

  // SETTERS

  setPeer = () => {
    this.peer = new Peer(uuid());
  };

  connectToOtherPeer = (id: string) => {
    this.connection = this.peer.connect(id);
  };
}
