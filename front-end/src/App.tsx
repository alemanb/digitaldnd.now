import { CharacterProvider } from "@/contexts/CharacterContext";
import { CharacterSheet } from "@/components/character-sheet";

const App = () => {
  return (
    <CharacterProvider autoSave={true}>
      <CharacterSheet />
    </CharacterProvider>
  );
};

export default App;
