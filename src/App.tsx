import './App.css';
import { GameField } from './components/GameField';
import { observer } from 'mobx-react-lite';
import { PeerController } from './components/PeerController';

const App = observer(() => {
  return (
    <>
      <GameField />
      <PeerController />
    </>
  );
});

export default App;
