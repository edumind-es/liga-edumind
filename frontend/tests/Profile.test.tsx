import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import Profile from '@/pages/Profile/Profile'

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: { codigo: 'docente01', email: 'docente@example.com' },
    logout: vi.fn(),
    isLoading: false,
  }),
}))

// Usuario SIN Nextcloud configurado: el caso que rompía la página
vi.mock('@/api/client', () => ({
  apiClient: {
    client: {
      get: vi.fn().mockResolvedValue({ data: { nextcloud_url: null, nextcloud_user: null, has_password: false } }),
      defaults: { baseURL: '/api/v1' },
    },
  },
  getOidcStartUrl: () => '/api/v1/auth/oidc/start',
  isAuthentikEnabled: () => false,
  authenticatedFetch: vi.fn(),
}))

vi.mock('@/components/EDUmindFooter', () => ({
  default: () => <div data-testid="footer" />,
}))

vi.mock('@/components/offline', () => ({
  NetworkStatusIndicator: () => null,
}))

describe('Profile', () => {
  it('renderiza sin bucle de re-render aunque no haya Nextcloud configurado', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/profile']}>
          <Profile />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Perfil de Usuario' })).toBeInTheDocument()
    expect(await screen.findByText('docente01')).toBeInTheDocument()
  })
})
