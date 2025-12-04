import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it, describe } from 'vitest';
import { vi } from 'vitest';
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
