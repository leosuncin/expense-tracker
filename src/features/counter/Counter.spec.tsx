import { screen } from '@testing-library/react';
import user from '@testing-library/user-event';

import Counter from '@app/features/counter/Counter';
import { render } from '@app/utils/testUtils';

jest.mock('@app/features/counter/counterApi', () => ({
  fetchCount: async (amount: number): Promise<{ data: number }> =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: amount });
      }, 500);
    }),
}));

describe('<Counter />', () => {
  it('renders the component', () => {
    render(<Counter />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('decrements the value', () => {
    render(<Counter />);

    user.click(screen.getByRole('button', { name: /decrement value/i }));

    expect(screen.getByText('-1')).toBeInTheDocument();
  });

  it('increments the value', () => {
    render(<Counter />);

    user.click(screen.getByRole('button', { name: /increment value/i }));

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('increments by amount', () => {
    render(<Counter />);

    user.type(screen.getByLabelText(/set increment amount/i), '{backspace}5');
    user.click(screen.getByRole('button', { name: /add amount/i }));

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('increments async', async () => {
    render(<Counter />);

    user.type(screen.getByLabelText(/set increment amount/i), '{backspace}3');
    user.click(screen.getByRole('button', { name: /add async/i }));

    await expect(screen.findByText('3')).resolves.toBeInTheDocument();
  });

  it('increments if amount is odd', async () => {
    render(<Counter />);

    user.click(screen.getByRole('button', { name: /add if odd/i }));

    expect(screen.getByText('0')).toBeInTheDocument();

    user.click(screen.getByRole('button', { name: /increment value/i }));
    user.type(screen.getByLabelText(/set increment amount/i), '{backspace}8');
    user.click(screen.getByRole('button', { name: /add if odd/i }));

    await expect(screen.findByText('9')).resolves.toBeInTheDocument();
  });
});
