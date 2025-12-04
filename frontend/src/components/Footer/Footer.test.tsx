import { screen, render } from '@testing-library/react';
import { expect, it, describe } from 'vitest';
import Footer from './Footer';

describe('Footer component test', () => {
    it('Correct render with actual year', () => {
        const currentYear = new Date().getFullYear();
        render(<Footer />);
        expect(screen.getByRole('paragraph')).toHaveTextContent(
            `${currentYear}`
        );
    });
});
