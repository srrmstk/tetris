import './App.css';
import { GameField } from './components/GameField';
import { observer } from 'mobx-react-lite';

const App = observer(() => {
  return <GameField />;
});

export default App;
