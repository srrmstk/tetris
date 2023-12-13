import Peer, { DataConnection } from 'peerjs';
import { makeAutoObservable } from 'mobx';

export class P2PStore {
  peer: Peer = new Peer();
  connection: DataConnection | null = null;
  uuid: string = '';

  constructor() {
    makeAutoObservable(this);
  }

  sendMessage = (data: any) => {
    this.connection?.send(data);
  };

  // SETTERS

  setPeer = () => {
    this.peer = new Peer();
    this.peer.on('open', id => {
      this.setUuid(id);
    });
  };

  connectToOtherPeer = (id: string) => {
    this.connection = this.peer.connect(id);
  };

  private setUuid = (value: string) => {
    this.uuid = value;
  };
}
