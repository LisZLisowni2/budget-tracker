import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, it, describe } from 'vitest'
import Content from './Content';
import HeroBox from '../Main/HeroBox';

describe('Content component', () => {
    it('renders with single text', () => {
        render(<Content children={'Hello!'} />);
        expect(screen.getByText('Hello!')).toBeInTheDocument()
        expect(screen.getByText('Hello!')).toHaveTextContent('Hello!');
    });

    it('renders with complicated component', () => {
        render(
            <MemoryRouter>
                <Content>
                    <HeroBox />
                </Content>
            </MemoryRouter>
        );
        expect(
            screen.getByText(
                'Take control over your budget with BudgetTracker!'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'Easy to use, functional UI, no ads, account system for multiple spheres (home, business)'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /Get Started/i })
        ).toBeInTheDocument();
    });
});
