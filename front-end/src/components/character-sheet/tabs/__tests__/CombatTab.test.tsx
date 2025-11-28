// ============================================================================
// CombatTab - Attack Management Tests
// ============================================================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CombatTab } from '../CombatTab';
import { CharacterProvider } from '@/contexts/CharacterContext';

// Mock the useCalculations hook
vi.mock('@/hooks/useCalculations', () => ({
  useCalculations: () => ({
    initiative: 2,
    hitDiceDisplay: '1d8',
  }),
}));

describe('CombatTab - Attack Management', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <CharacterProvider>
        {component}
      </CharacterProvider>
    );
  };

  it('should render "Add Attack" button', () => {
    renderWithProvider(<CombatTab />);
    expect(screen.getByText('Add Attack')).toBeInTheDocument();
  });

  it('should show empty state when no attacks exist', () => {
    renderWithProvider(<CombatTab />);
    expect(screen.getByText(/No attacks added yet/i)).toBeInTheDocument();
  });

  it('should add a new attack when "Add Attack" is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CombatTab />);

    const addButton = screen.getByText('Add Attack');
    await user.click(addButton);

    // Should no longer show empty state
    expect(screen.queryByText(/No attacks added yet/i)).not.toBeInTheDocument();

    // Should show input fields - check by role and placeholder
    const textInputs = screen.getAllByRole('textbox');
    const numberInputs = screen.getAllByRole('spinbutton');

    // Should have 3 text inputs (name, damage, type) and 1 number input (attack bonus)
    expect(textInputs.length).toBeGreaterThanOrEqual(3);
    expect(numberInputs.length).toBeGreaterThan(0);
  });

  it('should edit attack name without affecting other attacks', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CombatTab />);

    // Add first attack
    const addButton = screen.getByText('Add Attack');
    await user.click(addButton);

    // Add second attack
    await user.click(addButton);

    // Get all text inputs - they include name, damage, and type for each attack
    const allTextInputs = screen.getAllByRole('textbox');

    // Filter name inputs by checking they don't have placeholders (name has no placeholder)
    const nameInputs = allTextInputs.filter((input) => !input.getAttribute('placeholder'));
    expect(nameInputs.length).toBeGreaterThanOrEqual(2);

    // Edit first attack name
    await user.clear(nameInputs[0]);
    await user.type(nameInputs[0], 'Longsword');

    // Edit second attack name
    await user.clear(nameInputs[1]);
    await user.type(nameInputs[1], 'Dagger');

    // Verify both attacks have different names
    expect(nameInputs[0]).toHaveValue('Longsword');
    expect(nameInputs[1]).toHaveValue('Dagger');
  });

  it('should edit attack bonus independently for each attack', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CombatTab />);

    // Add two attacks
    const addButton = screen.getByText('Add Attack');
    await user.click(addButton);
    await user.click(addButton);

    // Get number inputs from attacks section (skip combat stat inputs by getting last ones)
    const allNumberInputs = screen.getAllByRole('spinbutton');
    const bonusInputs = allNumberInputs.slice(-2); // Last 2 are attack bonuses
    expect(bonusInputs).toHaveLength(2);

    // Edit first attack bonus
    await user.clear(bonusInputs[0]);
    await user.type(bonusInputs[0], '5');

    // Edit second attack bonus
    await user.clear(bonusInputs[1]);
    await user.type(bonusInputs[1], '3');

    // Verify independent values
    expect(bonusInputs[0]).toHaveValue(5);
    expect(bonusInputs[1]).toHaveValue(3);
  });

  it('should edit damage independently for each attack', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CombatTab />);

    // Add two attacks
    const addButton = screen.getByText('Add Attack');
    await user.click(addButton);
    await user.click(addButton);

    // Get damage inputs - they're text inputs with "1d8+3" placeholder and "1d6" value
    const allTextInputs = screen.getAllByRole('textbox');
    const damageInputs = allTextInputs.filter((input) =>
      input.getAttribute('placeholder') === '1d8+3' && input.getAttribute('value') === '1d6'
    );
    expect(damageInputs.length).toBeGreaterThanOrEqual(2);

    // Edit first attack damage
    await user.clear(damageInputs[0]);
    await user.type(damageInputs[0], '1d8+3');

    // Edit second attack damage
    await user.clear(damageInputs[1]);
    await user.type(damageInputs[1], '1d4+1');

    // Verify independent values
    expect(damageInputs[0]).toHaveValue('1d8+3');
    expect(damageInputs[1]).toHaveValue('1d4+1');
  });

  it('should edit damage type independently for each attack', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CombatTab />);

    // Add two attacks
    const addButton = screen.getByText('Add Attack');
    await user.click(addButton);
    await user.click(addButton);

    // Get type inputs - they're text inputs with "Slashing" placeholder and empty value
    const allTextInputs = screen.getAllByRole('textbox');
    const typeInputs = allTextInputs.filter((input) =>
      input.getAttribute('placeholder') === 'Slashing' && input.getAttribute('value') === ''
    );
    expect(typeInputs.length).toBeGreaterThanOrEqual(2);

    // Edit first attack type
    await user.clear(typeInputs[0]);
    await user.type(typeInputs[0], 'Slashing');

    // Edit second attack type
    await user.clear(typeInputs[1]);
    await user.type(typeInputs[1], 'Piercing');

    // Verify independent values
    expect(typeInputs[0]).toHaveValue('Slashing');
    expect(typeInputs[1]).toHaveValue('Piercing');
  });

  it('should delete individual attacks without affecting others', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CombatTab />);

    // Add three attacks
    const addButton = screen.getByText('Add Attack');
    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);

    // Get all attack bonus inputs (number inputs, last 3 are from attacks)
    const allNumberInputs = screen.getAllByRole('spinbutton');
    const attackBonuses = allNumberInputs.slice(-3);
    expect(attackBonuses).toHaveLength(3);

    // Set unique attack bonuses
    await user.clear(attackBonuses[0]);
    await user.type(attackBonuses[0], '5');
    await user.clear(attackBonuses[1]);
    await user.type(attackBonuses[1], '3');
    await user.clear(attackBonuses[2]);
    await user.type(attackBonuses[2], '7');

    // Get all delete buttons (trash icons)
    const deleteButtons = screen.getAllByRole('button', { name: '' }).filter(
      btn => btn.querySelector('svg')?.classList.contains('lucide-trash-2')
    );
    expect(deleteButtons.length).toBeGreaterThanOrEqual(3);

    // Delete the second attack
    const trashButtons = deleteButtons.slice(-3); // Get the last 3 (attack delete buttons)
    await user.click(trashButtons[1]);

    // Should now have only 2 attacks (verify by number of attack bonuses)
    const allNumberInputsAfter = screen.getAllByRole('spinbutton');
    const remainingBonuses = allNumberInputsAfter.slice(-2);
    expect(remainingBonuses).toHaveLength(2);

    // Verify the correct attacks remain (first and third)
    expect(remainingBonuses[0]).toHaveValue(5);
    expect(remainingBonuses[1]).toHaveValue(7);
  });

  it('should handle attacks with the same name independently', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CombatTab />);

    // Add two attacks
    const addButton = screen.getByText('Add Attack');
    await user.click(addButton);
    await user.click(addButton);

    // Get all text inputs and filter for name inputs (no placeholder)
    const allTextInputs = screen.getAllByRole('textbox');
    const nameInputs = allTextInputs.filter((input) => !input.getAttribute('placeholder'));

    // Give both attacks the same name
    await user.clear(nameInputs[0]);
    await user.type(nameInputs[0], 'Shortsword');
    await user.clear(nameInputs[1]);
    await user.type(nameInputs[1], 'Shortsword');

    // Give them different attack bonuses
    const allNumberInputs = screen.getAllByRole('spinbutton');
    const bonusInputs = allNumberInputs.slice(-2); // Last 2 are attack bonuses
    await user.clear(bonusInputs[0]);
    await user.type(bonusInputs[0], '5');
    await user.clear(bonusInputs[1]);
    await user.type(bonusInputs[1], '3');

    // Verify both exist with different bonuses despite same name
    expect(bonusInputs[0]).toHaveValue(5);
    expect(bonusInputs[1]).toHaveValue(3);

    // Delete one attack
    const deleteButtons = screen.getAllByRole('button', { name: '' }).filter(
      btn => btn.querySelector('svg')?.classList.contains('lucide-trash-2')
    );
    const trashButtons = deleteButtons.slice(-2); // Get the last 2 (attack delete buttons)
    await user.click(trashButtons[0]);

    // Should only have 1 attack remaining
    const allNumberInputsAfter = screen.getAllByRole('spinbutton');
    const remainingBonusInputs = allNumberInputsAfter.slice(-1); // Last 1 is remaining attack bonus
    expect(remainingBonusInputs).toHaveLength(1);

    // The remaining attack should be the second one
    expect(remainingBonusInputs[0]).toHaveValue(3);
  });
});
