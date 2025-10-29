import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import Button from './Button';

describe('Button component', () => {
    it('renders with the given text', () => {
        render(<Button text="Click me" />);
        expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<Button text="Click me" onClick={handleClick} />);
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
