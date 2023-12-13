import { observer } from 'mobx-react-lite';
import { useRootStore } from '../RootStore';
import { useEffect, useState } from 'react';

export const PeerController = observer(() => {
  const { gameControlStore, p2pStore } = useRootStore();

  const [peerId, setPeerId] = useState<string>('');

  useEffect(() => {
    p2pStore.setPeer();

    return () => {
      if (p2pStore.connection) {
        p2pStore.peer.disconnect();
      }
    };
  }, [p2pStore]);

  useEffect(() => {
    p2pStore.peer.on('connection', conn => {
      // @TODO: type socket data
      conn.on('data', data => {
        // connect to initializer peer
        if (data?.peerId) {
          p2pStore.connectToOtherPeer(data?.peerId);
          return;
        }

        if (data?.otherPlayer) {
          gameControlStore.setOtherPlayerState(data?.otherPlayer);
          return;
        }
      });
    });
  }, [gameControlStore, p2pStore]);

  const handleSetOtherPlayerId = () => {
    p2pStore.connectToOtherPeer(peerId);
    p2pStore.connection?.on('open', () => {
      p2pStore.connection?.send({ peerId: p2pStore.peer.id });
    });
  };

  const handleSetPeerId = (value: string) => {
    setPeerId(value);
  };

  return (
    <div>
      <h2>Your peer id: {p2pStore.uuid}</h2>
      <input onChange={event => handleSetPeerId(event.target.value)} value={peerId} />
      <button onClick={handleSetOtherPlayerId}>Set other player ID and start the game</button>
    </div>
  );
});
