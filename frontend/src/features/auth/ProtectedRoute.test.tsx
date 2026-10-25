import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/render';
import { ProtectedRoute } from './ProtectedRoute';

describe('ProtectedRoute', () => {
  it('sends signed-out visitors to the login page', () => {
    renderWithProviders(<ProtectedRoute><p>Secret</p></ProtectedRoute>, { routes: { '/login': <p>Login page</p> } });
    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('renders the page for a signed-in user', () => {
    renderWithProviders(<ProtectedRoute><p>Secret</p></ProtectedRoute>, { as: 'USER' });
    expect(screen.getByText('Secret')).toBeInTheDocument();
  });
});
